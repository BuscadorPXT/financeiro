/**
 * Agenda Repository
 *
 * Encapsula todas as queries de acesso a dados relacionadas à agenda.
 */

import prisma from '../../database/client';
import { Agenda, Prisma, StatusAgenda } from '@prisma/client';

export interface AgendaFilters {
  status?: StatusAgenda;
  usuarioId?: string;
  renovou?: boolean;
  cancelou?: boolean;
  janela?: 'vencidos' | 'hoje' | 'proximos7dias' | 'mesAtual';
}

export interface PaginationOptions {
  skip: number;
  take: number;
}

export type AgendaWithRelations = any;

export class AgendaRepository {
  /**
   * Busca todos os itens da agenda com paginação e filtros
   */
  async findMany(
    filters: AgendaFilters = {},
    pagination: PaginationOptions
  ): Promise<AgendaWithRelations[]> {
    const where = this.buildWhereClause(filters);

    return prisma.agenda.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: { dataVenc: 'asc' },
      include: {
        usuario: {
          select: {
            id: true,
            emailLogin: true,
            nomeCompleto: true,
            telefone: true,
            statusFinal: true,
          },
        },
      },
    });
  }

  /**
   * Conta total de itens da agenda com filtros
   */
  async count(filters: AgendaFilters = {}): Promise<number> {
    const where = this.buildWhereClause(filters);
    return prisma.agenda.count({ where });
  }

  /**
   * Busca item da agenda por ID
   */
  async findById(id: string): Promise<Agenda | null> {
    return prisma.agenda.findUnique({
      where: { id },
      include: {
        usuario: true,
      },
    });
  }

  /**
   * Busca itens da agenda por usuário ID
   */
  async findByUsuarioId(usuarioId: string): Promise<Agenda[]> {
    return prisma.agenda.findMany({
      where: { usuarioId },
      orderBy: { dataVenc: 'asc' },
    });
  }

  /**
   * Busca itens ativos da agenda
   */
  async findAtivos(): Promise<Agenda[]> {
    return prisma.agenda.findMany({
      where: { status: StatusAgenda.ATIVO },
      orderBy: { dataVenc: 'asc' },
    });
  }

  /**
   * Busca primeiro item ativo não processado de um usuário
   */
  async findFirstAtivoByUsuarioId(usuarioId: string): Promise<Agenda | null> {
    return prisma.agenda.findFirst({
      where: {
        usuarioId,
        status: StatusAgenda.ATIVO,
        renovou: false,
        cancelou: false,
      },
    });
  }

  /**
   * Cria novo item na agenda
   */
  async create(data: Prisma.AgendaCreateInput): Promise<Agenda> {
    return prisma.agenda.create({ data });
  }

  /**
   * Atualiza item da agenda
   */
  async update(id: string, data: Prisma.AgendaUpdateInput): Promise<Agenda> {
    return prisma.agenda.update({
      where: { id },
      data,
    });
  }

  /**
   * Atualiza múltiplos itens da agenda
   */
  async updateMany(where: any, data: Prisma.AgendaUpdateInput): Promise<number> {
    const result = await prisma.agenda.updateMany({
      where,
      data,
    });
    return result.count;
  }

  /**
   * Deleta item da agenda
   */
  async delete(id: string): Promise<Agenda> {
    return prisma.agenda.delete({
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
  private buildWhereClause(filters: AgendaFilters): any {
    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.usuarioId) {
      where.usuarioId = filters.usuarioId;
    }

    if (filters.renovou !== undefined) {
      where.renovou = filters.renovou;
    }

    if (filters.cancelou !== undefined) {
      where.cancelou = filters.cancelou;
    }

    // Filtros por janela de vencimento
    if (filters.janela) {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      if (filters.janela === 'vencidos') {
        where.dataVenc = { lt: hoje };
        where.status = StatusAgenda.ATIVO;
      } else if (filters.janela === 'hoje') {
        const amanha = new Date(hoje);
        amanha.setDate(amanha.getDate() + 1);
        where.dataVenc = { gte: hoje, lt: amanha };
        where.status = StatusAgenda.ATIVO;
      } else if (filters.janela === 'proximos7dias') {
        const seteDias = new Date(hoje);
        seteDias.setDate(seteDias.getDate() + 7);
        where.dataVenc = { gte: hoje, lte: seteDias };
        where.status = StatusAgenda.ATIVO;
      } else if (filters.janela === 'mesAtual') {
        const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
        where.dataVenc = { gte: primeiroDia, lte: ultimoDia };
        where.status = StatusAgenda.ATIVO;
      }
    }

    return where;
  }
}

// Singleton instance
export default new AgendaRepository();
