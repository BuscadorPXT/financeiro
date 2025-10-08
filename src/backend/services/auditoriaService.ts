import prisma from '../../database/client';
import { Auditoria, AcaoAuditoria } from '../../generated/prisma';
import { PaginationParams, PaginatedResponse, FilterParams } from '../../shared/types';

class AuditoriaService {
  /**
   * Registra uma ação de auditoria
   */
  async log(data: {
    tabela: string;
    registroId: string;
    acao: AcaoAuditoria;
    usuario?: string;
    dadosAntes?: any;
    dadosDepois?: any;
  }): Promise<Auditoria> {
    const auditoria = await prisma.auditoria.create({
      data: {
        tabela: data.tabela,
        registroId: data.registroId,
        acao: data.acao,
        usuario: data.usuario,
        dadosAntes: data.dadosAntes ? JSON.stringify(data.dadosAntes) : null,
        dadosDepois: data.dadosDepois ? JSON.stringify(data.dadosDepois) : null,
      },
    });

    return auditoria;
  }

  /**
   * Lista todos os logs de auditoria com paginação e filtros
   */
  async findAll(
    pagination?: PaginationParams,
    filters?: FilterParams
  ): Promise<PaginatedResponse<Auditoria>> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Filtros
    if (filters?.tabela) {
      where.tabela = filters.tabela;
    }

    if (filters?.registroId) {
      where.registroId = filters.registroId;
    }

    if (filters?.acao) {
      where.acao = filters.acao;
    }

    if (filters?.usuario) {
      where.usuario = filters.usuario;
    }

    if (filters?.dataInicio) {
      where.createdAt = {
        gte: new Date(filters.dataInicio as string),
      };
    }

    if (filters?.dataFim) {
      where.createdAt = {
        ...where.createdAt,
        lte: new Date(filters.dataFim as string),
      };
    }

    const [data, total] = await Promise.all([
      prisma.auditoria.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.auditoria.count({ where }),
    ]);

    // Parse JSON strings de volta para objects
    const dataWithParsedJson = data.map((log) => ({
      ...log,
      dadosAntes: log.dadosAntes ? JSON.parse(log.dadosAntes) : null,
      dadosDepois: log.dadosDepois ? JSON.parse(log.dadosDepois) : null,
    }));

    return {
      data: dataWithParsedJson as any,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Busca histórico de um registro específico
   */
  async getHistoricoRegistro(
    tabela: string,
    registroId: string
  ): Promise<
    Array<{
      id: string;
      acao: AcaoAuditoria;
      usuario: string | null;
      dadosAntes: any;
      dadosDepois: any;
      createdAt: Date;
    }>
  > {
    const logs = await prisma.auditoria.findMany({
      where: {
        tabela,
        registroId,
      },
      orderBy: { createdAt: 'desc' },
    });

    return logs.map((log) => ({
      id: log.id,
      acao: log.acao,
      usuario: log.usuario,
      dadosAntes: log.dadosAntes ? JSON.parse(log.dadosAntes) : null,
      dadosDepois: log.dadosDepois ? JSON.parse(log.dadosDepois) : null,
      createdAt: log.createdAt,
    }));
  }

  /**
   * Obtém estatísticas de auditoria
   */
  async getStats(filters?: { dataInicio?: string; dataFim?: string }): Promise<{
    totalLogs: number;
    porAcao: Array<{ acao: string; quantidade: number }>;
    porTabela: Array<{ tabela: string; quantidade: number }>;
    porUsuario: Array<{ usuario: string; quantidade: number }>;
    ultimasAcoes: Array<{
      id: string;
      tabela: string;
      registroId: string;
      acao: AcaoAuditoria;
      usuario: string | null;
      createdAt: Date;
    }>;
  }> {
    const where: any = {};

    if (filters?.dataInicio) {
      where.createdAt = {
        gte: new Date(filters.dataInicio),
      };
    }

    if (filters?.dataFim) {
      where.createdAt = {
        ...where.createdAt,
        lte: new Date(filters.dataFim),
      };
    }

    const [total, porAcao, porTabela, porUsuario, ultimasAcoes] = await Promise.all([
      prisma.auditoria.count({ where }),
      prisma.auditoria.groupBy({
        by: ['acao'],
        where,
        _count: true,
      }),
      prisma.auditoria.groupBy({
        by: ['tabela'],
        where,
        _count: true,
        orderBy: {
          _count: {
            tabela: 'desc',
          },
        },
      }),
      prisma.auditoria.groupBy({
        by: ['usuario'],
        where,
        _count: true,
        orderBy: {
          _count: {
            usuario: 'desc',
          },
        },
      }),
      prisma.auditoria.findMany({
        where,
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          tabela: true,
          registroId: true,
          acao: true,
          usuario: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      totalLogs: total,
      porAcao: porAcao.map((item) => ({
        acao: item.acao,
        quantidade: item._count,
      })),
      porTabela: porTabela.map((item) => ({
        tabela: item.tabela,
        quantidade: item._count,
      })),
      porUsuario: porUsuario.map((item) => ({
        usuario: item.usuario || 'Sistema',
        quantidade: item._count,
      })),
      ultimasAcoes,
    };
  }

  /**
   * Busca logs por tabela
   */
  async getLogsPorTabela(
    tabela: string,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<Auditoria>> {
    return this.findAll(pagination, { tabela });
  }

  /**
   * Busca logs por usuário
   */
  async getLogsPorUsuario(
    usuario: string,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<Auditoria>> {
    return this.findAll(pagination, { usuario });
  }

  /**
   * Busca logs por ação
   */
  async getLogsPorAcao(
    acao: AcaoAuditoria,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<Auditoria>> {
    return this.findAll(pagination, { acao });
  }

  /**
   * Limpa logs antigos (retention policy)
   * Remove logs mais antigos que X dias
   */
  async limparLogsAntigos(dias: number): Promise<{ deletados: number }> {
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - dias);

    const resultado = await prisma.auditoria.deleteMany({
      where: {
        createdAt: {
          lt: dataLimite,
        },
      },
    });

    return {
      deletados: resultado.count,
    };
  }
}

export default new AuditoriaService();
