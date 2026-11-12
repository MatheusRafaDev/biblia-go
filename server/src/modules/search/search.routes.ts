import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { getDatabase } from '../../db/client.js';

const searchParamsSchema = z.object({
  q: z.string().min(1, 'Termo de busca obrigatório'),
  limit: z.coerce.number().min(1).max(50).default(10),
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
    const queryTerms = q
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .split(/\s+/)
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
    const scored = allThemes.map((row) => {
      const targetText = `${row.theme} ${row.keywords} ${row.text}`
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      let matches = 0;
      for (const term of queryTerms) {
        if (targetText.includes(term)) {
          matches++;
        }
      }

      // Base similarity score
      let score = matches > 0 ? 0.65 + (matches / Math.max(queryTerms.length, 1)) * 0.3 : 0.45;
      if (row.theme.includes(q.toLowerCase())) {
        score = Math.min(score + 0.15, 0.98);
      }

      return {
        bookId: row.book_id,
        bookName: row.book_name,
        chapter: row.chapter,
        verse: row.verse,
        text: row.text,
        similarityScore: Math.round(score * 100) / 100,
        themeTags: [row.theme, ...row.keywords.split(' ').slice(0, 3)],
      };
    });

    // Sort by highest similarity
    scored.sort((a, b) => b.similarityScore - a.similarityScore);

    return reply.send(scored.slice(0, limit));
  });
}
