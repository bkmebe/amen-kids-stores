import { Response } from 'express';
import { expensesService } from './expenses.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { AuthRequest } from '../../middleware/auth.middleware';

export const expensesController = {
  getAll: asyncHandler(async (_req: AuthRequest, res: Response) => {
    const expenses = await expensesService.getAll();
    res.json({ success: true, message: 'Expenses fetched', data: expenses });
  }),

  create: asyncHandler(async (req: AuthRequest, res: Response) => {
    const expense = await expensesService.create(req.body, req.user!.id);
    res.status(201).json({ success: true, message: 'Expense created', data: expense });
  }),
};
