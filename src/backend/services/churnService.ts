import prisma from '../../database/client';
import { Churn, StatusFinal } from '../../generated/prisma';
import { AppError } from '../middleware/errorHandler';
import { HTTP_STATUS } from '../../shared/constants';
import { PaginationParams, PaginatedResponse, FilterParams } from '../../shared/types';

class ChurnService {
  /**
   * Lista todos os registros de churn com paginação e filtros
   */
  async findAll(
    pagination?: PaginationParams,
    filters?: FilterParams
  ): Promise<PaginatedResponse<Churn>> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Filtros
    if (filters?.revertido !== undefined) {
      where.revertido = filters.revertido === 'true' || filters.revertido === true;
    }

    if (filters?.usuarioId) {
      where.usuarioId = filters.usuarioId;
    }

    // Filtro por período
    if (filters?.dataInicio && filters?.dataFim) {
      where.dataChurn = {
        gte: new Date(filters.dataInicio as string),
        lte: new Date(filters.dataFim as string),
      };
    } else if (filters?.dataInicio) {
      where.dataChurn = { gte: new Date(filters.dataInicio as string) };
    } else if (filters?.dataFim) {
      where.dataChurn = { lte: new Date(filters.dataFim as string) };
    }

    // Filtro por mês/ano
    if (filters?.mes && filters?.ano) {
      const mes = Number(filters.mes);
      const ano = Number(filters.ano);
      const dataInicio = new Date(ano, mes - 1, 1);
      const dataFim = new Date(ano, mes, 0, 23, 59, 59);
      where.dataChurn = { gte: dataInicio, lte: dataFim };
    }

