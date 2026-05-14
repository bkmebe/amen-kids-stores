import { supabase } from '../../config/supabase';
import { ApiError } from '../../utils/ApiError';
import { Expense, CreateExpenseInput } from './expenses.types';

export const expensesService = {
  async getAll(): Promise<Expense[]> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw ApiError.internal('Failed to fetch expenses');
    return data || [];
  },

  async create(input: CreateExpenseInput, userId: string): Promise<Expense> {
    const { data, error } = await supabase
      .from('expenses')
      .insert([{ ...input, created_by: userId }])
      .select()
      .single();

    if (error) throw ApiError.internal('Failed to create expense');
    return data;
  },

  async getByDateRange(startDate: string, endDate: string): Promise<Expense[]> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false });

    if (error) throw ApiError.internal('Failed to fetch expenses');
    return data || [];
  },
};
