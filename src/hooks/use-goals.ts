import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { goalService, Goal, UserGoal, GoalProgress } from '../services/goal.service';

export const useGoals = () => {
  const queryClient = useQueryClient();

  const { data: goals = { goals: [], total: 0 }, isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: () => goalService.getGoals(),
  });

  const { data: myGoals = [], isLoading: isLoadingMyGoals } = useQuery({
    queryKey: ['myGoals'],
    queryFn: () => goalService.getMyGoals(),
  });

  const { data: todayProgress = [], isLoading: isLoadingTodayProgress } = useQuery({
    queryKey: ['todayProgress'],
    queryFn: () => goalService.getTodayProgress(),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

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
    goals: goals.goals,
    goalsTotal: goals.total,
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
export const useWeeklyGoalStats = (myGoals: UserGoal[]) => {
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
  const endDate = last7Days[6].toISOString();
  const startDate = last7Days[0].toISOString();

  // Fetch progress for all user goals
  const progressQueries = myGoals.map((userGoal) => {
    const goalId = typeof userGoal.goalId === 'object' ? userGoal.goalId._id : userGoal.goalId;
    return useQuery({
      queryKey: ['goalProgress', goalId, startDate, endDate],
      queryFn: () => goalService.getProgress(goalId, startDate, endDate),
      enabled: !!goalId && myGoals.length > 0,
    });
  });

  const isLoading = progressQueries.some(q => q.isLoading);
  const allProgress = progressQueries.flatMap(q => q.data || []);

  // Calculate daily completion counts
  const dailyStats = last7Days.map((date) => {
    const dateStr = date.toISOString().split('T')[0];
    const completedCount = allProgress.filter((p) => {
      const progressDate = new Date(p.date).toISOString().split('T')[0];
      return progressDate === dateStr && p.completed;
    }).length;
    
    const totalGoals = myGoals.length;
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
    dailyStats,
    isLoading,
    totalGoals: myGoals.length,
  };
};

