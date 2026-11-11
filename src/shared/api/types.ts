import { z } from 'zod';

export const RagCitationSchema = z.object({
  bookId: z.number(),
  bookName: z.string(),
  chapter: z.number(),
  verse: z.number(),
  text: z.string(),
});

export const RagChatResponseSchema = z.object({
  answer: z.string(),
  citations: z.array(RagCitationSchema),
  confidence: z.number().min(0).max(1),
});

export type RagChatResponse = z.infer<typeof RagChatResponseSchema>;

export const SemanticSearchResultSchema = z.object({
  bookId: z.number(),
  bookName: z.string(),
  chapter: z.number(),
  verse: z.number(),
  text: z.string(),
  similarityScore: z.number(),
  themeTags: z.array(z.string()),
});

export type SemanticSearchResult = z.infer<typeof SemanticSearchResultSchema>;

export const SyncPayloadSchema = z.object({
  userId: z.string(),
  lastSyncedAt: z.string(),
  favorites: z.array(
    z.object({
      translationId: z.string(),
      bookId: z.number(),
      chapter: z.number(),
      verse: z.number(),
      highlightColor: z.string().nullable(),
      note: z.string().nullable(),
    })
  ),
  readingProgress: z.array(
    z.object({
      planId: z.string(),
      dayNumber: z.number(),
      isCompleted: z.boolean(),
    })
  ),
});

export type SyncPayload = z.infer<typeof SyncPayloadSchema>;
