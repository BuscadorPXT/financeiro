import api from './api';

export interface Despesa {
  id: number;
  categoria: string;
  descricao: string;
  conta?: string;
  indicador?: string;
  valor: number;
  status: 'Pago' | 'Pendente';
  competencia_mes: number;
  competencia_ano: number;
  created_at: string;
  updated_at: string;
}

export interface CreateDespesaDTO {
  categoria: string;
  descricao: string;
  conta?: string;
  indicador?: string;
  valor: number;
  status?: 'Pago' | 'Pendente';
  competencia_mes: number;
  competencia_ano: number;
}

export interface UpdateDespesaDTO {
  categoria?: string;
  descricao?: string;
  conta?: string;
  indicador?: string;
  valor?: number;
  status?: 'Pago' | 'Pendente';
  competencia_mes?: number;
  competencia_ano?: number;
}

const despesaService = {
  getAll: async (): Promise<Despesa[]> => {
    const response = await api.get('/despesas');
    return response.data;
  },

  getById: async (id: number): Promise<Despesa> => {
    const response = await api.get(`/despesas/${id}`);
    return response.data;
  },

  create: async (data: CreateDespesaDTO): Promise<Despesa> => {
    const response = await api.post('/despesas', data);
    return response.data;
  },

  update: async (id: number, data: UpdateDespesaDTO): Promise<Despesa> => {
    const response = await api.put(`/despesas/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/despesas/${id}`);
  },

  getByCategoria: async (categoria: string): Promise<Despesa[]> => {
    const response = await api.get('/despesas', {
      params: { categoria }
    });
    return response.data;
  },

  getByCompetencia: async (mes: number, ano: number): Promise<Despesa[]> => {
    const response = await api.get('/despesas', {
      params: { competencia_mes: mes, competencia_ano: ano }
    });
    return response.data;
  },

  getSomaPorCategoria: async (): Promise<Record<string, number>> => {
    const response = await api.get('/despesas/soma-categoria');
    return response.data;
  },

  quitar: async (id: number): Promise<Despesa> => {
    const response = await api.patch(`/despesas/${id}/quitar`);
    return response.data;
  }
};

export default despesaService;
