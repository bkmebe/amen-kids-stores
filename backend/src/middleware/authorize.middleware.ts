import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { ApiError } from '../utils/ApiError';

/**
 * Middleware to restrict route access by user role.
 * Usage: router.use(authorize('admin')) or authorize('admin', 'sales')
 */
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden('You do not have permission to access this resource'));
    }

    next();
  };
};
