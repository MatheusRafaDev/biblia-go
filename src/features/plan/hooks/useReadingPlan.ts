import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useReadingPlanRepository } from '@/src/shared/db/client';

export function useReadingPlans() {
  const repo = useReadingPlanRepository();
  return useQuery({
    queryKey: ['reading-plans'],
    queryFn: () => repo.getPlans(),
  });
}

export function useReadingPlanProgress(planId: string) {
  const repo = useReadingPlanRepository();
  return useQuery({
    queryKey: ['reading-plan-progress', planId],
    queryFn: () => repo.getPlanProgress(planId),
  });
}

export function usePlanDayReadings(planId: string) {
  const repo = useReadingPlanRepository();
  return useQuery({
    queryKey: ['plan-day-readings', planId],
    queryFn: () => repo.getDayReadings(planId),
  });
}

export function useToggleDayCompleted(planId: string) {
  const repo = useReadingPlanRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dayNumber: number) => {
      return repo.toggleDayCompleted(planId, dayNumber);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plan-day-readings', planId] });
      queryClient.invalidateQueries({ queryKey: ['reading-plan-progress', planId] });
    },
  });
}

