import { Router } from 'express';
import despesaController from '../controllers/despesaController';
import { validate } from '../middleware/validate';
import { createDespesaSchema, updateDespesaSchema } from '../schemas/despesa.schema';
import { idParamSchema } from '../schemas/usuario.schema';

const router = Router();

// GET /api/despesas/stats - Estatísticas (deve vir antes de /:id)
router.get('/stats', despesaController.getStats);

// GET /api/despesas/relatorio/categoria - Relatório por categoria
router.get('/relatorio/categoria', despesaController.getRelatorioPorCategoria);

// GET /api/despesas/relatorio/mensal - Relatório mensal
router.get('/relatorio/mensal', despesaController.getRelatorioMensal);

// GET /api/despesas - Lista todas com paginação e filtros
router.get('/', despesaController.getAll);

// GET /api/despesas/:id - Busca por ID
router.get('/:id', validate(idParamSchema), despesaController.getById);

// POST /api/despesas - Cria nova despesa
router.post('/', validate(createDespesaSchema), despesaController.create);

// PUT /api/despesas/:id - Atualiza despesa
router.put('/:id', validate(updateDespesaSchema), despesaController.update);

// PUT /api/despesas/:id/pagar - Marca como paga
router.put('/:id/pagar', validate(idParamSchema), despesaController.marcarComoPaga);

// PUT /api/despesas/:id/pendente - Marca como pendente
router.put('/:id/pendente', validate(idParamSchema), despesaController.marcarComoPendente);

// DELETE /api/despesas/:id - Deleta despesa
router.delete('/:id', validate(idParamSchema), despesaController.delete);

export default router;
