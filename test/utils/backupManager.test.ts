import { describe, it, expect } from 'vitest';
import {
  exportLocalUserData,
  importLocalUserData,
  validateBackupData,
  UserBackupData,
} from '../../src/shared/utils/backupManager';
import { ISqliteDb } from '../../src/shared/db/types';

class MockBackupDb implements ISqliteDb {
  public favorites: Record<string, unknown>[] = [];
  public progress: Record<string, unknown>[] = [];
  public quizScores: Record<string, unknown>[] = [];

  async getAllAsync<T>(sql: string): Promise<T[]> {
    if (sql.includes('FROM favorites')) {
      return this.favorites as unknown as T[];
    }
    if (sql.includes('FROM reading_progress')) {
      return this.progress as unknown as T[];
    }
    if (sql.includes('FROM quiz_scores')) {
      return this.quizScores as unknown as T[];
    }
    return [];
  }

  async getFirstAsync<T>(): Promise<T | null> {
    return null;
  }

  async runAsync(sql: string, ...params: unknown[]): Promise<{ changes: number; lastInsertRowId: number }> {
    if (sql.includes('INTO favorites')) {
      this.favorites.push({
        translation_id: params[0],
        book_id: params[1],
        chapter: params[2],
        verse: params[3],
        color: params[4],
        note: params[5],
        updated_at: params[6],
      });
    } else if (sql.includes('INTO reading_progress')) {
      this.progress.push({
        plan_id: params[0],
        day: params[1],
        completed_at: params[2],
      });
    } else if (sql.includes('INTO quiz_scores')) {
      this.quizScores.push({
        category: params[0],
        score: params[1],
        total_questions: params[2],
        correct_answers: params[3],
        completed_at: params[4],
      });
    }
    return { changes: 1, lastInsertRowId: 1 };
  }

  async execAsync(): Promise<void> {}
  async withTransactionAsync(task: () => Promise<void>): Promise<void> {
    await task();
  }
}

describe('backupManager', () => {
  it('exports local user data correctly into valid JSON structure', async () => {
    const db = new MockBackupDb();
    db.favorites.push({
      translation_id: 'ACF11',
      book_id: 'GEN',
      chapter: 1,
      verse: 1,
      color: '#FFE699',
      note: 'Primeiro versículo da Bíblia',
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    });

    db.progress.push({
      plan_id: 'plano_anual',
      day: 1,
      completed_at: '2026-01-01T00:00:00.000Z',
    });

    db.quizScores.push({
      category: 'Gênesis',
      score: 100,
      total_questions: 5,
      correct_answers: 5,
      completed_at: '2026-01-01T00:00:00.000Z',
    });

    const backup = await exportLocalUserData(db);

    expect(backup.version).toBe(1);
    expect(backup.exportedAt).toBeDefined();
    expect(backup.favorites).toHaveLength(1);
    expect(backup.readingProgress).toHaveLength(1);
    expect(backup.quizScores).toHaveLength(1);

    // Validate using Zod schema
    const validated = validateBackupData(backup);
    expect(validated.version).toBe(1);
  });

  it('rejects invalid backup schema structure', () => {
    expect(() =>
      validateBackupData({
        version: 99, // invalid version
        exportedAt: 'invalid-date',
        favorites: 'not-an-array',
      })
    ).toThrow();
  });

  it('imports valid backup data into target database', async () => {
    const db = new MockBackupDb();
    const backupData: UserBackupData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      favorites: [
        {
          translation_id: 'ARA',
          book_id: 'JHN',
          chapter: 3,
          verse: 16,
          color: '#B9FBC0',
          note: 'Versículo central da graça',
        },
      ],
      readingProgress: [{ plan_id: 'nt_90_dias', day: 14 }],
      quizScores: [
        {
          category: 'Evangelhos',
          score: 80,
          total_questions: 10,
          correct_answers: 8,
        },
      ],
    };

    const summary = await importLocalUserData(db, backupData);

    expect(summary.favoritesImported).toBe(1);
    expect(summary.progressImported).toBe(1);
    expect(summary.quizScoresImported).toBe(1);

    expect(db.favorites).toHaveLength(1);
    expect(db.favorites[0].book_id).toBe('JHN');
    expect(db.progress).toHaveLength(1);
    expect(db.progress[0].day).toBe(14);
    expect(db.quizScores).toHaveLength(1);
    expect(db.quizScores[0].score).toBe(80);
  });
});
