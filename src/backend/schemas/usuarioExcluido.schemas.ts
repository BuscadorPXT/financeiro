/**
 * Schemas de Validação para Usuários Excluídos
 *
 * Define os schemas Zod para validação de endpoints de histórico de exclusões.
 */

import { z } from 'zod';
import { StatusFinal } from '@prisma/client';

/**
 * Schema para filtros de busca de usuários excluídos
 * GET /api/usuarios-excluidos
 */
export const usuarioExcluidoFiltersSchema = z.object({
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
  statusFinal: z.nativeEnum(StatusFinal).optional(),
  indicador: z.string().max(50).optional(),
  excluidoPor: z.string().uuid().optional(),
  search: z
    .string()
    .max(100, 'Busca deve ter no máximo 100 caracteres')
    .optional(),
});

/**
 * Schema para parâmetro de email
 * GET /api/usuarios-excluidos/buscar/:email
 */
export const emailParamSchema = z.object({
  email: z
    .string()
    .email('Email inválido')
    .max(100, 'Email deve ter no máximo 100 caracteres')
    .trim()
    .toLowerCase(),
});
