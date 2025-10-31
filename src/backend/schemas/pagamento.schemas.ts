/**
 * Schemas de Validação para Pagamentos
 *
 * Define os schemas Zod para validação de todos os endpoints de pagamentos.
 */

import { z } from 'zod';
import { RegraTipo, MetodoPagamento } from '@prisma/client';

/**
 * Schema para criação de pagamento
 * POST /api/pagamentos
 */
export const createPagamentoSchema = z.object({
  usuarioId: z
    .string()
    .uuid('ID do usuário deve ser um UUID válido'),
  valor: z
    .number()
    .positive('Valor deve ser positivo')
    .max(999999.99, 'Valor muito alto')
    .refine((val) => Number(val.toFixed(2)) === val, 'Valor deve ter no máximo 2 casas decimais'),
  dataPagto: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')
    .transform((val) => new Date(val))
    .refine((date) => !isNaN(date.getTime()), 'Data inválida')
    .refine((date) => date <= new Date(), 'Data de pagamento não pode ser futura'),
  metodo: z.nativeEnum(MetodoPagamento, {
    errorMap: () => ({ message: 'Método de pagamento inválido' }),
  }),
  conta: z
    .string()
    .min(1, 'Conta é obrigatória')
    .max(50, 'Conta deve ter no máximo 50 caracteres')
    .trim(),
  regraTipo: z.nativeEnum(RegraTipo, {
    errorMap: () => ({ message: 'Tipo de regra deve ser PRIMEIRO ou RECORRENTE' }),
  }),
  regraValor: z
    .number()
    .min(0, 'Valor da regra deve ser maior ou igual a 0')
    .max(100, 'Valor da regra deve ser no máximo 100%')
    .optional(),
  elegivelComissao: z
    .boolean()
    .optional()
    .describe('Se não informado, será calculado automaticamente baseado no indicador'),
  obs: z
    .string()
    .max(500, 'Observação deve ter no máximo 500 caracteres')
    .optional()
    .or(z.literal('')),
});

/**
 * Schema para atualização de pagamento
 * PUT /api/pagamentos/:id
 */
export const updatePagamentoSchema = z.object({
  valor: z
    .number()
    .positive('Valor deve ser positivo')
    .max(999999.99, 'Valor muito alto')
    .refine((val) => Number(val.toFixed(2)) === val, 'Valor deve ter no máximo 2 casas decimais')
    .optional(),
  dataPagto: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')
    .transform((val) => new Date(val))
    .refine((date) => !isNaN(date.getTime()), 'Data inválida')
    .refine((date) => date <= new Date(), 'Data de pagamento não pode ser futura')
    .optional(),
  metodo: z.nativeEnum(MetodoPagamento, {
    errorMap: () => ({ message: 'Método de pagamento inválido' }),
  }).optional(),
  conta: z
    .string()
    .min(1, 'Conta é obrigatória')
    .max(50, 'Conta deve ter no máximo 50 caracteres')
    .trim()
    .optional(),
  obs: z
    .string()
    .max(500, 'Observação deve ter no máximo 500 caracteres')
    .optional()
    .or(z.literal('')),
});

/**
 * Schema para filtros de busca de pagamentos
 * GET /api/pagamentos
 */
export const pagamentoFiltersSchema = z.object({
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
  usuarioId: z
    .string()
    .uuid('ID do usuário deve ser um UUID válido')
    .optional(),
  metodo: z.nativeEnum(MetodoPagamento).optional(),
  conta: z.string().max(50).optional(),
  regraTipo: z.nativeEnum(RegraTipo).optional(),
  elegivelComissao: z
    .string()
    .optional()
    .transform((val) => val === 'true' ? true : val === 'false' ? false : undefined),
  mesRef: z
    .string()
    .regex(/^\d{2}\/\d{4}$/, 'Mês de referência deve estar no formato MM/YYYY')
    .optional(),
});
