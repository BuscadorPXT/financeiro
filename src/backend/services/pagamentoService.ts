import prisma from '../../database/client';
import { Pagamento, RegraTipo, StatusFinal, MetodoPagamento } from '@prisma/client';
import { AppError } from '../errors';
import { HTTP_STATUS } from '../../shared/constants';
import { PaginationParams, PaginatedResponse, FilterParams } from '../../shared/types';
import {
  calcularDataVencimento,
  calcularDiasParaVencer,
  venceHoje,
  venceProximos7Dias,
} from '../utils/dateUtils';
import { calcularComissao, isElegivelComissao } from '../utils/calculoComissao';
import { CreatePagamentoDTO, UpdatePagamentoDTO } from '../dtos';

class PagamentoService {
  /**
   * Lista todos os pagamentos com paginação e filtros
   */
  async findAll(
    pagination?: PaginationParams,
    filters?: FilterParams
  ): Promise<PaginatedResponse<Pagamento>> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Filtros
    if (filters?.usuarioId) {
      where.usuarioId = filters.usuarioId;
    }

    if (filters?.metodo) {
      where.metodo = filters.metodo;
    }

    if (filters?.conta) {
      where.conta = filters.conta;
    }

    if (filters?.regraTipo) {
      where.regraTipo = filters.regraTipo;
    }

    if (filters?.mes) {
      where.mesPagto = filters.mes;
    }

    if (filters?.elegivelComissao !== undefined) {
      where.elegivelComissao = filters.elegivelComissao === 'true' || filters.elegivelComissao === true;
    }

