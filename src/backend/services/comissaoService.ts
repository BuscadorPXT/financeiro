import prisma from '../../database/client';
import { Comissao, RegraTipo } from '@prisma/client';
import { AppError } from '../errors';
import { HTTP_STATUS } from '../../shared/constants';
import { PaginationParams, PaginatedResponse, FilterParams } from '../../shared/types';
import comissaoRepository, { ComissaoFilters } from '../repositories/ComissaoRepository';
import { CreateComissaoDTO, UpdateComissaoDTO } from '../dtos';

class ComissaoService {
  /**
   * Lista todas as comissões com paginação e filtros
   */
  async findAll(
    pagination?: PaginationParams,
    filters?: FilterParams
  ): Promise<PaginatedResponse<Comissao>> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = (page - 1) * limit;

    const repoFilters: ComissaoFilters = {
      indicador: filters?.indicador,
      regraTipo: filters?.regraTipo as RegraTipo | undefined,
      mesRef: filters?.mesRef,
      pagamentoId: filters?.pagamentoId,
    };

    const [data, total] = await Promise.all([
      comissaoRepository.findMany(repoFilters, { skip, take: limit }),
      comissaoRepository.count(repoFilters),
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
   * Busca uma comissão por ID
   */
  async findById(id: string): Promise<Comissao> {
    const comissao = await comissaoRepository.findById(id);

    if (!comissao) {
      throw new AppError('Comissão não encontrada', HTTP_STATUS.NOT_FOUND);
    }

    return comissao;
  }

  /**
   * Cria uma nova comissão
   * Geralmente criada automaticamente via pagamento
   */
  async create(data: CreateComissaoDTO): Promise<Comissao> {
    // Verifica se já existe comissão para este pagamento
    const existente = await comissaoRepository.findByPagamentoId(data.pagamentoId);

    if (existente) {
      throw new AppError(
        'Já existe uma comissão registrada para este pagamento',
        HTTP_STATUS.CONFLICT
      );
    }

    const comissao = await comissaoRepository.create({
      pagamento: {
        connect: { id: data.pagamentoId },
      },
      indicador: data.indicador,
      regraTipo: data.regraTipo,
      valor: data.valor,
      mesRef: data.mesRef,
    });

    return comissao;
  }

  /**
   * Atualiza uma comissão
   */
  async update(id: string, data: UpdateComissaoDTO): Promise<Comissao> {
    await this.findById(id);

    const comissao = await comissaoRepository.update(id, data);

    return comissao;
  }

  /**
   * Deleta uma comissão
   */
  async delete(id: string): Promise<void> {
    await this.findById(id);

    await comissaoRepository.delete(id);
  }

  /**
   * Obtém estatísticas gerais de comissões
   */
  async getStats(filters?: { mes?: string; indicador?: string }): Promise<{
    totalComissoes: number;
    valorTotal: number;
    primeirasAdesoes: number;
    valorPrimeiras: number;
    recorrentes: number;
    valorRecorrentes: number;
    totalIndicadores: number;
  }> {
    const repoFilters: ComissaoFilters = {
      mesRef: filters?.mes,
      indicador: filters?.indicador,
    };

    const [total, somaTotal, primeiras, somaPrimeiras, recorrentes, somaRecorrentes, indicadores] =
      await Promise.all([
        comissaoRepository.count(repoFilters),
        comissaoRepository.sumValues(repoFilters),
        comissaoRepository.count({ ...repoFilters, regraTipo: RegraTipo.PRIMEIRO }),
        comissaoRepository.sumValues({ ...repoFilters, regraTipo: RegraTipo.PRIMEIRO }),
        comissaoRepository.count({ ...repoFilters, regraTipo: RegraTipo.RECORRENTE }),
        comissaoRepository.sumValues({ ...repoFilters, regraTipo: RegraTipo.RECORRENTE }),
        comissaoRepository.groupByIndicador(repoFilters),
      ]);

    return {
      totalComissoes: total,
      valorTotal: somaTotal,
      primeirasAdesoes: primeiras,
      valorPrimeiras: somaPrimeiras,
      recorrentes: recorrentes,
      valorRecorrentes: somaRecorrentes,
      totalIndicadores: indicadores.length,
    };
  }

  /**
   * Obtém consolidação por indicador
   */
  async getConsolidacaoPorIndicador(filters?: {
    mes?: string;
  }): Promise<
    Array<{
      indicador: string;
      totalComissoes: number;
      valorTotal: number;
      primeirasAdesoes: number;
      valorPrimeiras: number;
      recorrentes: number;
      valorRecorrentes: number;
    }>
  > {
    const repoFilters: ComissaoFilters = {
      mesRef: filters?.mes,
    };

    const comissoes = await comissaoRepository.groupByIndicador(repoFilters);

    const consolidacao = await Promise.all(
      comissoes.map(async (item) => {
        const [primeiras, somaPrimeiras, recorrentes, somaRecorrentes] = await Promise.all([
          comissaoRepository.count({
            ...repoFilters,
            indicador: item.indicador,
            regraTipo: RegraTipo.PRIMEIRO,
          }),
          comissaoRepository.sumValues({
            ...repoFilters,
            indicador: item.indicador,
            regraTipo: RegraTipo.PRIMEIRO,
          }),
          comissaoRepository.count({
            ...repoFilters,
            indicador: item.indicador,
            regraTipo: RegraTipo.RECORRENTE,
          }),
          comissaoRepository.sumValues({
            ...repoFilters,
            indicador: item.indicador,
            regraTipo: RegraTipo.RECORRENTE,
          }),
        ]);

        return {
          indicador: item.indicador,
          totalComissoes: item._count.id,
          valorTotal: Number(item._sum.valor || 0),
          primeirasAdesoes: primeiras,
          valorPrimeiras: somaPrimeiras,
          recorrentes: recorrentes,
          valorRecorrentes: somaRecorrentes,
        };
      })
    );

    return consolidacao;
  }

  /**
   * Obtém relatório por mês
   */
  async getRelatorioPorMes(): Promise<
    Array<{
      mes: string;
      totalComissoes: number;
      valorTotal: number;
      primeirasAdesoes: number;
      valorPrimeiras: number;
      recorrentes: number;
      valorRecorrentes: number;
      indicadores: number;
    }>
  > {
    const comissoes = await comissaoRepository.groupByMes();

    const relatorio = await Promise.all(
      comissoes.map(async (item) => {
        const [primeiras, somaPrimeiras, recorrentes, somaRecorrentes, indicadores] =
          await Promise.all([
            comissaoRepository.count({
              mesRef: item.mesRef,
              regraTipo: RegraTipo.PRIMEIRO,
            }),
            comissaoRepository.sumValues({
              mesRef: item.mesRef,
              regraTipo: RegraTipo.PRIMEIRO,
            }),
            comissaoRepository.count({
              mesRef: item.mesRef,
              regraTipo: RegraTipo.RECORRENTE,
            }),
            comissaoRepository.sumValues({
              mesRef: item.mesRef,
              regraTipo: RegraTipo.RECORRENTE,
            }),
            comissaoRepository.groupByIndicador({ mesRef: item.mesRef }),
          ]);

        return {
          mes: item.mesRef || '',
          totalComissoes: item._count.id,
          valorTotal: Number(item._sum.valor || 0),
          primeirasAdesoes: primeiras,
          valorPrimeiras: somaPrimeiras,
          recorrentes: recorrentes,
          valorRecorrentes: somaRecorrentes,
          indicadores: indicadores.length,
        };
      })
    );

    return relatorio;
  }

  /**
   * Obtém extrato detalhado de comissões por indicador
   */
  async getExtratoPorIndicador(
    indicador: string,
    filters?: { mes?: string }
  ): Promise<
    Array<{
      id: string;
      mes: string;
      regraTipo: RegraTipo;
      valor: number;
      dataPagto: Date;
      usuario: {
        emailLogin: string;
        nomeCompleto: string;
      };
    }>
  > {
    const comissoes = await comissaoRepository.findByIndicador(indicador, {
      mesRef: filters?.mes,
    });

    return comissoes.map((c) => ({
      id: c.id,
      mes: c.mesRef,
      regraTipo: c.regraTipo,
      valor: Number(c.valor),
      dataPagto: c.pagamento.dataPagto,
      usuario: {
        emailLogin: c.pagamento.usuario.emailLogin,
        nomeCompleto: c.pagamento.usuario.nomeCompleto,
      },
    }));
  }
}

export default new ComissaoService();
