import { useState, useEffect, useCallback } from 'react';
import listaService from '../services/listaService';
import type { Lista, CreateListaData, UpdateListaData } from '../services/listaService';

export const useListas = (tipo?: 'CONTA' | 'METODO' | 'CATEGORIA' | 'INDICADOR') => {
  const [listas, setListas] = useState<Lista[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = tipo
        ? await listaService.getByTipo(tipo)
        : await listaService.getAll();

      // Se não há tipo específico, getAll retorna objeto agrupado
      // Precisamos converter para array
      if (!tipo && data && typeof data === 'object' && !Array.isArray(data)) {
        const allListas = Object.values(data).flat() as Lista[];
        setListas(allListas);
      } else {
        setListas(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar listas');
    } finally {
      setLoading(false);
    }
  }, [tipo]);

  const create = useCallback(async (data: CreateListaData) => {
    setLoading(true);
    setError(null);
    try {
      const newLista = await listaService.create(data);
      setListas(prev => [...prev, newLista]);
      return newLista;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar lista');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (id: string, data: UpdateListaData) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await listaService.update(id, data);
      setListas(prev => prev.map(l => l.id === id ? updated : l));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar lista');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await listaService.delete(id);
      setListas(prev => prev.filter(l => l.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar lista');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    listas,
    loading,
    error,
    fetchAll,
    create,
    update,
    remove
  };
};
