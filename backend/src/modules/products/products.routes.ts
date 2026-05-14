import { Router } from 'express';
import { productsController } from './products.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/authorize.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createProductSchema, updateProductSchema } from './products.schema';

const router = Router();

router.use(authenticate);

// Both admin and sales can read products (sales needs product list for recording)
router.get('/low-stock', productsController.getLowStock);
router.get('/', productsController.getAll);
router.get('/:id', productsController.getById);

// Only admin can create/update/delete products
router.post('/', authorize('admin'), validate(createProductSchema), productsController.create);
router.put('/:id', authorize('admin'), validate(updateProductSchema), productsController.update);
router.delete('/:id', authorize('admin'), productsController.delete);

export default router;
