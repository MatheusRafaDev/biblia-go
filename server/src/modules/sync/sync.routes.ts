import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import crypto from 'node:crypto';
import { getDatabase } from '../../db/client.js';

const syncFavoriteItemSchema = z.object({
  translationId: z.string().min(1),
  bookId: z.number().int().positive(),
  chapter: z.number().int().positive(),
  verse: z.number().int().positive(),
  highlightColor: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
});

const syncProgressItemSchema = z.object({
  planId: z.string().min(1),
  dayNumber: z.number().int().positive(),
  isCompleted: z.boolean(),
});

const syncPayloadSchema = z.object({
  userId: z.string().min(1, 'userId é obrigatório'),
  lastSyncedAt: z.string().optional(),
  favorites: z.array(syncFavoriteItemSchema).default([]),
  readingProgress: z.array(syncProgressItemSchema).default([]),
});

export async function syncRoutes(app: FastifyInstance) {
  const db = getDatabase();

  // POST /api/sync
  app.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    // If Authorization header is provided, verify JWT and assert userId ownership
    const authHeader = request.headers.authorization;
    if (authHeader) {
      try {
        await request.jwtVerify();
        const authUser = request.user as { sub: string };
        const body = request.body as { userId?: string };
        if (body && body.userId && authUser.sub !== body.userId) {
          return reply.status(403).send({
            error: 'Não autorizado',
            message: 'O token de autenticação não corresponde ao userId da requisição.',
          });
        }
      } catch {
        return reply.status(401).send({ error: 'Token de autenticação inválido ou expirado' });
      }
    }

    const parsed = syncPayloadSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Payload de sincronização inválido',
        details: parsed.error.format(),
      });
    }

    const { userId, favorites, readingProgress } = parsed.data;

    // Execute atomic transaction for bulk sync
    db.exec('BEGIN TRANSACTION;');
    try {
      // 1. Upsert incoming favorites into cloud database
      const upsertFavStmt = db.prepare(`
        INSERT INTO user_favorites (id, user_id, translation_id, book_id, chapter, verse, highlight_color, note, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(user_id, translation_id, book_id, chapter, verse) DO UPDATE SET
          highlight_color = excluded.highlight_color,
          note = excluded.note,
          updated_at = datetime('now')
      `);

      for (const f of favorites) {
        const favId = crypto.randomUUID();
        upsertFavStmt.run(
          favId,
          userId,
          f.translationId,
          f.bookId,
          f.chapter,
          f.verse,
          f.highlightColor ?? null,
          f.note ?? null
        );
      }

      // 2. Upsert incoming reading progress into cloud database
      const upsertProgressStmt = db.prepare(`
        INSERT INTO user_reading_progress (id, user_id, plan_id, day_number, is_completed, updated_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(user_id, plan_id, day_number) DO UPDATE SET
          is_completed = excluded.is_completed,
          updated_at = datetime('now')
      `);

      for (const p of readingProgress) {
        const progressId = crypto.randomUUID();
        upsertProgressStmt.run(progressId, userId, p.planId, p.dayNumber, p.isCompleted ? 1 : 0);
      }

      db.exec('COMMIT;');
    } catch (err) {
      db.exec('ROLLBACK;');
      request.log.error(err, 'Erro durante transação de sincronização');
      return reply.status(500).send({
        error: 'Erro interno ao processar sincronização',
      });
    }

    // 3. Query all cloud records for user to return consolidated state
    interface CloudFavRow {
      translation_id: string;
      book_id: number;
      chapter: number;
      verse: number;
      highlight_color: string | null;
      note: string | null;
      updated_at: string;
    }

    const cloudFavs = db
      .prepare(
        'SELECT translation_id, book_id, chapter, verse, highlight_color, note, updated_at FROM user_favorites WHERE user_id = ?'
      )
      .all(userId) as unknown as CloudFavRow[];

    interface CloudProgressRow {
      plan_id: string;
      day_number: number;
      is_completed: number;
      updated_at: string;
    }

    const cloudProgress = db
      .prepare(
        'SELECT plan_id, day_number, is_completed, updated_at FROM user_reading_progress WHERE user_id = ?'
      )
      .all(userId) as unknown as CloudProgressRow[];

    return reply.send({
      success: true,
      syncedAt: new Date().toISOString(),
      cloudState: {
        favorites: cloudFavs.map((f) => ({
          translationId: f.translation_id,
          bookId: f.book_id,
          chapter: f.chapter,
          verse: f.verse,
          highlightColor: f.highlight_color,
          note: f.note,
        })),
        readingProgress: cloudProgress.map((p) => ({
          planId: p.plan_id,
          dayNumber: p.day_number,
          isCompleted: p.is_completed === 1,
        })),
      },
    });
  });
}
