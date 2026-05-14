// All shared TypeScript types matching the API schemas

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'sales';
  language: 'en' | 'am';
  created_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

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

export interface Sale {
  id: string;
  product_id: string;
  quantity_sold: number;
  selling_price: number;
  discount: number;
  total_amount: number;
  total_cost: number;
  profit: number;
  payment_method: 'cash' | 'bank_transfer';
  bank_name?: string;
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

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  notes?: string;
  created_at: string;
}

export interface CreateExpenseInput {
  title: string;
  amount: number;
  category: string;
  notes?: string;
}

export interface Report {
  totalSales: number;
  totalExpenses: number;
  totalProductCost: number;
  netProfit: number;
  bestSellingProducts: Array<{ productName: string; quantitySold: number }>;
  lowStockProducts: Product[];
}

export interface DashboardSummary {
  totalProducts: number;
  totalInventoryValue: number;
  todaySales: number;
  monthlySales: number;
  monthlyExpenses: number;
  monthlyProfit: number;
  lowStockCount: number;
}

export interface ProfitLoss {
  revenue: number;
  productCosts: number;
  expenses: number;
  grossProfit: number;
  netProfit: number;
}

export interface AnalyticsItem {
  label: string;
  value: number;
}

export interface ExpenseAnalyticsItem {
  category: string;
  amount: number;
}

export interface TodaySummary {
  totalSales: number;
  totalTransactions: number;
  totalProfit: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
