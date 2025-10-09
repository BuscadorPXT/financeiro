import { Request, Response } from 'express';
import comissaoService from '../services/comissaoService';
import { catchAsync } from '../middleware/errorHandler';
import { HTTP_STATUS } from '../../shared/constants';
import { RegraTipo } from '@prisma/client';

class ComissaoController {
  /**
   * GET /api/comissoes
   * Lista todas as comissões com paginação e filtros
   */
  getAll = catchAsync(async (req: Request, res: Response) => {
    const { page, limit, sortBy, sortOrder, ...filters } = req.query;

    const result = await comissaoService.findAll(
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
   * GET /api/comissoes/:id
   * Busca uma comissão por ID
   */
  getById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const comissao = await comissaoService.findById(id);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: comissao,
    });
  });

  /**
   * GET /api/comissoes/stats
   * Obtém estatísticas de comissões
   */
  getStats = catchAsync(async (req: Request, res: Response) => {
    const { mes, indicador } = req.query;

    const stats = await comissaoService.getStats({
      mes: mes as string,
      indicador: indicador as string,
    });

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: stats,
    });
  });

  /**
   * GET /api/comissoes/consolidacao/indicador
   * Obtém consolidação por indicador
   */
  getConsolidacaoPorIndicador = catchAsync(async (req: Request, res: Response) => {
    const { mes } = req.query;

    const consolidacao = await comissaoService.getConsolidacaoPorIndicador({
      mes: mes as string,
    });

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: consolidacao,
    });
  });

  /**
   * GET /api/comissoes/relatorio/mensal
   * Obtém relatório mensal
   */
  getRelatorioMensal = catchAsync(async (_req: Request, res: Response) => {
    const relatorio = await comissaoService.getRelatorioPorMes();

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: relatorio,
    });
  });

  /**
   * GET /api/comissoes/extrato/:indicador
   * Obtém extrato detalhado por indicador
   */
  getExtratoPorIndicador = catchAsync(async (req: Request, res: Response) => {
    const { indicador } = req.params;
    const { mes } = req.query;

    const extrato = await comissaoService.getExtratoPorIndicador(indicador, {
      mes: mes as string,
    });

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: extrato,
    });
  });

  /**
   * POST /api/comissoes
   * Cria uma nova comissão
   */
  create = catchAsync(async (req: Request, res: Response) => {
    const { pagamentoId, indicador, regraTipo, valor, mesRef } = req.body;

    // Validações básicas
    if (!pagamentoId || !indicador || !regraTipo || valor === undefined || !mesRef) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: 'error',
        message: 'Campos obrigatórios: pagamentoId, indicador, regraTipo, valor, mesRef',
      });
      return;
    }

    const comissao = await comissaoService.create({
      pagamentoId,
      indicador,
      regraTipo: regraTipo as RegraTipo,
      valor: Number(valor),
      mesRef,
    });

    res.status(HTTP_STATUS.CREATED).json({
      status: 'success',
      data: comissao,
      message: 'Comissão criada com sucesso',
    });
  });

  /**
   * PUT /api/comissoes/:id
   * Atualiza uma comissão
   */
  update = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { indicador, valor, mesRef } = req.body;

    const updateData: any = {};

    if (indicador) updateData.indicador = indicador;
    if (valor !== undefined) updateData.valor = Number(valor);
    if (mesRef) updateData.mesRef = mesRef;

    const comissao = await comissaoService.update(id, updateData);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: comissao,
      message: 'Comissão atualizada com sucesso',
    });
  });

  /**
   * DELETE /api/comissoes/:id
   * Deleta uma comissão
   */
  delete = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    await comissaoService.delete(id);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      message: 'Comissão excluída com sucesso',
    });
  });
}

export default new ComissaoController();
