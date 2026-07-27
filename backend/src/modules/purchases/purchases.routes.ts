import { Router } from 'express';
import { purchasesController } from './purchases.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/authorize.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createPurchaseSchema } from './purchases.schema';

const router = Router();

router.use(authenticate);
router.use(authorize('admin'));

router.get('/', purchasesController.getAll);
router.post('/', validate(createPurchaseSchema), purchasesController.create);

export default router;
