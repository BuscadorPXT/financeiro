import { useState, useCallback } from 'react';
import relatorioService, { KPIData, RelatorioMensal } from '../services/relatorioService';

export const useRelatorios = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchKPIs = useCallback(async (mes?: string): Promise<KPIData> => {
    setLoading(true);
    setError(null);
    try {
      const data = await relatorioService.getKPIs(mes);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar KPIs');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPorMes = useCallback(async (): Promise<RelatorioMensal[]> => {
    setLoading(true);
    setError(null);
    try {
      const data = await relatorioService.getPorMes();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar relatório mensal');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPorIndicador = useCallback(async (): Promise<any> => {
    setLoading(true);
    setError(null);
    try {
      const data = await relatorioService.getPorIndicador();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar relatório por indicador');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchIdadeTitulos = useCallback(async (): Promise<any> => {
    setLoading(true);
    setError(null);
    try {
      const data = await relatorioService.getIdadeTitulos();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar idade de títulos');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchKPIs,
    fetchPorMes,
    fetchPorIndicador,
    fetchIdadeTitulos
  };
};
