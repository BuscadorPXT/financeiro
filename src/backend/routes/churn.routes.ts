import { Router } from 'express';
import churnController from '../controllers/churnController';
import { validate, idParamSchema } from '../middleware/validationMiddleware';
import {
  createChurnSchema,
  updateChurnSchema,
  reverterChurnSchema,
  churnFiltersSchema,
} from '../schemas/churn.schemas';

const router = Router();

// GET /api/churn/stats - Estatísticas (deve vir antes de /:id)
router.get('/stats', churnController.getStats);

// GET /api/churn/relatorio/mensal - Relatório mensal
router.get('/relatorio/mensal', churnController.getRelatorioMensal);

// GET /api/churn/usuarios-em-churn - Lista usuários em churn ativo
router.get('/usuarios-em-churn', churnController.getUsuariosEmChurn);

// GET /api/churn - Lista todos com paginação e filtros
router.get('/', validate({ query: churnFiltersSchema }), churnController.getAll);

// GET /api/churn/:id - Busca por ID
router.get('/:id', validate({ params: idParamSchema }), churnController.getById);

// POST /api/churn - Cria novo registro
router.post('/', validate(createChurnSchema), churnController.create);

// PUT /api/churn/:id - Atualiza registro
router.put('/:id', validate({ params: idParamSchema, body: updateChurnSchema }), churnController.update);

// PUT /api/churn/:id/reverter - Reverte churn
router.put('/:id/reverter', validate({ params: idParamSchema, body: reverterChurnSchema }), churnController.reverterChurn);

// DELETE /api/churn/:id - Deleta registro
router.delete('/:id', validate({ params: idParamSchema }), churnController.delete);

export default router;
