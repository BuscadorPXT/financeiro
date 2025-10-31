import { Router } from 'express';
import authController from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';
import { authLimiter, registerLimiter } from '../middleware/rateLimiter';
import { validate, idParamSchema } from '../middleware/validationMiddleware';
import {
  loginSchema,
  registerSchema,
  changePasswordSchema,
  listarUsuariosQuerySchema,
  alterarRoleSchema,
} from '../schemas/auth.schemas';

const router = Router();

// Rotas públicas com rate limiting específico
// Login: 5 tentativas por 15 minutos por IP (só conta falhas)
// Registro: 3 registros por 1 hora por IP (conta todos)
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.post('/register', registerLimiter, validate(registerSchema), authController.register);

// Rotas protegidas
router.get('/me', authenticate, authController.me);
router.post('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword);

export default router;
