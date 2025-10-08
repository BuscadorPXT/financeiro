import api from './api';

export interface Usuario {
  id: string;
  emailLogin: string;
  nomeCompleto: string;
  telefone?: string;
  statusFinal: string;
  indicador?: string;
}

export interface Churn {
  id: string;
  usuarioId: string;
  dataChurn: string;
  motivo?: string;
  revertido: boolean;
  createdAt: string;
  usuario?: Usuario;
}

export interface CreateChurnDTO {
  usuarioId: string;
  dataChurn: string;
  motivo?: string;
}

export interface UpdateChurnDTO {
  dataChurn?: string;
  motivo?: string;
  revertido?: boolean;
}

const churnService = {
  getAll: async (): Promise<Churn[]> => {
    const response = await api.get('/churn');
    return response.data.data;
  },

  getById: async (id: number): Promise<Churn> => {
    const response = await api.get(`/churn/${id}`);
    return response.data.data;
  },

  create: async (data: CreateChurnDTO): Promise<Churn> => {
    const response = await api.post('/churn', data);
    return response.data.data;
  },

  update: async (id: number, data: UpdateChurnDTO): Promise<Churn> => {
    const response = await api.put(`/churn/${id}`, data);
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/churn/${id}`);
  },

  reverter: async (id: number): Promise<Churn> => {
    const response = await api.patch(`/churn/${id}/reverter`);
    return response.data.data;
  },

  getByMes: async (mes: string): Promise<Churn[]> => {
    const response = await api.get('/churn', {
      params: { mes }
    });
    return response.data.data;
  },

  getTaxaChurn: async (mes?: string): Promise<number> => {
    const response = await api.get('/churn/taxa', {
      params: mes ? { mes } : {}
    });
    return response.data.taxa;
  }
};

export default churnService;
