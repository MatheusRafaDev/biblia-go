import { describe, it, expect } from 'vitest';
import {
  getEarnedMilestones,
  getNextMilestone,
  STREAK_MILESTONES,
} from '../../src/features/plan/utils/streakMilestones';

describe('streakMilestones', () => {
  it('returns empty array when streak is below lowest milestone', () => {
    const earned = getEarnedMilestones(2);
    expect(earned).toEqual([]);
  });

  it('returns earned milestones as streak progresses', () => {
    const earned7 = getEarnedMilestones(7);
    expect(earned7.map((m) => m.id)).toEqual(['streak_3', 'streak_7']);

    const earned30 = getEarnedMilestones(30);
    expect(earned30.map((m) => m.id)).toEqual([
      'streak_3',
      'streak_7',
      'streak_14',
      'streak_30',
    ]);
  });

  it('calculates the next milestone and remaining days', () => {
    const next1 = getNextMilestone(1);
    expect(next1).not.toBeNull();
    expect(next1?.nextMilestone.id).toBe('streak_3');
    expect(next1?.daysRemaining).toBe(2);

    const next10 = getNextMilestone(10);
    expect(next10?.nextMilestone.id).toBe('streak_14');
    expect(next10?.daysRemaining).toBe(4);
  });

  it('returns null when all milestones are achieved', () => {
    const nextMax = getNextMilestone(400);
    expect(nextMax).toBeNull();
  });
});
