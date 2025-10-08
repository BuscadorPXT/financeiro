import { useState, useEffect, useCallback } from 'react';
import comissaoService, { Comissao, ComissaoPorIndicador, ComissaoPorRegra } from '../services/comissaoService';

export const useComissoes = () => {
  const [comissoes, setComissoes] = useState<Comissao[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await comissaoService.getAll();
      setComissoes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar comissões');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPorIndicador = useCallback(async (mes?: string): Promise<ComissaoPorIndicador[]> => {
    setLoading(true);
    setError(null);
    try {
      const data = await comissaoService.getPorIndicador(mes);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar comissões por indicador');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPorRegra = useCallback(async (mes?: string): Promise<ComissaoPorRegra[]> => {
    setLoading(true);
    setError(null);
    try {
      const data = await comissaoService.getPorRegra(mes);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar comissões por regra');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    comissoes,
    loading,
    error,
    fetchAll,
    fetchPorIndicador,
    fetchPorRegra
  };
};
