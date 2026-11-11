import { describe, it, expect } from 'vitest';
import {
  RagChatResponseSchema,
  SemanticSearchResultSchema,
  SyncPayloadSchema,
} from '@/src/shared/api/types';

describe('Phase 2 API Contracts and Zod Validation', () => {
  it('deve validar contrato de resposta RAG com citações bíblicas', () => {
    const validRagResponse = {
      answer: 'Jesus ensina sobre o amor ao próximo na parábola do Bom Samaritano.',
      confidence: 0.95,
      citations: [
        {
          bookId: 42,
          bookName: 'Lucas',
          chapter: 10,
          verse: 25,
          text: 'E eis que se levantou um certo doutor da lei...',
        },
      ],
    };

    const parsed = RagChatResponseSchema.parse(validRagResponse);
    expect(parsed.answer).toBeDefined();
    expect(parsed.citations).toHaveLength(1);
    expect(parsed.citations[0].bookName).toBe('Lucas');
  });

  it('deve validar contrato de busca semântica vetorial', () => {
    const validSearchResult = {
      bookId: 19,
      bookName: 'Salmos',
      chapter: 23,
      verse: 1,
      text: 'O Senhor é o meu pastor, nada me faltará.',
      similarityScore: 0.89,
      themeTags: ['provisão', 'cuidado divino', 'paz'],
    };

    const parsed = SemanticSearchResultSchema.parse(validSearchResult);
    expect(parsed.similarityScore).toBe(0.89);
    expect(parsed.themeTags).toContain('provisão');
  });

  it('deve validar payload de sincronização de progresso do usuário', () => {
    const validSyncPayload = {
      userId: 'usr_123456',
      lastSyncedAt: new Date().toISOString(),
      favorites: [
        {
          translationId: 'ACF11',
          bookId: 1,
          chapter: 1,
          verse: 1,
          highlightColor: '#FFF59D',
          note: 'Criação do universo.',
        },
      ],
      readingProgress: [
        {
          planId: 'nt_90_days',
          dayNumber: 1,
          isCompleted: true,
        },
      ],
    };

    const parsed = SyncPayloadSchema.parse(validSyncPayload);
    expect(parsed.userId).toBe('usr_123456');
    expect(parsed.favorites).toHaveLength(1);
    expect(parsed.readingProgress[0].isCompleted).toBe(true);
  });
});

