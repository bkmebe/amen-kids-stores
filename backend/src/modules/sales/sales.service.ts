import { supabase } from '../../config/supabase';
import { ApiError } from '../../utils/ApiError';
import { productsService } from '../products/products.service';
import { calculateProfit } from '../../utils/calculations';
import { getStartOfTodayInEAT } from '../../utils/date';
import { Sale, CreateSaleInput, TodaySalesSummary } from './sales.types';

export const salesService = {
  async getAll(): Promise<Sale[]> {
    const { data: sales, error } = await supabase
      .from('sales')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw ApiError.internal('Failed to fetch sales');
    if (!sales || sales.length === 0) return [];

    // Manually attach product info
    const productIds = [...new Set(sales.map((s: any) => s.product_id).filter(Boolean))];
    let productMap: Record<string, { name: string; category: string }> = {};

    if (productIds.length > 0) {
      const { data: products } = await supabase
        .from('products')
        .select('id, name, category')
        .in('id', productIds);

      for (const p of products || []) {
        productMap[p.id] = { name: p.name, category: p.category };
      }
    }

    return sales.map((s: any) => ({
      ...s,
      product: productMap[s.product_id] || { name: 'Unknown', category: '' },
    }));
  },

  async create(input: CreateSaleInput, userId: string): Promise<Sale> {
    const product = await productsService.getById(input.product_id);

    if (product.quantity < input.quantity_sold) {
      throw ApiError.badRequest('Insufficient stock', [
        `Only ${product.quantity} items in stock`,
      ]);
    }

    const discount = input.discount || 0;
    const { totalAmount, totalCost, profit } = calculateProfit(
      input.quantity_sold,
      product.selling_price,
      product.cost_price,
      discount
    );

    const { data, error } = await supabase
      .from('sales')
      .insert([
        {
          product_id: input.product_id,
          quantity_sold: input.quantity_sold,
          selling_price: product.selling_price,
          discount,
          payment_method: input.payment_method || 'cash',
          bank_name: input.bank_name || null,
          total_amount: totalAmount,
          total_cost: totalCost,
          profit,
          created_by: userId,
        },
      ])
      .select('*')
      .single();

    if (error) throw ApiError.internal('Failed to record sale');

    // Reduce inventory
    await productsService.update(input.product_id, {
      quantity: product.quantity - input.quantity_sold,
    });

    return {
      ...data,
      product: { name: product.name, category: product.category },
    };
  },

  async getTodaySummary(): Promise<TodaySalesSummary> {
    const todayStr = getStartOfTodayInEAT().toISOString();

    const { data, error } = await supabase
      .from('sales')
      .select('total_amount, profit')
      .gte('created_at', todayStr);

    if (error) throw ApiError.internal('Failed to fetch today sales');

    const sales = data || [];
    return {
      totalSales: sales.reduce((sum: number, s: any) => sum + (s.total_amount || 0), 0),
      totalTransactions: sales.length,
      totalProfit: sales.reduce((sum: number, s: any) => sum + (s.profit || 0), 0),
    };
  },
};
