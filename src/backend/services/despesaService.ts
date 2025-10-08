import prisma from '../../database/client';
import { Despesa, StatusDespesa } from '../../generated/prisma';
import { AppError } from '../middleware/errorHandler';
import { HTTP_STATUS } from '../../shared/constants';
import { PaginationParams, PaginatedResponse, FilterParams } from '../../shared/types';

class DespesaService {
  /**
   * Lista todas as despesas com paginação e filtros
   */
  async findAll(
    pagination?: PaginationParams,
    filters?: FilterParams
  ): Promise<PaginatedResponse<Despesa>> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Filtros
    if (filters?.categoria) {
      where.categoria = filters.categoria;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.conta) {
      where.conta = filters.conta;
    }

    if (filters?.indicador) {
      where.indicador = filters.indicador;
    }

    if (filters?.mes) {
      where.competenciaMes = Number(filters.mes);
    }

    if (filters?.ano) {
      where.competenciaAno = Number(filters.ano);
    }

    // Filtro combinado de competência (formato: "10/2024")
    if (filters?.competencia) {
      const [mes, ano] = filters.competencia.split('/');
      if (mes && ano) {
        where.competenciaMes = Number(mes);
        where.competenciaAno = Number(ano);
      }
    }

    const [data, total] = await Promise.all([
      prisma.despesa.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { competenciaAno: 'desc' },
          { competenciaMes: 'desc' },
          { createdAt: 'desc' },
        ],
      }),
      prisma.despesa.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Busca uma despesa por ID
   */
  async findById(id: string): Promise<Despesa> {
    const despesa = await prisma.despesa.findUnique({
      where: { id },
    });

    if (!despesa) {
      throw new AppError('Despesa não encontrada', HTTP_STATUS.NOT_FOUND);
    }

    return despesa;
  }

  /**
   * Cria uma nova despesa
   */
  async create(data: {
    categoria: string;
    descricao: string;
    valor: number;
    conta?: string;
    indicador?: string;
    status?: StatusDespesa;
    competenciaMes: number;
    competenciaAno: number;
  }): Promise<Despesa> {
    // Validações
    if (data.competenciaMes < 1 || data.competenciaMes > 12) {
      throw new AppError(
        'Mês de competência inválido (deve ser entre 1 e 12)',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    if (data.valor <= 0) {
      throw new AppError('Valor deve ser maior que zero', HTTP_STATUS.BAD_REQUEST);
    }

    const despesa = await prisma.despesa.create({
      data: {
        categoria: data.categoria,
        descricao: data.descricao,
        valor: data.valor,
        conta: data.conta,
        indicador: data.indicador,
        status: data.status || StatusDespesa.PENDENTE,
        competenciaMes: data.competenciaMes,
        competenciaAno: data.competenciaAno,
      },
    });

    return despesa;
  }

  /**
   * Atualiza uma despesa
   */
  async update(
    id: string,
    data: Partial<{
      categoria: string;
      descricao: string;
      valor: number;
      conta: string;
      indicador: string;
      status: StatusDespesa;
      competenciaMes: number;
      competenciaAno: number;
    }>
  ): Promise<Despesa> {
    await this.findById(id);

    // Validações
    if (data.competenciaMes && (data.competenciaMes < 1 || data.competenciaMes > 12)) {
      throw new AppError(
        'Mês de competência inválido (deve ser entre 1 e 12)',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    if (data.valor !== undefined && data.valor <= 0) {
      throw new AppError('Valor deve ser maior que zero', HTTP_STATUS.BAD_REQUEST);
    }

    const despesa = await prisma.despesa.update({
      where: { id },
      data,
    });

    return despesa;
  }

  /**
   * Deleta uma despesa
   */
  async delete(id: string): Promise<void> {
    await this.findById(id);

    await prisma.despesa.delete({
      where: { id },
    });
  }

  /**
   * Marca despesa como paga
   */
  async marcarComoPaga(id: string): Promise<Despesa> {
    return await this.update(id, { status: StatusDespesa.PAGO });
  }

  /**
   * Marca despesa como pendente
   */
  async marcarComoPendente(id: string): Promise<Despesa> {
    return await this.update(id, { status: StatusDespesa.PENDENTE });
  }

  /**
   * Obtém estatísticas de despesas
   */
  async getStats(filters?: { mes?: number; ano?: number }): Promise<{
    totalDespesas: number;
    valorTotal: number;
    valorPago: number;
    valorPendente: number;
    despesasPagas: number;
    despesasPendentes: number;
  }> {
    const where: any = {};
    if (filters?.mes) where.competenciaMes = filters.mes;
    if (filters?.ano) where.competenciaAno = filters.ano;

    const [total, somaTotal, somaPago, somaPendente, countPago, countPendente] =
      await Promise.all([
        prisma.despesa.count({ where }),
        prisma.despesa.aggregate({
          where,
          _sum: { valor: true },
        }),
        prisma.despesa.aggregate({
          where: { ...where, status: StatusDespesa.PAGO },
          _sum: { valor: true },
        }),
        prisma.despesa.aggregate({
          where: { ...where, status: StatusDespesa.PENDENTE },
          _sum: { valor: true },
        }),
        prisma.despesa.count({
          where: { ...where, status: StatusDespesa.PAGO },
        }),
        prisma.despesa.count({
          where: { ...where, status: StatusDespesa.PENDENTE },
        }),
      ]);

    return {
      totalDespesas: total,
      valorTotal: Number(somaTotal._sum.valor || 0),
      valorPago: Number(somaPago._sum.valor || 0),
      valorPendente: Number(somaPendente._sum.valor || 0),
      despesasPagas: countPago,
      despesasPendentes: countPendente,
    };
  }

  /**
   * Obtém relatório por categoria
   */
  async getRelatorioPorCategoria(filters?: {
    mes?: number;
    ano?: number;
  }): Promise<
    Array<{
      categoria: string;
      totalDespesas: number;
      valorTotal: number;
      valorPago: number;
      valorPendente: number;
    }>
  > {
    const where: any = {};
    if (filters?.mes) where.competenciaMes = filters.mes;
    if (filters?.ano) where.competenciaAno = filters.ano;

    const despesas = await prisma.despesa.groupBy({
      by: ['categoria'],
      where,
      _count: { id: true },
      _sum: { valor: true },
      orderBy: { _sum: { valor: 'desc' } },
    });

    const relatorio = await Promise.all(
      despesas.map(async (item) => {
        const [somaPago, somaPendente] = await Promise.all([
          prisma.despesa.aggregate({
            where: {
              ...where,
              categoria: item.categoria,
              status: StatusDespesa.PAGO,
            },
            _sum: { valor: true },
          }),
          prisma.despesa.aggregate({
            where: {
              ...where,
              categoria: item.categoria,
              status: StatusDespesa.PENDENTE,
            },
            _sum: { valor: true },
          }),
        ]);

        return {
          categoria: item.categoria,
          totalDespesas: item._count.id,
          valorTotal: Number(item._sum.valor || 0),
          valorPago: Number(somaPago._sum.valor || 0),
          valorPendente: Number(somaPendente._sum.valor || 0),
        };
      })
    );

    return relatorio;
  }

  /**
   * Obtém relatório por mês/competência
   */
  async getRelatorioPorMes(): Promise<
    Array<{
      competencia: string; // "10/2024"
      mes: number;
      ano: number;
      totalDespesas: number;
      valorTotal: number;
      valorPago: number;
      valorPendente: number;
      categorias: number;
    }>
  > {
    const despesas = await prisma.despesa.groupBy({
      by: ['competenciaMes', 'competenciaAno'],
      _count: { id: true },
      _sum: { valor: true },
      orderBy: [{ competenciaAno: 'desc' }, { competenciaMes: 'desc' }],
    });

    const relatorio = await Promise.all(
      despesas.map(async (item) => {
        const [somaPago, somaPendente, categorias] = await Promise.all([
          prisma.despesa.aggregate({
            where: {
              competenciaMes: item.competenciaMes,
              competenciaAno: item.competenciaAno,
              status: StatusDespesa.PAGO,
            },
            _sum: { valor: true },
          }),
          prisma.despesa.aggregate({
            where: {
              competenciaMes: item.competenciaMes,
              competenciaAno: item.competenciaAno,
              status: StatusDespesa.PENDENTE,
            },
            _sum: { valor: true },
          }),
          prisma.despesa.groupBy({
            by: ['categoria'],
            where: {
              competenciaMes: item.competenciaMes,
              competenciaAno: item.competenciaAno,
            },
          }),
        ]);

        const mes = item.competenciaMes.toString().padStart(2, '0');
        const competencia = `${mes}/${item.competenciaAno}`;

        return {
          competencia,
          mes: item.competenciaMes,
          ano: item.competenciaAno,
          totalDespesas: item._count.id,
          valorTotal: Number(item._sum.valor || 0),
          valorPago: Number(somaPago._sum.valor || 0),
          valorPendente: Number(somaPendente._sum.valor || 0),
          categorias: categorias.length,
        };
      })
    );

    return relatorio;
  }
}

export default new DespesaService();
