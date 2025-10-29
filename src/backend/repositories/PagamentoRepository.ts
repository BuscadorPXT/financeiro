/**
 * Pagamento Repository
 *
 * Encapsula todas as queries de acesso a dados relacionadas a pagamentos.
 */

import prisma from '../../database/client';
import { Pagamento, Prisma, RegraTipo } from '@prisma/client';

export interface PagamentoFilters {
  usuarioId?: string;
  metodo?: string;
  conta?: string;
  regraTipo?: RegraTipo;
  mes?: string;
  elegivelComissao?: boolean;
}

export interface PaginationOptions {
  skip: number;
  take: number;
}

export class PagamentoRepository {
  /**
   * Busca todos os pagamentos com paginação e filtros
   */
  async findMany(
    filters: PagamentoFilters = {},
    pagination: PaginationOptions
  ): Promise<any[]> {
    const where = this.buildWhereClause(filters);

    return prisma.pagamento.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: { dataPagto: 'desc' },
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
   * Conta total de pagamentos com filtros
   */
  async count(filters: PagamentoFilters = {}): Promise<number> {
    const where = this.buildWhereClause(filters);
    return prisma.pagamento.count({ where });
  }

  /**
   * Busca pagamento por ID
   */
  async findById(id: string): Promise<Pagamento | null> {
    return prisma.pagamento.findUnique({
      where: { id },
      include: {
        usuario: true,
        comissao: true,
      },
    });
  }

  /**
   * Busca pagamentos por usuário ID
   */
  async findByUsuarioId(usuarioId: string): Promise<Pagamento[]> {
    return prisma.pagamento.findMany({
      where: { usuarioId },
      orderBy: { dataPagto: 'desc' },
    });
  }

  /**
   * Busca último pagamento de um usuário
   */
  async findLastByUsuarioId(usuarioId: string): Promise<Pagamento | null> {
    return prisma.pagamento.findFirst({
      where: { usuarioId },
      orderBy: { dataPagto: 'desc' },
    });
  }

  /**
   * Cria novo pagamento
   */
  async create(data: Prisma.PagamentoCreateInput): Promise<Pagamento> {
    return prisma.pagamento.create({ data });
  }

  /**
   * Atualiza pagamento
   */
  async update(id: string, data: Prisma.PagamentoUpdateInput): Promise<Pagamento> {
    return prisma.pagamento.update({
      where: { id },
      data,
    });
  }

  /**
   * Deleta pagamento
   */
  async delete(id: string): Promise<Pagamento> {
    return prisma.pagamento.delete({
      where: { id },
    });
  }

  /**
   * Busca pagamentos elegíveis para comissão
   */
  async findElegiveisParaComissao(): Promise<Pagamento[]> {
    return prisma.pagamento.findMany({
      where: { elegivelComissao: true },
      include: {
        usuario: {
          select: {
            id: true,
            nomeCompleto: true,
            indicador: true,
          },
        },
      },
      orderBy: { dataPagto: 'desc' },
    });
  }

  /**
   * Calcula soma de valores de pagamentos
   */
  async sumValues(filters: PagamentoFilters = {}): Promise<number> {
    const where = this.buildWhereClause(filters);
    const result = await prisma.pagamento.aggregate({
      where,
      _sum: {
        valor: true,
      },
    });
    return Number(result._sum.valor) || 0;
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
  private buildWhereClause(filters: PagamentoFilters): any {
    const where: any = {};

    if (filters.usuarioId) {
      where.usuarioId = filters.usuarioId;
    }

    if (filters.metodo) {
      where.metodo = filters.metodo;
    }

    if (filters.conta) {
      where.conta = filters.conta;
    }

    if (filters.regraTipo) {
      where.regraTipo = filters.regraTipo;
    }

    if (filters.mes) {
      where.mesPagto = filters.mes;
    }

    if (filters.elegivelComissao !== undefined) {
      where.elegivelComissao = filters.elegivelComissao;
    }

    return where;
  }
}

// Singleton instance
export default new PagamentoRepository();
