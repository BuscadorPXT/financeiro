import prisma from '../../database/client';
import { Churn } from '@prisma/client';
import { AppError } from '../errors';
import { HTTP_STATUS } from '../../shared/constants';
import { PaginationParams, PaginatedResponse, FilterParams } from '../../shared/types';
import churnRepository, { ChurnFilters } from '../repositories/ChurnRepository';
import { CreateChurnDTO, UpdateChurnDTO } from '../dtos';

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

    const repoFilters: ChurnFilters = {
      revertido: filters?.revertido !== undefined
        ? filters.revertido === 'true' || filters.revertido === true
        : undefined,
      usuarioId: filters?.usuarioId,
    };

    // Filtro por período
    if (filters?.dataInicio && filters?.dataFim) {
      repoFilters.dataInicio = new Date(filters.dataInicio as string);
      repoFilters.dataFim = new Date(filters.dataFim as string);
    } else if (filters?.dataInicio) {
      repoFilters.dataInicio = new Date(filters.dataInicio as string);
    } else if (filters?.dataFim) {
      repoFilters.dataFim = new Date(filters.dataFim as string);
    }

    // Filtro por mês/ano
    if (filters?.mes && filters?.ano) {
      repoFilters.mes = Number(filters.mes);
      repoFilters.ano = Number(filters.ano);
    }

    const [data, total] = await Promise.all([
      churnRepository.findMany(repoFilters, { skip, take: limit }),
      churnRepository.count(repoFilters),
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
    const churn = await churnRepository.findById(id);

    if (!churn) {
      throw new AppError('Registro de churn não encontrado', HTTP_STATUS.NOT_FOUND);
    }

    return churn;
  }

  /**
   * Cria um novo registro de churn
   */
  async create(data: CreateChurnDTO): Promise<Churn> {
    // Busca o usuário
    const usuario = await prisma.usuario.findUnique({
      where: { id: data.usuarioId },
    });

    if (!usuario) {
      throw new AppError('Usuário não encontrado', HTTP_STATUS.NOT_FOUND);
    }

    // Cria registro de churn e atualiza usuário em transação
    const churn = await churnRepository.transaction(async (tx) => {
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
  async update(id: string, data: UpdateChurnDTO): Promise<Churn> {
    await this.findById(id);

    const churn = await churnRepository.update(id, data);

    return churn;
  }

  /**
   * Deleta um registro de churn
   */
  async delete(id: string): Promise<void> {
    await this.findById(id);

    await churnRepository.delete(id);
  }

  /**
   * Reverte um churn (reativa o usuário)
   * VALIDAÇÃO: Verifica se usuário tem pagamento válido antes de reativar
   * Se não tiver dataVenc futura, reativa mas mantém como INATIVO
   */
  async reverterChurn(id: string): Promise<Churn> {
    const churn = await this.findById(id);

    if (churn.revertido) {
      throw new AppError('Este churn já foi revertido', HTTP_STATUS.BAD_REQUEST);
    }

    // Busca dados do usuário para validar se pode ser reativado
    const usuario = await prisma.usuario.findUnique({
      where: { id: churn.usuarioId },
    });

    if (!usuario) {
      throw new AppError('Usuário não encontrado', HTTP_STATUS.NOT_FOUND);
    }

    // Valida se usuário tem pagamento válido (dataVenc futura)
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const temPagamentoValido = Boolean(usuario.dataVenc && new Date(usuario.dataVenc) > hoje);

    // Marca churn como revertido e reativa usuário em transação
    const churnAtualizado = await churnRepository.transaction(async (tx) => {
      // Marca churn como revertido
      const churnRevertido = await tx.churn.update({
        where: { id },
        data: { revertido: true },
      });

      // Reativa o usuário
      // Se tem pagamento válido, marca como ATIVO
      // Se não tem, marca como INATIVO (reverteu o churn mas precisa de novo pagamento)
      await tx.usuario.update({
        where: { id: churn.usuarioId },
        data: {
          churn: false,
          ativoAtual: temPagamentoValido,
          statusFinal: temPagamentoValido ? 'ATIVO' : 'INATIVO',
        },
      });

      return churnRevertido;
    });

    // Log de aviso se não tem pagamento válido
    if (!temPagamentoValido) {
      console.warn(
        `[CHURN] Usuário ${usuario.emailLogin} reativado mas sem pagamento válido. ` +
        'Status definido como INATIVO. Um novo pagamento é necessário para ativação.'
      );
    }

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
    const repoFilters: ChurnFilters = {
      mes: filters?.mes,
      ano: filters?.ano,
    };

    const [total, revertidos, porMotivo] = await Promise.all([
      churnRepository.count(repoFilters),
      churnRepository.count({ ...repoFilters, revertido: true }),
      churnRepository.groupByMotivo(repoFilters),
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
    const churns = await churnRepository.findAll({});

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
      telefone: string | null;
      dataChurn: Date;
      motivo: string | null;
      diasDesdeChurn: number;
    }>
  > {
    const churns = await churnRepository.findNaoRevertidos();

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
