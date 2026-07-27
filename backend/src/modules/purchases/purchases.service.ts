import { supabase } from '../../config/supabase';
import { ApiError } from '../../utils/ApiError';
import { productsService } from '../products/products.service';
import { Purchase, CreatePurchaseInput } from './purchases.types';

export const purchasesService = {
  async getAll(): Promise<Purchase[]> {
    const { data: purchases, error } = await supabase
      .from('purchases')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw ApiError.internal('Failed to fetch purchases');
    if (!purchases || purchases.length === 0) return [];

    // Manually attach product info
    const productIds = [...new Set(purchases.map((p: any) => p.product_id).filter(Boolean))];
    let productMap: Record<string, { name: string; category: string; size?: string }> = {};

    if (productIds.length > 0) {
      const { data: products } = await supabase
        .from('products')
        .select('id, name, category, size')
        .in('id', productIds);

      if (products) {
        productMap = products.reduce((acc: any, p: any) => {
          acc[p.id] = { name: p.name, category: p.category, size: p.size };
          return acc;
        }, {});
      }
    }

    return purchases.map((p: any) => ({
      ...p,
      product: productMap[p.product_id] || null,
    }));
  },

  async create(input: CreatePurchaseInput, userId: string): Promise<Purchase> {
    // Validate product exists
    const product = await productsService.getById(input.product_id);

    const total_cost = parseFloat((input.quantity_purchased * input.cost_per_unit).toFixed(2));

    // Insert purchase record
    const { data, error } = await supabase
      .from('purchases')
      .insert([{
        product_id: input.product_id,
        supplier: input.supplier,
        quantity_purchased: input.quantity_purchased,
        cost_per_unit: input.cost_per_unit,
        total_cost,
        payment_method: input.payment_method,
        bank_name: input.payment_method === 'bank_transfer' ? input.bank_name : null,
        notes: input.notes,
        created_by: userId,
      }])
      .select('*')
      .single();

    if (error) throw ApiError.internal('Failed to record purchase');

    // Update product: increment quantity + update cost_price to new purchase price
    const updatePayload: any = {
      quantity: product.quantity + input.quantity_purchased,
      cost_price: input.cost_per_unit, // Always update cost price to latest purchase price
    };

    // Update supplier on the product if a supplier was provided
    if (input.supplier) {
      updatePayload.supplier = input.supplier;
    }

    await productsService.update(input.product_id, updatePayload);

    return {
      ...data,
      product: { name: product.name, category: product.category, size: product.size },
    };
  },
};
