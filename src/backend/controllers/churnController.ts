import { Request, Response } from 'express';
import churnService from '../services/churnService';
import { catchAsync } from '../middleware/errorHandler';
import { HTTP_STATUS } from '../../shared/constants';

class ChurnController {
  /**
   * GET /api/churn
   * Lista todos os registros de churn com paginação e filtros
   */
  getAll = catchAsync(async (req: Request, res: Response) => {
    const { page, limit, sortBy, sortOrder, ...filters } = req.query;

    const result = await churnService.findAll(
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
   * GET /api/churn/:id
   * Busca um registro de churn por ID
   */
  getById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const churn = await churnService.findById(id);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: churn,
    });
  });

  /**
   * GET /api/churn/stats
   * Obtém estatísticas de churn
   */
  getStats = catchAsync(async (req: Request, res: Response) => {
    const { mes, ano } = req.query;

    const stats = await churnService.getStats({
      mes: mes ? Number(mes) : undefined,
      ano: ano ? Number(ano) : undefined,
    });

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: stats,
    });
  });

  /**
   * GET /api/churn/relatorio/mensal
   * Obtém relatório mensal de churn
   */
  getRelatorioMensal = catchAsync(async (_req: Request, res: Response) => {
    const relatorio = await churnService.getRelatorioPorMes();

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: relatorio,
    });
  });

  /**
   * GET /api/churn/usuarios-em-churn
   * Obtém lista de usuários em churn ativo
   */
  getUsuariosEmChurn = catchAsync(async (_req: Request, res: Response) => {
    const usuarios = await churnService.getUsuariosEmChurn();

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: usuarios,
    });
  });

  /**
   * POST /api/churn
   * Cria um novo registro de churn
   */
  create = catchAsync(async (req: Request, res: Response) => {
    const { usuarioId, dataChurn, motivo } = req.body;

    // Validações básicas
    if (!usuarioId || !dataChurn) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: 'error',
        message: 'Campos obrigatórios: usuarioId, dataChurn',
      });
      return;
    }

    const churn = await churnService.create({
      usuarioId,
      dataChurn: new Date(dataChurn),
      motivo,
    });

    res.status(HTTP_STATUS.CREATED).json({
      status: 'success',
      data: churn,
      message: 'Churn registrado com sucesso',
    });
  });

  /**
   * PUT /api/churn/:id
   * Atualiza um registro de churn
   */
  update = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { dataChurn, motivo } = req.body;

    const updateData: any = {};

    if (dataChurn) updateData.dataChurn = new Date(dataChurn);
    if (motivo !== undefined) updateData.motivo = motivo;

    const churn = await churnService.update(id, updateData);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: churn,
      message: 'Churn atualizado com sucesso',
    });
  });

  /**
   * PUT /api/churn/:id/reverter
   * Reverte um churn (reativa o usuário)
   */
  reverterChurn = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const churn = await churnService.reverterChurn(id);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: churn,
      message: 'Churn revertido com sucesso. Usuário reativado.',
    });
  });

  /**
   * DELETE /api/churn/:id
   * Deleta um registro de churn
   */
  delete = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    await churnService.delete(id);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      message: 'Registro de churn excluído com sucesso',
    });
  });
}

export default new ChurnController();
