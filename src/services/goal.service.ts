import { api } from './api';

export interface Goal {
  _id: string;
  title: string;
  description: string;
  icon?: string;
  isActive: boolean;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UserGoal {
  _id: string;
  userId: string;
  goalId: Goal | string;
  joinDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GoalProgress {
  _id: string;
  userGoalId: string;
  userId: string;
  goalId: Goal | string;
  date: string;
  completed: boolean;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export const goalService = {
  // Get all active goals
  async getGoals(page: number = 1, limit: number = 50): Promise<{ goals: Goal[]; total: number }> {
    return await api.get<{ goals: Goal[]; total: number }>(`/goals?page=${page}&limit=${limit}`);
  },

  // Get a single goal
  async getGoal(id: string): Promise<Goal> {
    return await api.get<Goal>(`/goals/${id}`);
  },

  // Join a goal
  async joinGoal(goalId: string): Promise<UserGoal> {
    return await api.post<UserGoal>(`/goals/${goalId}/join`);
  },

  // Leave a goal
  async leaveGoal(goalId: string): Promise<void> {
    return await api.post(`/goals/${goalId}/leave`);
  },

  // Get user's joined goals
  async getMyGoals(): Promise<UserGoal[]> {
    return await api.get<UserGoal[]>('/goals/user/my-goals');
  },

  // Update daily progress
  async updateProgress(goalId: string, data: { completed?: boolean; notes?: string; date?: string }): Promise<GoalProgress> {
    return await api.post<GoalProgress>(`/goals/${goalId}/progress`, data);
  },

  // Get progress for a goal
  async getProgress(goalId: string, startDate?: string, endDate?: string): Promise<GoalProgress[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    return await api.get<GoalProgress[]>(`/goals/${goalId}/progress${query ? `?${query}` : ''}`);
  },

  // Get today's progress for all goals
  async getTodayProgress(): Promise<GoalProgress[]> {
    return await api.get<GoalProgress[]>('/goals/user/today-progress');
  },

  // Get goal statistics
  async getGoalStats(goalId: string): Promise<{ totalJoined: number; totalCompleted: number }> {
    return await api.get<{ totalJoined: number; totalCompleted: number }>(`/goals/${goalId}/stats`);
  },
};

