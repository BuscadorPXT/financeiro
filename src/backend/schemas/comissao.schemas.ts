/**
 * Schemas de Validação para Comissões
 *
 * Define os schemas Zod para validação de todos os endpoints de comissões.
 */

import { z } from 'zod';
import { RegraTipo } from '@prisma/client';

/**
 * Schema para criação de comissão
 * POST /api/comissoes
 */
export const createComissaoSchema = z.object({
  pagamentoId: z
    .string()
    .uuid('ID do pagamento deve ser um UUID válido'),
  indicador: z
    .string()
    .min(1, 'Indicador é obrigatório')
    .max(50, 'Indicador deve ter no máximo 50 caracteres')
    .trim(),
  regraTipo: z.nativeEnum(RegraTipo, {
    errorMap: () => ({ message: 'Tipo de regra deve ser PRIMEIRO ou RECORRENTE' }),
  }),
  valor: z
    .number()
    .min(0, 'Valor deve ser maior ou igual a 0')
    .max(999999.99, 'Valor muito alto')
    .refine((val) => Number(val.toFixed(2)) === val, 'Valor deve ter no máximo 2 casas decimais'),
  mesRef: z
    .string()
    .regex(/^\d{2}\/\d{4}$/, 'Mês deve estar no formato MM/YYYY'),
});

/**
 * Schema para atualização de comissão
 * PUT /api/comissoes/:id
 */
export const updateComissaoSchema = z.object({
  indicador: z
    .string()
    .min(1, 'Indicador é obrigatório')
    .max(50, 'Indicador deve ter no máximo 50 caracteres')
    .trim()
    .optional(),
  regraTipo: z.nativeEnum(RegraTipo, {
    errorMap: () => ({ message: 'Tipo de regra deve ser PRIMEIRO ou RECORRENTE' }),
  }).optional(),
  valor: z
    .number()
    .min(0, 'Valor deve ser maior ou igual a 0')
    .max(999999.99, 'Valor muito alto')
    .refine((val) => Number(val.toFixed(2)) === val, 'Valor deve ter no máximo 2 casas decimais')
    .optional(),
  mesRef: z
    .string()
    .regex(/^\d{2}\/\d{4}$/, 'Mês deve estar no formato MM/YYYY')
    .optional(),
});

/**
 * Schema para filtros de busca de comissões
 * GET /api/comissoes
 */
export const comissaoFiltersSchema = z.object({
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
  indicador: z.string().max(50).optional(),
  regraTipo: z.nativeEnum(RegraTipo).optional(),
  mesRef: z
    .string()
    .regex(/^\d{2}\/\d{4}$/, 'Mês deve estar no formato MM/YYYY')
    .optional(),
});

/**
 * Schema para extrato por indicador
 * GET /api/comissoes/extrato/:indicador
 */
export const extratoIndicadorParamSchema = z.object({
  indicador: z
    .string()
    .min(1, 'Indicador é obrigatório')
    .max(50, 'Indicador deve ter no máximo 50 caracteres')
    .trim(),
});
