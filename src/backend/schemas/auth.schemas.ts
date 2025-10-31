/**
 * Schemas de Validação para Autenticação
 *
 * Define os schemas Zod para validação de todos os endpoints de auth.
 */

import { z } from 'zod';

/**
 * Schema para login
 * POST /api/auth/login
 */
export const loginSchema = z.object({
  login: z
    .string()
    .min(3, 'Login deve ter no mínimo 3 caracteres')
    .max(50, 'Login deve ter no máximo 50 caracteres')
    .trim(),
  senha: z
    .string()
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .max(100, 'Senha deve ter no máximo 100 caracteres'),
});

/**
 * Schema para registro
 * POST /api/auth/register
 */
export const registerSchema = z.object({
  login: z
    .string()
    .min(3, 'Login deve ter no mínimo 3 caracteres')
    .max(50, 'Login deve ter no máximo 50 caracteres')
    .trim()
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Login deve conter apenas letras, números, _ e -'
    ),
  senha: z
    .string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .max(100, 'Senha deve ter no máximo 100 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número'),
  nome: z
    .string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
  email: z
    .string()
    .email('Email inválido')
    .max(100, 'Email deve ter no máximo 100 caracteres')
    .trim()
    .toLowerCase()
    .optional(),
});

/**
 * Schema para troca de senha
 * POST /api/auth/change-password
 */
export const changePasswordSchema = z.object({
  senhaAtual: z
    .string()
    .min(1, 'Senha atual é obrigatória')
    .max(100, 'Senha deve ter no máximo 100 caracteres'),
  senhaNova: z
    .string()
    .min(8, 'Nova senha deve ter no mínimo 8 caracteres')
    .max(100, 'Nova senha deve ter no máximo 100 caracteres')
    .regex(/[A-Z]/, 'Nova senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Nova senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'Nova senha deve conter pelo menos um número'),
});

/**
 * Schema para aprovar usuário
 * POST /api/auth/usuarios/:id/aprovar
 */
export const aprovarUsuarioParamsSchema = z.object({
  id: z.string().uuid('ID deve ser um UUID válido'),
});

/**
 * Schema para alterar role
 * PUT /api/auth/usuarios/:id/role
 */
export const alterarRoleSchema = z.object({
  role: z.enum(['ADMIN', 'USER'], {
    errorMap: () => ({ message: 'Role deve ser ADMIN ou USER' }),
  }),
});

/**
 * Schema para filtros de listagem de usuários
 * GET /api/auth/usuarios
 */
export const listarUsuariosQuerySchema = z.object({
  aprovado: z
    .string()
    .optional()
    .transform((val) => (val === 'true' ? true : val === 'false' ? false : undefined))
    .refine((val) => val === undefined || typeof val === 'boolean', 'Aprovado deve ser true ou false'),
  ativo: z
    .string()
    .optional()
    .transform((val) => (val === 'true' ? true : val === 'false' ? false : undefined))
    .refine((val) => val === undefined || typeof val === 'boolean', 'Ativo deve ser true ou false'),
});
