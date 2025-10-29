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

    // Hash da nova senha (8 rounds para melhor performance)
    const senhaHash = await bcrypt.hash(senhaNova, 8);

    // Atualizar senha
    await prisma.admin.update({
      where: { id: userId },
      data: { senha: senhaHash },
    });

    return true;
  }

  /**
   * Cria primeiro admin (seed)
   */
  async createAdmin(login: string, senha: string, nome: string) {
    // Hash da senha (8 rounds para melhor performance)
    const senhaHash = await bcrypt.hash(senha, 8);

    const admin = await prisma.admin.create({
      data: {
        login,
        senha: senhaHash,
        nome,
      },
    });

    return {
      id: admin.id,
      login: admin.login,
      nome: admin.nome,
    };
  }

  /**
   * Logout - adiciona token à blacklist
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
      // Ignora erros de decodificação
      throw new AppError('Erro ao fazer logout', 500);
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
  verifyToken(token: string): { id: string; login: string } {
    try {
      // Verificar se está na blacklist
      if (this.isTokenBlacklisted(token)) {
        throw new UnauthorizedError('Token foi revogado');
      }

      // Verificar assinatura, expiração, issuer e audience
      const decoded = jwt.verify(token, JWT_SECRET, {
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
      }) as { id: string; login: string };

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
}

export default new AuthService();
