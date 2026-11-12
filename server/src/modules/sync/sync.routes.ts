import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import crypto from 'node:crypto';
import { getDatabase } from '../../db/client.js';

const syncFavoriteItemSchema = z.object({
  translationId: z.string(),
  bookId: z.number(),
  chapter: z.number(),
  verse: z.number(),
  highlightColor: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
});

const syncProgressItemSchema = z.object({
  planId: z.string(),
  dayNumber: z.number(),
  isCompleted: z.boolean(),
});

const syncPayloadSchema = z.object({
  userId: z.string(),
  lastSyncedAt: z.string().optional(),
  favorites: z.array(syncFavoriteItemSchema).default([]),
  readingProgress: z.array(syncProgressItemSchema).default([]),
});

export async function syncRoutes(app: FastifyInstance) {
  const db = getDatabase();

  // POST /api/sync
  app.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = syncPayloadSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Payload de sincronização inválido',
        details: parsed.error.format(),
      });
    }

    const { userId, favorites, readingProgress } = parsed.data;

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
      .prepare('SELECT plan_id, day_number, is_completed, updated_at FROM user_reading_progress WHERE user_id = ?')
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
