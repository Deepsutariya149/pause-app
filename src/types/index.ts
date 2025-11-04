export interface User {
  _id: string;
  email: string;
  name: string;
  avatar?: string;
  gender?: 'male' | 'female' | 'other';
  dateOfBirth?: string;
  role: 'user' | 'admin' | 'superadmin';
  isBanned?: boolean;
  isGoogleAuth?: boolean;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Mood {
  _id: string;
  userId: string;
  moodType: 'happy' | 'sad' | 'anxious' | 'neutral' | 'angry' | 'calm' | 'excited' | 'tired'; // Backend uses moodType
  date: string;
  createdAt: string;
}

export interface Journal {
  _id: string;
  userId: string;
  title: string;
  description: string; // Backend uses "description" not "content"
  mood?: string;
  voiceNoteUrl?: string;
  aiMoodAnalysis?: string; // Backend AI analysis
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface Exercise {
  _id: string;
  title: string;
  description: string;
  duration: number;
  mediaUrl?: string; // Backend uses mediaUrl (not videoUrl/audioUrl)
  category: 'breathing' | 'meditation'; // Backend schema only has these two
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  accessToken?: string; // Backend returns camelCase
  access_token?: string; // Support both formats
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  name: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

