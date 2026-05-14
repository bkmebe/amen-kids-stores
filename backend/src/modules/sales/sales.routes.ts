import { Router } from 'express';
import { salesController } from './sales.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createSaleSchema } from './sales.schema';

const router = Router();

router.use(authenticate);

router.get('/today', salesController.getTodaySummary);
router.get('/', salesController.getAll);
router.post('/', validate(createSaleSchema), salesController.create);

export default router;
