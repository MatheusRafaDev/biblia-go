import { describe, it, expect } from 'vitest';
import {
  createInitialPerformanceStats,
  calculateAccuracy,
  recordQuizSession,
  findWeakestCategory,
} from '../../src/features/quiz/utils/quizPerformance';

describe('quizPerformance', () => {
  it('creates clean initial performance stats', () => {
    const stats = createInitialPerformanceStats();
    expect(stats.totalGames).toBe(0);
    expect(stats.highestScore).toBe(0);
    expect(stats.currentStreak).toBe(0);
    expect(stats.categoryStats).toEqual({});
  });

  it('calculates accuracy percentage accurately', () => {
    expect(calculateAccuracy(8, 10)).toBe(80);
    expect(calculateAccuracy(1, 3)).toBe(33);
    expect(calculateAccuracy(0, 0)).toBe(0);
  });

  it('updates stats and increments streak on perfect score', () => {
    let stats = createInitialPerformanceStats();

    stats = recordQuizSession(stats, {
      score: 100,
      category: 'Novo Testamento',
      totalQuestions: 5,
      correctAnswers: 5,
    });

    expect(stats.totalGames).toBe(1);
    expect(stats.currentStreak).toBe(1);
    expect(stats.maxStreak).toBe(1);
    expect(stats.highestScore).toBe(100);

    // Second perfect game
    stats = recordQuizSession(stats, {
      score: 120,
      category: 'Novo Testamento',
      totalQuestions: 5,
      correctAnswers: 5,
    });

    expect(stats.currentStreak).toBe(2);
    expect(stats.maxStreak).toBe(2);
    expect(stats.highestScore).toBe(120);

    // Imperfect game resets current streak but preserves max streak
    stats = recordQuizSession(stats, {
      score: 40,
      category: 'Antigo Testamento',
      totalQuestions: 5,
      correctAnswers: 2,
    });

    expect(stats.currentStreak).toBe(0);
    expect(stats.maxStreak).toBe(2);
  });

  it('identifies weakest category for targeted study recommendations', () => {
    let stats = createInitialPerformanceStats();
    stats = recordQuizSession(stats, {
      score: 100,
      category: 'Gospels',
      totalQuestions: 10,
      correctAnswers: 9, // 90%
    });
    stats = recordQuizSession(stats, {
      score: 50,
      category: 'Prophets',
      totalQuestions: 10,
      correctAnswers: 4, // 40%
    });

    const weakest = findWeakestCategory(stats.categoryStats);
    expect(weakest).toBe('Prophets');
  });
});
