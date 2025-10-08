import { Request, Response } from 'express';
import prospeccaoService from '../services/prospeccaoService';
import { catchAsync } from '../middleware/errorHandler';
import { HTTP_STATUS } from '../../shared/constants';

class ProspeccaoController {
  /**
   * GET /api/prospeccao
   * Lista todas as prospecções com paginação e filtros
   */
  getAll = catchAsync(async (req: Request, res: Response) => {
    const { page, limit, sortBy, sortOrder, ...filters } = req.query;

    const result = await prospeccaoService.findAll(
      {
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
      },
      filters
    );

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: result.data,
      pagination: result.pagination,
    });
  });

  /**
   * GET /api/prospeccao/:id
   * Busca uma prospecção por ID
   */
  getById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const prospeccao = await prospeccaoService.findById(id);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: prospeccao,
    });
  });

  /**
   * GET /api/prospeccao/stats
   * Obtém estatísticas de prospecção
   */
  getStats = catchAsync(async (req: Request, res: Response) => {
    const { origem, indicador } = req.query;

    const stats = await prospeccaoService.getStats({
      origem: origem as string,
      indicador: indicador as string,
    });

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: stats,
    });
  });

  /**
   * GET /api/prospeccao/nao-convertidas
   * Lista prospecções não convertidas
   */
  getNaoConvertidas = catchAsync(async (req: Request, res: Response) => {
    const { origem, indicador } = req.query;

    const prospeccoes = await prospeccaoService.getNaoConvertidas({
      origem: origem as string,
      indicador: indicador as string,
    });

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: prospeccoes,
    });
  });

  /**
   * POST /api/prospeccao
   * Cria uma nova prospecção
   */
  create = catchAsync(async (req: Request, res: Response) => {
    const { email, nome, telefone, origem, indicador } = req.body;

    // Validações básicas
    if (!email || !nome) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: 'error',
        message: 'Campos obrigatórios: email, nome',
      });
      return;
    }

    const prospeccao = await prospeccaoService.create({
      email,
      nome,
      telefone,
      origem,
      indicador,
    });

    res.status(HTTP_STATUS.CREATED).json({
      status: 'success',
      data: prospeccao,
      message: 'Prospecção criada com sucesso',
    });
  });

  /**
   * PUT /api/prospeccao/:id
   * Atualiza uma prospecção
   */
  update = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { email, nome, telefone, origem, indicador } = req.body;

    const updateData: any = {};

    if (email) updateData.email = email;
    if (nome) updateData.nome = nome;
    if (telefone !== undefined) updateData.telefone = telefone;
    if (origem !== undefined) updateData.origem = origem;
    if (indicador !== undefined) updateData.indicador = indicador;

    const prospeccao = await prospeccaoService.update(id, updateData);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: prospeccao,
      message: 'Prospecção atualizada com sucesso',
    });
  });

  /**
   * DELETE /api/prospeccao/:id
   * Deleta uma prospecção
   */
  delete = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    await prospeccaoService.delete(id);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      message: 'Prospecção excluída com sucesso',
    });
  });

  /**
   * POST /api/prospeccao/:id/converter
   * Converte uma prospecção em usuário
   */
  converterParaUsuario = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { telefone, indicador } = req.body;

    const result = await prospeccaoService.converterParaUsuario(id, {
      telefone,
      indicador,
    });

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: result,
      message: 'Prospecção convertida em usuário com sucesso',
    });
  });
}

export default new ProspeccaoController();
