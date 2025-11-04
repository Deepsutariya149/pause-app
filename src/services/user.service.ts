import { api } from './api';
import { storage } from '../utils/storage';
import { User } from '../types';

export const userService = {
  async getProfile(): Promise<User> {
    return await api.get<User>('/users/profile');
  },

  async updateProfile(data: { name?: string; avatar?: string; gender?: string; dateOfBirth?: string }): Promise<User> {
    const response = await api.put<User>('/users/profile', data);
    await storage.setUser(response);
    return response;
  },

  async deleteAccount(): Promise<void> {
    await api.delete('/users/account');
  },
};

