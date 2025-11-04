import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { moodService } from '../services/mood.service';

export const useMoods = () => {
  const queryClient = useQueryClient();

  const { data: moods = [], isLoading } = useQuery({
    queryKey: ['moods'],
    queryFn: () => moodService.getMoods(),
  });

  const createMutation = useMutation({
    mutationFn: (data: { moodType: string; date?: string }) =>
      moodService.createMood(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moods'] });
    },
  });

  return {
    moods,
    isLoading,
    createMood: createMutation.mutate,
    isCreating: createMutation.isPending,
  };
};

