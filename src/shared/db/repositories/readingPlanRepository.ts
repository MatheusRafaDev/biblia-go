import { ISqliteDb } from '../types';
import { DEFAULT_PLANS } from '@/src/features/plan/data/defaultPlans';

export interface DbReadingPlan {
  id: string;
  title: string;
  description: string;
  total_days: number;
}

export interface DbReadingDay {
  id: number;
  plan_id: string;
  day_number: number;
  passage_reference: string;
  completed_at: string | null;
  is_completed: number;
}

export interface PlanProgressSummary {
  planId: string;
  totalDays: number;
  completedDays: number;
  percent: number;
  streak: number;
}

export interface IReadingPlanRepository {
  ensurePlansSeeded(): Promise<void>;
  getPlans(): Promise<DbReadingPlan[]>;
  getDayReadings(planId: string): Promise<DbReadingDay[]>;
  getPlanProgress(planId: string): Promise<PlanProgressSummary>;
  toggleDayCompleted(planId: string, dayNumber: number): Promise<boolean>;
}

export class ReadingPlanRepository implements IReadingPlanRepository {
  constructor(private db: ISqliteDb) {}

  async ensurePlansSeeded(): Promise<void> {
    for (const plan of DEFAULT_PLANS) {
      // 1. Insert plan
      await this.db.runAsync(
        `INSERT OR IGNORE INTO reading_plans (id, title, description, total_days) VALUES (?, ?, ?, ?);`,
        plan.id,
        plan.title,
        plan.description,
        plan.totalDays
      );

      // Check if days already exist
      const existing = await this.db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM reading_progress WHERE plan_id = ?;`,
        plan.id
      );

      if (!existing || existing.count === 0) {
        await this.db.withTransactionAsync(async () => {
          for (const r of plan.readings) {
            await this.db.runAsync(
              `INSERT INTO reading_progress (plan_id, day_number, passage_reference, is_completed)
               VALUES (?, ?, ?, 0);`,
              plan.id,
              r.day,
              r.passage
            );
          }
        });
      }
    }
  }

  async getPlans(): Promise<DbReadingPlan[]> {
    await this.ensurePlansSeeded();
    return this.db.getAllAsync<DbReadingPlan>(
      `SELECT id, title, description, total_days FROM reading_plans ORDER BY total_days ASC;`
    );
  }

  async getDayReadings(planId: string): Promise<DbReadingDay[]> {
    await this.ensurePlansSeeded();
    return this.db.getAllAsync<DbReadingDay>(
      `SELECT id, plan_id, day_number, passage_reference, completed_at, is_completed 
       FROM reading_progress 
       WHERE plan_id = ? 
       ORDER BY day_number ASC;`,
      planId
    );
  }

  async getPlanProgress(planId: string): Promise<PlanProgressSummary> {
    await this.ensurePlansSeeded();
    const plan = await this.db.getFirstAsync<DbReadingPlan>(
      `SELECT id, title, description, total_days FROM reading_plans WHERE id = ?;`,
      planId
    );

    const totalDays = plan?.total_days ?? 90;

    const completedRow = await this.db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM reading_progress WHERE plan_id = ? AND is_completed = 1;`,
      planId
    );
    const completedDays = completedRow?.count ?? 0;
    const percent = Math.round((completedDays / totalDays) * 100);

    // Calculate streak from completed days
    const completedDaysList = await this.db.getAllAsync<{ day_number: number; completed_at: string }>(
      `SELECT day_number, completed_at FROM reading_progress 
       WHERE plan_id = ? AND is_completed = 1 
       ORDER BY day_number DESC;`,
      planId
    );

    let streak = 0;
    if (completedDaysList.length > 0) {
      streak = completedDaysList.length;
    }

    return {
      planId,
      totalDays,
      completedDays,
      percent,
      streak,
    };
  }

  async toggleDayCompleted(planId: string, dayNumber: number): Promise<boolean> {
    const row = await this.db.getFirstAsync<{ is_completed: number }>(
      `SELECT is_completed FROM reading_progress WHERE plan_id = ? AND day_number = ?;`,
      planId,
      dayNumber
    );

    const nextState = row?.is_completed === 1 ? 0 : 1;
    const completedAt = nextState === 1 ? new Date().toISOString() : null;

    await this.db.runAsync(
      `UPDATE reading_progress 
       SET is_completed = ?, completed_at = ? 
       WHERE plan_id = ? AND day_number = ?;`,
      nextState,
      completedAt,
      planId,
      dayNumber
    );

    return nextState === 1;
  }
}
