import { z } from 'zod';

/**
 * Schema de validação para criação de usuário
 */
export const createUsuarioSchema = z.object({
  body: z.object({
    emailLogin: z
      .string({ required_error: 'Email é obrigatório' })
      .email('Email inválido')
      .max(255, 'Email muito longo'),

    nomeCompleto: z
      .string({ required_error: 'Nome completo é obrigatório' })
      .min(3, 'Nome deve ter no mínimo 3 caracteres')
      .max(255, 'Nome muito longo'),

    telefone: z
      .string()
      .regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Telefone inválido. Use formato: (11) 98765-4321')
      .optional(),

    indicador: z
      .string()
      .max(100, 'Indicador muito longo')
      .optional(),

    obs: z
      .string()
      .max(500, 'Observação muito longa')
      .optional(),
  }),
});

/**
 * Schema de validação para atualização de usuário
 */
export const updateUsuarioSchema = z.object({
  body: z.object({
    emailLogin: z
      .string()
      .email('Email inválido')
      .max(255, 'Email muito longo')
      .optional(),

    nomeCompleto: z
      .string()
      .min(3, 'Nome deve ter no mínimo 3 caracteres')
      .max(255, 'Nome muito longo')
      .optional(),

    telefone: z
      .string()
      .regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Telefone inválido')
      .optional(),

    indicador: z
      .string()
      .max(100, 'Indicador muito longo')
      .optional(),

    obs: z
      .string()
      .max(500, 'Observação muito longa')
      .optional(),
  }),
  params: z.object({
    id: z.string().uuid('ID inválido'),
  }),
});

/**
 * Schema de validação para parâmetros com ID
 */
export const idParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID inválido'),
  }),
});

/**
 * Tipos TypeScript extraídos dos schemas
 */
export type CreateUsuarioInput = z.infer<typeof createUsuarioSchema>;
export type UpdateUsuarioInput = z.infer<typeof updateUsuarioSchema>;
