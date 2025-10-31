/**
 * Schemas de Validação para Despesas
 *
 * Define os schemas Zod para validação de todos os endpoints de despesas.
 */

import { z } from 'zod';

/**
 * Schema para criação de despesa
 * POST /api/despesas
 */
export const createDespesaSchema = z.object({
  descricao: z
    .string()
    .min(3, 'Descrição deve ter no mínimo 3 caracteres')
    .max(200, 'Descrição deve ter no máximo 200 caracteres')
    .trim(),
  valor: z
    .number()
    .positive('Valor deve ser positivo')
    .max(999999.99, 'Valor muito alto')
    .refine((val) => Number(val.toFixed(2)) === val, 'Valor deve ter no máximo 2 casas decimais'),
  dataDespesa: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')
    .transform((val) => new Date(val))
    .refine((date) => !isNaN(date.getTime()), 'Data inválida')
    .refine((date) => date <= new Date(), 'Data da despesa não pode ser futura'),
  categoria: z
    .string()
    .min(1, 'Categoria é obrigatória')
    .max(50, 'Categoria deve ter no máximo 50 caracteres')
    .trim(),
  metodoPagamento: z.enum(['PIX', 'BOLETO', 'CARTAO', 'DINHEIRO', 'TRANSFERENCIA'], {
    errorMap: () => ({ message: 'Método de pagamento inválido' }),
  }),
  conta: z
    .string()
    .min(1, 'Conta é obrigatória')
    .max(50, 'Conta deve ter no máximo 50 caracteres')
    .trim(),
  observacao: z
    .string()
    .max(500, 'Observação deve ter no máximo 500 caracteres')
    .optional()
    .or(z.literal('')),
  recorrente: z
    .boolean()
    .optional()
    .default(false)
    .describe('Indica se a despesa é recorrente'),
});

/**
 * Schema para atualização de despesa
 * PUT /api/despesas/:id
 */
export const updateDespesaSchema = z.object({
  descricao: z
    .string()
    .min(3, 'Descrição deve ter no mínimo 3 caracteres')
    .max(200, 'Descrição deve ter no máximo 200 caracteres')
    .trim()
    .optional(),
  valor: z
    .number()
    .positive('Valor deve ser positivo')
    .max(999999.99, 'Valor muito alto')
    .refine((val) => Number(val.toFixed(2)) === val, 'Valor deve ter no máximo 2 casas decimais')
    .optional(),
  dataDespesa: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')
    .transform((val) => new Date(val))
    .refine((date) => !isNaN(date.getTime()), 'Data inválida')
    .refine((date) => date <= new Date(), 'Data da despesa não pode ser futura')
    .optional(),
  categoria: z
    .string()
    .max(50, 'Categoria deve ter no máximo 50 caracteres')
    .trim()
    .optional(),
  metodoPagamento: z.enum(['PIX', 'BOLETO', 'CARTAO', 'DINHEIRO', 'TRANSFERENCIA'], {
    errorMap: () => ({ message: 'Método de pagamento inválido' }),
  }).optional(),
  conta: z
    .string()
    .max(50, 'Conta deve ter no máximo 50 caracteres')
    .trim()
    .optional(),
  observacao: z
    .string()
    .max(500, 'Observação deve ter no máximo 500 caracteres')
    .optional()
    .or(z.literal('')),
  recorrente: z
    .boolean()
    .optional(),
});

/**
 * Schema para filtros de busca de despesas
 * GET /api/despesas
 */
export const despesaFiltersSchema = z.object({
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
  categoria: z.string().max(50).optional(),
  conta: z.string().max(50).optional(),
  mesRef: z
    .string()
    .regex(/^\d{2}\/\d{4}$/, 'Mês deve estar no formato MM/YYYY')
    .optional(),
  recorrente: z
    .string()
    .optional()
    .transform((val) => val === 'true' ? true : val === 'false' ? false : undefined),
  search: z
    .string()
    .max(100, 'Busca deve ter no máximo 100 caracteres')
    .optional(),
});
