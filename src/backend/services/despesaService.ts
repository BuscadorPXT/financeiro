import prisma from '../../database/client';
import { Despesa, StatusDespesa } from '@prisma/client';
import { AppError } from '../errors';
import { HTTP_STATUS } from '../../shared/constants';
import { PaginationParams, PaginatedResponse, FilterParams } from '../../shared/types';
import despesaRepository, { DespesaFilters } from '../repositories/DespesaRepository';
import { CreateDespesaDTO, UpdateDespesaDTO } from '../dtos';

class DespesaService {
  /**
   * Lista todas as despesas com paginação e filtros
   */
  async findAll(
    pagination?: PaginationParams,
    filters?: FilterParams
  ): Promise<PaginatedResponse<Despesa>> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = (page - 1) * limit;

    // Converte filtros para o formato do repository
    const repoFilters: DespesaFilters = {
      categoria: filters?.categoria,
      status: filters?.status as StatusDespesa | undefined,
      conta: filters?.conta,
      indicador: filters?.indicador,
      mes: filters?.mes ? Number(filters.mes) : undefined,
      ano: filters?.ano ? Number(filters.ano) : undefined,
      competencia: filters?.competencia,
    };

    const [data, total] = await Promise.all([
      despesaRepository.findMany(repoFilters, { skip, take: limit }),
      despesaRepository.count(repoFilters),
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
   * Busca uma despesa por ID
   */
  async findById(id: string): Promise<Despesa> {
    const despesa = await despesaRepository.findById(id);

    if (!despesa) {
      throw new AppError('Despesa não encontrada', HTTP_STATUS.NOT_FOUND);
    }

    return despesa;
  }

  /**
   * Cria uma nova despesa
   */
  async create(data: CreateDespesaDTO): Promise<Despesa> {
    // Validações
    if (data.competenciaMes < 1 || data.competenciaMes > 12) {
      throw new AppError(
        'Mês de competência inválido (deve ser entre 1 e 12)',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    if (data.valor <= 0) {
      throw new AppError('Valor deve ser maior que zero', HTTP_STATUS.BAD_REQUEST);
    }

    const despesa = await despesaRepository.create({
      categoria: data.categoria,
      descricao: data.descricao,
      valor: data.valor,
      conta: data.conta,
      indicador: data.indicador,
      status: data.status || StatusDespesa.PENDENTE,
      competenciaMes: data.competenciaMes,
      competenciaAno: data.competenciaAno,
    });

    return despesa;
  }

  /**
   * Atualiza uma despesa
   */
  async update(id: string, data: UpdateDespesaDTO): Promise<Despesa> {
    await this.findById(id);

    // Validações
    if (data.competenciaMes && (data.competenciaMes < 1 || data.competenciaMes > 12)) {
      throw new AppError(
        'Mês de competência inválido (deve ser entre 1 e 12)',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    if (data.valor !== undefined && data.valor <= 0) {
      throw new AppError('Valor deve ser maior que zero', HTTP_STATUS.BAD_REQUEST);
    }

    const despesa = await despesaRepository.update(id, data);

    return despesa;
  }

  /**
   * Deleta uma despesa
   */
  async delete(id: string): Promise<void> {
    await this.findById(id);

    await despesaRepository.delete(id);
  }

  /**
   * Marca despesa como paga
   */
  async marcarComoPaga(id: string): Promise<Despesa> {
    return await this.update(id, { status: StatusDespesa.PAGO });
  }

  /**
   * Marca despesa como pendente
   */
  async marcarComoPendente(id: string): Promise<Despesa> {
    return await this.update(id, { status: StatusDespesa.PENDENTE });
  }

  /**
   * Obtém estatísticas de despesas
   */
  async getStats(filters?: { mes?: number; ano?: number }): Promise<{
    totalDespesas: number;
    valorTotal: number;
    valorPago: number;
    valorPendente: number;
    despesasPagas: number;
    despesasPendentes: number;
  }> {
    const repoFilters: DespesaFilters = {
      mes: filters?.mes,
      ano: filters?.ano,
    };

    const [total, somaTotal, somaPago, somaPendente, countPago, countPendente] =
      await Promise.all([
        despesaRepository.count(repoFilters),
        despesaRepository.sumValues(repoFilters),
        despesaRepository.sumValues({ ...repoFilters, status: StatusDespesa.PAGO }),
        despesaRepository.sumValues({ ...repoFilters, status: StatusDespesa.PENDENTE }),
        despesaRepository.count({ ...repoFilters, status: StatusDespesa.PAGO }),
        despesaRepository.count({ ...repoFilters, status: StatusDespesa.PENDENTE }),
      ]);

    return {
      totalDespesas: total,
      valorTotal: somaTotal,
      valorPago: somaPago,
      valorPendente: somaPendente,
      despesasPagas: countPago,
      despesasPendentes: countPendente,
    };
  }

  /**
   * Obtém relatório por categoria
   */
  async getRelatorioPorCategoria(filters?: {
    mes?: number;
    ano?: number;
  }): Promise<
    Array<{
      categoria: string;
      totalDespesas: number;
      valorTotal: number;
      valorPago: number;
      valorPendente: number;
    }>
  > {
    const repoFilters: DespesaFilters = {
      mes: filters?.mes,
      ano: filters?.ano,
    };

    const despesas = await despesaRepository.groupByCategoria(repoFilters);

    const relatorio = await Promise.all(
      despesas.map(async (item) => {
        const [somaPago, somaPendente] = await Promise.all([
          despesaRepository.sumValues({
            ...repoFilters,
            categoria: item.categoria,
            status: StatusDespesa.PAGO,
          }),
          despesaRepository.sumValues({
            ...repoFilters,
            categoria: item.categoria,
            status: StatusDespesa.PENDENTE,
          }),
        ]);

        return {
          categoria: item.categoria,
          totalDespesas: item._count.id,
          valorTotal: Number(item._sum.valor || 0),
          valorPago: somaPago,
          valorPendente: somaPendente,
        };
      })
    );

    return relatorio;
  }

  /**
   * Obtém relatório por mês/competência
   */
  async getRelatorioPorMes(): Promise<
    Array<{
      competencia: string; // "10/2024"
      mes: number;
      ano: number;
      totalDespesas: number;
      valorTotal: number;
      valorPago: number;
      valorPendente: number;
      categorias: number;
    }>
  > {
    const despesas = await despesaRepository.groupByCompetencia();

    const relatorio = await Promise.all(
      despesas.map(async (item) => {
        const [somaPago, somaPendente, categorias] = await Promise.all([
          despesaRepository.sumValues({
            mes: item.competenciaMes,
            ano: item.competenciaAno,
            status: StatusDespesa.PAGO,
          }),
          despesaRepository.sumValues({
            mes: item.competenciaMes,
            ano: item.competenciaAno,
            status: StatusDespesa.PENDENTE,
          }),
          despesaRepository.groupByCategoria({
            mes: item.competenciaMes,
            ano: item.competenciaAno,
          }),
        ]);

        const mes = item.competenciaMes.toString().padStart(2, '0');
        const competencia = `${mes}/${item.competenciaAno}`;

        return {
          competencia,
          mes: item.competenciaMes,
          ano: item.competenciaAno,
          totalDespesas: item._count.id,
          valorTotal: Number(item._sum.valor || 0),
          valorPago: somaPago,
          valorPendente: somaPendente,
          categorias: categorias.length,
        };
      })
    );

    return relatorio;
  }
}

export default new DespesaService();
