import { api } from './api';
import { Mood } from '../types';

export const moodService = {
  async getMoods(): Promise<Mood[]> {
    return await api.get<Mood[]>('/moods');
  },

  async getWeeklySummary(): Promise<any> {
    return await api.get('/moods/weekly-summary');
  },

  async getMonthlySummary(): Promise<any> {
    return await api.get('/moods/monthly-summary');
  },

  async getAverageScore(): Promise<{ averageScore: number }> {
    return await api.get('/moods/average-score');
  },

  // Backend expects: moodType (not mood), date
  async createMood(data: { moodType: string; date?: string }): Promise<Mood> {
    return await api.post<Mood>('/moods', data);
  },
  
  // NOTE: Backend doesn't have update or getByDate endpoints
  // You can only create moods (one per date)
};

