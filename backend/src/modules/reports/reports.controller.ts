import { Response } from 'express';
import { reportsService } from './reports.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { AuthRequest } from '../../middleware/auth.middleware';

export const reportsController = {
  daily: asyncHandler(async (_req: AuthRequest, res: Response) => {
    const data = await reportsService.getReport('daily');
    res.json({ success: true, message: 'Daily report', data });
  }),

  weekly: asyncHandler(async (_req: AuthRequest, res: Response) => {
    const data = await reportsService.getReport('weekly');
    res.json({ success: true, message: 'Weekly report', data });
  }),

  monthly: asyncHandler(async (_req: AuthRequest, res: Response) => {
    const data = await reportsService.getReport('monthly');
    res.json({ success: true, message: 'Monthly report', data });
  }),

  profitLoss: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
    const data = await reportsService.getProfitLoss(startDate, endDate);
    res.json({ success: true, message: 'Profit & Loss report', data });
  }),

  salesAnalytics: asyncHandler(async (req: AuthRequest, res: Response) => {
    const period = (req.query.period as 'daily' | 'weekly' | 'monthly') || 'daily';
    const data = await reportsService.getSalesAnalytics(period);
    res.json({ success: true, message: 'Sales analytics', data });
  }),

  expenseAnalytics: asyncHandler(async (_req: AuthRequest, res: Response) => {
    const data = await reportsService.getExpenseAnalytics();
    res.json({ success: true, message: 'Expense analytics', data });
  }),
};
