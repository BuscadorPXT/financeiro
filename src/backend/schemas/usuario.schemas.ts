/**
 * Schemas de Validação para Usuários
 *
 * Define os schemas Zod para validação de todos os endpoints de usuarios.
 */

import { z } from 'zod';
import { StatusFinal } from '@prisma/client';

/**
 * Schema para criação de usuário
 * POST /api/usuarios
 */
export const createUsuarioSchema = z.object({
  emailLogin: z
    .string()
    .email('Email inválido')
    .max(100, 'Email deve ter no máximo 100 caracteres')
    .trim()
    .toLowerCase(),
  nomeCompleto: z
    .string()
    .min(3, 'Nome completo deve ter no mínimo 3 caracteres')
    .max(100, 'Nome completo deve ter no máximo 100 caracteres')
    .trim(),
  telefone: z
    .string()
    .regex(/^\d{10,11}$/, 'Telefone deve ter 10 ou 11 dígitos')
    .optional()
    .or(z.literal('')),
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
 * Schema para atualização de usuário
 * PUT /api/usuarios/:id
 */
export const updateUsuarioSchema = z.object({
  emailLogin: z
    .string()
    .email('Email inválido')
    .max(100, 'Email deve ter no máximo 100 caracteres')
    .trim()
    .toLowerCase()
    .optional(),
  nomeCompleto: z
    .string()
    .min(3, 'Nome completo deve ter no mínimo 3 caracteres')
    .max(100, 'Nome completo deve ter no máximo 100 caracteres')
    .trim()
    .optional(),
  telefone: z
    .string()
    .regex(/^\d{10,11}$/, 'Telefone deve ter 10 ou 11 dígitos')
    .optional()
    .or(z.literal('')),
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
  ciclo: z
    .number()
    .int('Ciclo deve ser um número inteiro')
    .min(0, 'Ciclo deve ser maior ou igual a 0')
    .optional(),
});

/**
 * Schema para filtros de busca de usuários
 * GET /api/usuarios
 */
export const usuarioFiltersSchema = z.object({
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
  status: z
    .nativeEnum(StatusFinal)
    .optional()
    .describe('Status para filtrar (ATIVO, EM_ATRASO, INATIVO, HISTORICO)'),
  search: z
    .string()
    .max(100, 'Busca deve ter no máximo 100 caracteres')
    .optional(),
  indicador: z
    .string()
    .max(50, 'Indicador deve ter no máximo 50 caracteres')
    .optional(),
  venceHoje: z
    .string()
    .optional()
    .transform((val) => val === 'true'),
  prox7Dias: z
    .string()
    .optional()
    .transform((val) => val === 'true'),
  emAtraso: z
    .string()
    .optional()
    .transform((val) => val === 'true'),
});

/**
 * Schema para importação em massa
 * POST /api/usuarios/import
 */
export const importUsuariosSchema = z.object({
  usuarios: z
    .array(
      z.object({
        emailLogin: z.string().email('Email inválido').toLowerCase(),
        nomeCompleto: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
        telefone: z.string().regex(/^\d{10,11}$/).optional(),
        indicador: z.string().optional(),
        obs: z.string().optional(),
      })
    )
    .min(1, 'Deve haver pelo menos um usuário para importar')
    .max(1000, 'Máximo de 1000 usuários por importação'),
});

/**
 * Schema para pagamento rápido
 * POST /api/usuarios/:id/pagamento-rapido
 */
export const pagamentoRapidoSchema = z.object({
  valor: z
    .number()
    .positive('Valor deve ser positivo')
    .max(999999.99, 'Valor muito alto'),
  dataPagto: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')
    .transform((val) => new Date(val))
    .refine((date) => !isNaN(date.getTime()), 'Data inválida'),
  metodo: z.enum(['PIX', 'BOLETO', 'CARTAO', 'DINHEIRO', 'TRANSFERENCIA'], {
    errorMap: () => ({ message: 'Método de pagamento inválido' }),
  }),
  conta: z
    .string()
    .min(1, 'Conta é obrigatória')
    .max(50, 'Conta deve ter no máximo 50 caracteres'),
});
