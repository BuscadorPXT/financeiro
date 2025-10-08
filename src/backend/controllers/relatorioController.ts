import { Request, Response } from 'express';
import relatorioService from '../services/relatorioService';
import { catchAsync } from '../middleware/errorHandler';
import { HTTP_STATUS } from '../../shared/constants';

class RelatorioController {
  /**
   * GET /api/relatorios/dashboard
   * Dashboard principal com KPIs gerais
   */
  getDashboard = catchAsync(async (req: Request, res: Response) => {
    const { mes, ano } = req.query;

    const dashboard = await relatorioService.getDashboard({
      mes: mes as string,
      ano: ano ? Number(ano) : undefined,
    });

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: dashboard,
    });
  });

  /**
   * GET /api/relatorios/financeiro
   * Relatório financeiro detalhado
   */
  getRelatorioFinanceiro = catchAsync(async (req: Request, res: Response) => {
    const { mesInicio, mesFim, anoInicio, anoFim } = req.query;

    const relatorio = await relatorioService.getRelatorioFinanceiro({
      mesInicio: mesInicio as string,
      mesFim: mesFim as string,
      anoInicio: anoInicio ? Number(anoInicio) : undefined,
      anoFim: anoFim ? Number(anoFim) : undefined,
    });

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: relatorio,
    });
  });

  /**
   * GET /api/relatorios/usuarios
   * Relatório de usuários
   */
  getRelatorioUsuarios = catchAsync(async (req: Request, res: Response) => {
    const relatorio = await relatorioService.getRelatorioUsuarios();

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: relatorio,
    });
  });

  /**
   * GET /api/relatorios/desempenho-mensal
   * Relatório de desempenho mensal
   */
  getDesempenhoMensal = catchAsync(async (req: Request, res: Response) => {
    const { ano } = req.query;

    const relatorio = await relatorioService.getDesempenhoMensal(
      ano ? Number(ano) : undefined
    );

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: relatorio,
    });
  });

  /**
   * GET /api/relatorios/agenda
   * Relatório de agenda e renovações
   */
  getRelatorioAgenda = catchAsync(async (req: Request, res: Response) => {
    const relatorio = await relatorioService.getRelatorioAgenda();

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: relatorio,
    });
  });
}

export default new RelatorioController();
