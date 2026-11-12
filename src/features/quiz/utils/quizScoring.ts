export type QuizDifficulty = 'facil' | 'medio' | 'dificil';

export interface ScoreCalculationParams {
  basePoints: number;
  difficulty: QuizDifficulty;
  currentStreak: number;
  timeSpentSeconds: number;
  timeLimitSeconds?: number;
}

export interface ScoreResult {
  totalPoints: number;
  difficultyMultiplier: number;
  streakBonus: number;
  timeBonus: number;
  rankTitle: string;
}

export const DIFFICULTY_MULTIPLIERS: Record<QuizDifficulty, number> = {
  facil: 1.0,
  medio: 1.5,
  dificil: 2.0,
};

export function calculateQuizPoints(params: ScoreCalculationParams): ScoreResult {
  const { basePoints, difficulty, currentStreak, timeSpentSeconds, timeLimitSeconds = 30 } = params;

  const mult = DIFFICULTY_MULTIPLIERS[difficulty] || 1.0;

  // Streak bonus: +10% per consecutive correct answer up to +50% max
  const streakBonusPercent = Math.min(0.5, Math.max(0, currentStreak - 1) * 0.1);
  const streakBonus = Math.round(basePoints * streakBonusPercent);

  // Time bonus: fast responses get up to 25% extra if under half the time limit
  let timeBonus = 0;
  if (timeSpentSeconds < timeLimitSeconds / 2) {
    const timeFactor = 1 - timeSpentSeconds / (timeLimitSeconds / 2);
    timeBonus = Math.round(basePoints * 0.25 * timeFactor);
  }

  const totalPoints = Math.round((basePoints + streakBonus + timeBonus) * mult);

  return {
    totalPoints,
    difficultyMultiplier: mult,
    streakBonus,
    timeBonus,
    rankTitle: getRankTitle(totalPoints),
  };
}

export function getRankTitle(points: number): string {
  if (points >= 150) return 'Mestre Bíblico';
  if (points >= 100) return 'Doutor das Escrituras';
  if (points >= 60) return 'Estudioso Fiel';
  if (points >= 30) return 'Aprendiz da Palavra';
  return 'Iniciante';
}
