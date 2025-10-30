import prisma from '../../database/client';
import { Agenda, StatusAgenda, StatusFinal, RegraTipo, MetodoPagamento } from '@prisma/client';
import { AppError } from '../errors';
import { HTTP_STATUS } from '../../shared/constants';
import { PaginationParams, PaginatedResponse, FilterParams } from '../../shared/types';
import { calcularDiasParaVencer } from '../utils/dateUtils';
import pagamentoService from './pagamentoService';
import agendaRepository, { AgendaFilters } from '../repositories/AgendaRepository';
import { CreateAgendaDTO, UpdateAgendaDTO } from '../dtos';

class AgendaService {
  /**
   * Lista todos os itens da agenda com paginação e filtros
   */
  async findAll(
    pagination?: PaginationParams,
    filters?: FilterParams
  ): Promise<PaginatedResponse<Agenda>> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = (page - 1) * limit;

    const repoFilters: AgendaFilters = {
      status: filters?.status as StatusAgenda | undefined,
      usuarioId: filters?.usuarioId,
      renovou: filters?.renovou !== undefined
        ? filters.renovou === 'true' || filters.renovou === true
        : undefined,
      cancelou: filters?.cancelou !== undefined
        ? filters.cancelou === 'true' || filters.cancelou === true
        : undefined,
      janela: filters?.janela as 'vencidos' | 'hoje' | 'proximos7dias' | 'mesAtual' | undefined,
    };

