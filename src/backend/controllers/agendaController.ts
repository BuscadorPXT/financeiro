import { Request, Response } from 'express';
import agendaService from '../services/agendaService';
import { catchAsync } from '../middleware/errorHandler';
import { HTTP_STATUS } from '../../shared/constants';
import { StatusAgenda, MetodoPagamento } from '../../generated/prisma';

class AgendaController {
  /**
   * GET /api/agenda
   * Lista todos os itens da agenda com paginação e filtros
   */
  getAll = catchAsync(async (req: Request, res: Response) => {
    const { page, limit, sortBy, sortOrder, ...filters } = req.query;

    const result = await agendaService.findAll(
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
   * GET /api/agenda/:id
   * Busca um item da agenda por ID
   */
  getById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const agenda = await agendaService.findById(id);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: agenda,
    });
  });

  /**
   * GET /api/agenda/stats
   * Obtém estatísticas da agenda
   */
  getStats = catchAsync(async (_req: Request, res: Response) => {
    const stats = await agendaService.getStats();

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: stats,
    });
  });

  /**
   * POST /api/agenda
   * Cria um novo item na agenda
   */
  create = catchAsync(async (req: Request, res: Response) => {
    const { usuarioId, dataVenc, ciclo, status } = req.body;

    // Validações básicas
    if (!usuarioId || !dataVenc || ciclo === undefined) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: 'error',
        message: 'Campos obrigatórios: usuarioId, dataVenc, ciclo',
      });
      return;
    }

    const agenda = await agendaService.create({
      usuarioId,
      dataVenc: new Date(dataVenc),
      ciclo: Number(ciclo),
      status: status as StatusAgenda,
    });

    res.status(HTTP_STATUS.CREATED).json({
      status: 'success',
      data: agenda,
      message: 'Item adicionado à agenda com sucesso',
    });
  });

  /**
   * PUT /api/agenda/:id
   * Atualiza um item da agenda
   */
  update = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { dataVenc, status, ciclo } = req.body;

    const updateData: any = {};

    if (dataVenc) updateData.dataVenc = new Date(dataVenc);
    if (status) updateData.status = status as StatusAgenda;
    if (ciclo !== undefined) updateData.ciclo = Number(ciclo);

    const agenda = await agendaService.update(id, updateData);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: agenda,
      message: 'Item da agenda atualizado com sucesso',
    });
  });

  /**
   * PUT /api/agenda/:id/renovou
   * Marca como renovado e cria pagamento recorrente
   */
  marcarRenovou = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { dataPagto, valor, metodo, conta, regraValor, observacao } = req.body;

    // Validações básicas
    if (!dataPagto || !valor || !metodo || !conta) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: 'error',
        message: 'Campos obrigatórios: dataPagto, valor, metodo, conta',
      });
      return;
    }

    const result = await agendaService.marcarRenovou(id, {
      dataPagto: new Date(dataPagto),
      valor: Number(valor),
      metodo: metodo as MetodoPagamento,
      conta,
      regraValor: regraValor ? Number(regraValor) : undefined,
      observacao,
    });

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: result,
      message: 'Renovação registrada com sucesso',
    });
  });

  /**
   * PUT /api/agenda/:id/cancelou
   * Marca como cancelado e cria registro de churn
   */
  marcarCancelou = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { motivo } = req.body;

    const result = await agendaService.marcarCancelou(id, motivo);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: result,
      message: 'Cancelamento registrado com sucesso',
    });
  });

  /**
   * PUT /api/agenda/:id/reverter-renovou
   * Reverte renovação
   */
  reverterRenovou = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const agenda = await agendaService.reverterRenovou(id);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: agenda,
      message: 'Renovação revertida com sucesso',
    });
  });

  /**
   * PUT /api/agenda/:id/reverter-cancelou
   * Reverte cancelamento
   */
  reverterCancelou = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const agenda = await agendaService.reverterCancelou(id);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: agenda,
      message: 'Cancelamento revertido com sucesso',
    });
  });

  /**
   * PUT /api/agenda/atualizar-dias
   * Atualiza dias para vencer de todos os itens ativos
   */
  atualizarDiasParaVencer = catchAsync(async (_req: Request, res: Response) => {
    const atualizados = await agendaService.atualizarDiasParaVencer();

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: { atualizados },
      message: `${atualizados} itens atualizados`,
    });
  });

  /**
   * DELETE /api/agenda/:id
   * Deleta um item da agenda
   */
  delete = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    await agendaService.delete(id);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      message: 'Item da agenda excluído com sucesso',
    });
  });
}

export default new AgendaController();
