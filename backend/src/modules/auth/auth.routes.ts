import { Router } from 'express';
import { authController } from './auth.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { loginSchema, updateLanguageSchema } from './auth.schema';

const router = Router();

router.post('/login', validate(loginSchema), authController.login);
router.get('/me', authenticate, authController.me);
router.post('/logout', authenticate, authController.logout);
router.patch('/settings/language', authenticate, validate(updateLanguageSchema), authController.updateLanguage);

export default router;