    const [data, total] = await Promise.all([
      prisma.churn.findMany({
        where,
        skip,
        take: limit,
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
      }),
      prisma.churn.count({ where }),
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
   * Busca um registro de churn por ID
   */
  async findById(id: string): Promise<Churn> {
    const churn = await prisma.churn.findUnique({
      where: { id },
      include: {
        usuario: true,
      },
    });

    if (!churn) {
      throw new AppError('Registro de churn não encontrado', HTTP_STATUS.NOT_FOUND);
    }

    return churn;
  }

  /**
   * Cria um novo registro de churn
   */
  async create(data: {
    usuarioId: string;
    dataChurn: Date;
    motivo?: string;
  }): Promise<Churn> {
    // Busca o usuário
    const usuario = await prisma.usuario.findUnique({
      where: { id: data.usuarioId },
    });

    if (!usuario) {
      throw new AppError('Usuário não encontrado', HTTP_STATUS.NOT_FOUND);
    }

    // Cria registro de churn e atualiza usuário em transação
    const churn = await prisma.$transaction(async (tx) => {
      // Cria o churn
      const novoChurn = await tx.churn.create({
        data: {
          usuarioId: data.usuarioId,
          dataChurn: data.dataChurn,
          motivo: data.motivo,
        },
      });

      // Atualiza o usuário
      await tx.usuario.update({
        where: { id: data.usuarioId },
        data: {
          churn: true,
          ativoAtual: false,
        },
      });

      return novoChurn;
    });

    return churn;
  }

  /**
   * Atualiza um registro de churn
   */
  async update(
    id: string,
    data: Partial<{
      dataChurn: Date;
      motivo: string;
    }>
  ): Promise<Churn> {
    await this.findById(id);

    const churn = await prisma.churn.update({
      where: { id },
      data,
    });

    return churn;
  }

  /**
   * Deleta um registro de churn
   */
  async delete(id: string): Promise<void> {
    await this.findById(id);

    await prisma.churn.delete({
      where: { id },
    });
  }

  /**
   * Reverte um churn (reativa o usuário)
   */
  async reverterChurn(id: string): Promise<Churn> {
    const churn = await this.findById(id);

    if (churn.revertido) {
      throw new AppError('Este churn já foi revertido', HTTP_STATUS.BAD_REQUEST);
    }

    // Marca churn como revertido e reativa usuário em transação
    const churnAtualizado = await prisma.$transaction(async (tx) => {
      // Marca churn como revertido
      const churnRevertido = await tx.churn.update({
        where: { id },
        data: { revertido: true },
      });

      // Reativa o usuário
      await tx.usuario.update({
        where: { id: churn.usuarioId },
        data: {
          churn: false,
          ativoAtual: true,
        },
      });

      return churnRevertido;
    });

    return churnAtualizado;
  }

  /**
   * Obtém estatísticas de churn
   */
  async getStats(filters?: { mes?: number; ano?: number }): Promise<{
    totalChurns: number;
    churnAtivos: number;
    churnRevertidos: number;
    taxaReversao: number;
    churnPorMotivo: Array<{ motivo: string; total: number }>;
  }> {
    const where: any = {};
    if (filters?.mes && filters?.ano) {
      const mes = filters.mes;
      const ano = filters.ano;
      const dataInicio = new Date(ano, mes - 1, 1);
      const dataFim = new Date(ano, mes, 0, 23, 59, 59);
      where.dataChurn = { gte: dataInicio, lte: dataFim };
    }

    const [total, revertidos, porMotivo] = await Promise.all([
      prisma.churn.count({ where }),
      prisma.churn.count({ where: { ...where, revertido: true } }),
      prisma.churn.groupBy({
        by: ['motivo'],
        where,
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      }),
    ]);

    const churnAtivos = total - revertidos;
    const taxaReversao = total > 0 ? (revertidos / total) * 100 : 0;

    const churnPorMotivo = porMotivo.map((item) => ({
      motivo: item.motivo || 'Não informado',
      total: item._count.id,
    }));

    return {
      totalChurns: total,
      churnAtivos,
      churnRevertidos: revertidos,
      taxaReversao: Number(taxaReversao.toFixed(2)),
      churnPorMotivo,
    };
  }

  /**
   * Obtém relatório de churn por mês
   */
  async getRelatorioPorMes(): Promise<
    Array<{
      mes: string;
      ano: number;
      totalChurns: number;
      churnRevertidos: number;
      churnAtivos: number;
      taxaReversao: number;
    }>
  > {
    const churns = await prisma.churn.findMany({
      orderBy: { dataChurn: 'desc' },
    });

    // Agrupa por mês/ano
    const agrupado = churns.reduce((acc: any, churn) => {
      const data = new Date(churn.dataChurn);
      const mes = data.getMonth() + 1;
      const ano = data.getFullYear();
      const chave = `${mes}/${ano}`;

      if (!acc[chave]) {
        acc[chave] = {
          mes: mes.toString().padStart(2, '0'),
          ano,
          total: 0,
          revertidos: 0,
        };
      }

      acc[chave].total++;
      if (churn.revertido) acc[chave].revertidos++;

      return acc;
    }, {});

    // Converte para array
    const relatorio = Object.values(agrupado).map((item: any) => {
      const ativos = item.total - item.revertidos;
      const taxa = item.total > 0 ? (item.revertidos / item.total) * 100 : 0;

      return {
        mes: `${item.mes}/${item.ano}`,
        ano: item.ano,
        totalChurns: item.total,
        churnRevertidos: item.revertidos,
        churnAtivos: ativos,
        taxaReversao: Number(taxa.toFixed(2)),
      };
    });

    return relatorio;
  }

  /**
   * Obtém lista de usuários em churn ativo
   */
  async getUsuariosEmChurn(): Promise<
    Array<{
      id: string;
      emailLogin: string;
      nomeCompleto: string;
      telefone: string;
      dataChurn: Date;
      motivo: string | null;
      diasDesdeChurn: number;
    }>
  > {
    const churns = await prisma.churn.findMany({
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

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    return churns.map((churn) => {
      const dataChurn = new Date(churn.dataChurn);
      dataChurn.setHours(0, 0, 0, 0);
      const diasDesdeChurn = Math.floor(
        (hoje.getTime() - dataChurn.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        id: churn.usuario.id,
        emailLogin: churn.usuario.emailLogin,
        nomeCompleto: churn.usuario.nomeCompleto,
        telefone: churn.usuario.telefone,
        dataChurn: churn.dataChurn,
        motivo: churn.motivo,
        diasDesdeChurn,
      };
    });
  }
}

export default new ChurnService();
