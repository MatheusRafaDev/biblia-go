export interface QuizPerformanceStats {
  totalGames: number;
  totalQuestions: number;
  totalCorrect: number;
  highestScore: number;
  currentStreak: number;
  maxStreak: number;
  categoryStats: Record<string, { total: number; correct: number }>;
}

export interface QuizSessionSummary {
  score: number;
  category: string;
  totalQuestions: number;
  correctAnswers: number;
}

export function createInitialPerformanceStats(): QuizPerformanceStats {
  return {
    totalGames: 0,
    totalQuestions: 0,
    totalCorrect: 0,
    highestScore: 0,
    currentStreak: 0,
    maxStreak: 0,
    categoryStats: {},
  };
}

export function calculateAccuracy(correct: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((correct / total) * 100);
}

export function recordQuizSession(
  prev: QuizPerformanceStats,
  session: QuizSessionSummary
): QuizPerformanceStats {
  const isPerfect = session.correctAnswers === session.totalQuestions;
  const newStreak = isPerfect ? prev.currentStreak + 1 : 0;
  const maxStreak = Math.max(prev.maxStreak, newStreak);

  const prevCategory = prev.categoryStats[session.category] || { total: 0, correct: 0 };
  const updatedCategory = {
    total: prevCategory.total + session.totalQuestions,
    correct: prevCategory.correct + session.correctAnswers,
  };

  return {
    totalGames: prev.totalGames + 1,
    totalQuestions: prev.totalQuestions + session.totalQuestions,
    totalCorrect: prev.totalCorrect + session.correctAnswers,
    highestScore: Math.max(prev.highestScore, session.score),
    currentStreak: newStreak,
    maxStreak,
    categoryStats: {
      ...prev.categoryStats,
      [session.category]: updatedCategory,
    },
  };
}

export function findWeakestCategory(categoryStats: Record<string, { total: number; correct: number }>): string | null {
  const categories = Object.keys(categoryStats);
  if (categories.length === 0) return null;

  let weakest = categories[0];
  let lowestRate = 101;

  for (const cat of categories) {
    const data = categoryStats[cat];
    const rate = calculateAccuracy(data.correct, data.total);
    if (rate < lowestRate) {
      lowestRate = rate;
      weakest = cat;
    }
  }

  return weakest;
}
