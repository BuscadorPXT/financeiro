import { useState, useEffect, useCallback } from 'react';
import prospeccaoService from '../services/prospeccaoService';
import type { Prospeccao, CreateProspeccaoDTO, UpdateProspeccaoDTO, ConvertProspeccaoDTO } from '../services/prospeccaoService';

export const useProspeccao = () => {
  const [prospeccoes, setProspeccoes] = useState<Prospeccao[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await prospeccaoService.getAll();
      setProspeccoes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar prospecções');
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (data: CreateProspeccaoDTO) => {
    setLoading(true);
    setError(null);
    try {
      const newProspeccao = await prospeccaoService.create(data);
      setProspeccoes(prev => [...prev, newProspeccao]);
      return newProspeccao;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar prospecção');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (id: number, data: UpdateProspeccaoDTO) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await prospeccaoService.update(id, data);
      setProspeccoes(prev => prev.map(p => p.id === id ? updated : p));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar prospecção');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await prospeccaoService.delete(id);
      setProspeccoes(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar prospecção');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const converter = useCallback(async (id: number, data: ConvertProspeccaoDTO) => {
    setLoading(true);
    setError(null);
    try {
      const converted = await prospeccaoService.converter(id, data);
      setProspeccoes(prev => prev.map(p => p.id === id ? converted : p));
      return converted;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao converter prospecção');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    prospeccoes,
    loading,
    error,
    fetchAll,
    create,
    update,
    remove,
    converter
  };
};
