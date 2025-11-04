import { api } from './api';
import { Exercise } from '../types';

export const exerciseService = {
  async getExercises(page: number = 1, limit: number = 50): Promise<{ exercises: Exercise[]; total: number }> {
    return await api.get<{ exercises: Exercise[]; total: number }>(`/exercises?page=${page}&limit=${limit}`);
  },

  async getExercise(id: string): Promise<Exercise> {
    return await api.get<Exercise>(`/exercises/${id}`);
  },
};

