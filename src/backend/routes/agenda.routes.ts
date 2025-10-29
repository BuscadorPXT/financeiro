import { Router } from 'express';
import agendaController from '../controllers/agendaController';
import { validate } from '../middleware/validate';
import { createAgendaSchema, updateAgendaSchema } from '../schemas/agenda.schema';
import { idParamSchema } from '../schemas/usuario.schema';

const router = Router();

// GET /api/agenda/stats - Estatísticas (deve vir antes de /:id)
router.get('/stats', agendaController.getStats);

// PUT /api/agenda/atualizar-dias - Atualiza dias para vencer
router.put('/atualizar-dias', agendaController.atualizarDiasParaVencer);

// GET /api/agenda - Lista todos com paginação e filtros
router.get('/', agendaController.getAll);

// GET /api/agenda/:id - Busca por ID
router.get('/:id', validate(idParamSchema), agendaController.getById);

// POST /api/agenda - Cria novo item
router.post('/', validate(createAgendaSchema), agendaController.create);

// PUT /api/agenda/:id - Atualiza item
router.put('/:id', validate(updateAgendaSchema), agendaController.update);

// PUT /api/agenda/:id/renovou - Marca como renovado
router.put('/:id/renovou', validate(idParamSchema), agendaController.marcarRenovou);

// PUT /api/agenda/:id/cancelou - Marca como cancelado
router.put('/:id/cancelou', validate(idParamSchema), agendaController.marcarCancelou);

// PUT /api/agenda/:id/reverter-renovou - Reverte renovação
router.put('/:id/reverter-renovou', validate(idParamSchema), agendaController.reverterRenovou);

// PUT /api/agenda/:id/reverter-cancelou - Reverte cancelamento
router.put('/:id/reverter-cancelou', validate(idParamSchema), agendaController.reverterCancelou);

// DELETE /api/agenda/:id - Deleta item
router.delete('/:id', validate(idParamSchema), agendaController.delete);

export default router;
