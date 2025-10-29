import api from './api';

export interface Prospeccao {
  id: number;
  email: string;
  nome: string;
  telefone?: string;
  origem?: string;
  indicador?: string;
  observacao?: string;
  convertido: boolean;
  usuario_id?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateProspeccaoDTO {
  email: string;
  nome: string;
  telefone?: string;
  origem?: string;
  indicador?: string;
  observacao?: string;
}

export interface UpdateProspeccaoDTO {
  email?: string;
  nome?: string;
  telefone?: string;
  origem?: string;
  indicador?: string;
  observacao?: string;
}

export interface ConvertProspeccaoDTO {
  usuario_id: number;
}

const prospeccaoService = {
  getAll: async (): Promise<Prospeccao[]> => {
    const response = await api.get('/prospeccao');
    return response.data.data;
  },

  getById: async (id: number): Promise<Prospeccao> => {
    const response = await api.get(`/prospeccao/${id}`);
    return response.data.data;
  },

  create: async (data: CreateProspeccaoDTO): Promise<Prospeccao> => {
    const response = await api.post('/prospeccao', data);
    return response.data.data;
  },

  update: async (id: number, data: UpdateProspeccaoDTO): Promise<Prospeccao> => {
    const response = await api.put(`/prospeccao/${id}`, data);
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/prospeccao/${id}`);
  },

  converter: async (id: number, data: ConvertProspeccaoDTO): Promise<Prospeccao> => {
    const response = await api.post(`/prospeccao/${id}/converter`, data);
    return response.data.data;
  },

  getNaoConvertidos: async (): Promise<Prospeccao[]> => {
    const response = await api.get('/prospeccao', {
      params: { convertido: false }
    });
    return response.data.data;
  },

  getConvertidos: async (): Promise<Prospeccao[]> => {
    const response = await api.get('/prospeccao', {
      params: { convertido: true }
    });
    return response.data.data;
  }
};

export default prospeccaoService;
