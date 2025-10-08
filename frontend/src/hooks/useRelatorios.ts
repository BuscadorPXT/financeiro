import { useState, useCallback } from 'react';
import relatorioService from '../services/relatorioService';

export const useRelatorios = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async (params?: { mes?: string; ano?: number }): Promise<any> => {
    setLoading(true);
    setError(null);
    try {
      const data = await relatorioService.getDashboard(params);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dashboard');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRelatorioFinanceiro = useCallback(async (params?: {
    mesInicio?: string;
    mesFim?: string;
    anoInicio?: number;
    anoFim?: number;
  }): Promise<any> => {
    setLoading(true);
    setError(null);
    try {
      const data = await relatorioService.getRelatorioFinanceiro(params);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar relatório financeiro');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRelatorioUsuarios = useCallback(async (): Promise<any> => {
    setLoading(true);
    setError(null);
    try {
      const data = await relatorioService.getRelatorioUsuarios();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar relatório de usuários');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDesempenhoMensal = useCallback(async (ano?: number): Promise<any> => {
    setLoading(true);
    setError(null);
    try {
      const data = await relatorioService.getDesempenhoMensal(ano);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar desempenho mensal');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRelatorioAgenda = useCallback(async (): Promise<any> => {
    setLoading(true);
    setError(null);
    try {
      const data = await relatorioService.getRelatorioAgenda();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar relatório de agenda');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchDashboard,
    fetchRelatorioFinanceiro,
    fetchRelatorioUsuarios,
    fetchDesempenhoMensal,
    fetchRelatorioAgenda
  };
};
