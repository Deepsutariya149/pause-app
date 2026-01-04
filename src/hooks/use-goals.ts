import { useMutation, useQuery, useQueryClient, useInfiniteQuery, useQueries } from '@tanstack/react-query';
import { goalService, Goal, UserGoal, GoalProgress } from '../services/goal.service';

export const useGoals = () => {
  const queryClient = useQueryClient();

  const {
    data: goalsData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['goals'],
    queryFn: ({ pageParam = 1 }) => goalService.getGoals(pageParam, 20),
    getNextPageParam: (lastPage, allPages) => {
      // Safely check if lastPage and goals exist
      if (!lastPage || !lastPage.goals || !Array.isArray(lastPage.goals)) {
        return undefined;
      }
      const totalLoaded = allPages.reduce((sum, page) => {
        if (!page || !page.goals || !Array.isArray(page.goals)) {
          return sum;
        }
        return sum + page.goals.length;
      }, 0);
      return totalLoaded < lastPage.total ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });

  const goals = goalsData?.pages.flatMap(page => (page?.goals && Array.isArray(page.goals)) ? page.goals : []) || [];
  const goalsTotal = goalsData?.pages[0]?.total || 0;

  const { data: myGoals = [], isLoading: isLoadingMyGoals } = useQuery({
    queryKey: ['myGoals'],
    queryFn: () => goalService.getMyGoals(),
  });

  const { data: todayProgressData, isLoading: isLoadingTodayProgress } = useQuery({
    queryKey: ['todayProgress'],
    queryFn: () => goalService.getTodayProgress(),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Ensure todayProgress is always an array
  const todayProgress = Array.isArray(todayProgressData) ? todayProgressData : [];

  const joinMutation = useMutation({
    mutationFn: (goalId: string) => goalService.joinGoal(goalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myGoals'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });

  const leaveMutation = useMutation({
    mutationFn: (goalId: string) => goalService.leaveGoal(goalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myGoals'] });
      queryClient.invalidateQueries({ queryKey: ['todayProgress'] });
    },
  });

  const updateProgressMutation = useMutation({
    mutationFn: ({ goalId, data }: { goalId: string; data: { completed?: boolean; notes?: string; date?: string } }) =>
      goalService.updateProgress(goalId, data),
    onSuccess: async () => {
      // Invalidate and refetch immediately
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['todayProgress'] }),
        queryClient.invalidateQueries({ queryKey: ['myGoals'] }),
        queryClient.invalidateQueries({ queryKey: ['goalProgress'] }), // Invalidate all progress queries for chart
        queryClient.refetchQueries({ queryKey: ['todayProgress'] }),
        queryClient.refetchQueries({ queryKey: ['myGoals'] }),
      ]);
    },
  });

  return {
    goals,
    goalsTotal,
    isLoading,
    myGoals,
    isLoadingMyGoals,
    todayProgress,
    isLoadingTodayProgress,
    joinGoal: joinMutation.mutateAsync,
    isJoining: joinMutation.isPending,
    leaveGoal: leaveMutation.mutateAsync,
    isLeaving: leaveMutation.isPending,
    updateProgress: updateProgressMutation.mutateAsync,
    isUpdatingProgress: updateProgressMutation.isPending,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetchGoals: refetch,
  };
};

export const useGoalProgress = (goalId: string, startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['goalProgress', goalId, startDate, endDate],
    queryFn: () => goalService.getProgress(goalId, startDate, endDate),
    enabled: !!goalId,
  });
};

// Hook to get weekly completion stats for all goals
export const useWeeklyGoalStats = (myGoals: UserGoal[] | undefined) => {
  // Ensure myGoals is always an array - handle undefined/null cases
  const safeMyGoals: UserGoal[] = Array.isArray(myGoals) ? myGoals : [];

  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      days.push(date);
    }
    return days;
  };

  const last7Days = getLast7Days();
  const endDate = last7Days[6] ? last7Days[6].toISOString() : '';
  const startDate = last7Days[0] ? last7Days[0].toISOString() : '';

  // Use useQueries instead of mapping useQuery (which violates Rules of Hooks)
  // Only fetch if we have goals and valid dates
  const goalIds = safeMyGoals
    .filter((ug) => ug && (typeof ug.goalId === 'object' ? ug.goalId?._id : ug.goalId))
    .map((ug) => (typeof ug.goalId === 'object' ? ug.goalId._id : ug.goalId))
    .filter(Boolean) as string[];

  // Fetch all progress using useQueries (proper way to handle dynamic queries)
  const progressQueries = useQueries({
    queries: goalIds.map((goalId) => ({
      queryKey: ['goalProgress', goalId, startDate, endDate],
      queryFn: () => goalService.getProgress(goalId, startDate, endDate),
      enabled: !!goalId && goalIds.length > 0 && !!startDate && !!endDate,
      staleTime: 5 * 60 * 1000, // 5 minutes
    })),
  });

  const isLoading = progressQueries.some((q: any) => q?.isLoading || false);
  const allProgress = progressQueries.flatMap((q: any) => 
    (q?.data && Array.isArray(q.data)) ? q.data : []
  );

  // Calculate daily completion counts
  const dailyStats = last7Days.map((date) => {
    const dateStr = date.toISOString().split('T')[0];
    const completedCount = allProgress.filter((p) => {
      if (!p || !p.date) return false;
      try {
        const progressDate = new Date(p.date).toISOString().split('T')[0];
        return progressDate === dateStr && p.completed === true;
      } catch {
        return false;
      }
    }).length;
    
    const totalGoals = safeMyGoals.length;
    const completionRate = totalGoals > 0 ? (completedCount / totalGoals) * 100 : 0;

    return {
      date,
      dateStr,
      completedCount,
      totalGoals,
      completionRate,
      value: completionRate,
      label: date.toLocaleDateString('en-US', { weekday: 'short' }).substring(0, 3),
    };
  });

  return {
    dailyStats: Array.isArray(dailyStats) ? dailyStats : [],
    isLoading,
    totalGoals: safeMyGoals.length,
  };
};

