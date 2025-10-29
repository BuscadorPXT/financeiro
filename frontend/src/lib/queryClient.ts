/**
 * React Query Client Configuration
 *
 * Configurações:
 * - staleTime: 5 minutos - dados considerados "frescos" por 5min
 * - gcTime: 30 minutos - cache mantido em memória por 30min
 * - refetchOnWindowFocus: false - não refetch ao voltar para a aba
 * - retry: 1 - tenta novamente apenas 1 vez em caso de erro
 */

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      gcTime: 1000 * 60 * 30, // 30 minutos (antigo cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
      refetchOnMount: true,
    },
    mutations: {
      retry: 0,
    },
  },
});
