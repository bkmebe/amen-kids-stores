import { api } from '../lib/axios';
import { AuthResponse, User } from '../types';

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/login', { email, password });
    return data.data;
  },

  me: async (): Promise<User> => {
    const { data } = await api.get('/auth/me');
    return data.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  updateLanguage: async (language: 'en' | 'am'): Promise<void> => {
    await api.patch('/auth/settings/language', { language });
  },
};