    const [data, total] = await Promise.all([
      prisma.pagamento.findMany({
        where,
        skip,
        take: limit,
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
      }),
      prisma.pagamento.count({ where }),
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
   * Busca um pagamento por ID
   */
  async findById(id: string): Promise<Pagamento> {
    const pagamento = await prisma.pagamento.findUnique({
      where: { id },
      include: {
        usuario: true,
      },
    });

    if (!pagamento) {
      throw new AppError('Pagamento não encontrado', HTTP_STATUS.NOT_FOUND);
    }

    return pagamento;
  }

  /**
   * Cria um novo pagamento e atualiza o usuário
   * Implementa regras de PRIMEIRO e RECORRENTE
   */
  async create(data: CreatePagamentoDTO): Promise<Pagamento> {
    // Busca o usuário
    const usuario = await prisma.usuario.findUnique({
      where: { id: data.usuarioId },
    });

    if (!usuario) {
      throw new AppError('Usuário não encontrado', HTTP_STATUS.NOT_FOUND);
    }

    // Calcula mês de pagamento (formato: "OUT/2024")
    const mesPagto = this.formatarMesPagamento(data.dataPagto);

    // Calcula data de vencimento (30 dias padrão)
    const dataVenc = calcularDataVencimento(data.dataPagto, 30);
    const diasParaVencer = calcularDiasParaVencer(dataVenc);

    // Calcula elegibilidade e comissão
    // Se elegivelComissao foi passado explicitamente, usa o valor; caso contrário, calcula baseado no indicador
    const elegivelComissao = data.elegivelComissao !== undefined
      ? data.elegivelComissao
      : isElegivelComissao(usuario.indicador);

    const comissaoValor = elegivelComissao && data.regraValor !== undefined
      ? calcularComissao(data.valor, data.regraTipo, data.regraValor)
      : null;

    // Prepara dados do usuário para atualizar
    const usuarioUpdate: any = {
      dataPagto: data.dataPagto,
      mesPagto,
      dataVenc,
      diasParaVencer,
      venceHoje: venceHoje(dataVenc),
      prox7Dias: venceProximos7Dias(dataVenc),
      emAtraso: false, // Zera flag de atraso ao receber pagamento
      metodo: data.metodo,
      conta: data.conta,
      regraTipo: data.regraTipo,
      regraValor: data.regraValor,
      elegivelComissao,
      comissaoValor,
    };

    // Regras específicas por tipo
    if (data.regraTipo === RegraTipo.PRIMEIRO) {
      // Primeira adesão
      usuarioUpdate.entrou = true;
      usuarioUpdate.ativoAtual = true;
      usuarioUpdate.statusFinal = StatusFinal.ATIVO;
      usuarioUpdate.ciclo = 1;
      usuarioUpdate.totalCiclosUsuario = 1;
      usuarioUpdate.mesRef = mesPagto;
    } else if (data.regraTipo === RegraTipo.RECORRENTE) {
      // Renovação
      usuarioUpdate.renovou = true;
      usuarioUpdate.ativoAtual = true;
      usuarioUpdate.statusFinal = StatusFinal.ATIVO;
      usuarioUpdate.ciclo = (usuario.ciclo || 0) + 1;
      usuarioUpdate.totalCiclosUsuario = (usuario.totalCiclosUsuario || 0) + 1;
    }

    // Cria o pagamento e atualiza o usuário em transação
    const pagamento = await prisma.$transaction(async (tx) => {
      // Prepara dados do pagamento
      const pagamentoData: any = {
        usuarioId: data.usuarioId,
        dataPagto: data.dataPagto,
        mesPagto,
        valor: data.valor,
        metodo: data.metodo,
        conta: data.conta,
        regraTipo: data.regraTipo,
        elegivelComissao,
        comissaoValor,
        observacao: data.observacao,
      };

      if (data.regraValor !== undefined) {
        pagamentoData.regraValor = data.regraValor;
      }

      // Cria o pagamento
      const novoPagamento = await tx.pagamento.create({
        data: pagamentoData,
      });

      // Atualiza o usuário
      await tx.usuario.update({
        where: { id: data.usuarioId },
        data: usuarioUpdate,
      });

      // Se elegível para comissão, cria registro na tabela Comissões
      if (elegivelComissao && comissaoValor && usuario.indicador) {
        await tx.comissao.create({
          data: {
            pagamentoId: novoPagamento.id,
            indicador: usuario.indicador,
            regraTipo: data.regraTipo,
            valor: comissaoValor,
            mesRef: mesPagto,
          },
        });
      }

      // Se for pagamento RECORRENTE, marca item da agenda como renovado
      // VALIDAÇÃO: Garante que existe APENAS UM item para marcar como renovado
      if (data.regraTipo === RegraTipo.RECORRENTE) {
        // Busca itens que seriam marcados como renovados
        const itensParaRenovar = await tx.agenda.findMany({
          where: {
            usuarioId: data.usuarioId,
            renovou: false,
            cancelou: false,
            status: 'ATIVO',
          },
        });

        // Valida que existe exatamente UM item
        if (itensParaRenovar.length === 0) {
          throw new AppError(
            'Nenhum item da agenda encontrado para marcar como renovado. Crie um item na agenda antes de registrar o pagamento recorrente.',
            HTTP_STATUS.BAD_REQUEST
          );
        }

        if (itensParaRenovar.length > 1) {
          throw new AppError(
            `Encontrados ${itensParaRenovar.length} itens ATIVO não processados na agenda para este usuário. ` +
            'Existe uma duplicata que precisa ser corrigida. Execute a sincronização da agenda primeiro.',
            HTTP_STATUS.CONFLICT
          );
        }

        // Marca o único item como renovado
        await tx.agenda.update({
          where: { id: itensParaRenovar[0].id },
          data: { renovou: true },
        });
      }

      return novoPagamento;
    });

    return pagamento;
  }

  /**
   * Atualiza um pagamento
   * IMPORTANTE: Não recalcula automaticamente o usuário (seria necessário reverter estado anterior)
   */
  async update(id: string, data: UpdatePagamentoDTO): Promise<Pagamento> {
    await this.findById(id);

    // Se a data mudou, atualiza mesPagto
    if (data.dataPagto) {
      const mesPagto = this.formatarMesPagamento(data.dataPagto);
      (data as any).mesPagto = mesPagto;
    }

    const pagamento = await prisma.pagamento.update({
      where: { id },
      data,
    });

    return pagamento;
  }

  /**
   * Deleta um pagamento e reverte os efeitos no usuário
   * ATENÇÃO: Esta operação reverte o estado do usuário para o estado anterior ao pagamento
   * - Se for PRIMEIRO: Reverte usuário para estado inicial (INATIVO, ciclo 0)
   * - Se for RECORRENTE: Decrementa ciclo e restaura dados do pagamento anterior
   * - Remove comissão associada (cascade)
   */
  async delete(id: string): Promise<void> {
    const pagamento = await this.findById(id);

    // Executa em transação para garantir atomicidade
    await prisma.$transaction(async (tx) => {
      // Busca usuário
      const usuario = await tx.usuario.findUnique({
        where: { id: pagamento.usuarioId },
      });

      if (!usuario) {
        throw new AppError('Usuário não encontrado', HTTP_STATUS.NOT_FOUND);
      }

      // Define atualização baseada no tipo de pagamento
      let usuarioUpdate: any = {};

      if (pagamento.regraTipo === RegraTipo.PRIMEIRO) {
        // Reverter primeira adesão - volta para estado inicial
        usuarioUpdate = {
          statusFinal: StatusFinal.INATIVO,
          entrou: false,
          ativoAtual: false,
          ciclo: 0,
          totalCiclosUsuario: 0,
          dataPagto: null,
          mesPagto: null,
          dataVenc: null,
          diasParaVencer: null,
          diasAcesso: null,
          venceHoje: false,
          prox7Dias: false,
          emAtraso: false,
          metodo: null,
          conta: null,
          regraTipo: null,
          regraValor: null,
          elegivelComissao: false,
          comissaoValor: null,
          mesRef: null,
        };
      } else if (pagamento.regraTipo === RegraTipo.RECORRENTE) {
        // Reverter renovação - busca pagamento anterior para restaurar
        const pagamentoAnterior = await tx.pagamento.findFirst({
          where: {
            usuarioId: pagamento.usuarioId,
            dataPagto: { lt: pagamento.dataPagto },
          },
          orderBy: { dataPagto: 'desc' },
        });

        if (pagamentoAnterior) {
          // Restaura dados do pagamento anterior
          const dataVencAnterior = calcularDataVencimento(pagamentoAnterior.dataPagto, 30);
          const diasParaVencerAnterior = calcularDiasParaVencer(dataVencAnterior);

          usuarioUpdate = {
            dataPagto: pagamentoAnterior.dataPagto,
            mesPagto: pagamentoAnterior.mesPagto,
            dataVenc: dataVencAnterior,
            diasParaVencer: diasParaVencerAnterior,
            venceHoje: venceHoje(dataVencAnterior),
            prox7Dias: venceProximos7Dias(dataVencAnterior),
            emAtraso: diasParaVencerAnterior < 0,
            metodo: pagamentoAnterior.metodo,
            conta: pagamentoAnterior.conta,
            regraTipo: pagamentoAnterior.regraTipo,
            regraValor: pagamentoAnterior.regraValor,
            elegivelComissao: pagamentoAnterior.elegivelComissao,
            comissaoValor: pagamentoAnterior.comissaoValor,
            ciclo: Math.max(0, (usuario.ciclo || 1) - 1),
            totalCiclosUsuario: Math.max(0, (usuario.totalCiclosUsuario || 1) - 1),
            renovou: false,
            statusFinal: diasParaVencerAnterior >= 1 ? StatusFinal.ATIVO : StatusFinal.EM_ATRASO,
          };
        } else {
          // Se não há pagamento anterior, trata como primeira adesão sendo revertida
          usuarioUpdate = {
            statusFinal: StatusFinal.INATIVO,
            entrou: false,
            ativoAtual: false,
            ciclo: 0,
            totalCiclosUsuario: 0,
            dataPagto: null,
            mesPagto: null,
            dataVenc: null,
            diasParaVencer: null,
            diasAcesso: null,
            venceHoje: false,
            prox7Dias: false,
            emAtraso: false,
            metodo: null,
            conta: null,
            regraTipo: null,
            regraValor: null,
            elegivelComissao: false,
            comissaoValor: null,
            mesRef: null,
            renovou: false,
          };
        }
      }

      // Atualiza usuário
      await tx.usuario.update({
        where: { id: pagamento.usuarioId },
        data: usuarioUpdate,
      });

      // Remove o pagamento (cascade remove comissão automaticamente)
      await tx.pagamento.delete({
        where: { id },
      });
    });
  }

  /**
   * Obtém estatísticas de pagamentos
   */
  async getStats(filters?: { mes?: string }): Promise<{
    totalPagamentos: number;
    totalReceita: number;
    receitaMes: number;
    primeirasAdesoes: number;
    renovacoes: number;
    valorMedioPagamento: number;
    pagamentosElegiveis: number;
    totalComissoes: number;
  }> {
    const where: any = filters?.mes ? { mesPagto: filters.mes } : {};

    const [
      totalPagamentos,
      somaValores,
      primeirasAdesoes,
      renovacoes,
      pagamentosElegiveis,
      somaComissoes,
    ] = await Promise.all([
      prisma.pagamento.count({ where }),
      prisma.pagamento.aggregate({
        where,
        _sum: { valor: true },
      }),
      prisma.pagamento.count({
        where: { ...where, regraTipo: RegraTipo.PRIMEIRO },
      }),
      prisma.pagamento.count({
        where: { ...where, regraTipo: RegraTipo.RECORRENTE },
      }),
      prisma.pagamento.count({
        where: { ...where, elegivelComissao: true },
      }),
      prisma.pagamento.aggregate({
        where: { ...where, elegivelComissao: true },
        _sum: { comissaoValor: true },
      }),
    ]);

    const totalReceita = Number(somaValores._sum.valor || 0);
    const totalComissoes = Number(somaComissoes._sum.comissaoValor || 0);
    const valorMedioPagamento =
      totalPagamentos > 0 ? totalReceita / totalPagamentos : 0;

    return {
      totalPagamentos,
      totalReceita,
      receitaMes: totalReceita, // Se filtrado por mês, será a receita do mês
      primeirasAdesoes,
      renovacoes,
      valorMedioPagamento,
      pagamentosElegiveis,
      totalComissoes,
    };
  }

  /**
   * Obtém relatório de pagamentos por mês
   */
  async getRelatorioPorMes(): Promise<
    Array<{
      mes: string;
      totalPagamentos: number;
      receita: number;
      primeirasAdesoes: number;
      renovacoes: number;
      comissoes: number;
    }>
  > {
    const pagamentos = await prisma.pagamento.groupBy({
      by: ['mesPagto'],
      _count: { id: true },
      _sum: {
        valor: true,
        comissaoValor: true,
      },
      orderBy: { mesPagto: 'asc' },
    });

    const relatorio = await Promise.all(
      pagamentos.map(async (item) => {
        const [primeiras, renovacoes] = await Promise.all([
          prisma.pagamento.count({
            where: {
              mesPagto: item.mesPagto,
              regraTipo: RegraTipo.PRIMEIRO,
            },
          }),
          prisma.pagamento.count({
            where: {
              mesPagto: item.mesPagto,
              regraTipo: RegraTipo.RECORRENTE,
            },
          }),
        ]);

        return {
          mes: item.mesPagto || '',
          totalPagamentos: item._count.id,
          receita: Number(item._sum.valor || 0),
          primeirasAdesoes: primeiras,
          renovacoes: renovacoes,
          comissoes: Number(item._sum.comissaoValor || 0),
        };
      })
    );

    return relatorio;
  }

  /**
   * Formata data para mês de pagamento (ex: "10/2024")
   * CORREÇÃO: Padronizado para formato numérico MM/YYYY em todo o sistema
   */
  private formatarMesPagamento(data: Date): string {
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${mes}/${ano}`;
  }
}

export default new PagamentoService();
