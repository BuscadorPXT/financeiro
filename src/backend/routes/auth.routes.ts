import { Router } from 'express';
import authController from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

// Rotas públicas (com rate limiting específico para login)
// Limite: 5 tentativas de login por 15 minutos por IP
router.post('/login', authLimiter, authController.login);
router.post('/logout', authController.logout);
router.post('/register', authLimiter, authController.register); // Registro público

// Rotas protegidas
router.get('/me', authenticate, authController.me);
router.post('/change-password', authenticate, authController.changePassword);

export default router;
