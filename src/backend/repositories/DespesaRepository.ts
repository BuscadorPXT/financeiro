/**
 * Despesa Repository
 *
 * Encapsula todas as queries de acesso a dados relacionadas a despesas.
 */

import prisma from '../../database/client';
import { Despesa, Prisma, StatusDespesa } from '@prisma/client';

export interface DespesaFilters {
  categoria?: string;
  status?: StatusDespesa;
  conta?: string;
  indicador?: string;
  mes?: number;
  ano?: number;
  competencia?: string;
}

export interface PaginationOptions {
  skip: number;
  take: number;
}

export class DespesaRepository {
  /**
   * Busca todas as despesas com paginação e filtros
   */
  async findMany(
    filters: DespesaFilters = {},
    pagination: PaginationOptions
  ): Promise<Despesa[]> {
    const where = this.buildWhereClause(filters);

    return prisma.despesa.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: [
        { competenciaAno: 'desc' },
        { competenciaMes: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  /**
   * Conta total de despesas com filtros
   */
  async count(filters: DespesaFilters = {}): Promise<number> {
    const where = this.buildWhereClause(filters);
    return prisma.despesa.count({ where });
  }

  /**
   * Busca despesa por ID
   */
  async findById(id: string): Promise<Despesa | null> {
    return prisma.despesa.findUnique({
      where: { id },
    });
  }

  /**
   * Calcula soma de valores de despesas
   */
  async sumValues(filters: DespesaFilters = {}): Promise<number> {
    const where = this.buildWhereClause(filters);
    const result = await prisma.despesa.aggregate({
      where,
      _sum: {
        valor: true,
      },
    });
    return Number(result._sum.valor) || 0;
  }

  /**
   * Agrupa despesas por categoria
   */
  async groupByCategoria(filters: DespesaFilters = {}): Promise<any[]> {
    const where = this.buildWhereClause(filters);
    return prisma.despesa.groupBy({
      by: ['categoria'],
      where,
      _count: { id: true },
      _sum: { valor: true },
      orderBy: { _sum: { valor: 'desc' } },
    } as any);
  }

  /**
   * Agrupa despesas por competência (mês/ano)
   */
  async groupByCompetencia(): Promise<any[]> {
    return prisma.despesa.groupBy({
      by: ['competenciaMes', 'competenciaAno'],
      _count: { id: true },
      _sum: { valor: true },
      orderBy: [{ competenciaAno: 'desc' }, { competenciaMes: 'desc' }],
    } as any);
  }

  /**
   * Cria nova despesa
   */
  async create(data: Prisma.DespesaCreateInput): Promise<Despesa> {
    return prisma.despesa.create({ data });
  }

  /**
   * Atualiza despesa
   */
  async update(id: string, data: Prisma.DespesaUpdateInput): Promise<Despesa> {
    return prisma.despesa.update({
      where: { id },
      data,
    });
  }

  /**
   * Deleta despesa
   */
  async delete(id: string): Promise<Despesa> {
    return prisma.despesa.delete({
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
  private buildWhereClause(filters: DespesaFilters): any {
    const where: any = {};

    if (filters.categoria) {
      where.categoria = filters.categoria;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.conta) {
      where.conta = filters.conta;
    }

    if (filters.indicador) {
      where.indicador = filters.indicador;
    }

    if (filters.mes) {
      where.competenciaMes = filters.mes;
    }

    if (filters.ano) {
      where.competenciaAno = filters.ano;
    }

    // Filtro combinado de competência (formato: "10/2024")
    if (filters.competencia) {
      const [mes, ano] = filters.competencia.split('/');
      if (mes && ano) {
        where.competenciaMes = Number(mes);
        where.competenciaAno = Number(ano);
      }
    }

    return where;
  }
}

// Singleton instance
export default new DespesaRepository();
