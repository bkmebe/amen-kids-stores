import { Response } from 'express';
import { productsService } from './products.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { AuthRequest } from '../../middleware/auth.middleware';

export const productsController = {
  getAll: asyncHandler(async (_req: AuthRequest, res: Response) => {
    const products = await productsService.getAll();
    res.json({ success: true, message: 'Products fetched', data: products });
  }),

  getById: asyncHandler(async (req: AuthRequest, res: Response) => {
    const product = await productsService.getById(req.params.id as string);
    res.json({ success: true, message: 'Product fetched', data: product });
  }),

  getLowStock: asyncHandler(async (_req: AuthRequest, res: Response) => {
    const products = await productsService.getLowStock();
    res.json({ success: true, message: 'Low stock products fetched', data: products });
  }),

  create: asyncHandler(async (req: AuthRequest, res: Response) => {
    const product = await productsService.create(req.body);
    res.status(201).json({ success: true, message: 'Product created', data: product });
  }),

  update: asyncHandler(async (req: AuthRequest, res: Response) => {
    const product = await productsService.update(req.params.id as string, req.body);
    res.json({ success: true, message: 'Product updated', data: product });
  }),

  delete: asyncHandler(async (req: AuthRequest, res: Response) => {
    await productsService.delete(req.params.id as string);
    res.json({ success: true, message: 'Product deleted', data: null });
  }),
};
