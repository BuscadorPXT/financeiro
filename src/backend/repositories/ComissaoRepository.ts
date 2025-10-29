/**
 * Comissao Repository
 *
 * Encapsula todas as queries de acesso a dados relacionadas a comissões.
 */

import prisma from '../../database/client';
import { Comissao, Prisma, RegraTipo } from '@prisma/client';

export interface ComissaoFilters {
  indicador?: string;
  regraTipo?: RegraTipo;
  mesRef?: string;
  pagamentoId?: string;
}

export interface PaginationOptions {
  skip: number;
  take: number;
}

export type ComissaoWithRelations = any;

export class ComissaoRepository {
  /**
   * Busca todas as comissões com paginação e filtros
   */
  async findMany(
    filters: ComissaoFilters = {},
    pagination: PaginationOptions
  ): Promise<ComissaoWithRelations[]> {
    const where = this.buildWhereClause(filters);

    return prisma.comissao.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
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
    });
  }

  /**
   * Conta total de comissões com filtros
   */
  async count(filters: ComissaoFilters = {}): Promise<number> {
    const where = this.buildWhereClause(filters);
    return prisma.comissao.count({ where });
  }

  /**
   * Busca comissão por ID
   */
  async findById(id: string): Promise<Comissao | null> {
    return prisma.comissao.findUnique({
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
  }

  /**
   * Busca comissão por ID de pagamento (unique constraint)
   */
  async findByPagamentoId(pagamentoId: string): Promise<Comissao | null> {
    return prisma.comissao.findUnique({
      where: { pagamentoId },
    });
  }

  /**
   * Busca comissões por indicador
   */
  async findByIndicador(
    indicador: string,
    filters: ComissaoFilters = {}
  ): Promise<ComissaoWithRelations[]> {
    const where = { ...this.buildWhereClause(filters), indicador };
    return prisma.comissao.findMany({
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
  }

  /**
   * Calcula soma de valores de comissões
   */
  async sumValues(filters: ComissaoFilters = {}): Promise<number> {
    const where = this.buildWhereClause(filters);
    const result = await prisma.comissao.aggregate({
      where,
      _sum: {
        valor: true,
      },
    });
    return Number(result._sum.valor) || 0;
  }

  /**
   * Agrupa comissões por indicador
   */
  async groupByIndicador(filters: ComissaoFilters = {}): Promise<any[]> {
    const where = this.buildWhereClause(filters);
    return prisma.comissao.groupBy({
      by: ['indicador'],
      where,
      _count: { id: true },
      _sum: { valor: true },
      orderBy: { _sum: { valor: 'desc' } },
    } as any);
  }

  /**
   * Agrupa comissões por mês
   */
  async groupByMes(): Promise<any[]> {
    return prisma.comissao.groupBy({
      by: ['mesRef'],
      _count: { id: true },
      _sum: { valor: true },
      orderBy: { mesRef: 'desc' },
    } as any);
  }

  /**
   * Cria nova comissão
   */
  async create(data: Prisma.ComissaoCreateInput): Promise<Comissao> {
    return prisma.comissao.create({ data });
  }

  /**
   * Atualiza comissão
   */
  async update(id: string, data: Prisma.ComissaoUpdateInput): Promise<Comissao> {
    return prisma.comissao.update({
      where: { id },
      data,
    });
  }

  /**
   * Deleta comissão
   */
  async delete(id: string): Promise<Comissao> {
    return prisma.comissao.delete({
      where: { id },
    });
  }

  /**
   * Executa operação em transação
   */
  async transaction<T>(
    callback: (tx: Prisma.TransactionClient) => Promise<T>
  ): Promise<T> {
    return prisma.$transaction(callback);
  }

  /**
   * Constrói cláusula WHERE baseada nos filtros
   */
  private buildWhereClause(filters: ComissaoFilters): any {
    const where: any = {};

    if (filters.indicador) {
      where.indicador = filters.indicador;
    }

    if (filters.regraTipo) {
      where.regraTipo = filters.regraTipo;
    }

    if (filters.mesRef) {
      where.mesRef = filters.mesRef;
    }

    if (filters.pagamentoId) {
      where.pagamentoId = filters.pagamentoId;
    }

    return where;
  }
}

// Singleton instance
export default new ComissaoRepository();