    const [data, total] = await Promise.all([
      agendaRepository.findMany(repoFilters, { skip, take: limit }),
      agendaRepository.count(repoFilters),
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
   * Busca um item da agenda por ID
   */
  async findById(id: string): Promise<Agenda> {
    const agenda = await agendaRepository.findById(id);

    if (!agenda) {
      throw new AppError('Item da agenda não encontrado', HTTP_STATUS.NOT_FOUND);
    }

    return agenda;
  }

  /**
   * Cria um novo item na agenda
   */
  async create(data: CreateAgendaDTO): Promise<Agenda> {
    // Busca o usuário
    const usuario = await prisma.usuario.findUnique({
      where: { id: data.usuarioId },
    });

    if (!usuario) {
      throw new AppError('Usuário não encontrado', HTTP_STATUS.NOT_FOUND);
    }

    const diasParaVencer = calcularDiasParaVencer(data.dataVenc);

    const agenda = await agendaRepository.create({
      usuario: {
        connect: { id: data.usuarioId },
      },
      dataVenc: data.dataVenc,
      diasParaVencer,
      ciclo: data.ciclo,
      status: data.status || StatusAgenda.ATIVO,
    });

    return agenda;
  }

  /**
   * Atualiza um item da agenda
   */
  async update(id: string, data: UpdateAgendaDTO): Promise<Agenda> {
    await this.findById(id);

    // Se a data mudou, recalcula dias para vencer
    if (data.dataVenc) {
      const diasParaVencer = calcularDiasParaVencer(data.dataVenc);
      (data as any).diasParaVencer = diasParaVencer;
    }

    const agenda = await agendaRepository.update(id, data);

    return agenda;
  }

  /**
   * Deleta um item da agenda
   */
  async delete(id: string): Promise<void> {
    await this.findById(id);

    await agendaRepository.delete(id);
  }

  /**
   * Marca como renovado e cria pagamento recorrente
   */
  async marcarRenovou(
    id: string,
    dadosPagamento: {
      dataPagto: Date;
      valor: number;
      metodo: MetodoPagamento;
      conta: string;
      regraValor?: number;
      observacao?: string;
    }
  ): Promise<{ agenda: Agenda; pagamento: any }> {
    const agenda = await this.findById(id);

    // Valida se já não foi renovado
    if (agenda.renovou) {
      throw new AppError('Este item já foi marcado como renovado', HTTP_STATUS.BAD_REQUEST);
    }

    // Se estiver cancelado, remove o cancelamento
    if (agenda.cancelou) {
      throw new AppError(
        'Este item está cancelado. Reverta o cancelamento primeiro.',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Cria pagamento recorrente
    const pagamento = await pagamentoService.create({
      usuarioId: agenda.usuarioId,
      dataPagto: dadosPagamento.dataPagto,
      valor: dadosPagamento.valor,
      metodo: dadosPagamento.metodo,
      conta: dadosPagamento.conta,
      regraTipo: RegraTipo.RECORRENTE,
      regraValor: dadosPagamento.regraValor,
      observacao: dadosPagamento.observacao || `Renovação - Ciclo ${agenda.ciclo + 1}`,
    });

    // Marca como renovado
    const agendaAtualizada = await agendaRepository.update(id, {
      renovou: true,
      cancelou: false,
    });

    return {
      agenda: agendaAtualizada,
      pagamento,
    };
  }

  /**
   * Marca como cancelado e cria registro de churn
   * Se estiver renovado, reverte automaticamente a renovação
   */
  async marcarCancelou(
    id: string,
    motivoChurn?: string
  ): Promise<{ agenda: Agenda; churn: any }> {
    const agenda = await this.findById(id);

    // Valida se já não foi cancelado
    if (agenda.cancelou) {
      throw new AppError('Este item já foi marcado como cancelado', HTTP_STATUS.BAD_REQUEST);
    }

    // Se estiver renovado, reverte automaticamente (permitir cancelamento)
    // Isso é comum quando o usuário renova mas depois decide cancelar

    // Cria registro de churn
    const churn = await prisma.churn.create({
      data: {
        usuarioId: agenda.usuarioId,
        dataChurn: new Date(),
        motivo: motivoChurn || 'Cancelamento via agenda',
      },
    });

    // Atualiza usuário para churn
    await prisma.usuario.update({
      where: { id: agenda.usuarioId },
      data: {
        churn: true,
        ativoAtual: false,
        statusFinal: StatusFinal.INATIVO,
      },
    });

    // Marca como cancelado (e remove renovação se houver)
    const agendaAtualizada = await agendaRepository.update(id, {
      cancelou: true,
      renovou: false,
      status: StatusAgenda.INATIVO,
    });

    return {
      agenda: agendaAtualizada,
      churn,
    };
  }

  /**
   * Reverte renovação
   */
  async reverterRenovou(id: string): Promise<Agenda> {
    const agenda = await this.findById(id);

    if (!agenda.renovou) {
      throw new AppError('Este item não foi marcado como renovado', HTTP_STATUS.BAD_REQUEST);
    }

    const agendaAtualizada = await agendaRepository.update(id, {
      renovou: false,
    });

    return agendaAtualizada;
  }

  /**
   * Reverte cancelamento
   */
  async reverterCancelou(id: string): Promise<Agenda> {
    const agenda = await this.findById(id);

    if (!agenda.cancelou) {
      throw new AppError('Este item não foi marcado como cancelado', HTTP_STATUS.BAD_REQUEST);
    }

    const agendaAtualizada = await agendaRepository.update(id, {
      cancelou: false,
      status: StatusAgenda.ATIVO,
    });

    return agendaAtualizada;
  }

  /**
   * Obtém estatísticas da agenda
   */
  async getStats(): Promise<{
    totalAtivos: number;
    vencidos: number;
    vencemHoje: number;
    vencemProximos7Dias: number;
    vencemMesAtual: number;
    renovados: number;
    cancelados: number;
  }> {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);

    const seteDias = new Date(hoje);
    seteDias.setDate(seteDias.getDate() + 7);

    const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

    const [
      totalAtivos,
      vencidos,
      vencemHoje,
      vencemProximos7Dias,
      vencemMesAtual,
      renovados,
      cancelados,
    ] = await Promise.all([
      agendaRepository.count({ status: StatusAgenda.ATIVO }),
      agendaRepository.count({ janela: 'vencidos' }),
      agendaRepository.count({ janela: 'hoje' }),
      agendaRepository.count({ janela: 'proximos7dias' }),
      agendaRepository.count({ janela: 'mesAtual' }),
      agendaRepository.count({ renovou: true }),
      agendaRepository.count({ cancelou: true }),
    ]);

    return {
      totalAtivos,
      vencidos,
      vencemHoje,
      vencemProximos7Dias,
      vencemMesAtual,
      renovados,
      cancelados,
    };
  }

  /**
   * Atualiza dias para vencer de todos os itens ativos
   */
  async atualizarDiasParaVencer(): Promise<number> {
    const itensAtivos = await agendaRepository.findAtivos();

    let atualizados = 0;

    for (const item of itensAtivos) {
      const diasParaVencer = calcularDiasParaVencer(item.dataVenc);

      if (diasParaVencer !== item.diasParaVencer) {
        await agendaRepository.update(item.id, { diasParaVencer });
        atualizados++;
      }
    }

    return atualizados;
  }

  /**
   * Sincroniza a agenda com os usuários ativos
   * Adiciona usuários que estão próximos do vencimento (30 dias) e ainda não estão na agenda
   */
  async sincronizarAgenda(): Promise<{ adicionados: number; atualizados: number }> {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const daqui30Dias = new Date(hoje);
    daqui30Dias.setDate(daqui30Dias.getDate() + 30);

    // Buscar usuários que precisam estar na agenda
    const usuarios = await prisma.usuario.findMany({
      where: {
        dataVenc: {
          not: null,
          lte: daqui30Dias,
        },
        statusFinal: {
          in: [StatusFinal.ATIVO, StatusFinal.EM_ATRASO],
        },
        ativoAtual: true,
      },
    });

    let adicionados = 0;
    let atualizados = 0;

    for (const usuario of usuarios) {
      if (!usuario.dataVenc) continue;

      // Verificar se já existe na agenda ativo e não processado
      const existeNaAgenda = await agendaRepository.findFirstAtivoByUsuarioId(usuario.id);

      const diasParaVencer = calcularDiasParaVencer(usuario.dataVenc);

      if (existeNaAgenda) {
        // Atualizar se dados mudaram
        if (
          existeNaAgenda.dataVenc.getTime() !== usuario.dataVenc.getTime() ||
          existeNaAgenda.diasParaVencer !== diasParaVencer ||
          existeNaAgenda.ciclo !== usuario.ciclo
        ) {
          await agendaRepository.update(existeNaAgenda.id, {
            dataVenc: usuario.dataVenc,
            diasParaVencer,
            ciclo: usuario.ciclo || 0,
          });
          atualizados++;
        }
      } else {
        // Adicionar à agenda
        await agendaRepository.create({
          usuario: {
            connect: { id: usuario.id },
          },
          dataVenc: usuario.dataVenc,
          diasParaVencer,
          status: StatusAgenda.ATIVO,
          ciclo: usuario.ciclo || 0,
        });
        adicionados++;
      }
    }

    return { adicionados, atualizados };
  }
}

export default new AgendaService();
