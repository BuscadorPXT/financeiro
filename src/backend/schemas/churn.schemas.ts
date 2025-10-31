/**
 * Schemas de Validação para Churn
 *
 * Define os schemas Zod para validação de todos os endpoints de churn.
 */

import { z } from 'zod';

/**
 * Schema para criação de registro de churn
 * POST /api/churn
 */
export const createChurnSchema = z.object({
  usuarioId: z
    .string()
    .uuid('ID do usuário deve ser um UUID válido'),
  dataChurn: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')
    .transform((val) => new Date(val))
    .refine((date) => !isNaN(date.getTime()), 'Data inválida')
    .refine((date) => date <= new Date(), 'Data de churn não pode ser futura'),
  motivo: z
    .string()
    .min(3, 'Motivo deve ter no mínimo 3 caracteres')
    .max(500, 'Motivo deve ter no máximo 500 caracteres')
    .trim(),
});

/**
 * Schema para atualização de registro de churn
 * PUT /api/churn/:id
 */
export const updateChurnSchema = z.object({
  dataChurn: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')
    .transform((val) => new Date(val))
    .refine((date) => !isNaN(date.getTime()), 'Data inválida')
    .refine((date) => date <= new Date(), 'Data de churn não pode ser futura')
    .optional(),
  motivo: z
    .string()
    .min(3, 'Motivo deve ter no mínimo 3 caracteres')
    .max(500, 'Motivo deve ter no máximo 500 caracteres')
    .trim()
    .optional(),
});

/**
 * Schema para reverter churn
 * POST /api/churn/:id/reverter
 */
export const reverterChurnSchema = z.object({
  observacao: z
    .string()
    .max(500, 'Observação deve ter no máximo 500 caracteres')
    .optional(),
});

/**
 * Schema para filtros de busca de churn
 * GET /api/churn
 */
export const churnFiltersSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .refine((val) => val > 0, 'Página deve ser maior que 0'),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .refine((val) => val > 0 && val <= 50000, 'Limite deve estar entre 1 e 50000'),
  usuarioId: z.string().uuid().optional(),
  revertido: z
    .string()
    .optional()
    .transform((val) => val === 'true' ? true : val === 'false' ? false : undefined),
  mesRef: z
    .string()
    .regex(/^\d{2}\/\d{4}$/, 'Mês deve estar no formato MM/YYYY')
    .optional(),
});
