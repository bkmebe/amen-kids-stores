import { Response } from 'express';
import { salesService } from './sales.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { AuthRequest } from '../../middleware/auth.middleware';

export const salesController = {
  getAll: asyncHandler(async (_req: AuthRequest, res: Response) => {
    const sales = await salesService.getAll();
    res.json({ success: true, message: 'Sales fetched', data: sales });
  }),

  create: asyncHandler(async (req: AuthRequest, res: Response) => {
    const sale = await salesService.create(req.body, req.user!.id);
    res.status(201).json({ success: true, message: 'Sale recorded', data: sale });
  }),

  getTodaySummary: asyncHandler(async (_req: AuthRequest, res: Response) => {
    const summary = await salesService.getTodaySummary();
    res.json({ success: true, message: "Today's summary", data: summary });
  }),
};
