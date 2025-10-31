import { Router } from 'express';
import usuarioExcluidoController from '../controllers/usuarioExcluidoController';
import { authenticate } from '../middleware/authMiddleware';
import { validate, idParamSchema } from '../middleware/validationMiddleware';
import {
  usuarioExcluidoFiltersSchema,
  emailParamSchema,
} from '../schemas/usuarioExcluido.schemas';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

// GET /api/usuarios-excluidos/stats
router.get('/stats', usuarioExcluidoController.getStats);

// GET /api/usuarios-excluidos/buscar/:email
router.get('/buscar/:email', validate({ params: emailParamSchema }), usuarioExcluidoController.findByEmail);

// GET /api/usuarios-excluidos/:id
router.get('/:id', validate({ params: idParamSchema }), usuarioExcluidoController.getById);

// GET /api/usuarios-excluidos
router.get('/', validate({ query: usuarioExcluidoFiltersSchema }), usuarioExcluidoController.getAll);

export default router;
