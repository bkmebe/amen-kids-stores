import { api } from '../lib/axios';
import { Product, CreateProductInput } from '../types';

export const productsApi = {
  getAll: async (): Promise<Product[]> => {
    const { data } = await api.get('/products');
    return data.data;
  },

  getById: async (id: string): Promise<Product> => {
    const { data } = await api.get(`/products/${id}`);
    return data.data;
  },

  getLowStock: async (): Promise<Product[]> => {
    const { data } = await api.get('/products/low-stock');
    return data.data;
  },

  create: async (input: CreateProductInput): Promise<Product> => {
    const { data } = await api.post('/products', input);
    return data.data;
  },

  update: async (id: string, input: Partial<CreateProductInput>): Promise<Product> => {
    const { data } = await api.put(`/products/${id}`, input);
    return data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },
};
