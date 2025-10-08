import { useState, useEffect, useCallback } from 'react';
import agendaService, { Agenda, CreateAgendaDTO, UpdateAgendaDTO } from '../services/agendaService';

export const useAgenda = () => {
  const [agenda, setAgenda] = useState<Agenda[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await agendaService.getAll();
      setAgenda(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar agenda');
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (data: CreateAgendaDTO) => {
    setLoading(true);
    setError(null);
    try {
      const newAgenda = await agendaService.create(data);
      setAgenda(prev => [...prev, newAgenda]);
      return newAgenda;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar agenda');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (id: number, data: UpdateAgendaDTO) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await agendaService.update(id, data);
      setAgenda(prev => prev.map(a => a.id === id ? updated : a));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar agenda');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await agendaService.delete(id);
      setAgenda(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar agenda');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const marcarRenovou = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await agendaService.marcarRenovou(id);
      setAgenda(prev => prev.map(a => a.id === id ? updated : a));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao marcar renovação');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const marcarCancelou = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await agendaService.marcarCancelou(id);
      setAgenda(prev => prev.map(a => a.id === id ? updated : a));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao marcar cancelamento');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    agenda,
    loading,
    error,
    fetchAll,
    create,
    update,
    remove,
    marcarRenovou,
    marcarCancelou
  };
};
