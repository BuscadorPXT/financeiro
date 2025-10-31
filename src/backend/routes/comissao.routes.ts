import { Router } from 'express';
import comissaoController from '../controllers/comissaoController';
import { validate, idParamSchema } from '../middleware/validationMiddleware';
import {
  createComissaoSchema,
  updateComissaoSchema,
  comissaoFiltersSchema,
  extratoIndicadorParamSchema,
} from '../schemas/comissao.schemas';

const router = Router();

// GET /api/comissoes/stats - Estatísticas (deve vir antes de /:id)
router.get('/stats', comissaoController.getStats);

// GET /api/comissoes/consolidacao/indicador - Consolidação por indicador
router.get('/consolidacao/indicador', comissaoController.getConsolidacaoPorIndicador);

// GET /api/comissoes/relatorio/mensal - Relatório mensal
router.get('/relatorio/mensal', comissaoController.getRelatorioMensal);

// GET /api/comissoes/extrato/:indicador - Extrato por indicador
router.get('/extrato/:indicador', validate({ params: extratoIndicadorParamSchema }), comissaoController.getExtratoPorIndicador);

// GET /api/comissoes - Lista todas com paginação e filtros
router.get('/', validate({ query: comissaoFiltersSchema }), comissaoController.getAll);

// GET /api/comissoes/:id - Busca por ID
router.get('/:id', validate({ params: idParamSchema }), comissaoController.getById);

// POST /api/comissoes - Cria nova comissão
router.post('/', validate(createComissaoSchema), comissaoController.create);

// PUT /api/comissoes/:id - Atualiza comissão
router.put('/:id', validate({ params: idParamSchema, body: updateComissaoSchema }), comissaoController.update);

// DELETE /api/comissoes/:id - Deleta comissão
router.delete('/:id', validate({ params: idParamSchema }), comissaoController.delete);

export default router;
