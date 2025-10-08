import { useState, useEffect, useCallback } from 'react';
import churnService, { Churn, CreateChurnDTO, UpdateChurnDTO } from '../services/churnService';

export const useChurn = () => {
  const [churns, setChurns] = useState<Churn[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await churnService.getAll();
      setChurns(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar churns');
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (data: CreateChurnDTO) => {
    setLoading(true);
    setError(null);
    try {
      const newChurn = await churnService.create(data);
      setChurns(prev => [...prev, newChurn]);
      return newChurn;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar churn');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (id: number, data: UpdateChurnDTO) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await churnService.update(id, data);
      setChurns(prev => prev.map(c => c.id === id ? updated : c));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar churn');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await churnService.delete(id);
      setChurns(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar churn');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reverter = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await churnService.reverter(id);
      setChurns(prev => prev.map(c => c.id === id ? updated : c));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao reverter churn');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    churns,
    loading,
    error,
    fetchAll,
    create,
    update,
    remove,
    reverter
  };
};
