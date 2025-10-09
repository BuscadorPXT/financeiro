import { Request, Response } from 'express';
import despesaService from '../services/despesaService';
import { catchAsync } from '../middleware/errorHandler';
import { HTTP_STATUS } from '../../shared/constants';
import { StatusDespesa } from '@prisma/client';

class DespesaController {
  /**
   * GET /api/despesas
   * Lista todas as despesas com paginação e filtros
   */
  getAll = catchAsync(async (req: Request, res: Response) => {
    const { page, limit, sortBy, sortOrder, ...filters } = req.query;

    const result = await despesaService.findAll(
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
   * GET /api/despesas/:id
   * Busca uma despesa por ID
   */
  getById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const despesa = await despesaService.findById(id);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: despesa,
    });
  });

  /**
   * GET /api/despesas/stats
   * Obtém estatísticas de despesas
   */
  getStats = catchAsync(async (req: Request, res: Response) => {
    const { mes, ano } = req.query;

    const stats = await despesaService.getStats({
      mes: mes ? Number(mes) : undefined,
      ano: ano ? Number(ano) : undefined,
    });

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: stats,
    });
  });

  /**
   * GET /api/despesas/relatorio/categoria
   * Obtém relatório por categoria
   */
  getRelatorioPorCategoria = catchAsync(async (req: Request, res: Response) => {
    const { mes, ano } = req.query;

    const relatorio = await despesaService.getRelatorioPorCategoria({
      mes: mes ? Number(mes) : undefined,
      ano: ano ? Number(ano) : undefined,
    });

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: relatorio,
    });
  });

  /**
   * GET /api/despesas/relatorio/mensal
   * Obtém relatório mensal
   */
  getRelatorioMensal = catchAsync(async (_req: Request, res: Response) => {
    const relatorio = await despesaService.getRelatorioPorMes();

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: relatorio,
    });
  });

  /**
   * POST /api/despesas
   * Cria uma nova despesa
   */
  create = catchAsync(async (req: Request, res: Response) => {
    const {
      categoria,
      descricao,
      valor,
      conta,
      indicador,
      status,
      competenciaMes,
      competenciaAno,
    } = req.body;

    // Validações básicas
    if (!categoria || !descricao || !valor || !competenciaMes || !competenciaAno) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: 'error',
        message:
          'Campos obrigatórios: categoria, descricao, valor, competenciaMes, competenciaAno',
      });
      return;
    }

    const despesa = await despesaService.create({
      categoria,
      descricao,
      valor: Number(valor),
      conta,
      indicador,
      status: status as StatusDespesa,
      competenciaMes: Number(competenciaMes),
      competenciaAno: Number(competenciaAno),
    });

    res.status(HTTP_STATUS.CREATED).json({
      status: 'success',
      data: despesa,
      message: 'Despesa criada com sucesso',
    });
  });

  /**
   * PUT /api/despesas/:id
   * Atualiza uma despesa
   */
  update = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
      categoria,
      descricao,
      valor,
      conta,
      indicador,
      status,
      competenciaMes,
      competenciaAno,
    } = req.body;

    const updateData: any = {};

    if (categoria) updateData.categoria = categoria;
    if (descricao) updateData.descricao = descricao;
    if (valor !== undefined) updateData.valor = Number(valor);
    if (conta !== undefined) updateData.conta = conta;
    if (indicador !== undefined) updateData.indicador = indicador;
    if (status) updateData.status = status as StatusDespesa;
    if (competenciaMes) updateData.competenciaMes = Number(competenciaMes);
    if (competenciaAno) updateData.competenciaAno = Number(competenciaAno);

    const despesa = await despesaService.update(id, updateData);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: despesa,
      message: 'Despesa atualizada com sucesso',
    });
  });

  /**
   * PUT /api/despesas/:id/pagar
   * Marca despesa como paga
   */
  marcarComoPaga = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const despesa = await despesaService.marcarComoPaga(id);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: despesa,
      message: 'Despesa marcada como paga',
    });
  });

  /**
   * PUT /api/despesas/:id/pendente
   * Marca despesa como pendente
   */
  marcarComoPendente = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const despesa = await despesaService.marcarComoPendente(id);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: despesa,
      message: 'Despesa marcada como pendente',
    });
  });

  /**
   * DELETE /api/despesas/:id
   * Deleta uma despesa
   */
  delete = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    await despesaService.delete(id);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      message: 'Despesa excluída com sucesso',
    });
  });
}

export default new DespesaController();
