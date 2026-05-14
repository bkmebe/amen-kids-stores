import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  category: z.string().min(2, 'Category must be at least 2 characters'),
  size: z.string().optional(),
  selling_price: z.number().positive('Selling price must be positive'),
  cost_price: z.number().positive('Cost price must be positive'),
  quantity: z.number().min(0, 'Quantity cannot be negative'),
  low_stock_threshold: z.number().min(0).optional().default(5),
  supplier: z.string().optional(),
});

export const updateProductSchema = createProductSchema.partial();
