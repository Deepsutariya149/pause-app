import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { journalService } from '../services/journal.service';
import { Journal } from '../types';

export const useJournals = () => {
  const queryClient = useQueryClient();

  const { data: journalsData = { journals: [], total: 0 }, isLoading } = useQuery({
    queryKey: ['journals'],
    queryFn: () => journalService.getJournals(),
  });

  const createMutation = useMutation({
    mutationFn: (data: { title: string; description: string; voiceNoteUrl?: string; mood?: string; date?: string }) =>
      journalService.createJournal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journals'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { title?: string; description?: string; mood?: string; date?: string } }) =>
      journalService.updateJournal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journals'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => journalService.deleteJournal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journals'] });
    },
  });

  return {
    journals: journalsData.journals,
    total: journalsData.total,
    isLoading,
    createJournal: createMutation.mutate,
    updateJournal: updateMutation.mutate,
    deleteJournal: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

