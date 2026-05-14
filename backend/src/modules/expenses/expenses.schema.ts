import { z } from 'zod';

export const createExpenseSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  amount: z.number().positive('Amount must be positive'),
  category: z.string().min(2, 'Category is required'),
  notes: z.string().optional(),
});
