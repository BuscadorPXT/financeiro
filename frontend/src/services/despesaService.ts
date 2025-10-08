import api from './api';

export interface Despesa {
  id: string;
  categoria: string;
  descricao: string;
  conta?: string;
  indicador?: string;
  valor: number;
  status: 'PAGO' | 'PENDENTE';
  competenciaMes: number;
  competenciaAno: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDespesaDTO {
  categoria: string;
  descricao: string;
  conta?: string;
  indicador?: string;
  valor: number;
  status?: 'PAGO' | 'PENDENTE';
  competenciaMes: number;
  competenciaAno: number;
}

export interface UpdateDespesaDTO {
  categoria?: string;
  descricao?: string;
  conta?: string;
  indicador?: string;
  valor?: number;
  status?: 'PAGO' | 'PENDENTE';
  competenciaMes?: number;
  competenciaAno?: number;
}

// Helper para normalizar despesa (converter valor string para number)
const normalizeDespesa = (despesa: any): Despesa => ({
  ...despesa,
  valor: Number(despesa.valor),
});

const despesaService = {
  getAll: async (): Promise<Despesa[]> => {
    const response = await api.get('/despesas', {
      params: { limit: 10000 } // Buscar todas as despesas (limite alto)
    });
    return response.data.data.map(normalizeDespesa);
  },

  getById: async (id: string): Promise<Despesa> => {
    const response = await api.get(`/despesas/${id}`);
    return normalizeDespesa(response.data.data);
  },

  create: async (data: CreateDespesaDTO): Promise<Despesa> => {
    const response = await api.post('/despesas', data);
    return normalizeDespesa(response.data.data);
  },

  update: async (id: string, data: UpdateDespesaDTO): Promise<Despesa> => {
    const response = await api.put(`/despesas/${id}`, data);
    return normalizeDespesa(response.data.data);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/despesas/${id}`);
  },

  getByCategoria: async (categoria: string): Promise<Despesa[]> => {
    const response = await api.get('/despesas', {
      params: { categoria }
    });
    return response.data.data.map(normalizeDespesa);
  },

  getByCompetencia: async (mes: number, ano: number): Promise<Despesa[]> => {
    const response = await api.get('/despesas', {
      params: { competenciaMes: mes, competenciaAno: ano }
    });
    return response.data.data.map(normalizeDespesa);
  },

  getSomaPorCategoria: async (): Promise<Record<string, number>> => {
    const response = await api.get('/despesas/soma-categoria');
    return response.data.data;
  },

  quitar: async (id: string): Promise<Despesa> => {
    const response = await api.patch(`/despesas/${id}/pagar`);
    return normalizeDespesa(response.data.data);
  }
};

export default despesaService;
