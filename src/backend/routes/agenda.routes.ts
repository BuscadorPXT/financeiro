import { Router } from 'express';
import agendaController from '../controllers/agendaController';

const router = Router();

// GET /api/agenda/stats - Estatísticas (deve vir antes de /:id)
router.get('/stats', agendaController.getStats);

// PUT /api/agenda/atualizar-dias - Atualiza dias para vencer
router.put('/atualizar-dias', agendaController.atualizarDiasParaVencer);

// GET /api/agenda - Lista todos com paginação e filtros
router.get('/', agendaController.getAll);

// GET /api/agenda/:id - Busca por ID
router.get('/:id', agendaController.getById);

// POST /api/agenda - Cria novo item
router.post('/', agendaController.create);

// PUT /api/agenda/:id - Atualiza item
router.put('/:id', agendaController.update);

// PUT /api/agenda/:id/renovou - Marca como renovado
router.put('/:id/renovou', agendaController.marcarRenovou);

// PUT /api/agenda/:id/cancelou - Marca como cancelado
router.put('/:id/cancelou', agendaController.marcarCancelou);

// PUT /api/agenda/:id/reverter-renovou - Reverte renovação
router.put('/:id/reverter-renovou', agendaController.reverterRenovou);

// PUT /api/agenda/:id/reverter-cancelou - Reverte cancelamento
router.put('/:id/reverter-cancelou', agendaController.reverterCancelou);

// DELETE /api/agenda/:id - Deleta item
router.delete('/:id', agendaController.delete);

export default router;
