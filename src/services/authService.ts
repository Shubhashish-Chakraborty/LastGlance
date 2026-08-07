import apiClient from './api';
import type { User } from '@/store/authStore';

interface LoginResponse {
  message: string;
  success: boolean;
  user: User;
  token: string;
}

interface SignupResponse {
  message: string;
  success: boolean;
}

export const loginUser = async (
  username: string,
  password: string,
): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>('/auth/user/login', {
    username,
    password,
  });
  return response.data;
};

export const signupUser = async (
  username: string,
  password: string,
): Promise<SignupResponse> => {
  const response = await apiClient.post<SignupResponse>(
    '/auth/user/signup',
    { username, password },
  );
  return response.data;
};

export const changeUsername = async (username: string): Promise<{ success: boolean; user: User }> => {
  const response = await apiClient.put('/auth/user/change-username', { username });
  return response.data;
};

export const changePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.put('/auth/user/change-password', { currentPassword, newPassword });
  return response.data;
};