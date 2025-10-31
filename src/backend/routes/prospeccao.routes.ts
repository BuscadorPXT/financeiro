import { Router } from 'express';
import prospeccaoController from '../controllers/prospeccaoController';
import { validate, idParamSchema } from '../middleware/validationMiddleware';
import {
  createProspeccaoSchema,
  updateProspeccaoSchema,
  converterProspeccaoSchema,
  prospeccaoFiltersSchema,
} from '../schemas/prospeccao.schemas';

const router = Router();

// GET /api/prospeccao/stats - Estatísticas (deve vir antes de /:id)
router.get('/stats', prospeccaoController.getStats);

// GET /api/prospeccao/nao-convertidas - Lista não convertidas
router.get('/nao-convertidas', prospeccaoController.getNaoConvertidas);

// GET /api/prospeccao - Lista todas com paginação e filtros
router.get('/', validate({ query: prospeccaoFiltersSchema }), prospeccaoController.getAll);

// GET /api/prospeccao/:id - Busca por ID
router.get('/:id', validate({ params: idParamSchema }), prospeccaoController.getById);

// POST /api/prospeccao - Cria nova prospecção
router.post('/', validate(createProspeccaoSchema), prospeccaoController.create);

// POST /api/prospeccao/:id/converter - Converte prospecção para usuário
router.post('/:id/converter', validate({ params: idParamSchema, body: converterProspeccaoSchema }), prospeccaoController.converterParaUsuario);

// PUT /api/prospeccao/:id - Atualiza prospecção
router.put('/:id', validate({ params: idParamSchema, body: updateProspeccaoSchema }), prospeccaoController.update);

// DELETE /api/prospeccao/:id - Deleta prospecção
router.delete('/:id', validate({ params: idParamSchema }), prospeccaoController.delete);

export default router;
