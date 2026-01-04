import { api } from './api';

export interface Goal {
  _id: string;
  title: string;
  description: string;
  icon?: string;
  timing: string; // e.g., "1 month", "2 months", "3 months"
  points: number; // Reward points for completing the goal
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
    const response = await api.get<{ goals: Goal[]; total: number }>(`/goals?page=${page}&limit=${limit}`);
    // Ensure response has the correct structure
    if (!response || typeof response !== 'object') {
      return { goals: [], total: 0 };
    }
    return {
      goals: Array.isArray(response.goals) ? response.goals : [],
      total: typeof response.total === 'number' ? response.total : 0,
    };
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
    try {
      const data = await api.get<GoalProgress[]>('/goals/user/today-progress');
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching today progress:', error);
      return [];
    }
  },

  // Get goal statistics
  async getGoalStats(goalId: string): Promise<{ totalJoined: number; totalCompleted: number }> {
    return await api.get<{ totalJoined: number; totalCompleted: number }>(`/goals/${goalId}/stats`);
  },

  // Get goal completion status
  async getGoalCompletionStatus(goalId: string): Promise<{
    userGoal: UserGoal;
    isCompleted: boolean;
    progressPercentage: number;
    daysCompleted: number;
    pointsAwarded: boolean;
    startDate?: string;
    endDate?: string;
  }> {
    return await api.get(`/goals/${goalId}/completion-status`);
  },
};



