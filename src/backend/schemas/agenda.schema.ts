import { z } from 'zod';
import { StatusAgenda } from '@prisma/client';

/**
 * Schema de validação para criação de item de agenda
 */
export const createAgendaSchema = z.object({
  body: z.object({
    usuarioId: z
      .string({ required_error: 'ID do usuário é obrigatório' })
      .uuid('ID do usuário inválido'),

    dataVenc: z
      .string({ required_error: 'Data de vencimento é obrigatória' })
      .refine((date) => !isNaN(Date.parse(date)), {
        message: 'Data inválida. Use formato ISO 8601 (YYYY-MM-DD)',
      })
      .transform((date) => new Date(date)),

    diasParaVencer: z
      .number({ required_error: 'Dias para vencer é obrigatório' })
      .int('Dias para vencer deve ser um número inteiro'),

    status: z.nativeEnum(StatusAgenda, {
      errorMap: () => ({ message: 'Status inválido. Use: ATIVO ou INATIVO' }),
    }).optional(),

    ciclo: z
      .number({ required_error: 'Ciclo é obrigatório' })
      .int('Ciclo deve ser um número inteiro')
      .min(0, 'Ciclo não pode ser negativo'),

    renovou: z.boolean().optional(),

    cancelou: z.boolean().optional(),
  }),
});

/**
 * Schema de validação para atualização de item de agenda
 */
export const updateAgendaSchema = z.object({
  body: z.object({
    dataVenc: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), {
        message: 'Data inválida',
      })
      .transform((date) => new Date(date))
      .optional(),

    diasParaVencer: z
      .number()
      .int('Dias para vencer deve ser um número inteiro')
      .optional(),

    status: z.nativeEnum(StatusAgenda).optional(),

    ciclo: z
      .number()
      .int('Ciclo deve ser um número inteiro')
      .min(0, 'Ciclo não pode ser negativo')
      .optional(),

    renovou: z.boolean().optional(),

    cancelou: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().uuid('ID inválido'),
  }),
});

/**
 * Tipos TypeScript extraídos dos schemas
 */
export type CreateAgendaInput = z.infer<typeof createAgendaSchema>;
export type UpdateAgendaInput = z.infer<typeof updateAgendaSchema>;
