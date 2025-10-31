/**
 * Schemas de Validação para Listas Auxiliares
 *
 * Define os schemas Zod para validação de todos os endpoints de listas.
 */

import { z } from 'zod';
import { TipoLista } from '@prisma/client';

/**
 * Schema para criação de item de lista
 * POST /api/listas
 */
export const createListaSchema = z.object({
  tipo: z.nativeEnum(TipoLista, {
    errorMap: () => ({ message: 'Tipo deve ser CONTA, METODO, CATEGORIA ou INDICADOR' }),
  }),
  valor: z
    .string()
    .min(1, 'Valor é obrigatório')
    .max(100, 'Valor deve ter no máximo 100 caracteres')
    .trim(),
  ativo: z
    .boolean()
    .optional()
    .default(true),
});

/**
 * Schema para atualização de item de lista
 * PUT /api/listas/:id
 */
export const updateListaSchema = z.object({
  valor: z
    .string()
    .min(1, 'Valor é obrigatório')
    .max(100, 'Valor deve ter no máximo 100 caracteres')
    .trim()
    .optional(),
  ativo: z
    .boolean()
    .optional(),
});

/**
 * Schema para parâmetro de tipo
 * GET /api/listas/tipo/:tipo
 */
export const tipoParamSchema = z.object({
  tipo: z.nativeEnum(TipoLista, {
    errorMap: () => ({ message: 'Tipo deve ser CONTA, METODO, CATEGORIA ou INDICADOR' }),
  }),
});
