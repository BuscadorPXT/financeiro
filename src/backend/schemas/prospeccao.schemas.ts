/**
 * Schemas de Validação para Prospecção
 *
 * Define os schemas Zod para validação de todos os endpoints de prospeccao.
 */

import { z } from 'zod';

/**
 * Schema para criação de prospecção
 * POST /api/prospeccao
 */
export const createProspeccaoSchema = z.object({
  nome: z
    .string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
  email: z
    .string()
    .email('Email inválido')
    .max(100, 'Email deve ter no máximo 100 caracteres')
    .trim()
    .toLowerCase(),
  telefone: z
    .string()
    .regex(/^\d{10,11}$/, 'Telefone deve ter 10 ou 11 dígitos')
    .optional()
    .or(z.literal('')),
  origem: z
    .string()
    .min(1, 'Origem é obrigatória')
    .max(50, 'Origem deve ter no máximo 50 caracteres')
    .trim(),
  indicador: z
    .string()
    .max(50, 'Indicador deve ter no máximo 50 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),
  obs: z
    .string()
    .max(500, 'Observação deve ter no máximo 500 caracteres')
    .optional()
    .or(z.literal('')),
});

/**
 * Schema para atualização de prospecção
 * PUT /api/prospeccao/:id
 */
export const updateProspeccaoSchema = z.object({
  nome: z
    .string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim()
    .optional(),
  email: z
    .string()
    .email('Email inválido')
    .max(100, 'Email deve ter no máximo 100 caracteres')
    .trim()
    .toLowerCase()
    .optional(),
  telefone: z
    .string()
    .regex(/^\d{10,11}$/, 'Telefone deve ter 10 ou 11 dígitos')
    .optional()
    .or(z.literal('')),
  origem: z
    .string()
    .max(50, 'Origem deve ter no máximo 50 caracteres')
    .trim()
    .optional(),
  indicador: z
    .string()
    .max(50, 'Indicador deve ter no máximo 50 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),
  obs: z
    .string()
    .max(500, 'Observação deve ter no máximo 500 caracteres')
    .optional()
    .or(z.literal('')),
  convertido: z
    .boolean()
    .optional()
    .describe('Marca se a prospecção foi convertida em usuário'),
});

/**
 * Schema para converter prospecção em usuário
 * POST /api/prospeccao/:id/converter
 */
export const converterProspeccaoSchema = z.object({
  // Dados adicionais opcionais para a conversão
  telefone: z
    .string()
    .regex(/^\d{10,11}$/, 'Telefone deve ter 10 ou 11 dígitos')
    .optional(),
  indicador: z
    .string()
    .max(50, 'Indicador deve ter no máximo 50 caracteres')
    .trim()
    .optional(),
});

/**
 * Schema para filtros de busca de prospecções
 * GET /api/prospeccao
 */
export const prospeccaoFiltersSchema = z.object({
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
  origem: z.string().max(50).optional(),
  indicador: z.string().max(50).optional(),
  convertido: z
    .string()
    .optional()
    .transform((val) => val === 'true' ? true : val === 'false' ? false : undefined),
  search: z
    .string()
    .max(100, 'Busca deve ter no máximo 100 caracteres')
    .optional(),
});
