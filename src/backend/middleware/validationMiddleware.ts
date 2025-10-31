/**
 * Middleware de Validação com Zod
 *
 * Valida request body, query params e route params usando schemas Zod.
 * Retorna erros de validação formatados com status 400.
 */

import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { AppError } from '../errors';

/**
 * Schema de validação que pode incluir body, query e params
 */
export interface ValidationSchema {
  body?: AnyZodObject;
  query?: AnyZodObject;
  params?: AnyZodObject;
}

/**
 * Middleware que valida o request usando schemas Zod
 *
 * @param schema - Schema Zod ou objeto com schemas para body/query/params
 * @returns Express middleware function
 *
 * @example
 * // Validar apenas body
 * router.post('/usuarios', validate(createUsuarioSchema), controller.create);
 *
 * // Validar body e params
 * router.put('/usuarios/:id', validate({
 *   params: idParamSchema,
 *   body: updateUsuarioSchema
 * }), controller.update);
 */
export const validate = (schema: AnyZodObject | ValidationSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Se o schema tem body/query/params separados
      if ('body' in schema || 'query' in schema || 'params' in schema) {
        const validationSchema = schema as ValidationSchema;

        // Validar body se schema fornecido
        if (validationSchema.body) {
          req.body = await validationSchema.body.parseAsync(req.body);
        }

        // Validar query se schema fornecido
        if (validationSchema.query) {
          req.query = await validationSchema.query.parseAsync(req.query);
        }

        // Validar params se schema fornecido
        if (validationSchema.params) {
          req.params = await validationSchema.params.parseAsync(req.params);
        }
      } else {
        // Schema único para body (retrocompatibilidade)
        req.body = await (schema as AnyZodObject).parseAsync(req.body);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Formata erros de validação do Zod
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        // Retorna erro 400 com detalhes de validação
        return res.status(400).json({
          status: 'error',
          message: 'Erro de validação',
          errors: formattedErrors,
        });
      }

      // Outros erros passam para o error handler
      next(error);
    }
  };
};

/**
 * Cria um schema para validação de ID no params
 * Uso: validate({ params: idParamSchema })
 */
import { z } from 'zod';

export const idParamSchema = z.object({
  id: z.string().uuid('ID deve ser um UUID válido'),
});

/**
 * Schema para paginação em query params
 * Uso: validate({ query: paginationSchema })
 */
export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .refine((val) => val > 0, 'Página deve ser maior que 0'),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .refine((val) => val > 0 && val <= 100, 'Limite deve estar entre 1 e 100'),
});

/**
 * Helper para criar schema de filtros de status
 */
export const createStatusFilterSchema = <T extends string>(
  statusEnum: Record<string, T>
) => {
  return z.object({
    status: z
      .nativeEnum(statusEnum as any)
      .optional()
      .describe('Status para filtrar'),
  });
};
