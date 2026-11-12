import { describe, it, expect } from 'vitest';
import {
  calculateQuizPoints,
  getRankTitle,
  DIFFICULTY_MULTIPLIERS,
} from '../../src/features/quiz/utils/quizScoring';

describe('quizScoring', () => {
  it('applies difficulty multipliers correctly', () => {
    expect(DIFFICULTY_MULTIPLIERS.facil).toBe(1.0);
    expect(DIFFICULTY_MULTIPLIERS.medio).toBe(1.5);
    expect(DIFFICULTY_MULTIPLIERS.dificil).toBe(2.0);
  });

  it('calculates score with streak bonus and difficulty', () => {
    const result = calculateQuizPoints({
      basePoints: 100,
      difficulty: 'dificil',
      currentStreak: 3, // streak bonus = 2 * 10% = 20%
      timeSpentSeconds: 25, // no time bonus (> 15s)
      timeLimitSeconds: 30,
    });

    expect(result.streakBonus).toBe(20);
    expect(result.timeBonus).toBe(0);
    expect(result.difficultyMultiplier).toBe(2.0);
    expect(result.totalPoints).toBe((100 + 20) * 2); // 240
    expect(result.rankTitle).toBe('Mestre Bíblico');
  });

  it('calculates time bonus for fast answers', () => {
    const result = calculateQuizPoints({
      basePoints: 100,
      difficulty: 'facil',
      currentStreak: 1, // streak bonus = 0
      timeSpentSeconds: 0, // max speed bonus
      timeLimitSeconds: 30,
    });

    expect(result.timeBonus).toBe(25);
    expect(result.totalPoints).toBe(125);
  });

  it('assigns correct ranks based on score brackets', () => {
    expect(getRankTitle(160)).toBe('Mestre Bíblico');
    expect(getRankTitle(110)).toBe('Doutor das Escrituras');
    expect(getRankTitle(80)).toBe('Estudioso Fiel');
    expect(getRankTitle(45)).toBe('Aprendiz da Palavra');
    expect(getRankTitle(10)).toBe('Iniciante');
  });
});
