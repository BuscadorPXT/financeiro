import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../database/client';
import { UnauthorizedError, NotFoundError, AppError } from '../errors';

// Validação obrigatória do JWT_SECRET
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error(
    'JWT_SECRET é obrigatório e deve ter no mínimo 32 caracteres. Configure no arquivo .env'
  );
}

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_ISSUER = 'financasbuscador';
const JWT_AUDIENCE = 'financasbuscador-api';

/**
 * Configuração de segurança do Bcrypt
 *
 * OWASP recomenda 10-12 rounds para equilibrar segurança e performance.
 * - 10 rounds: ~150ms por hash (mínimo recomendado)
 * - 12 rounds: ~600ms por hash (recomendado para 2024+)
 * - 14 rounds: ~2.4s por hash (muito lento para UX)
 *
 * Nota: Aumentar rounds não afeta senhas existentes. Apenas novas senhas
 * (registro, troca de senha) usarão o novo valor. bcrypt.compare() funciona
 * com qualquer número de rounds.
 */
const BCRYPT_ROUNDS = 12;

// Blacklist de tokens revogados (em memória - migrar para Redis em produção)
const tokenBlacklist = new Set<string>();

class AuthService {
  /**
   * Autentica usuário e retorna token
   */
  async login(login: string, senha: string) {
    // Buscar admin
    const admin = await prisma.admin.findUnique({
      where: { login },
    });

    if (!admin) {
      throw new UnauthorizedError('Login ou senha inválidos');
    }

    if (!admin.ativo) {
      throw new UnauthorizedError('Usuário desativado');
    }

    if (!admin.aprovado) {
      throw new UnauthorizedError('Usuário aguardando aprovação do administrador');
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, admin.senha);

    if (!senhaValida) {
      throw new UnauthorizedError('Login ou senha inválidos');
    }

    // Gerar token JWT com padrão de segurança
    const token = jwt.sign(
      {
        id: admin.id,
        login: admin.login,
        role: admin.role,
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN,
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
        subject: String(admin.id),
      } as jwt.SignOptions
    );

    return {
      token,
      user: {
        id: admin.id,
        login: admin.login,
        nome: admin.nome,
        email: admin.email,
        role: admin.role,
        aprovado: admin.aprovado,
      },
    };
  }

  /**
   * Retorna dados do usuário autenticado
   */
  async getMe(userId: string) {
    const admin = await prisma.admin.findUnique({
      where: { id: userId },
      select: {
        id: true,
        login: true,
        nome: true,
        email: true,
        role: true,
        aprovado: true,
        ativo: true,
        createdAt: true,
      },
    });

    if (!admin) {
      throw new NotFoundError('Admin', userId);
    }

    return admin;
  }

  /**
   * Altera senha do usuário
   */
  async changePassword(userId: string, senhaAtual: string, senhaNova: string) {
    const admin = await prisma.admin.findUnique({
      where: { id: userId },
    });

    if (!admin) {
      throw new NotFoundError('Admin', userId);
    }

    // Verificar senha atual
    const senhaValida = await bcrypt.compare(senhaAtual, admin.senha);

    if (!senhaValida) {
      throw new UnauthorizedError('Senha atual incorreta');
    }

    // Hash da nova senha com rounds recomendado pela OWASP
    const senhaHash = await bcrypt.hash(senhaNova, BCRYPT_ROUNDS);

    // Atualizar senha
    await prisma.admin.update({
      where: { id: userId },
      data: { senha: senhaHash },
    });

    return true;
  }

  /**
   * Registra novo usuário (aguarda aprovação, exceto se for o primeiro)
   */
  async register(login: string, senha: string, nome: string, email?: string) {
    // Verificar se login já existe
    const existingLogin = await prisma.admin.findUnique({
      where: { login },
    });

    if (existingLogin) {
      throw new AppError('Login já está em uso', 400);
    }

    // Verificar se email já existe (se fornecido)
    if (email) {
      const existingEmail = await prisma.admin.findUnique({
        where: { email },
      });

      if (existingEmail) {
        throw new AppError('Email já está em uso', 400);
      }
    }

    // Verificar se é o primeiro usuário (se sim, já aprova e torna admin)
    const totalAdmins = await prisma.admin.count();
    const isPrimeiroUsuario = totalAdmins === 0;

    // Hash da senha com rounds recomendado pela OWASP
    const senhaHash = await bcrypt.hash(senha, BCRYPT_ROUNDS);

    const admin = await prisma.admin.create({
      data: {
        login,
        senha: senhaHash,
        nome,
        email,
        aprovado: isPrimeiroUsuario,
        role: isPrimeiroUsuario ? 'ADMIN' : 'USER',
      },
    });

    return {
      id: admin.id,
      login: admin.login,
      nome: admin.nome,
      email: admin.email,
      role: admin.role,
      aprovado: admin.aprovado,
      isPrimeiroUsuario,
    };
  }

