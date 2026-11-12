import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { getDatabase } from '../../db/client.js';

const chatRequestSchema = z.object({
  question: z.string().trim().min(2, 'Pergunta muito curta').max(500, 'Pergunta muito longa'),
  contextPassage: z.string().trim().max(1000).optional(),
});

export async function aiRoutes(app: FastifyInstance) {
  const db = getDatabase();

  // POST /api/ai/chat (RAG Biblical Assistant)
  app.post('/chat', async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = chatRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Requisição inválida',
        details: parsed.error.format(),
      });
    }

    const { question, contextPassage } = parsed.data;

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

    // Normalize query
    const normalizedQuery = `${question} ${contextPassage || ''}`
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    const queryWords = normalizedQuery
      .split(/\s+/)
      .map((w) => w.trim())
      .filter((w) => w.length > 2);

    // Match question keywords against knowledge base
    const matches = allThemes.filter((t) => {
      const tokens = `${t.theme} ${t.keywords} ${t.text}`
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      return queryWords.some((qWord) => tokens.includes(qWord));
    });

    const isDirectMatch = matches.length > 0;
    const relevantVerses = isDirectMatch ? matches.slice(0, 2) : allThemes.slice(0, 1);
    const primaryVerse = relevantVerses[0];

    const answer = isDirectMatch
      ? `À luz das Escrituras Sagradas, a resposta para sua dúvida encontra fundamento em ${primaryVerse.book_name} ${primaryVerse.chapter}:${primaryVerse.verse}. ` +
        `O texto bíblico declara: "${primaryVerse.text}". ` +
        `Este princípio nos ensina sobre a providência, fidelidade e o amor soberano de Deus diante dos desafios da vida cristã. ` +
        `Lembre-se de meditar continuamente nessa promessa em oração.`
      : `Embora sua consulta abranja um tema amplo, as Escrituras nos orientam a manter os olhos firmes nas promessas divinas. ` +
        `Em ${primaryVerse.book_name} ${primaryVerse.chapter}:${primaryVerse.verse}, a Palavra nos instrui: "${primaryVerse.text}". ` +
        `Busque a orientação do Senhor em oração e continue examinando os textos bíblicos.`;

    const citations = relevantVerses.map((v) => ({
      bookId: v.book_id,
      bookName: v.book_name,
      chapter: v.chapter,
      verse: v.verse,
      text: v.text,
    }));

    return reply.send({
      answer,
      citations,
      confidence: isDirectMatch ? 0.95 : 0.72,
    });
  });
}
