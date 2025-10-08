import { Router } from 'express';
import listaController from '../controllers/listaController';

const router = Router();

// GET /api/listas - Lista todas agrupadas por tipo
router.get('/', listaController.getAll);

// GET /api/listas/item/:id - Busca por ID (deve vir antes de /:tipo para não conflitar)
router.get('/item/:id', listaController.getById);

// GET /api/listas/tipo/:tipo - Lista por tipo específico
router.get('/tipo/:tipo', listaController.getByTipo);

// POST /api/listas - Cria novo item
router.post('/', listaController.create);

// PUT /api/listas/:id - Atualiza item
router.put('/:id', listaController.update);

// DELETE /api/listas/:id - Desativa item
router.delete('/:id', listaController.delete);

// PATCH /api/listas/:id/toggle-ativo - Toggle ativo/inativo
router.patch('/:id/toggle-ativo', listaController.toggleAtivo);

export default router;
