import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ConflictError,
} from '../errors';
import logger from '../config/logger';

/**
 * Middleware de tratamento de erros
 *
 * Centraliza o tratamento de todos os erros da aplicação,
 * fornecendo respostas consistentes e logs estruturados.
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Log estruturado do erro
  logger.error('Request Error', {
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    userId: req.user?.id,
    body: req.body,
    query: req.query,
    params: req.params,
    statusCode: error instanceof AppError ? error.statusCode : 500,
    isOperational: error instanceof AppError ? error.isOperational : false,
  });

  // Tratamento de erros operacionais (AppError e suas subclasses)
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      status: 'error',
      code: error.code,
      message: error.message,
      ...(error instanceof ValidationError && error.errors && {
        errors: error.errors,
      }),
    });
  }

  // Tratamento de erros do Prisma
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return handlePrismaError(error, res);
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      status: 'error',
      code: 'VALIDATION_ERROR',
      message: 'Dados inválidos fornecidos',
    });
  }

  // Erro não tratado (bug de programação)
  // Em produção, não vazar detalhes internos
  res.status(500).json({
    status: 'error',
    code: 'INTERNAL_SERVER_ERROR',
    message:
      process.env.NODE_ENV === 'production'
        ? 'Erro interno do servidor'
        : error.message,
    ...(process.env.NODE_ENV !== 'production' && {
      stack: error.stack,
    }),
  });
};

/**
 * Tratamento específico de erros do Prisma
 */
function handlePrismaError(
  error: Prisma.PrismaClientKnownRequestError,
  res: Response
) {
  switch (error.code) {
    // Unique constraint violation
    case 'P2002': {
      const fields = (error.meta?.target as string[]) || [];
      return res.status(409).json({
        status: 'error',
        code: 'UNIQUE_CONSTRAINT',
        message: `Registro duplicado. Campo(s) já existente(s): ${fields.join(', ')}`,
        fields,
      });
    }

    // Foreign key constraint violation
    case 'P2003':
      return res.status(400).json({
        status: 'error',
        code: 'FOREIGN_KEY_CONSTRAINT',
        message: 'Referência inválida. O registro relacionado não existe.',
      });

    // Record not found
    case 'P2025':
      return res.status(404).json({
        status: 'error',
        code: 'NOT_FOUND',
        message: 'Registro não encontrado',
      });

    // Record required but not found
    case 'P2018':
      return res.status(400).json({
        status: 'error',
        code: 'REQUIRED_CONNECTED_RECORD',
        message: 'Registro relacionado obrigatório não encontrado',
      });

    // Too many database connections
    case 'P1001':
      return res.status(503).json({
        status: 'error',
        code: 'DATABASE_UNAVAILABLE',
        message: 'Banco de dados temporariamente indisponível',
      });

    default:
      return res.status(500).json({
        status: 'error',
        code: 'DATABASE_ERROR',
        message:
          process.env.NODE_ENV === 'production'
            ? 'Erro ao processar dados'
            : error.message,
      });
  }
}

/**
 * Wrapper para funções assíncronas
 *
 * Automaticamente captura erros de promises rejeitadas
 * e passa para o error handler.
 *
 * @example
 * router.get('/usuarios', catchAsync(async (req, res) => {
 *   const usuarios = await usuarioService.getAll();
 *   res.json(usuarios);
 * }));
 */
export const catchAsync = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
