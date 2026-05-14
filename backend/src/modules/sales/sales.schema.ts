import { z } from 'zod';

export const createSaleSchema = z.object({
  product_id: z.string().uuid('Invalid product ID'),
  quantity_sold: z.number().int().min(1, 'Quantity must be at least 1'),
  discount: z.number().min(0, 'Discount cannot be negative').optional().default(0),
  payment_method: z.enum(['cash', 'bank_transfer']),
  bank_name: z.string().optional(),
}).refine(
  (data) => data.payment_method !== 'bank_transfer' || (data.bank_name && data.bank_name.length > 0),
  { message: 'Bank name is required for mobile banking', path: ['bank_name'] }
);
