/**
 * Churn Repository
 *
 * Encapsula todas as queries de acesso a dados relacionadas a churn.
 */

import prisma from '../../database/client';
import { Churn, Prisma } from '@prisma/client';

export interface ChurnFilters {
  revertido?: boolean;
  usuarioId?: string;
  dataInicio?: Date;
  dataFim?: Date;
  mes?: number;
  ano?: number;
}

export interface PaginationOptions {
  skip: number;
  take: number;
}

export type ChurnWithRelations = any;

export class ChurnRepository {
  /**
   * Busca todos os registros de churn com paginação e filtros
   */
  async findMany(
    filters: ChurnFilters = {},
    pagination: PaginationOptions
  ): Promise<ChurnWithRelations[]> {
    const where = this.buildWhereClause(filters);

    return prisma.churn.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: { dataChurn: 'desc' },
      include: {
        usuario: {
          select: {
            id: true,
            emailLogin: true,
            nomeCompleto: true,
            telefone: true,
            statusFinal: true,
            indicador: true,
          },
        },
      },
    });
  }

  /**
   * Conta total de registros de churn com filtros
   */
  async count(filters: ChurnFilters = {}): Promise<number> {
    const where = this.buildWhereClause(filters);
    return prisma.churn.count({ where });
  }

  /**
   * Busca registro de churn por ID
   */
  async findById(id: string): Promise<Churn | null> {
    return prisma.churn.findUnique({
      where: { id },
      include: {
        usuario: true,
      },
    });
  }

  /**
   * Busca churns não revertidos
   */
  async findNaoRevertidos(): Promise<ChurnWithRelations[]> {
    return prisma.churn.findMany({
      where: { revertido: false },
      include: {
        usuario: {
          select: {
            id: true,
            emailLogin: true,
            nomeCompleto: true,
            telefone: true,
          },
        },
      },
      orderBy: { dataChurn: 'desc' },
    });
  }

  /**
   * Agrupa churns por motivo
   */
  async groupByMotivo(filters: ChurnFilters = {}): Promise<any[]> {
    const where = this.buildWhereClause(filters);
    return prisma.churn.groupBy({
      by: ['motivo'],
      where,
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    } as any);
  }

  /**
   * Busca todos os churns (sem paginação, para relatórios)
   */
  async findAll(filters: ChurnFilters = {}): Promise<Churn[]> {
    const where = this.buildWhereClause(filters);
    return prisma.churn.findMany({
      where,
      orderBy: { dataChurn: 'desc' },
    });
  }

  /**
   * Cria novo registro de churn
   */
  async create(data: Prisma.ChurnCreateInput): Promise<Churn> {
    return prisma.churn.create({ data });
  }

  /**
   * Atualiza registro de churn
   */
  async update(id: string, data: Prisma.ChurnUpdateInput): Promise<Churn> {
    return prisma.churn.update({
      where: { id },
      data,
    });
  }

  /**
   * Deleta registro de churn
   */
  async delete(id: string): Promise<Churn> {
    return prisma.churn.delete({
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
  private buildWhereClause(filters: ChurnFilters): any {
    const where: any = {};

    if (filters.revertido !== undefined) {
      where.revertido = filters.revertido;
    }

    if (filters.usuarioId) {
      where.usuarioId = filters.usuarioId;
    }

    // Filtro por período
    if (filters.dataInicio && filters.dataFim) {
      where.dataChurn = {
        gte: filters.dataInicio,
        lte: filters.dataFim,
      };
    } else if (filters.dataInicio) {
      where.dataChurn = { gte: filters.dataInicio };
    } else if (filters.dataFim) {
      where.dataChurn = { lte: filters.dataFim };
    }

    // Filtro por mês/ano
    if (filters.mes && filters.ano) {
      const dataInicio = new Date(filters.ano, filters.mes - 1, 1);
      const dataFim = new Date(filters.ano, filters.mes, 0, 23, 59, 59);
      where.dataChurn = { gte: dataInicio, lte: dataFim };
    }

    return where;
  }
}

// Singleton instance
export default new ChurnRepository();
