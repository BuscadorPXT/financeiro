import prisma from '../../database/client';
import { Usuario, StatusFinal } from '@prisma/client';
import { NotFoundError, ConflictError, ValidationError } from '../errors';
import { HTTP_STATUS } from '../../shared/constants';
import { isValidEmail, formatPhone } from '../utils/validators';
import {
  calcularDiasParaVencer,
  venceHoje,
  venceProximos7Dias,
  emAtraso,
} from '../utils/dateUtils';
import { PaginationParams, FilterParams } from '../../shared/types';
import { createPaginationMeta, PaginatedResponse } from '../types/pagination.types';
import usuarioRepository, { UsuarioFilters } from '../repositories/UsuarioRepository';

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

    // Converte filtros para o formato do repository
    const repoFilters: UsuarioFilters = {
      status: filters?.status as StatusFinal,
      search: filters?.search,
      indicador: filters?.indicador,
      venceHoje: filters?.venceHoje,
      prox7Dias: filters?.prox7Dias,
      emAtraso: filters?.emAtraso,
    };

    const [data, total] = await Promise.all([
      usuarioRepository.findMany(repoFilters, { skip, take: limit }),
      usuarioRepository.count(repoFilters),
    ]);

    return {
      status: 'success',
      data,
      pagination: createPaginationMeta(page, limit, total),
    };
  }

  /**
   * Busca um usuário por ID
   */
  async findById(id: string): Promise<Usuario> {
    const usuario = await usuarioRepository.findById(id);

    if (!usuario) {
      throw new NotFoundError('Usuario', id);
    }

    return usuario;
  }

  /**
   * Busca um usuário por email
   */
  async findByEmail(email: string): Promise<Usuario | null> {
    return await usuarioRepository.findByEmail(email);
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
      throw new ValidationError('Email inválido', [
        { field: 'emailLogin', message: 'Email inválido' },
      ]);
    }

    // Verifica se email já existe usando repository
    const emailExists = await usuarioRepository.emailExists(data.emailLogin);
    if (emailExists) {
      throw new ConflictError('Email já cadastrado');
    }

    // Formata telefone se fornecido e não vazio
    let telefone = data.telefone;
    if (telefone && telefone.trim() !== '') {
      telefone = formatPhone(telefone);
    } else {
      telefone = undefined;
    }

    const usuario = await usuarioRepository.create({
      ...data,
      telefone,
      statusFinal: StatusFinal.INATIVO, // Status inicial
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

    const usuario = await usuarioRepository.update(id, data);

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

    return await usuarioRepository.update(id, {
      ...flags,
      statusFinal,
    });
  }

  /**
   * Deleta um usuário permanentemente do banco de dados
   * ATENÇÃO: Esta operação é irreversível e também remove:
   * - Todos os pagamentos do usuário (cascade)
   * - Registros de agenda (cascade)
   * - Registros de churn (cascade)
   */
  async delete(id: string): Promise<void> {
    await this.findById(id);

    await prisma.usuario.delete({
      where: { id },
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
