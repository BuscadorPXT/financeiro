import api from './api';

export interface Churn {
  id: number;
  usuario_id: number;
  data_churn: string;
  motivo?: string;
  revertido: boolean;
  created_at: string;
}

export interface CreateChurnDTO {
  usuario_id: number;
  data_churn: string;
  motivo?: string;
}

export interface UpdateChurnDTO {
  data_churn?: string;
  motivo?: string;
  revertido?: boolean;
}

const churnService = {
  getAll: async (): Promise<Churn[]> => {
    const response = await api.get('/churn');
    return response.data;
  },

  getById: async (id: number): Promise<Churn> => {
    const response = await api.get(`/churn/${id}`);
    return response.data;
  },

  create: async (data: CreateChurnDTO): Promise<Churn> => {
    const response = await api.post('/churn', data);
    return response.data;
  },

  update: async (id: number, data: UpdateChurnDTO): Promise<Churn> => {
    const response = await api.put(`/churn/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/churn/${id}`);
  },

  reverter: async (id: number): Promise<Churn> => {
    const response = await api.patch(`/churn/${id}/reverter`);
    return response.data;
  },

  getByMes: async (mes: string): Promise<Churn[]> => {
    const response = await api.get('/churn', {
      params: { mes }
    });
    return response.data;
  },

  getTaxaChurn: async (mes?: string): Promise<number> => {
    const response = await api.get('/churn/taxa', {
      params: mes ? { mes } : {}
    });
    return response.data.taxa;
  }
};

export default churnService;
