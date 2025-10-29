import { z } from 'zod';
import { StatusDespesa } from '@prisma/client';

/**
 * Schema de validação para criação de despesa
 */
export const createDespesaSchema = z.object({
  body: z.object({
    categoria: z
      .string({ required_error: 'Categoria é obrigatória' })
      .min(1, 'Categoria não pode estar vazia')
      .max(100, 'Categoria muito longa'),

    descricao: z
      .string({ required_error: 'Descrição é obrigatória' })
      .min(1, 'Descrição não pode estar vazia')
      .max(500, 'Descrição muito longa'),

    conta: z
      .string()
      .max(100, 'Nome da conta muito longo')
      .optional(),

    indicador: z
      .string()
      .max(100, 'Indicador muito longo')
      .optional(),

    valor: z
      .number({ required_error: 'Valor é obrigatório' })
      .positive('Valor deve ser positivo')
      .max(999999.99, 'Valor máximo excedido'),

    status: z.nativeEnum(StatusDespesa, {
      errorMap: () => ({ message: 'Status inválido. Use: PAGO ou PENDENTE' }),
    }).optional(),

    competenciaMes: z
      .number({ required_error: 'Mês de competência é obrigatório' })
      .int('Mês deve ser um número inteiro')
      .min(1, 'Mês deve ser entre 1 e 12')
      .max(12, 'Mês deve ser entre 1 e 12'),

    competenciaAno: z
      .number({ required_error: 'Ano de competência é obrigatório' })
      .int('Ano deve ser um número inteiro')
      .min(2000, 'Ano deve ser maior que 2000')
      .max(2100, 'Ano deve ser menor que 2100'),
  }),
});

/**
 * Schema de validação para atualização de despesa
 */
export const updateDespesaSchema = z.object({
  body: z.object({
    categoria: z
      .string()
      .min(1, 'Categoria não pode estar vazia')
      .max(100, 'Categoria muito longa')
      .optional(),

    descricao: z
      .string()
      .min(1, 'Descrição não pode estar vazia')
      .max(500, 'Descrição muito longa')
      .optional(),

    conta: z
      .string()
      .max(100, 'Nome da conta muito longo')
      .optional(),

    indicador: z
      .string()
      .max(100, 'Indicador muito longo')
      .optional(),

    valor: z
      .number()
      .positive('Valor deve ser positivo')
      .max(999999.99, 'Valor máximo excedido')
      .optional(),

    status: z.nativeEnum(StatusDespesa).optional(),

    competenciaMes: z
      .number()
      .int('Mês deve ser um número inteiro')
      .min(1, 'Mês deve ser entre 1 e 12')
      .max(12, 'Mês deve ser entre 1 e 12')
      .optional(),

    competenciaAno: z
      .number()
      .int('Ano deve ser um número inteiro')
      .min(2000, 'Ano deve ser maior que 2000')
      .max(2100, 'Ano deve ser menor que 2100')
      .optional(),
  }),
  params: z.object({
    id: z.string().uuid('ID inválido'),
  }),
});

/**
 * Tipos TypeScript extraídos dos schemas
 */
export type CreateDespesaInput = z.infer<typeof createDespesaSchema>;
export type UpdateDespesaInput = z.infer<typeof updateDespesaSchema>;
