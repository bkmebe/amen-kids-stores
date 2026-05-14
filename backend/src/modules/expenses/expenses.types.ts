export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  notes?: string;
  created_by?: string;
  created_at: string;
}

export interface CreateExpenseInput {
  title: string;
  amount: number;
  category: string;
  notes?: string;
}
