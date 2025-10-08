import { useState, useEffect, useCallback } from 'react';
import despesaService from '../services/despesaService';
import type { Despesa, CreateDespesaDTO, UpdateDespesaDTO } from '../services/despesaService';

export const useDespesas = () => {
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await despesaService.getAll();
      setDespesas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar despesas');
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (data: CreateDespesaDTO) => {
    setLoading(true);
    setError(null);
    try {
      const newDespesa = await despesaService.create(data);
      setDespesas(prev => [...prev, newDespesa]);
      return newDespesa;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar despesa');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (id: string, data: UpdateDespesaDTO) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await despesaService.update(id, data);
      setDespesas(prev => prev.map(d => d.id === id ? updated : d));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar despesa');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await despesaService.delete(id);
      setDespesas(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar despesa');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const quitar = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await despesaService.quitar(id);
      setDespesas(prev => prev.map(d => d.id === id ? updated : d));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao quitar despesa');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    despesas,
    loading,
    error,
    fetchAll,
    create,
    update,
    remove,
    quitar
  };
};
