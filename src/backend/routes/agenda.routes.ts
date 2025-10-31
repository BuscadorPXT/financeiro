import { Router } from 'express';
import agendaController from '../controllers/agendaController';
import { validate, idParamSchema } from '../middleware/validationMiddleware';
import {
  createAgendaSchema,
  updateAgendaSchema,
  marcarRenouSchema,
  marcarCancelouSchema,
  agendaFiltersSchema,
} from '../schemas/agenda.schemas';

const router = Router();

// GET /api/agenda/stats - Estatísticas (deve vir antes de /:id)
router.get('/stats', agendaController.getStats);

// PUT /api/agenda/atualizar-dias - Atualiza dias para vencer
router.put('/atualizar-dias', agendaController.atualizarDiasParaVencer);

// GET /api/agenda - Lista todos com paginação e filtros
router.get('/', validate({ query: agendaFiltersSchema }), agendaController.getAll);

// GET /api/agenda/:id - Busca por ID
router.get('/:id', validate({ params: idParamSchema }), agendaController.getById);

// POST /api/agenda - Cria novo item
router.post('/', validate(createAgendaSchema), agendaController.create);

// PUT /api/agenda/:id - Atualiza item
router.put('/:id', validate({ params: idParamSchema, body: updateAgendaSchema }), agendaController.update);

// PUT /api/agenda/:id/renovou - Marca como renovado
router.put('/:id/renovou', validate({ params: idParamSchema, body: marcarRenouSchema }), agendaController.marcarRenovou);

// PUT /api/agenda/:id/cancelou - Marca como cancelado
router.put('/:id/cancelou', validate({ params: idParamSchema, body: marcarCancelouSchema }), agendaController.marcarCancelou);

// PUT /api/agenda/:id/reverter-renovou - Reverte renovação
router.put('/:id/reverter-renovou', validate({ params: idParamSchema }), agendaController.reverterRenovou);

// PUT /api/agenda/:id/reverter-cancelou - Reverte cancelamento
router.put('/:id/reverter-cancelou', validate({ params: idParamSchema }), agendaController.reverterCancelou);

// DELETE /api/agenda/:id - Deleta item
router.delete('/:id', validate({ params: idParamSchema }), agendaController.delete);

export default router;
