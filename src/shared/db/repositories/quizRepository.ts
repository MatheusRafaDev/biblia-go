import { ISqliteDb } from '../types';

export interface DbQuizResult {
  id: number;
  category: string;
  score: number;
  total_questions: number;
  played_at: string;
}

export interface QuizStats {
  totalGames: number;
  highestScore: number;
  averagePercent: number;
}

export interface IQuizRepository {
  saveResult(category: string, score: number, totalQuestions: number): Promise<number>;
  getHistory(): Promise<DbQuizResult[]>;
  getStats(): Promise<QuizStats>;
  clearHistory(): Promise<void>;
}

export class QuizRepository implements IQuizRepository {
  constructor(private db: ISqliteDb) {}

  async saveResult(category: string, score: number, totalQuestions: number): Promise<number> {
    const res = await this.db.runAsync(
      `INSERT INTO quiz_progress (category, score, total_questions) VALUES (?, ?, ?);`,
      category,
      score,
      totalQuestions
    );
    return res.lastInsertRowId;
  }

  async getHistory(): Promise<DbQuizResult[]> {
    return this.db.getAllAsync<DbQuizResult>(
      `SELECT id, category, score, total_questions, played_at 
       FROM quiz_progress 
       ORDER BY id DESC 
       LIMIT 20;`
    );
  }

  async getStats(): Promise<QuizStats> {
    const totalRow = await this.db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM quiz_progress;`
    );
    const totalGames = totalRow?.count ?? 0;

    if (totalGames === 0) {
      return { totalGames: 0, highestScore: 0, averagePercent: 0 };
    }

    const highRow = await this.db.getFirstAsync<{ maxScore: number }>(
      `SELECT MAX(score) as maxScore FROM quiz_progress;`
    );
    const highestScore = highRow?.maxScore ?? 0;

    const allGames = await this.getHistory();
    const sumPercent = allGames.reduce(
      (acc, g) => acc + (g.total_questions > 0 ? (g.score / g.total_questions) * 100 : 0),
      0
    );
    const averagePercent = Math.round(sumPercent / allGames.length);

    return {
      totalGames,
      highestScore,
      averagePercent,
    };
  }

  async clearHistory(): Promise<void> {
    await this.db.runAsync(`DELETE FROM quiz_progress;`);
  }
}
