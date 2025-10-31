/**
 * Admin Repository
 *
 * Encapsula todas as queries de acesso a dados relacionadas a administradores.
 * Separa a lógica de acesso a dados da lógica de negócio no authService.
 *
 * Benefícios:
 * - authService não conhece o Prisma diretamente
 * - Fácil criar mocks para testes
 * - Queries centralizadas em um único lugar
 * - Facilita trocar ORM no futuro se necessário
 */

import prisma from '../../database/client';
import { Admin, Prisma } from '@prisma/client';

export interface AdminFilters {
  aprovado?: boolean;
  ativo?: boolean;
}

export interface AdminWithoutPassword extends Omit<Admin, 'senha'> {}

export class AdminRepository {
  /**
   * Busca admin por login (inclui senha para autenticação)
   */
  async findByLogin(login: string): Promise<Admin | null> {
    return prisma.admin.findUnique({
      where: { login },
    });
  }

  /**
   * Busca admin por email (inclui senha para autenticação)
   */
  async findByEmail(email: string): Promise<Admin | null> {
    return prisma.admin.findUnique({
      where: { email },
    });
  }

  /**
   * Busca admin por ID (inclui senha para operações de troca de senha)
   */
  async findById(id: string): Promise<Admin | null> {
    return prisma.admin.findUnique({
      where: { id },
    });
  }

  /**
   * Busca admin por ID (sem senha, para exibição segura)
   */
  async findByIdSafe(id: string): Promise<AdminWithoutPassword | null> {
    return prisma.admin.findUnique({
      where: { id },
      select: {
        id: true,
        login: true,
        nome: true,
        email: true,
        role: true,
        aprovado: true,
        ativo: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Busca todos os admins com filtros (sem senha)
   */
  async findMany(filters: AdminFilters = {}): Promise<AdminWithoutPassword[]> {
    const where: any = {};

    if (filters.aprovado !== undefined) {
      where.aprovado = filters.aprovado;
    }

    if (filters.ativo !== undefined) {
      where.ativo = filters.ativo;
    }

    return prisma.admin.findMany({
      where,
      select: {
        id: true,
        login: true,
        nome: true,
        email: true,
        role: true,
        aprovado: true,
        ativo: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Conta total de admins
   */
  async count(filters: AdminFilters = {}): Promise<number> {
    const where: any = {};

    if (filters.aprovado !== undefined) {
      where.aprovado = filters.aprovado;
    }

    if (filters.ativo !== undefined) {
      where.ativo = filters.ativo;
    }

    return prisma.admin.count({ where });
  }

  /**
   * Cria novo admin
   */
  async create(data: Prisma.AdminCreateInput): Promise<AdminWithoutPassword> {
    const admin = await prisma.admin.create({
      data,
    });

    // Remove senha antes de retornar
    const { senha, ...adminWithoutPassword } = admin;
    return adminWithoutPassword;
  }

  /**
   * Atualiza admin por ID
   */
  async update(
    id: string,
    data: Prisma.AdminUpdateInput
  ): Promise<AdminWithoutPassword> {
    const admin = await prisma.admin.update({
      where: { id },
      data,
      select: {
        id: true,
        login: true,
        nome: true,
        email: true,
        role: true,
        aprovado: true,
        ativo: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return admin;
  }

  /**
   * Atualiza apenas a senha de um admin
   */
  async updatePassword(id: string, senhaHash: string): Promise<void> {
    await prisma.admin.update({
      where: { id },
      data: { senha: senhaHash },
    });
  }

  /**
   * Deleta admin por ID
   */
  async delete(id: string): Promise<void> {
    await prisma.admin.delete({
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
}

// Singleton instance
export default new AdminRepository();