  /**
   * Cria primeiro admin (seed) - mantido para compatibilidade
   */
  async createAdmin(login: string, senha: string, nome: string) {
    return this.register(login, senha, nome);
  }

  /**
   * Logout - adiciona token à blacklist
   *
   * NOTA: Logout é idempotente e nunca lança erro.
   * Se o token for inválido ou já expirado, simplesmente ignora.
   * Isso garante que o usuário sempre consiga fazer logout, mesmo com token corrompido.
   */
  async logout(token: string): Promise<void> {
    try {
      // Decodificar token para pegar tempo de expiração
      const decoded = jwt.decode(token) as any;

      if (decoded && decoded.exp) {
        // Adicionar à blacklist
        tokenBlacklist.add(token);

        // Remover da blacklist após expiração (cleanup automático)
        const expiresIn = (decoded.exp * 1000) - Date.now();
        if (expiresIn > 0) {
          setTimeout(() => {
            tokenBlacklist.delete(token);
          }, expiresIn);
        }
      }
    } catch (error) {
      // Logout é idempotente - ignora erros silenciosamente
      console.warn('[AUTH] Erro ao processar logout, mas operação concluída:', error);
      // Não lança erro - usuário sempre consegue fazer logout
    }
  }

  /**
   * Verifica se token está na blacklist
   */
  isTokenBlacklisted(token: string): boolean {
    return tokenBlacklist.has(token);
  }

  /**
   * Valida token JWT com todas as verificações de segurança
   */
  verifyToken(token: string): { id: string; login: string; role: string } {
    try {
      // Verificar se está na blacklist
      if (this.isTokenBlacklisted(token)) {
        throw new UnauthorizedError('Token foi revogado');
      }

      // Verificar assinatura, expiração, issuer e audience
      const decoded = jwt.verify(token, JWT_SECRET, {
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
      }) as { id: string; login: string; role: string };

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Token expirado');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('Token inválido');
      }
      throw error;
    }
  }

  /**
   * Lista todos os usuários (apenas para admins)
   */
  async listUsuarios(filtro?: { aprovado?: boolean; ativo?: boolean }) {
    const where: any = {};

    if (filtro?.aprovado !== undefined) {
      where.aprovado = filtro.aprovado;
    }

    if (filtro?.ativo !== undefined) {
      where.ativo = filtro.ativo;
    }

    const usuarios = await prisma.admin.findMany({
      where,
      select: {
        id: true,
        login: true,
        nome: true,
        email: true,
        role: true,
        aprovado: true,
        ativo: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return usuarios;
  }

  /**
   * Aprova um usuário pendente (apenas para admins)
   */
  async aprovarUsuario(userId: string) {
    const admin = await prisma.admin.findUnique({
      where: { id: userId },
    });

    if (!admin) {
      throw new NotFoundError('Usuário', userId);
    }

    if (admin.aprovado) {
      throw new AppError('Usuário já está aprovado', 400);
    }

    const updated = await prisma.admin.update({
      where: { id: userId },
      data: { aprovado: true },
      select: {
        id: true,
        login: true,
        nome: true,
        email: true,
        role: true,
        aprovado: true,
      },
    });

    return updated;
  }

  /**
   * Rejeita/remove um usuário pendente (apenas para admins)
   */
  async rejeitarUsuario(userId: string) {
    const admin = await prisma.admin.findUnique({
      where: { id: userId },
    });

    if (!admin) {
      throw new NotFoundError('Usuário', userId);
    }

    if (admin.aprovado) {
      throw new AppError('Não é possível rejeitar usuário já aprovado. Use a desativação.', 400);
    }

    await prisma.admin.delete({
      where: { id: userId },
    });

    return true;
  }

  /**
   * Altera role do usuário (apenas para admins)
   */
  async alterarRole(userId: string, novaRole: 'ADMIN' | 'USER') {
    const admin = await prisma.admin.findUnique({
      where: { id: userId },
    });

    if (!admin) {
      throw new NotFoundError('Usuário', userId);
    }

    const updated = await prisma.admin.update({
      where: { id: userId },
      data: { role: novaRole },
      select: {
        id: true,
        login: true,
        nome: true,
        email: true,
        role: true,
        aprovado: true,
      },
    });

    return updated;
  }

  /**
   * Ativa/desativa usuário (apenas para admins)
   */
  async toggleAtivo(userId: string) {
    const admin = await prisma.admin.findUnique({
      where: { id: userId },
    });

    if (!admin) {
      throw new NotFoundError('Usuário', userId);
    }

    const updated = await prisma.admin.update({
      where: { id: userId },
      data: { ativo: !admin.ativo },
      select: {
        id: true,
        login: true,
        nome: true,
        email: true,
        role: true,
        aprovado: true,
        ativo: true,
      },
    });

    return updated;
  }
}

export default new AuthService();
