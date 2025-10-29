/**
 * React Query hooks for Usuario CRUD operations
 *
 * Benefícios sobre o hook anterior:
 * - Cache automático de 5 minutos
 * - Loading states automáticos
 * - Invalidação inteligente após mutations
 * - Menos re-renders desnecessários
 * - Background refetch
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import usuarioService from '../services/usuarioService';
import type { CreateUsuarioDTO, UpdateUsuarioDTO } from '../services/usuarioService';

// Query keys - centralizados para fácil manutenção
export const usuarioKeys = {
  all: ['usuarios'] as const,
  lists: () => [...usuarioKeys.all, 'list'] as const,
  list: (filters?: any) => [...usuarioKeys.lists(), { filters }] as const,
  details: () => [...usuarioKeys.all, 'detail'] as const,
  detail: (id: string) => [...usuarioKeys.details(), id] as const,
};

/**
 * Hook para buscar todos os usuários
 * - Cache de 5 minutos
 * - Refetch automático ao montar o componente
 */
export function useUsuarios() {
  return useQuery({
    queryKey: usuarioKeys.lists(),
    queryFn: () => usuarioService.getAll(),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook para buscar um usuário específico por ID
 */
export function useUsuario(id: string) {
  return useQuery({
    queryKey: usuarioKeys.detail(id),
    queryFn: () => usuarioService.getById(id),
    enabled: !!id, // Só executa se id existir
  });
}

/**
 * Hook para criar novo usuário
 * - Invalida cache de usuários após sucesso
 * - Retorna loading e error states automáticos
 */
export function useCreateUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUsuarioDTO) => usuarioService.create(data),
    onSuccess: () => {
      // Invalida lista de usuários para forçar refetch
      queryClient.invalidateQueries({ queryKey: usuarioKeys.lists() });
    },
  });
}

/**
 * Hook para atualizar usuário
 * - Invalida cache do usuário específico e lista
 */
export function useUpdateUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUsuarioDTO }) =>
      usuarioService.update(id, data),
    onSuccess: (_updatedUsuario, variables) => {
      // Invalida o usuário específico
      queryClient.invalidateQueries({ queryKey: usuarioKeys.detail(variables.id) });
      // Invalida a lista
      queryClient.invalidateQueries({ queryKey: usuarioKeys.lists() });
    },
  });
}

/**
 * Hook para deletar usuário
 * - Remove do cache após sucesso
 */
export function useDeleteUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usuarioService.delete(id),
    onSuccess: (_data, id) => {
      // Remove do cache o usuário específico
      queryClient.removeQueries({ queryKey: usuarioKeys.detail(id) });
      // Invalida a lista
      queryClient.invalidateQueries({ queryKey: usuarioKeys.lists() });
    },
  });
}

/**
 * Hook legado para compatibilidade com código existente
 * @deprecated Use useUsuarios() + useCreateUsuario() + useUpdateUsuario() + useDeleteUsuario() separadamente
 */
export const useUsuariosLegacy = () => {
  const { data: usuarios = [], isLoading: loading, error: queryError } = useUsuarios();
  const createMutation = useCreateUsuario();
  const updateMutation = useUpdateUsuario();
  const deleteMutation = useDeleteUsuario();
  const queryClient = useQueryClient();

  const fetchAll = async () => {
    await queryClient.invalidateQueries({ queryKey: usuarioKeys.lists() });
  };

  const create = async (data: CreateUsuarioDTO) => {
    return createMutation.mutateAsync(data);
  };

  const update = async (id: string, data: UpdateUsuarioDTO) => {
    return updateMutation.mutateAsync({ id, data });
  };

  const remove = async (id: string) => {
    return deleteMutation.mutateAsync(id);
  };

  const error = queryError ? String(queryError) : null;

  return {
    usuarios,
    loading,
    error,
    fetchAll,
    create,
    update,
    remove,
  };
};
