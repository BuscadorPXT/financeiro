import { Router } from 'express';
import adminController from '../controllers/adminController';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// Todas as rotas de admin requerem autenticação e role ADMIN
router.use(authenticate);
router.use(requireAdmin);

// GET /api/admin-users/usuarios - Lista todos os usuários do sistema
router.get('/usuarios', adminController.listUsuarios);

// POST /api/admin-users/usuarios/:id/aprovar - Aprova usuário pendente
router.post('/usuarios/:id/aprovar', adminController.aprovarUsuario);

// DELETE /api/admin-users/usuarios/:id/rejeitar - Rejeita usuário pendente
router.delete('/usuarios/:id/rejeitar', adminController.rejeitarUsuario);

// PUT /api/admin-users/usuarios/:id/role - Altera role do usuário
router.put('/usuarios/:id/role', adminController.alterarRole);

// PUT /api/admin-users/usuarios/:id/toggle-ativo - Ativa/desativa usuário
router.put('/usuarios/:id/toggle-ativo', adminController.toggleAtivo);

export default router;
