import prisma from '../../database/client';
import { Comissao, RegraTipo } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { HTTP_STATUS } from '../../shared/constants';
import { PaginationParams, PaginatedResponse, FilterParams } from '../../shared/types';

class ComissaoService {
  /**
   * Lista todas as comissões com paginação e filtros
   */
  async findAll(
    pagination?: PaginationParams,
    filters?: FilterParams
  ): Promise<PaginatedResponse<Comissao>> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Filtros
    if (filters?.indicador) {
      where.indicador = filters.indicador;
    }

    if (filters?.regraTipo) {
      where.regraTipo = filters.regraTipo;
    }

    if (filters?.mesRef) {
      where.mesRef = filters.mesRef;
    }

    if (filters?.pagamentoId) {
      where.pagamentoId = filters.pagamentoId;
    }

    const [data, total] = await Promise.all([
      prisma.comissao.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          pagamento: {
            select: {
              id: true,
              dataPagto: true,
              valor: true,
              metodo: true,
              usuarioId: true,
            },
          },
        },
      }),
      prisma.comissao.count({ where }),
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
   * Busca uma comissão por ID
   */
  async findById(id: string): Promise<Comissao> {
    const comissao = await prisma.comissao.findUnique({
      where: { id },
      include: {
        pagamento: {
          include: {
            usuario: {
              select: {
                id: true,
                emailLogin: true,
                nomeCompleto: true,
              },
            },
          },
        },
      },
    });

    if (!comissao) {
      throw new AppError('Comissão não encontrada', HTTP_STATUS.NOT_FOUND);
    }

    return comissao;
  }

  /**
   * Cria uma nova comissão
   * Geralmente criada automaticamente via pagamento
   */
  async create(data: {
    pagamentoId: string;
    indicador: string;
    regraTipo: RegraTipo;
    valor: number;
    mesRef: string;
  }): Promise<Comissao> {
    // Verifica se já existe comissão para este pagamento
    const existente = await prisma.comissao.findUnique({
      where: { pagamentoId: data.pagamentoId },
    });

    if (existente) {
      throw new AppError(
        'Já existe uma comissão registrada para este pagamento',
        HTTP_STATUS.CONFLICT
      );
    }

    const comissao = await prisma.comissao.create({
      data: {
        pagamentoId: data.pagamentoId,
        indicador: data.indicador,
        regraTipo: data.regraTipo,
        valor: data.valor,
        mesRef: data.mesRef,
      },
    });

    return comissao;
  }

  /**
   * Atualiza uma comissão
   */
  async update(
    id: string,
    data: Partial<{
      indicador: string;
      valor: number;
      mesRef: string;
    }>
  ): Promise<Comissao> {
    await this.findById(id);

    const comissao = await prisma.comissao.update({
      where: { id },
      data,
    });

    return comissao;
  }

  /**
   * Deleta uma comissão
   */
  async delete(id: string): Promise<void> {
    await this.findById(id);

    await prisma.comissao.delete({
      where: { id },
    });
  }

  /**
   * Obtém estatísticas gerais de comissões
   */
  async getStats(filters?: { mes?: string; indicador?: string }): Promise<{
    totalComissoes: number;
    valorTotal: number;
    primeirasAdesoes: number;
    valorPrimeiras: number;
    recorrentes: number;
    valorRecorrentes: number;
    totalIndicadores: number;
  }> {
    const where: any = {};
    if (filters?.mes) where.mesRef = filters.mes;
    if (filters?.indicador) where.indicador = filters.indicador;

    const [total, somaTotal, primeiras, somaPrimeiras, recorrentes, somaRecorrentes, indicadores] =
      await Promise.all([
        prisma.comissao.count({ where }),
        prisma.comissao.aggregate({
          where,
          _sum: { valor: true },
        }),
        prisma.comissao.count({
          where: { ...where, regraTipo: RegraTipo.PRIMEIRO },
        }),
        prisma.comissao.aggregate({
          where: { ...where, regraTipo: RegraTipo.PRIMEIRO },
          _sum: { valor: true },
        }),
        prisma.comissao.count({
          where: { ...where, regraTipo: RegraTipo.RECORRENTE },
        }),
        prisma.comissao.aggregate({
          where: { ...where, regraTipo: RegraTipo.RECORRENTE },
          _sum: { valor: true },
        }),
        prisma.comissao.groupBy({
          by: ['indicador'],
          where,
        }),
      ]);

    return {
      totalComissoes: total,
      valorTotal: Number(somaTotal._sum.valor || 0),
      primeirasAdesoes: primeiras,
      valorPrimeiras: Number(somaPrimeiras._sum.valor || 0),
      recorrentes: recorrentes,
      valorRecorrentes: Number(somaRecorrentes._sum.valor || 0),
      totalIndicadores: indicadores.length,
    };
  }

  /**
   * Obtém consolidação por indicador
   */
  async getConsolidacaoPorIndicador(filters?: {
    mes?: string;
  }): Promise<
    Array<{
      indicador: string;
      totalComissoes: number;
      valorTotal: number;
      primeirasAdesoes: number;
      valorPrimeiras: number;
      recorrentes: number;
      valorRecorrentes: number;
    }>
  > {
    const where: any = {};
    if (filters?.mes) where.mesRef = filters.mes;

    const comissoes = await prisma.comissao.groupBy({
      by: ['indicador'],
      where,
      _count: { id: true },
      _sum: { valor: true },
      orderBy: { _sum: { valor: 'desc' } },
    });

    const consolidacao = await Promise.all(
      comissoes.map(async (item) => {
        const [primeiras, somaPrimeiras, recorrentes, somaRecorrentes] = await Promise.all([
          prisma.comissao.count({
            where: {
              ...where,
              indicador: item.indicador,
              regraTipo: RegraTipo.PRIMEIRO,
            },
          }),
          prisma.comissao.aggregate({
            where: {
              ...where,
              indicador: item.indicador,
              regraTipo: RegraTipo.PRIMEIRO,
            },
            _sum: { valor: true },
          }),
          prisma.comissao.count({
            where: {
              ...where,
              indicador: item.indicador,
              regraTipo: RegraTipo.RECORRENTE,
            },
          }),
          prisma.comissao.aggregate({
            where: {
              ...where,
              indicador: item.indicador,
              regraTipo: RegraTipo.RECORRENTE,
            },
            _sum: { valor: true },
          }),
        ]);

        return {
          indicador: item.indicador,
          totalComissoes: item._count.id,
          valorTotal: Number(item._sum.valor || 0),
          primeirasAdesoes: primeiras,
          valorPrimeiras: Number(somaPrimeiras._sum.valor || 0),
          recorrentes: recorrentes,
          valorRecorrentes: Number(somaRecorrentes._sum.valor || 0),
        };
      })
    );

    return consolidacao;
  }

  /**
   * Obtém relatório por mês
   */
  async getRelatorioPorMes(): Promise<
    Array<{
      mes: string;
      totalComissoes: number;
      valorTotal: number;
      primeirasAdesoes: number;
      valorPrimeiras: number;
      recorrentes: number;
      valorRecorrentes: number;
      indicadores: number;
    }>
  > {
    const comissoes = await prisma.comissao.groupBy({
      by: ['mesRef'],
      _count: { id: true },
      _sum: { valor: true },
      orderBy: { mesRef: 'desc' },
    });

    const relatorio = await Promise.all(
      comissoes.map(async (item) => {
        const [primeiras, somaPrimeiras, recorrentes, somaRecorrentes, indicadores] =
          await Promise.all([
            prisma.comissao.count({
              where: {
                mesRef: item.mesRef,
                regraTipo: RegraTipo.PRIMEIRO,
              },
            }),
            prisma.comissao.aggregate({
              where: {
                mesRef: item.mesRef,
                regraTipo: RegraTipo.PRIMEIRO,
              },
              _sum: { valor: true },
            }),
            prisma.comissao.count({
              where: {
                mesRef: item.mesRef,
                regraTipo: RegraTipo.RECORRENTE,
              },
            }),
            prisma.comissao.aggregate({
              where: {
                mesRef: item.mesRef,
                regraTipo: RegraTipo.RECORRENTE,
              },
              _sum: { valor: true },
            }),
            prisma.comissao.groupBy({
              by: ['indicador'],
              where: { mesRef: item.mesRef },
            }),
          ]);

        return {
          mes: item.mesRef || '',
          totalComissoes: item._count.id,
          valorTotal: Number(item._sum.valor || 0),
          primeirasAdesoes: primeiras,
          valorPrimeiras: Number(somaPrimeiras._sum.valor || 0),
          recorrentes: recorrentes,
          valorRecorrentes: Number(somaRecorrentes._sum.valor || 0),
          indicadores: indicadores.length,
        };
      })
    );

    return relatorio;
  }

  /**
   * Obtém extrato detalhado de comissões por indicador
   */
  async getExtratoPorIndicador(
    indicador: string,
    filters?: { mes?: string }
  ): Promise<
    Array<{
      id: string;
      mes: string;
      regraTipo: RegraTipo;
      valor: number;
      dataPagto: Date;
      usuario: {
        emailLogin: string;
        nomeCompleto: string;
      };
    }>
  > {
    const where: any = { indicador };
    if (filters?.mes) where.mesRef = filters.mes;

    const comissoes = await prisma.comissao.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        pagamento: {
          include: {
            usuario: {
              select: {
                emailLogin: true,
                nomeCompleto: true,
              },
            },
          },
        },
      },
    });

    return comissoes.map((c) => ({
      id: c.id,
      mes: c.mesRef,
      regraTipo: c.regraTipo,
      valor: Number(c.valor),
      dataPagto: c.pagamento.dataPagto,
      usuario: {
        emailLogin: c.pagamento.usuario.emailLogin,
        nomeCompleto: c.pagamento.usuario.nomeCompleto,
      },
    }));
  }
}

export default new ComissaoService();
