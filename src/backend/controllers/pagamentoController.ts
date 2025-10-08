import { Request, Response } from 'express';
import pagamentoService from '../services/pagamentoService';
import { catchAsync } from '../middleware/errorHandler';
import { HTTP_STATUS } from '../../shared/constants';
import { RegraTipo, MetodoPagamento } from '../../generated/prisma';

class PagamentoController {
  /**
   * GET /api/pagamentos
   * Lista todos os pagamentos com paginação e filtros
   */
  getAll = catchAsync(async (req: Request, res: Response) => {
    const { page, limit, sortBy, sortOrder, ...filters } = req.query;

    const result = await pagamentoService.findAll(
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
   * GET /api/pagamentos/:id
   * Busca um pagamento por ID
   */
  getById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const pagamento = await pagamentoService.findById(id);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: pagamento,
    });
  });

  /**
   * GET /api/pagamentos/stats
   * Obtém estatísticas de pagamentos
   */
  getStats = catchAsync(async (req: Request, res: Response) => {
    const { mes } = req.query;

    const stats = await pagamentoService.getStats({
      mes: mes as string,
    });

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: stats,
    });
  });

  /**
   * GET /api/pagamentos/relatorio/mensal
   * Obtém relatório mensal de pagamentos
   */
  getRelatorioMensal = catchAsync(async (req: Request, res: Response) => {
    const relatorio = await pagamentoService.getRelatorioPorMes();

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: relatorio,
    });
  });

  /**
   * POST /api/pagamentos
   * Cria um novo pagamento
   */
  create = catchAsync(async (req: Request, res: Response) => {
    const {
      usuarioId,
      dataPagto,
      valor,
      metodo,
      conta,
      regraTipo,
      regraValor,
      elegivelComissao,
      observacao,
    } = req.body;

    // Validações básicas
    if (!usuarioId || !dataPagto || !valor || !metodo || !conta || !regraTipo) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: 'error',
        message: 'Campos obrigatórios: usuarioId, dataPagto, valor, metodo, conta, regraTipo',
      });
      return;
    }

    const pagamento = await pagamentoService.create({
      usuarioId,
      dataPagto: new Date(dataPagto),
      valor: Number(valor),
      metodo: metodo as MetodoPagamento,
      conta,
      regraTipo: regraTipo as RegraTipo,
      regraValor: regraValor ? Number(regraValor) : undefined,
      elegivelComissao: elegivelComissao !== undefined ? Boolean(elegivelComissao) : true,
      observacao,
    });

    res.status(HTTP_STATUS.CREATED).json({
      status: 'success',
      data: pagamento,
      message: 'Pagamento registrado com sucesso',
    });
  });

  /**
   * PUT /api/pagamentos/:id
   * Atualiza um pagamento
   */
  update = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { dataPagto, valor, metodo, conta, observacao } = req.body;

    const updateData: any = {};

    if (dataPagto) updateData.dataPagto = new Date(dataPagto);
    if (valor) updateData.valor = Number(valor);
    if (metodo) updateData.metodo = metodo as MetodoPagamento;
    if (conta) updateData.conta = conta;
    if (observacao !== undefined) updateData.observacao = observacao;

    const pagamento = await pagamentoService.update(id, updateData);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: pagamento,
      message: 'Pagamento atualizado com sucesso',
    });
  });

  /**
   * DELETE /api/pagamentos/:id
   * Deleta um pagamento
   */
  delete = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    await pagamentoService.delete(id);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      message: 'Pagamento excluído com sucesso',
    });
  });
}

export default new PagamentoController();
