export interface StreakMilestone {
  id: string;
  daysRequired: number;
  title: string;
  description: string;
  icon: string;
}

export const STREAK_MILESTONES: StreakMilestone[] = [
  {
    id: 'streak_3',
    daysRequired: 3,
    title: 'Primeiros Passos',
    description: 'Completou 3 dias consecutivos de leitura bíblica.',
    icon: '🥉',
  },
  {
    id: 'streak_7',
    daysRequired: 7,
    title: 'Uma Semana Fiel',
    description: '1 semana mantendo o hábito devocional diário.',
    icon: '🥈',
  },
  {
    id: 'streak_14',
    daysRequired: 14,
    title: 'Hábito Sagrado',
    description: 'Duas semanas ininterruptas de comunhão com a Palavra.',
    icon: '🥇',
  },
  {
    id: 'streak_30',
    daysRequired: 30,
    title: 'Constância Mensal',
    description: '30 dias de leitura diária sem falhar nenhum dia.',
    icon: '🌟',
  },
  {
    id: 'streak_100',
    daysRequired: 100,
    title: 'Centurião da Palavra',
    description: '100 dias consecutivos de imersão bíblica.',
    icon: '👑',
  },
  {
    id: 'streak_365',
    daysRequired: 365,
    title: 'Jornada Anual Completa',
    description: 'Um ano inteiro perseverando nas Escrituras!',
    icon: '🏆',
  },
];

export function getEarnedMilestones(streakDays: number): StreakMilestone[] {
  return STREAK_MILESTONES.filter((m) => streakDays >= m.daysRequired);
}

export function getNextMilestone(streakDays: number): {
  nextMilestone: StreakMilestone;
  daysRemaining: number;
} | null {
  const next = STREAK_MILESTONES.find((m) => streakDays < m.daysRequired);
  if (!next) return null;

  return {
    nextMilestone: next,
    daysRemaining: next.daysRequired - streakDays,
  };
}
