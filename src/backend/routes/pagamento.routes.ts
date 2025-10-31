import { Router } from 'express';
import pagamentoController from '../controllers/pagamentoController';
import { validate, idParamSchema } from '../middleware/validationMiddleware';
import {
  createPagamentoSchema,
  updatePagamentoSchema,
  pagamentoFiltersSchema,
} from '../schemas/pagamento.schemas';

const router = Router();

// GET /api/pagamentos/stats - Estatísticas (deve vir antes de /:id)
router.get('/stats', pagamentoController.getStats);

// GET /api/pagamentos/relatorio/mensal - Relatório mensal
router.get('/relatorio/mensal', pagamentoController.getRelatorioMensal);

// GET /api/pagamentos - Lista todos com paginação e filtros
router.get('/', validate({ query: pagamentoFiltersSchema }), pagamentoController.getAll);

// GET /api/pagamentos/:id - Busca por ID
router.get('/:id', validate({ params: idParamSchema }), pagamentoController.getById);

// POST /api/pagamentos - Cria novo pagamento
router.post('/', validate(createPagamentoSchema), pagamentoController.create);

// PUT /api/pagamentos/:id - Atualiza pagamento
router.put('/:id', validate({ params: idParamSchema, body: updatePagamentoSchema }), pagamentoController.update);

// DELETE /api/pagamentos/:id - Deleta pagamento
router.delete('/:id', validate({ params: idParamSchema }), pagamentoController.delete);

export default router;
