import api from './api';

export interface Comissao {
  id: number;
  pagamento_id: number;
  indicador: string;
  regra_tipo: 'PRIMEIRO' | 'RECORRENTE';
  valor: number;
  mes_ref: string;
  created_at: string;
}

export interface ComissaoPorIndicador {
  indicador: string;
  total: number;
  quantidade: number;
  usuarios: string[];
}

export interface ComissaoPorRegra {
  regra_tipo: 'PRIMEIRO' | 'RECORRENTE';
  total: number;
  quantidade: number;
}

const comissaoService = {
  getAll: async (): Promise<Comissao[]> => {
    const response = await api.get('/comissoes');
    return response.data;
  },

  getById: async (id: number): Promise<Comissao> => {
    const response = await api.get(`/comissoes/${id}`);
    return response.data;
  },

  getPorIndicador: async (mes?: string): Promise<ComissaoPorIndicador[]> => {
    const response = await api.get('/comissoes/por-indicador', {
      params: mes ? { mes } : {}
    });
    return response.data;
  },

  getPorRegra: async (mes?: string): Promise<ComissaoPorRegra[]> => {
    const response = await api.get('/comissoes/por-regra', {
      params: mes ? { mes } : {}
    });
    return response.data;
  },

  getByMes: async (mes: string): Promise<Comissao[]> => {
    const response = await api.get('/comissoes', {
      params: { mes_ref: mes }
    });
    return response.data;
  },

  getTotalPorIndicador: async (indicador: string, mes?: string): Promise<number> => {
    const response = await api.get('/comissoes/total-indicador', {
      params: { indicador, mes }
    });
    return response.data.total;
  }
};

export default comissaoService;
