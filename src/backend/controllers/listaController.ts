import { Request, Response } from 'express';
import listaService from '../services/listaService';
import { catchAsync } from '../middleware/errorHandler';
import { HTTP_STATUS } from '../../shared/constants';
import { TipoLista } from '../../generated/prisma';

class ListaController {
  /**
   * GET /api/listas
   * Lista todas as listas agrupadas por tipo
   */
  getAll = catchAsync(async (_req: Request, res: Response) => {
    const listas = await listaService.findAll();

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: listas,
    });
  });

  /**
   * GET /api/listas/:tipo
   * Lista itens de um tipo específico
   */
  getByTipo = catchAsync(async (req: Request, res: Response) => {
    const { tipo } = req.params;

    const listas = await listaService.findByTipo(tipo as TipoLista);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: listas,
    });
  });

  /**
   * GET /api/listas/item/:id
   * Busca um item específico por ID
   */
  getById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const lista = await listaService.findById(id);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: lista,
    });
  });

  /**
   * POST /api/listas
   * Cria um novo item
   */
  create = catchAsync(async (req: Request, res: Response) => {
    const { tipo, valor, ativo } = req.body;

    const lista = await listaService.create({
      tipo,
      valor,
      ativo,
    });

    res.status(HTTP_STATUS.CREATED).json({
      status: 'success',
      data: lista,
      message: 'Item criado com sucesso',
    });
  });

  /**
   * PUT /api/listas/:id
   * Atualiza um item existente
   */
  update = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { valor, ativo } = req.body;

    const lista = await listaService.update(id, {
      valor,
      ativo,
    });

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: lista,
      message: 'Item atualizado com sucesso',
    });
  });

  /**
   * DELETE /api/listas/:id
   * Desativa um item (soft delete)
   */
  delete = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    await listaService.delete(id);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      message: 'Item desativado com sucesso',
    });
  });

  /**
   * PATCH /api/listas/:id/toggle-ativo
   * Ativa/Desativa um item
   */
  toggleAtivo = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const lista = await listaService.findById(id);
    const updated = await listaService.update(id, { ativo: !lista.ativo });

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: updated,
      message: `Item ${updated.ativo ? 'ativado' : 'desativado'} com sucesso`,
    });
  });
}

export default new ListaController();
