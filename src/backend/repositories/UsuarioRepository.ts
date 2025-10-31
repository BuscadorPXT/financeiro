/**
 * Usuario Repository
 *
 * Encapsula todas as queries de acesso a dados relacionadas a usuários.
 * Separa a lógica de acesso a dados da lógica de negócio.
 *
 * Benefícios:
 * - Services não conhecem o Prisma diretamente
 * - Fácil criar mocks para testes
 * - Queries centralizadas em um único lugar
 * - Facilita trocar ORM no futuro se necessário
 */

import prisma from '../../database/client';
import { Usuario, Prisma, StatusFinal } from '@prisma/client';

// Type para usuário com relações incluídas (any para simplificar)
export type UsuarioWithRelations = any;

export interface UsuarioFilters {
  status?: StatusFinal;
  search?: string;
  indicador?: string;
  venceHoje?: boolean;
  prox7Dias?: boolean;
  emAtraso?: boolean;
}

export interface PaginationOptions {
  skip: number;
  take: number;
}

export class UsuarioRepository {
  /**
   * Busca todos os usuários com paginação e filtros
   */
  async findMany(
    filters: UsuarioFilters = {},
    pagination: PaginationOptions
  ): Promise<UsuarioWithRelations[]> {
    const where = this.buildWhereClause(filters);

    return prisma.usuario.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            pagamentos: true,
            agenda: true,
            churnRegistros: true,
          },
        },
        pagamentos: {
          take: 1,
          orderBy: { dataPagto: 'desc' },
          select: {
            id: true,
            valor: true,
            dataPagto: true,
            metodo: true,
            regraTipo: true,
          },
        },
      },
    });
  }

  /**
   * Conta total de usuários com filtros
   */
  async count(filters: UsuarioFilters = {}): Promise<number> {
    const where = this.buildWhereClause(filters);
    return prisma.usuario.count({ where });
  }

  /**
   * Busca usuário por ID
   */
  async findById(id: string): Promise<Usuario | null> {
    return prisma.usuario.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            pagamentos: true,
            agenda: true,
            churnRegistros: true,
          },
        },
        pagamentos: {
          take: 5,
          orderBy: { dataPagto: 'desc' },
        },
      },
    });
  }

  /**
   * Busca usuário por email
   */
  async findByEmail(email: string): Promise<Usuario | null> {
    return prisma.usuario.findFirst({
      where: { emailLogin: email },
    });
  }

  /**
   * Cria novo usuário
   */
  async create(data: Prisma.UsuarioCreateInput): Promise<Usuario> {
    return prisma.usuario.create({ data });
  }

  /**
   * Atualiza usuário
   */
  async update(id: string, data: Prisma.UsuarioUpdateInput): Promise<Usuario> {
    return prisma.usuario.update({
      where: { id },
      data,
    });
  }

  /**
   * Deleta usuário
   */
  async delete(id: string): Promise<Usuario> {
    return prisma.usuario.delete({
      where: { id },
    });
  }

  /**
   * Verifica se email já existe
   */
  async emailExists(email: string, excludeId?: string): Promise<boolean> {
    const count = await prisma.usuario.count({
      where: {
        emailLogin: email,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });
    return count > 0;
  }

  /**
   * Busca usuários por indicador
   */
  async findByIndicador(indicador: string): Promise<Usuario[]> {
    return prisma.usuario.findMany({
      where: { indicador },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Busca usuários que vencem hoje
   */
  async findVencendoHoje(): Promise<Usuario[]> {
    return prisma.usuario.findMany({
      where: { venceHoje: true },
      orderBy: { dataVenc: 'asc' },
    });
  }

  /**
   * Busca usuários em atraso
   */
  async findEmAtraso(): Promise<Usuario[]> {
    return prisma.usuario.findMany({
      where: { emAtraso: true },
      orderBy: { diasParaVencer: 'asc' },
    });
  }

  /**
   * Atualiza múltiplos usuários em transação
   */
  async updateMany(
    where: Prisma.UsuarioWhereInput,
    data: Prisma.UsuarioUpdateInput
  ): Promise<number> {
    const result = await prisma.usuario.updateMany({
      where,
      data,
    });
    return result.count;
  }

  /**
   * Busca usuários ativos
   */
  async findAtivos(): Promise<Usuario[]> {
    return prisma.usuario.findMany({
      where: {
        statusFinal: StatusFinal.ATIVO,
      },
      orderBy: { nomeCompleto: 'asc' },
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
  private buildWhereClause(filters: UsuarioFilters): Prisma.UsuarioWhereInput {
    const where: Prisma.UsuarioWhereInput = {};

    if (filters.status) {
      where.statusFinal = filters.status;
    }

    if (filters.search) {
      where.OR = [
        { emailLogin: { contains: filters.search, mode: 'insensitive' } },
        { nomeCompleto: { contains: filters.search, mode: 'insensitive' } },
        { telefone: { contains: filters.search } },
      ];
    }

    if (filters.indicador) {
      where.indicador = filters.indicador;
    }

    if (filters.venceHoje) {
      where.venceHoje = true;
    }

    if (filters.prox7Dias) {
      where.prox7Dias = true;
    }

    if (filters.emAtraso) {
      where.emAtraso = true;
    }

    return where;
  }
}

// Singleton instance
export default new UsuarioRepository();
