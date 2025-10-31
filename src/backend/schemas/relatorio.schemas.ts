/**
 * Schemas de Validação para Relatórios
 *
 * Define os schemas Zod para validação de query parameters de relatórios.
 */

import { z } from 'zod';

/**
 * Schema para filtros de relatórios com período
 * Usado em vários endpoints de relatórios
 */
export const periodoQuerySchema = z.object({
  dataInicio: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')
    .transform((val) => new Date(val))
    .refine((date) => !isNaN(date.getTime()), 'Data inicial inválida')
    .optional(),
  dataFim: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')
    .transform((val) => new Date(val))
    .refine((date) => !isNaN(date.getTime()), 'Data final inválida')
    .optional(),
  mesRef: z
    .string()
    .regex(/^\d{2}\/\d{4}$/, 'Mês deve estar no formato MM/YYYY')
    .optional(),
  ano: z
    .string()
    .regex(/^\d{4}$/, 'Ano deve ter 4 dígitos')
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 2000 && val <= 2100, 'Ano deve estar entre 2000 e 2100')
    .optional(),
  mes: z
    .string()
    .regex(/^\d{1,2}$/, 'Mês deve ter 1 ou 2 dígitos')
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 1 && val <= 12, 'Mês deve estar entre 1 e 12')
    .optional(),
});

/**
 * Schema para relatório financeiro
 * GET /api/relatorios/financeiro
 */
export const relatorioFinanceiroQuerySchema = periodoQuerySchema.extend({
  agruparPor: z.enum(['mes', 'categoria', 'indicador']).optional(),
});

/**
 * Schema para relatório de usuários
 * GET /api/relatorios/usuarios
 */
export const relatorioUsuariosQuerySchema = periodoQuerySchema.extend({
  statusFinal: z.enum(['ATIVO', 'EM_ATRASO', 'INATIVO', 'HISTORICO']).optional(),
  indicador: z.string().max(50).optional(),
});

/**
 * Schema para desempenho mensal
 * GET /api/relatorios/desempenho-mensal
 */
export const desempenhoMensalQuerySchema = z.object({
  meses: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 12))
    .refine((val) => val >= 1 && val <= 36, 'Meses deve estar entre 1 e 36'),
});
