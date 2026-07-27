export interface Purchase {
  id: string;
  product_id: string;
  supplier?: string;
  quantity_purchased: number;
  cost_per_unit: number;
  total_cost: number;
  payment_method: 'cash' | 'bank_transfer';
  bank_name?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  product?: { name: string; category: string; size?: string };
}

export interface CreatePurchaseInput {
  product_id: string;
  supplier?: string;
  quantity_purchased: number;
  cost_per_unit: number;
  payment_method: 'cash' | 'bank_transfer';
  bank_name?: string;
  notes?: string;
}
