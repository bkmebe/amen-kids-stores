import { api } from '../lib/axios';
import { Expense, CreateExpenseInput } from '../types';

export const expensesApi = {
  getAll: async (): Promise<Expense[]> => {
    const { data } = await api.get('/expenses');
    return data.data;
  },

  create: async (input: CreateExpenseInput): Promise<Expense> => {
    const { data } = await api.post('/expenses', input);
    return data.data;
  },
};
