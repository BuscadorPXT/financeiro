import { Router } from 'express';
import usuarioExcluidoController from '../controllers/usuarioExcluidoController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

// GET /api/usuarios-excluidos/stats
router.get('/stats', usuarioExcluidoController.getStats);

// GET /api/usuarios-excluidos/buscar/:email
router.get('/buscar/:email', usuarioExcluidoController.findByEmail);

// GET /api/usuarios-excluidos/:id
router.get('/:id', usuarioExcluidoController.getById);

// GET /api/usuarios-excluidos
router.get('/', usuarioExcluidoController.getAll);

export default router;
