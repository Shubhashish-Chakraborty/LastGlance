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