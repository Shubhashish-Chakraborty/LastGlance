import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'STUDENT' | 'ADMIN';
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isHydrated: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isHydrated: false,

  setAuth: (user: User, token: string) => {
    SecureStore.setItemAsync('token', token).catch(() => {});
    SecureStore.setItemAsync('user', JSON.stringify(user)).catch(() => {});
    set({ user, token });
  },

  clearAuth: () => {
    SecureStore.deleteItemAsync('token').catch(() => {});
    SecureStore.deleteItemAsync('user').catch(() => {});
    set({ user: null, token: null });
  },

  initializeAuth: async () => {
    try {
      const [storedToken, storedUser] = await Promise.all([
        SecureStore.getItemAsync('token'),
        SecureStore.getItemAsync('user'),
      ]);

      if (storedToken && storedUser) {
        const parsedUser = JSON.parse(storedUser) as User;
        set({ user: parsedUser, token: storedToken, isHydrated: true });
        return;
      }
    } catch (error) {
      console.warn('Failed to hydrate auth state:', error);
    }

    set({ user: null, token: null, isHydrated: true });
  },
}));