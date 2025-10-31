import { Router } from 'express';
import listaController from '../controllers/listaController';
import { validate, idParamSchema } from '../middleware/validationMiddleware';
import {
  createListaSchema,
  updateListaSchema,
  tipoParamSchema,
} from '../schemas/lista.schemas';

const router = Router();

// GET /api/listas - Lista todas agrupadas por tipo
router.get('/', listaController.getAll);

// GET /api/listas/item/:id - Busca por ID (deve vir antes de /:tipo para não conflitar)
router.get('/item/:id', validate({ params: idParamSchema }), listaController.getById);

// GET /api/listas/tipo/:tipo - Lista por tipo específico
router.get('/tipo/:tipo', validate({ params: tipoParamSchema }), listaController.getByTipo);

// POST /api/listas - Cria novo item
router.post('/', validate(createListaSchema), listaController.create);

// PUT /api/listas/:id - Atualiza item
router.put('/:id', validate({ params: idParamSchema, body: updateListaSchema }), listaController.update);

// DELETE /api/listas/:id - Desativa item
router.delete('/:id', validate({ params: idParamSchema }), listaController.delete);

// PATCH /api/listas/:id/toggle-ativo - Toggle ativo/inativo
router.patch('/:id/toggle-ativo', validate({ params: idParamSchema }), listaController.toggleAtivo);

export default router;
