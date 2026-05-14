import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { ApiError } from '../utils/ApiError';

export const validate = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`);
      return next(ApiError.badRequest('Validation failed', errors));
    }

    req.body = result.data;
    next();
  };
};
