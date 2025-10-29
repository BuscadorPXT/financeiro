/**
 * Prospeccao Repository
 *
 * Encapsula todas as queries de acesso a dados relacionadas a prospecção.
 */

import prisma from '../../database/client';
import { Prospeccao, Prisma } from '@prisma/client';

export interface ProspeccaoFilters {
  origem?: string;
  indicador?: string;
  convertido?: boolean;
  search?: string;
}

export interface PaginationOptions {
  skip: number;
  take: number;
}

export type ProspeccaoWithRelations = any;

export class ProspeccaoRepository {
  /**
   * Busca todas as prospecções com paginação e filtros
   */
  async findMany(
    filters: ProspeccaoFilters = {},
    pagination: PaginationOptions
  ): Promise<ProspeccaoWithRelations[]> {
    const where = this.buildWhereClause(filters);

    return prisma.prospeccao.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: { createdAt: 'desc' },
      include: {
        usuario: {
          select: {
            id: true,
            emailLogin: true,
            nomeCompleto: true,
            statusFinal: true,
          },
        },
      },
    });
  }

  /**
   * Conta total de prospecções com filtros
   */
  async count(filters: ProspeccaoFilters = {}): Promise<number> {
    const where = this.buildWhereClause(filters);
    return prisma.prospeccao.count({ where });
  }

  /**
   * Busca prospecção por ID
   */
  async findById(id: string): Promise<Prospeccao | null> {
    return prisma.prospeccao.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            id: true,
            emailLogin: true,
            nomeCompleto: true,
            telefone: true,
            statusFinal: true,
            ciclo: true,
            createdAt: true,
          },
        },
      },
    });
  }

  /**
   * Busca prospecção por email
   */
  async findByEmail(email: string): Promise<Prospeccao | null> {
    return prisma.prospeccao.findFirst({
      where: { email },
    });
  }

  /**
   * Busca prospecções não convertidas
   */
  async findNaoConvertidas(filters?: {
    origem?: string;
    indicador?: string;
  }): Promise<Prospeccao[]> {
    const where: any = { convertido: false };

    if (filters?.origem) where.origem = filters.origem;
    if (filters?.indicador) where.indicador = filters.indicador;

    return prisma.prospeccao.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Agrupa prospecções por origem
   */
  async groupByOrigem(filters: ProspeccaoFilters = {}): Promise<any[]> {
    const where = this.buildWhereClause(filters);
    return prisma.prospeccao.groupBy({
      by: ['origem'],
      where,
      _count: { id: true },
    } as any);
  }

  /**
   * Agrupa prospecções por indicador
   */
  async groupByIndicador(filters: ProspeccaoFilters = {}): Promise<any[]> {
    const where = this.buildWhereClause(filters);
    return prisma.prospeccao.groupBy({
      by: ['indicador'],
      where,
      _count: { id: true },
    } as any);
  }

  /**
   * Cria nova prospecção
   */
  async create(data: Prisma.ProspeccaoCreateInput): Promise<Prospeccao> {
    return prisma.prospeccao.create({ data });
  }

  /**
   * Atualiza prospecção
   */
  async update(id: string, data: Prisma.ProspeccaoUpdateInput): Promise<Prospeccao> {
    return prisma.prospeccao.update({
      where: { id },
      data,
      include: {
        usuario: true,
      },
    });
  }

  /**
   * Deleta prospecção
   */
  async delete(id: string): Promise<Prospeccao> {
    return prisma.prospeccao.delete({
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
  private buildWhereClause(filters: ProspeccaoFilters): any {
    const where: any = {};

    if (filters.origem) {
      where.origem = filters.origem;
    }

    if (filters.indicador) {
      where.indicador = filters.indicador;
    }

    if (filters.convertido !== undefined) {
      where.convertido = filters.convertido;
    }

    if (filters.search) {
      where.OR = [
        { nome: { contains: filters.search } },
        { email: { contains: filters.search } },
        { telefone: { contains: filters.search } },
      ];
    }

    return where;
  }
}

// Singleton instance
export default new ProspeccaoRepository();
