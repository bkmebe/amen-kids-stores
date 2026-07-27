import { z } from 'zod';

export const createPurchaseSchema = z.object({
  product_id: z.string().uuid('Invalid product ID'),
  supplier: z.string().optional(),
  quantity_purchased: z.number().int().min(1, 'Quantity must be at least 1'),
  cost_per_unit: z.number().positive('Cost per unit must be positive'),
  payment_method: z.enum(['cash', 'bank_transfer']),
  bank_name: z.string().optional(),
  notes: z.string().optional(),
});
