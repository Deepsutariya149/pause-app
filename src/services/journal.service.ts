import { api } from './api';
import { Journal } from '../types';

export const journalService = {
  async getJournals(page: number = 1, limit: number = 50): Promise<{ journals: Journal[]; total: number }> {
    return await api.get<{ journals: Journal[]; total: number }>(`/journals?page=${page}&limit=${limit}`);
  },

  async getJournal(id: string): Promise<Journal> {
    return await api.get<Journal>(`/journals/${id}`);
  },

  // Backend expects: title, description (not content), mood, date, voiceNoteUrl
  async createJournal(data: { title: string; description: string; voiceNoteUrl?: string; mood?: string; date?: string }): Promise<Journal> {
    return await api.post<Journal>('/journals', data);
  },

  // Backend expects: title, description (not content), mood, date
  async updateJournal(id: string, data: { title?: string; description?: string; mood?: string; date?: string }): Promise<Journal> {
    return await api.put<Journal>(`/journals/${id}`, data);
  },

  async deleteJournal(id: string): Promise<void> {
    await api.delete(`/journals/${id}`);
  },

  // NOTE: Backend doesn't have /journals/:id/analyze endpoint
  // Analysis happens automatically when creating/updating journals
  async analyzeJournal(id: string): Promise<{ tone: string }> {
    // This endpoint doesn't exist in backend
    // AI analysis is done automatically when creating/updating
    throw new Error('Analysis is done automatically when creating/updating journals');
  },
};

