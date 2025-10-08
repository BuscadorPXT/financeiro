import { Router } from 'express';
import prospeccaoController from '../controllers/prospeccaoController';

const router = Router();

// GET /api/prospeccao/stats - Estatísticas (deve vir antes de /:id)
router.get('/stats', prospeccaoController.getStats);

// GET /api/prospeccao/nao-convertidas - Lista não convertidas
router.get('/nao-convertidas', prospeccaoController.getNaoConvertidas);

// GET /api/prospeccao - Lista todas com paginação e filtros
router.get('/', prospeccaoController.getAll);

// GET /api/prospeccao/:id - Busca por ID
router.get('/:id', prospeccaoController.getById);

// POST /api/prospeccao - Cria nova prospecção
router.post('/', prospeccaoController.create);

// POST /api/prospeccao/:id/converter - Converte prospecção para usuário
router.post('/:id/converter', prospeccaoController.converterParaUsuario);

// PUT /api/prospeccao/:id - Atualiza prospecção
router.put('/:id', prospeccaoController.update);

// DELETE /api/prospeccao/:id - Deleta prospecção
router.delete('/:id', prospeccaoController.delete);

export default router;
