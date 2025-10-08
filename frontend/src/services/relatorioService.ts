import { api } from './api';

class RelatorioService {
  /**
   * Dashboard principal com KPIs gerais
   */
  async getDashboard(params?: { mes?: string; ano?: number }) {
    const response = await api.get('/relatorios/dashboard', { params });
    return response.data.data;
  }

  /**
   * Relatório financeiro detalhado
   */
  async getRelatorioFinanceiro(params?: {
    mesInicio?: string;
    mesFim?: string;
    anoInicio?: number;
    anoFim?: number;
  }) {
    const response = await api.get('/relatorios/financeiro', { params });
    return response.data.data;
  }

  /**
   * Relatório de usuários
   */
  async getRelatorioUsuarios() {
    const response = await api.get('/relatorios/usuarios');
    return response.data.data;
  }

  /**
   * Desempenho mensal
   */
  async getDesempenhoMensal(ano?: number) {
    const response = await api.get('/relatorios/desempenho-mensal', {
      params: { ano },
    });
    return response.data.data;
  }

  /**
   * Relatório de agenda
   */
  async getRelatorioAgenda() {
    const response = await api.get('/relatorios/agenda');
    return response.data.data;
  }
}

export default new RelatorioService();
