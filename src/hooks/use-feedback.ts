import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { feedbackService, Feedback } from '../services/feedback.service';

export const useFeedback = () => {
  const queryClient = useQueryClient();

  const { data: myFeedback = [], isLoading } = useQuery({
    queryKey: ['myFeedback'],
    queryFn: () => feedbackService.getMyFeedback(),
  });

  const submitMutation = useMutation({
    mutationFn: (data: { message: string; email?: string; type?: string }) =>
      feedbackService.submitFeedback(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myFeedback'] });
    },
  });

  return {
    myFeedback,
    isLoading,
    submitFeedback: submitMutation.mutateAsync,
    isSubmitting: submitMutation.isPending,
  };
};

