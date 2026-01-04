import { api } from './api';

export interface Feedback {
  _id: string;
  userId: string;
  rating: number; // Rating from 1 to 5
  message: string;
  isRead: boolean;
  isResolved: boolean;
  createdAt: string;
  updatedAt: string;
}

export const feedbackService = {
  // Submit feedback
  async submitFeedback(data: { rating: number; message: string }): Promise<Feedback> {
    return await api.post<Feedback>('/feedback', data);
  },

  // Get user's own feedback
  async getMyFeedback(): Promise<Feedback[]> {
    return await api.get<Feedback[]>('/feedback/my-feedback');
  },
};



