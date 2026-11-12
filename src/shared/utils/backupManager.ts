import { z } from 'zod';
import { ISqliteDb } from '../db/types';

export const UserBackupSchema = z.object({
  version: z.literal(1),
  exportedAt: z.string(),
  favorites: z.array(
    z.object({
      translation_id: z.string(),
      book_id: z.string(),
      chapter: z.number(),
      verse: z.number(),
      color: z.string().optional().nullable(),
      note: z.string().optional().nullable(),
      created_at: z.string().optional().nullable(),
      updated_at: z.string().optional().nullable(),
    })
  ),
  readingProgress: z.array(
    z.object({
      plan_id: z.string(),
      day: z.number(),
      completed_at: z.string().optional().nullable(),
    })
  ),
  quizScores: z.array(
    z.object({
      category: z.string(),
      score: z.number(),
      total_questions: z.number(),
      correct_answers: z.number(),
      completed_at: z.string().optional().nullable(),
    })
  ),
});

export type UserBackupData = z.infer<typeof UserBackupSchema>;

export interface ImportSummary {
  favoritesImported: number;
  progressImported: number;
  quizScoresImported: number;
}

export async function exportLocalUserData(db: ISqliteDb): Promise<UserBackupData> {
  const favorites = await db.getAllAsync<{
    translation_id: string;
    book_id: string;
    chapter: number;
    verse: number;
    color: string | null;
    note: string | null;
    created_at: string | null;
    updated_at: string | null;
  }>('SELECT translation_id, book_id, chapter, verse, color, note, created_at, updated_at FROM favorites');

  const readingProgress = await db.getAllAsync<{
    plan_id: string;
    day: number;
    completed_at: string | null;
  }>('SELECT plan_id, day, completed_at FROM reading_progress');

  const quizScores = await db.getAllAsync<{
    category: string;
    score: number;
    total_questions: number;
    correct_answers: number;
    completed_at: string | null;
  }>('SELECT category, score, total_questions, correct_answers, completed_at FROM quiz_scores');

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    favorites,
    readingProgress,
    quizScores,
  };
}

export function validateBackupData(data: unknown): UserBackupData {
  return UserBackupSchema.parse(data);
}

export async function importLocalUserData(
  db: ISqliteDb,
  backup: UserBackupData
): Promise<ImportSummary> {
  let favCount = 0;
  for (const fav of backup.favorites) {
    await db.runAsync(
      `INSERT OR REPLACE INTO favorites (translation_id, book_id, chapter, verse, color, note, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      fav.translation_id,
      fav.book_id,
      fav.chapter,
      fav.verse,
      fav.color ?? '#FFE699',
      fav.note ?? null,
      fav.updated_at ?? new Date().toISOString()
    );
    favCount++;
  }

  let progCount = 0;
  for (const p of backup.readingProgress) {
    await db.runAsync(
      `INSERT OR REPLACE INTO reading_progress (plan_id, day, completed_at)
       VALUES (?, ?, ?)`,
      p.plan_id,
      p.day,
      p.completed_at ?? new Date().toISOString()
    );
    progCount++;
  }

  let quizCount = 0;
  for (const q of backup.quizScores) {
    await db.runAsync(
      `INSERT INTO quiz_scores (category, score, total_questions, correct_answers, completed_at)
       VALUES (?, ?, ?, ?, ?)`,
      q.category,
      q.score,
      q.total_questions,
      q.correct_answers,
      q.completed_at ?? new Date().toISOString()
    );
    quizCount++;
  }

  return {
    favoritesImported: favCount,
    progressImported: progCount,
    quizScoresImported: quizCount,
  };
}

