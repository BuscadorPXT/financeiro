import { Router } from 'express';
import authController from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// Rotas públicas
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Rotas protegidas
router.get('/me', authenticate, authController.me);
router.post('/change-password', authenticate, authController.changePassword);

export default router;
