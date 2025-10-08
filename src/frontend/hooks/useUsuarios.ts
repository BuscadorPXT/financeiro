import { useState, useEffect, useCallback } from 'react';
import usuarioService, { Usuario, CreateUsuarioDTO, UpdateUsuarioDTO } from '../services/usuarioService';

export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await usuarioService.getAll();
      setUsuarios(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (data: CreateUsuarioDTO) => {
    setLoading(true);
    setError(null);
    try {
      const newUsuario = await usuarioService.create(data);
      setUsuarios(prev => [...prev, newUsuario]);
      return newUsuario;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar usuário');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (id: number, data: UpdateUsuarioDTO) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await usuarioService.update(id, data);
      setUsuarios(prev => prev.map(u => u.id === id ? updated : u));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar usuário');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await usuarioService.delete(id);
      setUsuarios(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar usuário');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    usuarios,
    loading,
    error,
    fetchAll,
    create,
    update,
    remove
  };
};
