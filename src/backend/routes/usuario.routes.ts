import { Router } from 'express';
import usuarioController from '../controllers/usuarioController';

const router = Router();

// GET /api/usuarios/stats - Estatísticas (deve vir antes de /:id)
router.get('/stats', usuarioController.getStats);

// POST /api/usuarios/import - Importação em lote (deve vir antes de /:id)
router.post('/import', usuarioController.importBulk);

// GET /api/usuarios - Lista todos com paginação e filtros
router.get('/', usuarioController.getAll);

// GET /api/usuarios/:id - Busca por ID
router.get('/:id', usuarioController.getById);

// POST /api/usuarios - Cria novo usuário
router.post('/', usuarioController.create);

// PUT /api/usuarios/:id - Atualiza usuário
router.put('/:id', usuarioController.update);

// PUT /api/usuarios/:id/atualizar-flags - Atualiza flags de vencimento
router.put('/:id/atualizar-flags', usuarioController.atualizarFlags);

// DELETE /api/usuarios/:id - Desativa usuário
router.delete('/:id', usuarioController.delete);

export default router;
