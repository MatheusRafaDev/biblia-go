import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { getDatabase } from '../../db/client.js';

const searchParamsSchema = z.object({
  q: z.string().trim().min(1, 'Termo de busca obrigatório'),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export async function searchRoutes(app: FastifyInstance) {
  const db = getDatabase();

  // GET /api/search/semantic
  app.get('/semantic', async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = searchParamsSchema.safeParse(request.query);
    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Parâmetros de busca inválidos',
        details: parsed.error.format(),
      });
    }

    const { q, limit } = parsed.data;
    const normalizedQ = q
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    const queryTerms = normalizedQ
      .split(/\s+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 1);

    interface ThemeRow {
      id: string;
      theme: string;
      keywords: string;
      book_id: number;
      book_name: string;
      chapter: number;
      verse: number;
      text: string;
    }

    const allThemes = db
      .prepare('SELECT id, theme, keywords, book_id, book_name, chapter, verse, text FROM semantic_themes')
      .all() as unknown as ThemeRow[];

    // Compute semantic relevance score based on query keywords matching theme and verse text
    const scored = allThemes
      .map((row) => {
        const normalizedTheme = row.theme
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');

        const targetText = `${normalizedTheme} ${row.keywords} ${row.text}`
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');

        let matches = 0;
        for (const term of queryTerms) {
          if (targetText.includes(term)) {
            matches++;
          }
        }

        const isThemeMatch =
          normalizedTheme.includes(normalizedQ) || normalizedQ.includes(normalizedTheme);

        if (matches === 0 && !isThemeMatch) {
          return null;
        }

        let score = 0.5;
        if (isThemeMatch) {
          score = 0.85 + (matches / Math.max(queryTerms.length, 1)) * 0.12;
        } else {
          score = 0.65 + (matches / Math.max(queryTerms.length, 1)) * 0.25;
        }

        score = Math.min(Math.max(score, 0.5), 0.99);

        return {
          bookId: row.book_id,
          bookName: row.book_name,
          chapter: row.chapter,
          verse: row.verse,
          text: row.text,
          similarityScore: Math.round(score * 100) / 100,
          themeTags: [row.theme, ...row.keywords.split(' ').slice(0, 3)],
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    // Sort by highest similarity
    scored.sort((a, b) => b.similarityScore - a.similarityScore);

    return reply.send(scored.slice(0, limit));
  });
}
