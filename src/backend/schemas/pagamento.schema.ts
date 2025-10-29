import { z } from 'zod';
import { MetodoPagamento, RegraTipo } from '@prisma/client';

/**
 * Schema de validação para criação de pagamento
 */
export const createPagamentoSchema = z.object({
  body: z.object({
    usuarioId: z
      .string({ required_error: 'ID do usuário é obrigatório' })
      .uuid('ID do usuário inválido'),

    dataPagto: z
      .string({ required_error: 'Data do pagamento é obrigatória' })
      .refine((date) => !isNaN(Date.parse(date)), {
        message: 'Data inválida. Use formato ISO 8601 (YYYY-MM-DD)',
      })
      .transform((date) => new Date(date)),

    valor: z
      .number({ required_error: 'Valor é obrigatório' })
      .positive('Valor deve ser positivo')
      .max(999999.99, 'Valor máximo excedido'),

    metodo: z.nativeEnum(MetodoPagamento, {
      errorMap: () => ({ message: 'Método de pagamento inválido. Use: PIX, CREDITO ou DINHEIRO' }),
    }),

    conta: z
      .string({ required_error: 'Conta é obrigatória' })
      .min(1, 'Conta não pode estar vazia')
      .max(100, 'Nome da conta muito longo'),

    regraTipo: z.nativeEnum(RegraTipo, {
      errorMap: () => ({ message: 'Tipo de regra inválido. Use: PRIMEIRO ou RECORRENTE' }),
    }),

    regraValor: z
      .number()
      .min(0, 'Valor da regra deve ser positivo')
      .max(100, 'Valor da regra máximo é 100%')
      .optional(),

    elegivelComissao: z.boolean().optional(),

    observacao: z
      .string()
      .max(500, 'Observação muito longa')
      .optional(),
  }),
});

/**
 * Schema de validação para atualização de pagamento
 */
export const updatePagamentoSchema = z.object({
  body: z.object({
    dataPagto: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), {
        message: 'Data inválida',
      })
      .transform((date) => new Date(date))
      .optional(),

    valor: z
      .number()
      .positive('Valor deve ser positivo')
      .max(999999.99, 'Valor máximo excedido')
      .optional(),

    metodo: z.nativeEnum(MetodoPagamento).optional(),

    conta: z
      .string()
      .min(1, 'Conta não pode estar vazia')
      .max(100, 'Nome da conta muito longo')
      .optional(),

    observacao: z
      .string()
      .max(500, 'Observação muito longa')
      .optional(),
  }),
  params: z.object({
    id: z.string().uuid('ID inválido'),
  }),
});

/**
 * Tipos TypeScript extraídos dos schemas
 */
export type CreatePagamentoInput = z.infer<typeof createPagamentoSchema>;
export type UpdatePagamentoInput = z.infer<typeof updatePagamentoSchema>;
