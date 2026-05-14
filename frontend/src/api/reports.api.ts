import { api } from '../lib/axios';
import { Report, DashboardSummary, ProfitLoss, AnalyticsItem, ExpenseAnalyticsItem } from '../types';

export const reportsApi = {
  getDaily: async (): Promise<Report> => {
    const { data } = await api.get('/reports/daily');
    return data.data;
  },

  getWeekly: async (): Promise<Report> => {
    const { data } = await api.get('/reports/weekly');
    return data.data;
  },

  getMonthly: async (): Promise<Report> => {
    const { data } = await api.get('/reports/monthly');
    return data.data;
  },

  getDashboardSummary: async (): Promise<DashboardSummary> => {
    const { data } = await api.get('/dashboard/summary');
    return data.data;
  },

  getProfitLoss: async (startDate?: string, endDate?: string): Promise<ProfitLoss> => {
    const { data } = await api.get('/reports/profit-loss', {
      params: { startDate, endDate },
    });
    return data.data;
  },

  getSalesAnalytics: async (period: 'daily' | 'weekly' | 'monthly'): Promise<AnalyticsItem[]> => {
    const { data } = await api.get('/analytics/sales', { params: { period } });
    return data.data;
  },

  getExpenseAnalytics: async (): Promise<ExpenseAnalyticsItem[]> => {
    const { data } = await api.get('/analytics/expenses');
    return data.data;
  },
};
