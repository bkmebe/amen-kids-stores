import { api } from '../lib/axios';
import { Purchase, CreatePurchaseInput } from '../types';

export const purchasesApi = {
  getAll: async (): Promise<Purchase[]> => {
    const { data } = await api.get('/purchases');
    return data.data;
  },

  create: async (input: CreatePurchaseInput): Promise<Purchase> => {
    const { data } = await api.post('/purchases', input);
    return data.data;
  },
};
