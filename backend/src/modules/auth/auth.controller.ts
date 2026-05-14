import { Response } from 'express';
import { authService } from './auth.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { AuthRequest } from '../../middleware/auth.middleware';

export const authController = {
  login: asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await authService.login(req.body);
    res.json({ success: true, message: 'Login successful', data: result });
  }),

  me: asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await authService.getUserById(req.user!.id);
    res.json({ success: true, message: 'User fetched', data: user });
  }),

  logout: asyncHandler(async (_req: AuthRequest, res: Response) => {
    res.json({ success: true, message: 'Logged out successfully', data: null });
  }),

  updateLanguage: asyncHandler(async (req: AuthRequest, res: Response) => {
    await authService.updateLanguage(req.user!.id, req.body.language);
    res.json({ success: true, message: 'Language updated', data: null });
  }),
};
