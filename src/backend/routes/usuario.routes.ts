import { Router } from 'express';
import usuarioController from '../controllers/usuarioController';
import { criticalOperationsLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validate';
import { createUsuarioSchema, updateUsuarioSchema, idParamSchema } from '../schemas/usuario.schema';

const router = Router();

// GET /api/usuarios/stats - Estatísticas (deve vir antes de /:id)
router.get('/stats', usuarioController.getStats);

// POST /api/usuarios/import - Importação em lote (operação crítica)
// Limite: 10 imports por 15 minutos por IP
router.post('/import', criticalOperationsLimiter, usuarioController.importBulk);

// GET /api/usuarios - Lista todos com paginação e filtros
router.get('/', usuarioController.getAll);

// GET /api/usuarios/:id - Busca por ID
router.get('/:id', validate(idParamSchema), usuarioController.getById);

// POST /api/usuarios - Cria novo usuário
router.post('/', validate(createUsuarioSchema), usuarioController.create);

// PUT /api/usuarios/:id - Atualiza usuário
router.put('/:id', validate(updateUsuarioSchema), usuarioController.update);

// PUT /api/usuarios/:id/atualizar-flags - Atualiza flags de vencimento
router.put('/:id/atualizar-flags', validate(idParamSchema), usuarioController.atualizarFlags);

// DELETE /api/usuarios/:id - Desativa usuário (operação crítica)
// Limite: 10 deletes por 15 minutos por IP
router.delete('/:id', validate(idParamSchema), criticalOperationsLimiter, usuarioController.delete);

export default router;
