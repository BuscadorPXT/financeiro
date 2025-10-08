import { useState, useEffect, useCallback } from 'react';
import pagamentoService, { Pagamento, CreatePagamentoDTO, UpdatePagamentoDTO } from '../services/pagamentoService';

export const usePagamentos = () => {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await pagamentoService.getAll();
      setPagamentos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar pagamentos');
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (data: CreatePagamentoDTO) => {
    setLoading(true);
    setError(null);
    try {
      const newPagamento = await pagamentoService.create(data);
      setPagamentos(prev => [...prev, newPagamento]);
      return newPagamento;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar pagamento');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (id: number, data: UpdatePagamentoDTO) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await pagamentoService.update(id, data);
      setPagamentos(prev => prev.map(p => p.id === id ? updated : p));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar pagamento');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await pagamentoService.delete(id);
      setPagamentos(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar pagamento');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    pagamentos,
    loading,
    error,
    fetchAll,
    create,
    update,
    remove
  };
};
