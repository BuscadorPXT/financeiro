import prisma from '../../database/client';
import { Usuario, StatusFinal } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { HTTP_STATUS } from '../../shared/constants';
import { isValidEmail, formatPhone } from '../utils/validators';
import {
  calcularDiasParaVencer,
  venceHoje,
  venceProximos7Dias,
  emAtraso,
} from '../utils/dateUtils';
import { PaginationParams, PaginatedResponse, FilterParams } from '../../shared/types';

class UsuarioService {
  /**
   * Lista todos os usuários com paginação e filtros
   */
  async findAll(
    pagination?: PaginationParams,
    filters?: FilterParams
  ): Promise<PaginatedResponse<Usuario>> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Filtros
    if (filters?.status) {
      where.statusFinal = filters.status;
    }

    if (filters?.search) {
      where.OR = [
        { emailLogin: { contains: filters.search, mode: 'insensitive' } },
        { nomeCompleto: { contains: filters.search, mode: 'insensitive' } },
        { telefone: { contains: filters.search } },
      ];
    }

    if (filters?.indicador) {
      where.indicador = filters.indicador;
    }

    if (filters?.venceHoje) {
      where.venceHoje = true;
    }

    if (filters?.prox7Dias) {
      where.prox7Dias = true;
    }

    if (filters?.emAtraso) {
      where.emAtraso = true;
    }

