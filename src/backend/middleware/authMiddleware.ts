import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler';
import prisma from '../../database/client';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

// Estender interface Request do Express
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        login: string;
      };
    }
  }
}

/**
 * Middleware para verificar autenticação JWT
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
      throw new AppError('Token não fornecido', 401);
    }

    const token = authHeader.substring(7); // Remove "Bearer "

    // Verificar token
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      login: string;
    };

    // Verificar se usuário ainda existe e está ativo
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.id },
    });

    if (!admin || !admin.ativo) {
      throw new AppError('Usuário não autorizado', 401);
    }

    // Adicionar usuário ao request
    req.user = {
      id: decoded.id,
      login: decoded.login,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError('Token inválido', 401));
    }
    if (error instanceof jwt.TokenExpiredError) {
      return next(new AppError('Token expirado', 401));
    }
    next(error);
  }
};

/**
 * Middleware opcional - pode ser aplicado em rotas específicas
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
      const decoded = jwt.verify(token, JWT_SECRET) as {
        id: string;
        login: string;
      };

      req.user = {
        id: decoded.id,
        login: decoded.login,
      };
    }

    next();
  } catch (error) {
    // Ignora erros de autenticação, continua sem usuário
    next();
  }
};
