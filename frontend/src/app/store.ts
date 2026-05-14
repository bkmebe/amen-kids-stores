import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
}

interface UIStore {
  sidebarOpen: boolean;
  language: 'en' | 'am';
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setLanguage: (lang: 'en' | 'am') => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => {
        localStorage.setItem('amen_token', token);
        localStorage.setItem('amen_user', JSON.stringify(user));
        set({ user, token, isAuthenticated: true });
      },
      clearAuth: () => {
        localStorage.removeItem('amen_token');
        localStorage.removeItem('amen_user');
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    { name: 'amen-auth' }
  )
);

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      language: 'en',
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setLanguage: (language) => set({ language }),
    }),
    { name: 'amen-ui' }
  )
);
