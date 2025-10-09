import prisma from '../../database/client';
import { Prospeccao, StatusFinal } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { HTTP_STATUS } from '../../shared/constants';
import { PaginationParams, PaginatedResponse, FilterParams } from '../../shared/types';

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

    const where: any = {};

    // Filtros
    if (filters?.origem) {
      where.origem = filters.origem;
    }

    if (filters?.indicador) {
      where.indicador = filters.indicador;
    }

    if (filters?.convertido !== undefined) {
      where.convertido = filters.convertido === 'true' || filters.convertido === true;
    }

    if (filters?.search) {
      where.OR = [
        { nome: { contains: filters.search } },
        { email: { contains: filters.search } },
        { telefone: { contains: filters.search } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.prospeccao.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
      prisma.prospeccao.count({ where }),
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
    const prospeccao = await prisma.prospeccao.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            id: true,
            emailLogin: true,
            nomeCompleto: true,
            telefone: true,
            statusFinal: true,
            ciclo: true,
            createdAt: true,
          },
        },
      },
    });

    if (!prospeccao) {
      throw new AppError('Prospecção não encontrada', HTTP_STATUS.NOT_FOUND);
    }

    return prospeccao;
  }

  /**
   * Cria uma nova prospecção
   */
  async create(data: {
    email: string;
    nome: string;
    telefone?: string;
    origem?: string;
    indicador?: string;
  }): Promise<Prospeccao> {
    // Verifica se já existe prospecção com este email
    const existente = await prisma.prospeccao.findFirst({
      where: { email: data.email },
    });

    if (existente) {
      throw new AppError(
        'Já existe uma prospecção com este email',
        HTTP_STATUS.CONFLICT
      );
    }

    const prospeccao = await prisma.prospeccao.create({
      data: {
        email: data.email,
        nome: data.nome,
        telefone: data.telefone,
        origem: data.origem,
        indicador: data.indicador,
      },
    });

    return prospeccao;
  }

  /**
   * Atualiza uma prospecção
   */
  async update(
    id: string,
    data: Partial<{
      email: string;
      nome: string;
      telefone: string;
      origem: string;
      indicador: string;
    }>
  ): Promise<Prospeccao> {
    await this.findById(id);

    // Se está alterando o email, verifica duplicidade
    if (data.email) {
      const existente = await prisma.prospeccao.findFirst({
        where: {
          email: data.email,
          id: { not: id },
        },
      });

      if (existente) {
        throw new AppError('Email já cadastrado em outra prospecção', HTTP_STATUS.CONFLICT);
      }
    }

    const prospeccao = await prisma.prospeccao.update({
      where: { id },
      data,
    });

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

    await prisma.prospeccao.delete({
      where: { id },
    });
  }

  /**
   * Converte uma prospecção em usuário
   * IMPORTANTE: Esta é a função principal do módulo de prospecção
   */
  async converterParaUsuario(
    id: string,
    dadosAdicionais?: {
      telefone?: string;
      indicador?: string;
    }
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

    const [total, convertidas, porOrigem, porIndicador] = await Promise.all([
      prisma.prospeccao.count({ where }),
      prisma.prospeccao.count({ where: { ...where, convertido: true } }),
      prisma.prospeccao.groupBy({
        by: ['origem'],
        where,
        _count: { id: true },
      }),
      prisma.prospeccao.groupBy({
        by: ['indicador'],
        where,
        _count: { id: true },
      }),
    ]);

    // Calcula conversões por origem
    const origemStats = await Promise.all(
      porOrigem.map(async (item) => {
        const convertidas = await prisma.prospeccao.count({
          where: {
            ...where,
            origem: item.origem,
            convertido: true,
          },
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
        const convertidas = await prisma.prospeccao.count({
          where: {
            ...where,
            indicador: item.indicador,
            convertido: true,
          },
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
    const where: any = { convertido: false };

    if (filters?.origem) where.origem = filters.origem;
    if (filters?.indicador) where.indicador = filters.indicador;

    const prospeccoes = await prisma.prospeccao.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return prospeccoes;
  }
}

export default new ProspeccaoService();
