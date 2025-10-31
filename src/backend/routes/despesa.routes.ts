import { Router } from 'express';
import despesaController from '../controllers/despesaController';
import { validate, idParamSchema } from '../middleware/validationMiddleware';
import {
  createDespesaSchema,
  updateDespesaSchema,
  despesaFiltersSchema,
} from '../schemas/despesa.schemas';

const router = Router();

// GET /api/despesas/stats - Estatísticas (deve vir antes de /:id)
router.get('/stats', despesaController.getStats);

// GET /api/despesas/relatorio/categoria - Relatório por categoria
router.get('/relatorio/categoria', despesaController.getRelatorioPorCategoria);

// GET /api/despesas/relatorio/mensal - Relatório mensal
router.get('/relatorio/mensal', despesaController.getRelatorioMensal);

// GET /api/despesas - Lista todas com paginação e filtros
router.get('/', validate({ query: despesaFiltersSchema }), despesaController.getAll);

// GET /api/despesas/:id - Busca por ID
router.get('/:id', validate({ params: idParamSchema }), despesaController.getById);

// POST /api/despesas - Cria nova despesa
router.post('/', validate(createDespesaSchema), despesaController.create);

// PUT /api/despesas/:id - Atualiza despesa
router.put('/:id', validate({ params: idParamSchema, body: updateDespesaSchema }), despesaController.update);

// PUT /api/despesas/:id/pagar - Marca como paga
router.put('/:id/pagar', validate({ params: idParamSchema }), despesaController.marcarComoPaga);

// PUT /api/despesas/:id/pendente - Marca como pendente
router.put('/:id/pendente', validate({ params: idParamSchema }), despesaController.marcarComoPendente);

// DELETE /api/despesas/:id - Deleta despesa
router.delete('/:id', validate({ params: idParamSchema }), despesaController.delete);

export default router;
