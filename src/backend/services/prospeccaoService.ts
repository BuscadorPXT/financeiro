import prisma from '../../database/client';
import { Prospeccao, StatusFinal } from '@prisma/client';
import { AppError } from '../errors';
import { HTTP_STATUS } from '../../shared/constants';
import { PaginationParams, PaginatedResponse, FilterParams } from '../../shared/types';
import prospeccaoRepository, { ProspeccaoFilters } from '../repositories/ProspeccaoRepository';
import { CreateProspeccaoDTO, UpdateProspeccaoDTO, ConversaoProspeccaoDTO } from '../dtos';

class ProspeccaoService {
  /**
   * Lista todas as prospecções com paginação e filtros
   */
  async findAll(
    pagination?: PaginationParams,
    filters?: FilterParams
  ): Promise<PaginatedResponse<Prospeccao>> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = (page - 1) * limit;

    // Converte filtros para o formato do repository
    const repoFilters: ProspeccaoFilters = {
      origem: filters?.origem,
      indicador: filters?.indicador,
      convertido: filters?.convertido !== undefined
        ? filters.convertido === 'true' || filters.convertido === true
        : undefined,
      search: filters?.search,
    };

    const [data, total] = await Promise.all([
      prospeccaoRepository.findMany(repoFilters, { skip, take: limit }),
      prospeccaoRepository.count(repoFilters),
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
   * Busca uma prospecção por ID
   */
  async findById(id: string): Promise<Prospeccao> {
    const prospeccao = await prospeccaoRepository.findById(id);

    if (!prospeccao) {
      throw new AppError('Prospecção não encontrada', HTTP_STATUS.NOT_FOUND);
    }

    return prospeccao;
  }

  /**
   * Cria uma nova prospecção
   */
  async create(data: CreateProspeccaoDTO): Promise<Prospeccao> {
    // Verifica se já existe prospecção com este email
    const existente = await prospeccaoRepository.findByEmail(data.email);

    if (existente) {
      throw new AppError(
        'Já existe uma prospecção com este email',
        HTTP_STATUS.CONFLICT
      );
    }

    const prospeccao = await prospeccaoRepository.create({
      email: data.email,
      nome: data.nome,
      telefone: data.telefone,
      origem: data.origem,
      indicador: data.indicador,
    });

    return prospeccao;
  }

  /**
   * Atualiza uma prospecção
   */
  async update(id: string, data: UpdateProspeccaoDTO): Promise<Prospeccao> {
    await this.findById(id);

    // Se está alterando o email, verifica duplicidade
    if (data.email) {
      const existente = await prospeccaoRepository.findByEmail(data.email);

      if (existente && existente.id !== id) {
        throw new AppError('Email já cadastrado em outra prospecção', HTTP_STATUS.CONFLICT);
      }
    }

    const prospeccao = await prospeccaoRepository.update(id, data);

    return prospeccao;
  }

  /**
   * Deleta uma prospecção
   */
  async delete(id: string): Promise<void> {
    const prospeccao = await this.findById(id);

    if (prospeccao.convertido) {
      throw new AppError(
        'Não é possível excluir uma prospecção já convertida',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    await prospeccaoRepository.delete(id);
  }

  /**
   * Converte uma prospecção em usuário
   * IMPORTANTE: Esta é a função principal do módulo de prospecção
   */
  async converterParaUsuario(
    id: string,
    dadosAdicionais?: ConversaoProspeccaoDTO
  ): Promise<{ prospeccao: Prospeccao; usuario: any }> {
    const prospeccao = await this.findById(id);

    if (prospeccao.convertido) {
      throw new AppError('Esta prospecção já foi convertida', HTTP_STATUS.BAD_REQUEST);
    }

    // Verifica se já existe usuário com este email
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { emailLogin: prospeccao.email },
    });

    if (usuarioExistente) {
      throw new AppError(
        'Já existe um usuário com este email',
        HTTP_STATUS.CONFLICT
      );
    }

    // Cria o usuário a partir dos dados da prospecção
    const usuario = await prisma.usuario.create({
      data: {
        emailLogin: prospeccao.email,
        nomeCompleto: prospeccao.nome,
        telefone: dadosAdicionais?.telefone || prospeccao.telefone || '',
        indicador: dadosAdicionais?.indicador || prospeccao.indicador,
        statusFinal: StatusFinal.INATIVO,
        ciclo: 0,
        totalCiclosUsuario: 0,
        entrou: false,
        renovou: false,
        ativoAtual: false,
        churn: false,
        venceHoje: false,
        prox7Dias: false,
        emAtraso: false,
        flagAgenda: false,
        elegivelComissao: false,
      },
    });

    // Atualiza a prospecção marcando como convertida e vinculando ao usuário
    const prospeccaoAtualizada = await prisma.prospeccao.update({
      where: { id },
      data: {
        convertido: true,
        usuarioId: usuario.id,
      },
      include: {
        usuario: true,
      },
    });

    return {
      prospeccao: prospeccaoAtualizada,
      usuario,
    };
  }

  /**
   * Obtém estatísticas de prospecção
   */
  async getStats(filters?: {
    origem?: string;
    indicador?: string;
  }): Promise<{
    totalProspeccoes: number;
    convertidas: number;
    naoConvertidas: number;
    taxaConversao: number;
    porOrigem: Array<{ origem: string; total: number; convertidas: number }>;
    porIndicador: Array<{ indicador: string; total: number; convertidas: number }>;
  }> {
    const where: any = {};
    if (filters?.origem) where.origem = filters.origem;
    if (filters?.indicador) where.indicador = filters.indicador;

    const repoFilters: ProspeccaoFilters = {
      origem: filters?.origem,
      indicador: filters?.indicador,
    };

    const [total, convertidas, porOrigem, porIndicador] = await Promise.all([
      prospeccaoRepository.count(repoFilters),
      prospeccaoRepository.count({ ...repoFilters, convertido: true }),
      prospeccaoRepository.groupByOrigem(repoFilters),
      prospeccaoRepository.groupByIndicador(repoFilters),
    ]);

    // Calcula conversões por origem
    const origemStats = await Promise.all(
      porOrigem.map(async (item) => {
        const convertidas = await prospeccaoRepository.count({
          ...repoFilters,
          origem: item.origem,
          convertido: true,
        });

        return {
          origem: item.origem || 'Sem origem',
          total: item._count.id,
          convertidas,
        };
      })
    );

    // Calcula conversões por indicador
    const indicadorStats = await Promise.all(
      porIndicador.map(async (item) => {
        const convertidas = await prospeccaoRepository.count({
          ...repoFilters,
          indicador: item.indicador,
          convertido: true,
        });

        return {
          indicador: item.indicador || 'Sem indicador',
          total: item._count.id,
          convertidas,
        };
      })
    );

    return {
      totalProspeccoes: total,
      convertidas: convertidas,
      naoConvertidas: total - convertidas,
      taxaConversao: total > 0 ? Number(((convertidas / total) * 100).toFixed(2)) : 0,
      porOrigem: origemStats,
      porIndicador: indicadorStats,
    };
  }

  /**
   * Lista prospecções não convertidas
   */
  async getNaoConvertidas(filters?: {
    origem?: string;
    indicador?: string;
  }): Promise<Prospeccao[]> {
    return prospeccaoRepository.findNaoConvertidas(filters);
  }
}

export default new ProspeccaoService();
