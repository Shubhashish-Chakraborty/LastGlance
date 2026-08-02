import { useState, useCallback } from 'react';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { loginUser, signupUser } from '@/services/authService';

interface UseAuthReturn {
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<{ success?: boolean; message?: string }>;
  signup: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
}

export function useAuth(): UseAuthReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setAuth } = useAuthStore();

  const login = useCallback(async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await loginUser(username, password);
      setAuth(data.user, data.token);
      router.replace({ pathname: '/' });
      return { success: true, message: data.message };
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const responseData = axiosErr.response?.data;
      const message = responseData?.message ?? (err instanceof Error ? err.message : 'Login failed. Please try again.');
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, [setAuth]);

  const signup = useCallback(async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await signupUser(username, password);
      return { success: true, message: data.message };
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
      const data = axiosErr.response?.data;
      let message = data?.message ?? (err instanceof Error ? err.message : 'Signup failed. Please try again.');

      if (data?.errors) {
        const firstError = Object.values(data.errors).flat()[0];
        if (firstError) message = firstError;
      }

      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, login, signup };
}