    const [data, total] = await Promise.all([
      prisma.usuario.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.usuario.count({ where }),
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
   * Busca um usuário por ID
   */
  async findById(id: string): Promise<Usuario> {
    const usuario = await prisma.usuario.findUnique({
      where: { id },
      include: {
        pagamentos: {
          orderBy: { dataPagto: 'desc' },
          take: 10,
        },
        agenda: true,
        churnRegistros: true,
      },
    });

    if (!usuario) {
      throw new AppError('Usuário não encontrado', HTTP_STATUS.NOT_FOUND);
    }

    return usuario;
  }

  /**
   * Busca um usuário por email
   */
  async findByEmail(email: string): Promise<Usuario | null> {
    return await prisma.usuario.findUnique({
      where: { emailLogin: email },
    });
  }

  /**
   * Cria um novo usuário
   */
  async create(data: {
    emailLogin: string;
    nomeCompleto: string;
    telefone?: string;
    indicador?: string;
    obs?: string;
  }): Promise<Usuario> {
    // Validações
    if (!isValidEmail(data.emailLogin)) {
      throw new AppError('Email inválido', HTTP_STATUS.BAD_REQUEST);
    }

    // Verifica se email já existe
    const existing = await this.findByEmail(data.emailLogin);
    if (existing) {
      throw new AppError('Email já cadastrado', HTTP_STATUS.CONFLICT);
    }

    // Formata telefone se fornecido e não vazio
    let telefone = data.telefone;
    if (telefone && telefone.trim() !== '') {
      telefone = formatPhone(telefone);
    } else {
      telefone = undefined;
    }

    const usuario = await prisma.usuario.create({
      data: {
        ...data,
        telefone,
        statusFinal: StatusFinal.INATIVO, // Status inicial
      },
    });

    return usuario;
  }

  /**
   * Atualiza um usuário
   */
  async update(
    id: string,
    data: Partial<{
      nomeCompleto: string;
      telefone: string;
      indicador: string;
      obs: string;
      statusFinal: StatusFinal;
    }>
  ): Promise<Usuario> {
    await this.findById(id);

    // Formata telefone se fornecido e não vazio
    if (data.telefone !== undefined) {
      if (data.telefone && data.telefone.trim() !== '') {
        data.telefone = formatPhone(data.telefone);
      } else {
        data.telefone = undefined as any;
      }
    }

    const usuario = await prisma.usuario.update({
      where: { id },
      data,
    });

    return usuario;
  }

  /**
   * Atualiza flags de vencimento e status do usuário
   */
  async atualizarFlags(id: string): Promise<Usuario> {
    const usuario = await this.findById(id);

    if (!usuario.dataVenc) {
      return usuario;
    }

    const diasParaVencer = calcularDiasParaVencer(usuario.dataVenc);
    const flags = {
      diasParaVencer,
      venceHoje: venceHoje(usuario.dataVenc),
      prox7Dias: venceProximos7Dias(usuario.dataVenc),
      emAtraso: emAtraso(usuario.dataVenc),
    };

    // Atualiza status automático
    let statusFinal = usuario.statusFinal;
    if (flags.emAtraso) {
      statusFinal = StatusFinal.EM_ATRASO;
    } else if (diasParaVencer >= 1) {
      statusFinal = StatusFinal.ATIVO;
    }

    return await prisma.usuario.update({
      where: { id },
      data: {
        ...flags,
        statusFinal,
      },
    });
  }

  /**
   * Deleta um usuário (soft delete - muda status para INATIVO)
   */
  async delete(id: string): Promise<void> {
    await this.findById(id);

    await prisma.usuario.update({
      where: { id },
      data: {
        statusFinal: StatusFinal.INATIVO,
        ativoAtual: false,
      },
    });
  }

  /**
   * Importa usuários em lote
   * Implementa idempotência: não duplica usuários por email
   * Otimizado para importações grandes usando batch processing
   */
  async importBulk(usuarios: Array<Partial<Usuario>>): Promise<{
    success: number;
    errors: number;
    skipped: number;
    details: Array<{ email: string; status: 'success' | 'error' | 'skipped'; message?: string }>;
  }> {
    let success = 0;
    let errors = 0;
    let skipped = 0;
    const details: Array<{ email: string; status: 'success' | 'error' | 'skipped'; message?: string }> = [];

    // Validação inicial: separa válidos de inválidos
    const usuariosValidos: Array<{
      email: string;
      data: any;
    }> = [];

    for (const userData of usuarios) {
      // Validação de email obrigatório
      if (!userData.emailLogin) {
        errors++;
        details.push({
          email: 'N/A',
          status: 'error',
          message: 'Email é obrigatório',
        });
        continue;
      }

      // Validação de email
      if (!isValidEmail(userData.emailLogin)) {
        errors++;
        details.push({
          email: userData.emailLogin,
          status: 'error',
          message: 'Email inválido',
        });
        continue;
      }

      // Formata telefone se fornecido e não vazio
      let telefone = userData.telefone;
      if (telefone && telefone.trim() !== '') {
        telefone = formatPhone(telefone);
      } else {
        telefone = undefined;
      }

      usuariosValidos.push({
        email: userData.emailLogin,
        data: {
          emailLogin: userData.emailLogin,
          nomeCompleto: userData.nomeCompleto || userData.emailLogin,
          telefone,
          indicador: userData.indicador,
          obs: userData.obs,
          statusFinal: StatusFinal.INATIVO,
          ativoAtual: false,
          entrou: false,
          renovou: false,
          churn: false,
          flagAgenda: false,
        },
      });
    }

    if (usuariosValidos.length === 0) {
      return { success, errors, skipped, details };
    }

    // Busca todos os emails existentes de uma vez (otimização)
    const emailsParaVerificar = usuariosValidos.map(u => u.email);
    const usuariosExistentes = await prisma.usuario.findMany({
      where: {
        emailLogin: { in: emailsParaVerificar },
      },
      select: { emailLogin: true },
    });

    const emailsExistentes = new Set(usuariosExistentes.map(u => u.emailLogin));

    // Separa usuários novos dos duplicados
    const usuariosParaInserir = usuariosValidos.filter(u => {
      if (emailsExistentes.has(u.email)) {
        skipped++;
        details.push({
          email: u.email,
          status: 'skipped',
          message: 'Usuário já existe',
        });
        return false;
      }
      return true;
    });

    if (usuariosParaInserir.length === 0) {
      return { success, errors, skipped, details };
    }

    // Insere em lotes de 50 para evitar problemas de memória
    const BATCH_SIZE = 50;
    for (let i = 0; i < usuariosParaInserir.length; i += BATCH_SIZE) {
      const batch = usuariosParaInserir.slice(i, i + BATCH_SIZE);

      try {
        // Usa createMany para inserção em lote (muito mais rápido)
        const result = await prisma.usuario.createMany({
          data: batch.map(u => u.data),
          skipDuplicates: true, // Segurança adicional
        });

        success += result.count;

        // Adiciona detalhes de sucesso
        batch.forEach(u => {
          details.push({
            email: u.email,
            status: 'success',
          });
        });
      } catch (error: any) {
        // Se falhar o batch inteiro, tenta um por um para identificar o problema
        for (const usuario of batch) {
          try {
            await prisma.usuario.create({
              data: usuario.data,
            });
            success++;
            details.push({
              email: usuario.email,
              status: 'success',
            });
          } catch (err: any) {
            errors++;
            details.push({
              email: usuario.email,
              status: 'error',
              message: err.message || 'Erro desconhecido',
            });
          }
        }
      }
    }

    return {
      success,
      errors,
      skipped,
      details,
    };
  }

  /**
   * Obtém estatísticas de usuários
   */
  async getStats(): Promise<{
    total: number;
    ativos: number;
    inativos: number;
    emAtraso: number;
    vencemHoje: number;
    vencemProximos7Dias: number;
  }> {
    const [total, ativos, inativos, emAtraso, vencemHoje, vencemProximos7Dias] =
      await Promise.all([
        prisma.usuario.count(),
        prisma.usuario.count({ where: { statusFinal: StatusFinal.ATIVO } }),
        prisma.usuario.count({ where: { statusFinal: StatusFinal.INATIVO } }),
        prisma.usuario.count({ where: { statusFinal: StatusFinal.EM_ATRASO } }),
        prisma.usuario.count({ where: { venceHoje: true } }),
        prisma.usuario.count({ where: { prox7Dias: true } }),
      ]);

    return {
      total,
      ativos,
      inativos,
      emAtraso,
      vencemHoje,
      vencemProximos7Dias,
    };
  }
}

export default new UsuarioService();
