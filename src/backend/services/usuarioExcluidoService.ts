import prisma from '../../database/client';
import { UsuarioExcluido } from '@prisma/client';
import { PaginationParams, PaginatedResponse } from '../../shared/types';

class UsuarioExcluidoService {
  /**
   * Lista usuários excluídos com paginação e filtros
   */
  async findAll(pagination?: PaginationParams): Promise<PaginatedResponse<UsuarioExcluido>> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 50;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.usuarioExcluido.findMany({
        skip,
        take: limit,
        orderBy: { dataExclusao: 'desc' },
      }),
      prisma.usuarioExcluido.count(),
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
   * Busca um usuário excluído por ID
   */
  async findById(id: string): Promise<UsuarioExcluido | null> {
    return await prisma.usuarioExcluido.findUnique({
      where: { id },
    });
  }

  /**
   * Busca usuários excluídos por email
   */
  async findByEmail(email: string): Promise<UsuarioExcluido[]> {
    return await prisma.usuarioExcluido.findMany({
      where: {
        emailLogin: {
          contains: email,
          mode: 'insensitive',
        },
      },
      orderBy: { dataExclusao: 'desc' },
    });
  }

  /**
   * Obtém estatísticas de exclusões
   */
  async getStats(): Promise<{
    total: number;
    ultimoMes: number;
    totalPagamentosHistorico: number;
    valorTotalHistorico: number;
  }> {
    const total = await prisma.usuarioExcluido.count();

    // Últimos 30 dias
    const umMesAtras = new Date();
    umMesAtras.setDate(umMesAtras.getDate() - 30);

    const ultimoMes = await prisma.usuarioExcluido.count({
      where: {
        dataExclusao: {
          gte: umMesAtras,
        },
      },
    });

    // Agregações
    const agregado = await prisma.usuarioExcluido.aggregate({
      _sum: {
        totalPagamentos: true,
        valorTotalPago: true,
      },
    });

    return {
      total,
      ultimoMes,
      totalPagamentosHistorico: agregado._sum.totalPagamentos || 0,
      valorTotalHistorico: Number(agregado._sum.valorTotalPago || 0),
    };
  }
}

export default new UsuarioExcluidoService();
