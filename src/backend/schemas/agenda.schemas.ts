/**
 * Schemas de Validação para Agenda
 *
 * Define os schemas Zod para validação de todos os endpoints de agenda.
 */

import { z } from 'zod';
import { StatusAgenda } from '@prisma/client';

/**
 * Schema para criação de item na agenda
 * POST /api/agenda
 */
export const createAgendaSchema = z.object({
  usuarioId: z
    .string()
    .uuid('ID do usuário deve ser um UUID válido'),
  dataVenc: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')
    .transform((val) => new Date(val))
    .refine((date) => !isNaN(date.getTime()), 'Data inválida'),
  ciclo: z
    .number()
    .int('Ciclo deve ser um número inteiro')
    .min(0, 'Ciclo deve ser maior ou igual a 0'),
  status: z.nativeEnum(StatusAgenda, {
    errorMap: () => ({ message: 'Status deve ser ATIVO ou INATIVO' }),
  }),
});

/**
 * Schema para atualização de item na agenda
 * PUT /api/agenda/:id
 */
export const updateAgendaSchema = z.object({
  dataVenc: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')
    .transform((val) => new Date(val))
    .refine((date) => !isNaN(date.getTime()), 'Data inválida')
    .optional(),
  ciclo: z
    .number()
    .int('Ciclo deve ser um número inteiro')
    .min(0, 'Ciclo deve ser maior ou igual a 0')
    .optional(),
  status: z.nativeEnum(StatusAgenda, {
    errorMap: () => ({ message: 'Status deve ser ATIVO ou INATIVO' }),
  }).optional(),
});

/**
 * Schema para marcar renovação
 * POST /api/agenda/:id/renovar
 */
export const marcarRenouSchema = z.object({
  valor: z
    .number()
    .positive('Valor deve ser positivo')
    .max(999999.99, 'Valor muito alto'),
  dataPagto: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')
    .transform((val) => new Date(val))
    .refine((date) => !isNaN(date.getTime()), 'Data inválida')
    .refine((date) => date <= new Date(), 'Data de pagamento não pode ser futura'),
  metodo: z.enum(['PIX', 'BOLETO', 'CARTAO', 'DINHEIRO', 'TRANSFERENCIA'], {
    errorMap: () => ({ message: 'Método de pagamento inválido' }),
  }),
  conta: z
    .string()
    .min(1, 'Conta é obrigatória')
    .max(50, 'Conta deve ter no máximo 50 caracteres'),
});

/**
 * Schema para marcar cancelamento
 * POST /api/agenda/:id/cancelar
 */
export const marcarCancelouSchema = z.object({
  motivo: z
    .string()
    .min(3, 'Motivo deve ter no mínimo 3 caracteres')
    .max(500, 'Motivo deve ter no máximo 500 caracteres')
    .trim()
    .optional(),
});

/**
 * Schema para filtros de busca na agenda
 * GET /api/agenda
 */
export const agendaFiltersSchema = z.object({
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
  status: z.nativeEnum(StatusAgenda).optional(),
  usuarioId: z.string().uuid().optional(),
  janela: z
    .enum(['hoje', 'proximos7dias', 'vencidos', 'todos'])
    .optional()
    .describe('Janela de tempo para filtrar'),
});
