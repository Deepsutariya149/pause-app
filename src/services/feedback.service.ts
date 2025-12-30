import { api } from './api';

export interface Feedback {
  _id: string;
  userId: string;
  message: string;
  email?: string;
  type: 'bug' | 'feature' | 'improvement' | 'other';
  isRead: boolean;
  isResolved: boolean;
  createdAt: string;
  updatedAt: string;
}

export const feedbackService = {
  // Submit feedback
  async submitFeedback(data: { message: string; email?: string; type?: string }): Promise<Feedback> {
    return await api.post<Feedback>('/feedback', data);
  },

  // Get user's own feedback
  async getMyFeedback(): Promise<Feedback[]> {
    return await api.get<Feedback[]>('/feedback/my-feedback');
  },
};


