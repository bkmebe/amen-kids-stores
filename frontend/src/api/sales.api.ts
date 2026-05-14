import { api } from '../lib/axios';
import { Sale, CreateSaleInput, TodaySummary } from '../types';

export const salesApi = {
  getAll: async (): Promise<Sale[]> => {
    const { data } = await api.get('/sales');
    return data.data;
  },

  create: async (input: CreateSaleInput): Promise<Sale> => {
    const { data } = await api.post('/sales', input);
    return data.data;
  },

  getTodaySummary: async (): Promise<TodaySummary> => {
    const { data } = await api.get('/sales/today');
    return data.data;
  },
};
