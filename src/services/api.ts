import axios, { AxiosInstance, AxiosError } from 'axios';
import { storage } from '../utils/storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

// Log API configuration
console.log('🔧 API Configuration:', {
  API_URL,
  envVar: process.env.EXPO_PUBLIC_API_URL,
});

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor to add token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await storage.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Log API request
        console.log('🔵 API Request:', {
          method: config.method?.toUpperCase(),
          url: `${config.baseURL}${config.url}`,
          data: config.data,
          headers: config.headers,
        });
        
        return config;
      },
      (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.client.interceptors.response.use(
      (response) => {
        // Log API response
        console.log('🟢 API Response:', {
          status: response.status,
          url: `${response.config.baseURL}${response.config.url}`,
          data: response.data,
        });
        return response;
      },
      async (error: AxiosError) => {
        // Log API error
        console.error('🔴 API Error:', {
          status: error.response?.status,
          url: `${error.config?.baseURL}${error.config?.url}`,
          message: error.message,
          responseData: error.response?.data,
        });
        
        if (error.response?.status === 401) {
          // Token expired or invalid
          await storage.clear();
          // You might want to redirect to login here
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: any): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: any): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }
}

export const api = new ApiClient();

