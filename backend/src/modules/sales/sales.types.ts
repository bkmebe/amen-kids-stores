export interface Sale {
  id: string;
  product_id: string;
  quantity_sold: number;
  selling_price: number;
  discount: number;
  payment_method: 'cash' | 'bank_transfer';
  bank_name?: string;
  total_amount: number;
  total_cost: number;
  profit: number;
  created_by?: string;
  created_at: string;
  product?: { name: string; category: string };
}

export interface CreateSaleInput {
  product_id: string;
  quantity_sold: number;
  discount?: number;
  payment_method: 'cash' | 'bank_transfer';
  bank_name?: string;
}

export interface TodaySalesSummary {
  totalSales: number;
  totalTransactions: number;
  totalProfit: number;
}
