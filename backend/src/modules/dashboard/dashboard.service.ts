import { supabase } from '../../config/supabase';
import { ApiError } from '../../utils/ApiError';
import { sumArray } from '../../utils/calculations';

export const dashboardService = {
  async getSummary() {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      productsResult,
      todaySalesResult,
      monthlySalesResult,
      monthlyExpensesResult,
    ] = await Promise.all([
      supabase.from('products').select('id, quantity, cost_price, selling_price, low_stock_threshold'),
      supabase.from('sales').select('total_amount, profit').gte('created_at', todayStart.toISOString()),
      supabase.from('sales').select('total_amount, total_cost, profit').gte('created_at', monthStart.toISOString()),
      supabase.from('expenses').select('amount').gte('created_at', monthStart.toISOString()),
    ]);

    if (productsResult.error) throw ApiError.internal('Failed to fetch dashboard data');

    const products = productsResult.data || [];
    const todaySales = todaySalesResult.data || [];
    const monthlySales = monthlySalesResult.data || [];
    const monthlyExpenses = monthlyExpensesResult.data || [];

    const totalProducts = products.length;
    const totalInventoryValue = products.reduce(
      (sum: number, p: any) => sum + p.quantity * p.cost_price,
      0
    );
    const lowStockCount = products.filter(
      (p: any) => p.quantity <= p.low_stock_threshold
    ).length;

    const todaySalesTotal = sumArray(todaySales.map((s: any) => s.total_amount));
    const monthlySalesTotal = sumArray(monthlySales.map((s: any) => s.total_amount));
    const monthlyExpensesTotal = sumArray(monthlyExpenses.map((e: any) => e.amount));
    const monthlyCosts = sumArray(monthlySales.map((s: any) => s.total_cost));
    const monthlyProfit = parseFloat(
      (monthlySalesTotal - monthlyCosts - monthlyExpensesTotal).toFixed(2)
    );

    return {
      totalProducts,
      totalInventoryValue: parseFloat(totalInventoryValue.toFixed(2)),
      todaySales: todaySalesTotal,
      monthlySales: monthlySalesTotal,
      monthlyExpenses: monthlyExpensesTotal,
      monthlyProfit,
      lowStockCount,
    };
  },
};
