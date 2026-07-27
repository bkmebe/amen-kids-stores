import { Response } from 'express';
import { purchasesService } from './purchases.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { AuthRequest } from '../../middleware/auth.middleware';

export const purchasesController = {
  getAll: asyncHandler(async (_req: AuthRequest, res: Response) => {
    const purchases = await purchasesService.getAll();
    res.json({ success: true, message: 'Purchases fetched', data: purchases });
  }),

  create: asyncHandler(async (req: AuthRequest, res: Response) => {
    const purchase = await purchasesService.create(req.body, req.user!.id);
    res.status(201).json({ success: true, message: 'Purchase recorded', data: purchase });
  }),
};
