import { supabase } from '../../config/supabase';
import { ApiError } from '../../utils/ApiError';
import { calculateNetProfit, sumArray } from '../../utils/calculations';
import { productsService } from '../products/products.service';

function getDateRange(period: 'daily' | 'weekly' | 'monthly') {
  const now = new Date();
  const start = new Date();

  if (period === 'daily') {
    start.setHours(0, 0, 0, 0);
  } else if (period === 'weekly') {
    const day = start.getDay();
    start.setDate(start.getDate() - day);
    start.setHours(0, 0, 0, 0);
  } else {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
  }

  return { start: start.toISOString(), end: now.toISOString() };
}

export const reportsService = {
  async getReport(period: 'daily' | 'weekly' | 'monthly') {
    const { start, end } = getDateRange(period);

    const [salesResult, expensesResult, lowStockProducts] = await Promise.all([
      supabase
        .from('sales')
        .select('total_amount, total_cost, profit, product_id, quantity_sold')
        .gte('created_at', start)
        .lte('created_at', end),
      supabase
        .from('expenses')
        .select('amount')
        .gte('created_at', start)
        .lte('created_at', end),
      productsService.getLowStock(),
    ]);

    if (salesResult.error) throw ApiError.internal('Failed to fetch sales data');
    if (expensesResult.error) throw ApiError.internal('Failed to fetch expense data');

    const sales = salesResult.data || [];
    const expenses = expensesResult.data || [];

    // Manually fetch product names for best-seller aggregation
    const productIds = [...new Set(sales.map((s: any) => s.product_id).filter(Boolean))];
    let productNameMap: Record<string, string> = {};
    if (productIds.length > 0) {
      const { data: products } = await supabase
        .from('products')
        .select('id, name')
        .in('id', productIds);
      for (const p of products || []) {
        productNameMap[p.id] = p.name;
      }
    }

    const totalSales = sumArray(sales.map((s: any) => s.total_amount));
    const totalProductCost = sumArray(sales.map((s: any) => s.total_cost));
    const totalExpenses = sumArray(expenses.map((e: any) => e.amount));
    const netProfit = calculateNetProfit(totalSales, totalProductCost, totalExpenses);

    // Best selling products
    const productMap: Record<string, { productName: string; quantitySold: number }> = {};
    for (const sale of sales as any[]) {
      const name = productNameMap[sale.product_id] || 'Unknown';
      if (!productMap[sale.product_id]) {
        productMap[sale.product_id] = { productName: name, quantitySold: 0 };
      }
      productMap[sale.product_id].quantitySold += sale.quantity_sold;
    }

    const bestSellingProducts = Object.values(productMap)
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 5);

    return {
      totalSales,
      totalExpenses,
      totalProductCost,
      netProfit,
      bestSellingProducts,
      lowStockProducts,
    };
  },

  async getProfitLoss(startDate?: string, endDate?: string) {
    const start = startDate ? new Date(startDate).toISOString() : getDateRange('monthly').start;
    const end = endDate ? new Date(endDate + 'T23:59:59').toISOString() : new Date().toISOString();

    const [salesResult, expensesResult] = await Promise.all([
      supabase.from('sales').select('total_amount, total_cost, profit').gte('created_at', start).lte('created_at', end),
      supabase.from('expenses').select('amount').gte('created_at', start).lte('created_at', end),
    ]);

    const sales = salesResult.data || [];
    const expenses = expensesResult.data || [];

    const revenue = sumArray(sales.map((s: any) => s.total_amount));
    const productCosts = sumArray(sales.map((s: any) => s.total_cost));
    const totalExpenses = sumArray(expenses.map((e: any) => e.amount));
    const grossProfit = parseFloat((revenue - productCosts).toFixed(2));
    const netProfit = calculateNetProfit(revenue, productCosts, totalExpenses);

    return { revenue, productCosts, expenses: totalExpenses, grossProfit, netProfit };
  },

  async getSalesAnalytics(period: 'daily' | 'weekly' | 'monthly' = 'daily') {
    const now = new Date();
    let results: { label: string; value: number }[] = [];

    if (period === 'daily') {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        const end = new Date(d);
        end.setHours(23, 59, 59, 999);

        const { data } = await supabase
          .from('sales')
          .select('total_amount')
          .gte('created_at', d.toISOString())
          .lte('created_at', end.toISOString());

        const label = d.toLocaleDateString('en-US', { weekday: 'short' });
        const value = sumArray((data || []).map((s: any) => s.total_amount));
        results.push({ label, value });
      }
    } else if (period === 'weekly') {
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay() - i * 7);
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        const { data } = await supabase
          .from('sales')
          .select('total_amount')
          .gte('created_at', weekStart.toISOString())
          .lte('created_at', weekEnd.toISOString());

        const label = `Week ${4 - i}`;
        const value = sumArray((data || []).map((s: any) => s.total_amount));
        results.push({ label, value });
      }
    } else {
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

        const { data } = await supabase
          .from('sales')
          .select('total_amount')
          .gte('created_at', d.toISOString())
          .lte('created_at', end.toISOString());

        const label = d.toLocaleDateString('en-US', { month: 'short' });
        const value = sumArray((data || []).map((s: any) => s.total_amount));
        results.push({ label, value });
      }
    }

    return results;
  },

  async getExpenseAnalytics() {
    const { data, error } = await supabase.from('expenses').select('category, amount');
    if (error) throw ApiError.internal('Failed to fetch expense analytics');

    const categoryMap: Record<string, number> = {};
    for (const e of data || []) {
      categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
    }

    return Object.entries(categoryMap).map(([category, amount]) => ({
      category,
      amount: parseFloat(amount.toFixed(2)),
    }));
  },
};
