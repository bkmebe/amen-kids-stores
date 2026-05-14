import { Response } from 'express';
import { dashboardService } from './dashboard.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { AuthRequest } from '../../middleware/auth.middleware';

export const dashboardController = {
  getSummary: asyncHandler(async (_req: AuthRequest, res: Response) => {
    const data = await dashboardService.getSummary();
    res.json({ success: true, message: 'Dashboard summary', data });
  }),
};
