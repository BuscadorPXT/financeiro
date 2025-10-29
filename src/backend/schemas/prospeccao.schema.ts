import { z } from 'zod';

/**
 * Schema de validação para criação de prospecção (lead)
 */
export const createProspeccaoSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email é obrigatório' })
      .email('Email inválido')
      .max(255, 'Email muito longo'),

    nome: z
      .string({ required_error: 'Nome é obrigatório' })
      .min(3, 'Nome deve ter no mínimo 3 caracteres')
      .max(255, 'Nome muito longo'),

    telefone: z
      .string()
      .regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Telefone inválido. Use formato: (11) 98765-4321')
      .optional(),

    origem: z
      .string()
      .max(100, 'Origem muito longa')
      .optional(),

    indicador: z
      .string()
      .max(100, 'Indicador muito longo')
      .optional(),

    convertido: z.boolean().optional(),

    usuarioId: z
      .string()
      .uuid('ID do usuário inválido')
      .optional(),
  }),
});

/**
 * Schema de validação para atualização de prospecção
 */
export const updateProspeccaoSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email('Email inválido')
      .max(255, 'Email muito longo')
      .optional(),

    nome: z
      .string()
      .min(3, 'Nome deve ter no mínimo 3 caracteres')
      .max(255, 'Nome muito longo')
      .optional(),

    telefone: z
      .string()
      .regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Telefone inválido')
      .optional(),

    origem: z
      .string()
      .max(100, 'Origem muito longa')
      .optional(),

    indicador: z
      .string()
      .max(100, 'Indicador muito longo')
      .optional(),

    convertido: z.boolean().optional(),

    usuarioId: z
      .string()
      .uuid('ID do usuário inválido')
      .optional(),
  }),
  params: z.object({
    id: z.string().uuid('ID inválido'),
  }),
});

/**
 * Tipos TypeScript extraídos dos schemas
 */
export type CreateProspeccaoInput = z.infer<typeof createProspeccaoSchema>;
export type UpdateProspeccaoInput = z.infer<typeof updateProspeccaoSchema>;
