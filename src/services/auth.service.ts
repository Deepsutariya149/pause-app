import { api } from './api';
import { storage } from '../utils/storage';
import { AuthResponse, LoginCredentials, SignupCredentials, ForgotPasswordRequest, ResetPasswordRequest } from '../types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    console.log('🔐 Login Service Called:', { email: credentials.email });
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      // Handle both camelCase and snake_case token formats
      const token = response.accessToken || response.access_token;
      console.log('✅ Login Success:', {
        token: token ? 'Present' : 'Missing',
        user: response.user,
      });
      
      if (!token) {
        throw new Error('No access token in response');
      }
      
      await storage.setToken(token);
      await storage.setUser(response.user);
      console.log('💾 Token and User saved to storage');
      return response;
    } catch (error: any) {
      console.error('❌ Login Failed:', error);
      throw error;
    }
  },

  async signup(credentials: SignupCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', credentials);
    const token = response.accessToken || response.access_token;
    if (token) {
      await storage.setToken(token);
      await storage.setUser(response.user);
    }
    return response;
  },

  async logout(): Promise<void> {
    await storage.clear();
  },

  async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    await api.post('/auth/forgot-password', data);
  },

  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    await api.post('/auth/reset-password', data);
  },

  async googleLogin(token: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/google', { token });
    const accessToken = response.accessToken || response.access_token;
    if (accessToken) {
      await storage.setToken(accessToken);
      await storage.setUser(response.user);
    }
    return response;
  },

  async getCurrentUser(): Promise<any> {
    const user = await storage.getUser();
    return user;
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await storage.getToken();
    return !!token;
  },
};

