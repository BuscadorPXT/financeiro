/**
 * React Query hooks for Pagamento CRUD operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import pagamentoService from '../services/pagamentoService';
import type { CreatePagamentoDTO, UpdatePagamentoDTO } from '../services/pagamentoService';
import { usuarioKeys } from './useUsuarios';

// Query keys
export const pagamentoKeys = {
  all: ['pagamentos'] as const,
  lists: () => [...pagamentoKeys.all, 'list'] as const,
  list: (filters?: any) => [...pagamentoKeys.lists(), { filters }] as const,
  details: () => [...pagamentoKeys.all, 'detail'] as const,
  detail: (id: string) => [...pagamentoKeys.details(), id] as const,
};

/**
 * Hook para buscar todos os pagamentos
 */
export function usePagamentos() {
  return useQuery({
    queryKey: pagamentoKeys.lists(),
    queryFn: () => pagamentoService.getAll(),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook para buscar um pagamento específico por ID
 */
export function usePagamento(id: string) {
  return useQuery({
    queryKey: pagamentoKeys.detail(id),
    queryFn: () => pagamentoService.getById(id),
    enabled: !!id,
  });
}

/**
 * Hook para criar novo pagamento
 * - Invalida cache de pagamentos E usuários (pois pagamento afeta usuário)
 */
export function useCreatePagamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePagamentoDTO) => pagamentoService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pagamentoKeys.lists() });
      // Invalida usuários também pois pagamento afeta dados do usuário
      queryClient.invalidateQueries({ queryKey: usuarioKeys.lists() });
    },
  });
}

/**
 * Hook para atualizar pagamento
 */
export function useUpdatePagamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePagamentoDTO }) =>
      pagamentoService.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: pagamentoKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: pagamentoKeys.lists() });
      queryClient.invalidateQueries({ queryKey: usuarioKeys.lists() });
    },
  });
}

/**
 * Hook para deletar pagamento
 */
export function useDeletePagamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => pagamentoService.delete(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: pagamentoKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: pagamentoKeys.lists() });
      queryClient.invalidateQueries({ queryKey: usuarioKeys.lists() });
    },
  });
}

/**
 * Hook legado para compatibilidade com código existente
 * @deprecated
 */
export const usePagamentosLegacy = () => {
  const { data: pagamentos = [], isLoading: loading, error: queryError } = usePagamentos();
  const createMutation = useCreatePagamento();
  const updateMutation = useUpdatePagamento();
  const deleteMutation = useDeletePagamento();
  const queryClient = useQueryClient();

  const fetchAll = async () => {
    await queryClient.invalidateQueries({ queryKey: pagamentoKeys.lists() });
  };

  const create = async (data: CreatePagamentoDTO) => {
    return createMutation.mutateAsync(data);
  };

  const update = async (id: string, data: UpdatePagamentoDTO) => {
    return updateMutation.mutateAsync({ id, data });
  };

  const remove = async (id: string) => {
    return deleteMutation.mutateAsync(id);
  };

  const error = queryError ? String(queryError) : null;

  return {
    pagamentos,
    loading,
    error,
    fetchAll,
    create,
    update,
    remove,
  };
};
