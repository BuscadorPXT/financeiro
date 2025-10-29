import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { HTTP_STATUS } from '../../shared/constants';

/**
 * Middleware de validação usando Zod schemas
 *
 * @param schema - Schema Zod para validar a requisição
 * @returns Middleware Express que valida req.body, req.query e req.params
 *
 * @example
 * router.post('/usuarios', validate(createUsuarioSchema), usuarioController.create);
 */
export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Valida req.body, req.query e req.params
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Formata erros de validação do Zod
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          status: 'error',
          message: 'Erro de validação',
          errors,
        });
      }

      // Erro inesperado
      next(error);
    }
  };
};

/**
 * Middleware de validação apenas para body
 * Útil quando não há params ou query para validar
 */
export const validateBody = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          status: 'error',
          message: 'Erro de validação',
          errors,
        });
      }

      next(error);
    }
  };
};
