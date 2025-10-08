import { Router } from 'express';
import pagamentoController from '../controllers/pagamentoController';

const router = Router();

// GET /api/pagamentos/stats - Estatísticas (deve vir antes de /:id)
router.get('/stats', pagamentoController.getStats);

// GET /api/pagamentos/relatorio/mensal - Relatório mensal
router.get('/relatorio/mensal', pagamentoController.getRelatorioMensal);

// GET /api/pagamentos - Lista todos com paginação e filtros
router.get('/', pagamentoController.getAll);

// GET /api/pagamentos/:id - Busca por ID
router.get('/:id', pagamentoController.getById);

// POST /api/pagamentos - Cria novo pagamento
router.post('/', pagamentoController.create);

// PUT /api/pagamentos/:id - Atualiza pagamento
router.put('/:id', pagamentoController.update);

// DELETE /api/pagamentos/:id - Deleta pagamento
router.delete('/:id', pagamentoController.delete);

export default router;
