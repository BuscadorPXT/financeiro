import api from './api';

export interface Comissao {
  id: string;
  pagamentoId: string;
  indicador: string;
  regraTipo: 'PRIMEIRO' | 'RECORRENTE';
  valor: number;
  mesRef: string; // formato DD/MM/YYYY
  createdAt: string;
  pagamento?: {
    id: string;
    dataPagto: string;
    valor: string;
    metodo: string;
    usuarioId: string;
  };
}

export interface ComissaoPorIndicador {
  indicador: string;
  total: number;
  quantidade: number;
  usuarios: string[];
}

export interface ComissaoPorRegra {
  regraTipo: 'PRIMEIRO' | 'RECORRENTE';
  total: number;
  quantidade: number;
}

const comissaoService = {
  getAll: async (): Promise<Comissao[]> => {
    const response = await api.get('/comissoes');
    return response.data.data;
  },

  getById: async (id: number): Promise<Comissao> => {
    const response = await api.get(`/comissoes/${id}`);
    return response.data.data;
  },

  getPorIndicador: async (mes?: string): Promise<ComissaoPorIndicador[]> => {
    const response = await api.get('/comissoes/por-indicador', {
      params: mes ? { mes } : {}
    });
    return response.data.data;
  },

  getPorRegra: async (mes?: string): Promise<ComissaoPorRegra[]> => {
    const response = await api.get('/comissoes/por-regra', {
      params: mes ? { mes } : {}
    });
    return response.data.data;
  },

  getByMes: async (mes: string): Promise<Comissao[]> => {
    const response = await api.get('/comissoes', {
      params: { mes_ref: mes }
    });
    return response.data.data;
  },

  getTotalPorIndicador: async (indicador: string, mes?: string): Promise<number> => {
    const response = await api.get('/comissoes/total-indicador', {
      params: { indicador, mes }
    });
    return response.data.total;
  }
};

export default comissaoService;
