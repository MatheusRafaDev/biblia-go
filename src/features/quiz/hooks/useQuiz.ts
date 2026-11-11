import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useQuizRepository } from '@/src/shared/db/client';

export function useQuizHistory() {
  const repo = useQuizRepository();
  return useQuery({
    queryKey: ['quiz-history'],
    queryFn: () => repo.getHistory(),
  });
}

export function useQuizStats() {
  const repo = useQuizRepository();
  return useQuery({
    queryKey: ['quiz-stats'],
    queryFn: () => repo.getStats(),
  });
}

export function useSaveQuizResult() {
  const repo = useQuizRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      category,
      score,
      totalQuestions,
    }: {
      category: string;
      score: number;
      totalQuestions: number;
    }) => {
      return repo.saveResult(category, score, totalQuestions);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-history'] });
      queryClient.invalidateQueries({ queryKey: ['quiz-stats'] });
    },
  });
}
