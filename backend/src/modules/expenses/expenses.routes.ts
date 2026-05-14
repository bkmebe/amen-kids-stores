import { Router } from 'express';
import { expensesController } from './expenses.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createExpenseSchema } from './expenses.schema';

const router = Router();

router.use(authenticate);

router.get('/', expensesController.getAll);
router.post('/', validate(createExpenseSchema), expensesController.create);

export default router;
