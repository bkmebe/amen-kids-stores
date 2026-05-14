export interface Product {
  id: string;
  name: string;
  category: string;
  size?: string;
  selling_price: number;
  cost_price: number;
  quantity: number;
  low_stock_threshold: number;
  supplier?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProductInput {
  name: string;
  category: string;
  size?: string;
  selling_price: number;
  cost_price: number;
  quantity: number;
  low_stock_threshold?: number;
  supplier?: string;
}

export interface UpdateProductInput extends Partial<CreateProductInput> {}
