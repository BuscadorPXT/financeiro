import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../errors';
import prisma from '../../database/client';
import authService from '../services/authService';

// Estender interface Request do Express
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        login: string;
        role: string;
      };
    }
  }
}

/**
 * Middleware para verificar autenticação JWT
 * Inclui: validação de assinatura, expiração, issuer, audience, blacklist
 */
export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    // Pegar token do header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Token não fornecido');
    }

    const token = authHeader.substring(7); // Remove "Bearer "

    // Verificar token com todas as validações de segurança
    // (assinatura, expiração, issuer, audience, blacklist)
    const decoded = authService.verifyToken(token);

    // Verificar se usuário ainda existe e está ativo
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.id },
    });

    if (!admin || !admin.ativo) {
      throw new UnauthorizedError('Usuário não autorizado');
    }

    // Adicionar usuário ao request
    req.user = {
      id: decoded.id,
      login: decoded.login,
      role: decoded.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware opcional - pode ser aplicado em rotas específicas
 * Se token válido, adiciona user ao request. Se inválido, continua sem user.
 */
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = authService.verifyToken(token);

      req.user = {
        id: decoded.id,
        login: decoded.login,
        role: decoded.role,
      };
    }

    next();
  } catch (error) {
    // Ignora erros de autenticação, continua sem usuário
    next();
  }
};

/**
 * Middleware para verificar se usuário é admin
 * Deve ser usado após o middleware authenticate
 */
export const requireAdmin = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Usuário não autenticado');
    }

    if (req.user.role !== 'ADMIN') {
      throw new UnauthorizedError('Acesso negado. Apenas administradores podem acessar este recurso.');
    }

    next();
  } catch (error) {
    next(error);
  }
};
