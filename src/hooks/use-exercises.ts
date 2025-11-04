import { useQuery } from '@tanstack/react-query';
import { exerciseService } from '../services/exercise.service';

export const useExercises = () => {
  const { data: exercisesData = { exercises: [], total: 0 }, isLoading } = useQuery({
    queryKey: ['exercises'],
    queryFn: () => exerciseService.getExercises(),
  });

  return {
    exercises: exercisesData.exercises,
    total: exercisesData.total,
    isLoading,
  };
};

