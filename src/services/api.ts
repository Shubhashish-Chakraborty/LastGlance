import axios from 'axios';
import { router } from 'expo-router';
import { API_BASE_URL } from '@/constants/api';
import { useAuthStore } from '@/store/authStore';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor — attach Bearer token from Zustand store
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — on 401, clear auth and redirect to login
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      // Don't auto-logout if the 401 is just a wrong password on login or change-password
      if (!url.includes('/login') && !url.includes('/change-password')) {
        useAuthStore.getState().clearAuth();
        router.replace({ pathname: '/login' });
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;