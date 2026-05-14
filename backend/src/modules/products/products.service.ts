import { supabase } from '../../config/supabase';
import { ApiError } from '../../utils/ApiError';
import { Product, CreateProductInput, UpdateProductInput } from './products.types';

export const productsService = {
  async getAll(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw ApiError.internal('Failed to fetch products');
    return data || [];
  },

  async getById(id: string): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) throw ApiError.notFound('Product not found');
    return data;
  },

  async getLowStock(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .filter('quantity', 'lte', supabase.rpc as any)
      .order('quantity', { ascending: true });

    // Use raw query approach for column comparison
    const { data: lowStockData, error: lowStockError } = await supabase
      .rpc('get_low_stock_products');

    if (lowStockError) {
      // Fallback: fetch all and filter in app
      const { data: allProducts, error: allError } = await supabase
        .from('products')
        .select('*')
        .order('quantity', { ascending: true });

      if (allError) throw ApiError.internal('Failed to fetch low stock products');
      return (allProducts || []).filter(
        (p: Product) => p.quantity <= p.low_stock_threshold
      );
    }

    return lowStockData || [];
  },

  async create(input: CreateProductInput): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert([input])
      .select()
      .single();

    if (error) throw ApiError.internal(`Failed to create product: ${error.message}`);
    return data;
  },

  async update(id: string, input: UpdateProductInput): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) throw ApiError.notFound('Product not found or update failed');
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw ApiError.internal('Failed to delete product');
  },

  async reduceQuantity(id: string, amount: number): Promise<Product> {
    const product = await productsService.getById(id);

    if (product.quantity < amount) {
      throw ApiError.badRequest('Insufficient stock', [
        `Only ${product.quantity} items available`,
      ]);
    }

    return productsService.update(id, { quantity: product.quantity - amount });
  },
};
