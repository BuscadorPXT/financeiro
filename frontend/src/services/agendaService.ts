import api from './api';

export interface Agenda {
  id: string; // UUID
  usuarioId: string; // camelCase from API
  dataVenc: string; // camelCase from API
  diasParaVencer: number; // camelCase from API
  status: 'ATIVO' | 'INATIVO'; // uppercase from API
  ciclo: number;
  renovou: boolean;
  cancelou: boolean;
  createdAt: string; // camelCase from API
  updatedAt: string; // camelCase from API
  usuario?: {
    id: string;
    emailLogin: string;
    nomeCompleto: string;
    telefone: string | null;
    statusFinal: string;
  };
}

// Alias for backward compatibility
export interface AgendaLegacy {
  id: string;
  usuario_id: string;
  data_venc: string;
  dias_para_vencer: number;
  status: 'ATIVO' | 'INATIVO';
  ciclo: number;
  renovou: boolean;
  cancelou: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAgendaDTO {
  usuarioId: string; // camelCase for API
  dataVenc: string; // camelCase for API
  status?: 'ATIVO' | 'INATIVO';
  ciclo?: number;
}

export interface UpdateAgendaDTO {
  dataVenc?: string;
  status?: 'ATIVO' | 'INATIVO';
  ciclo?: number;
  renovou?: boolean;
  cancelou?: boolean;
}

const agendaService = {
  getAll: async (): Promise<Agenda[]> => {
    const response = await api.get('/agenda?limit=1000');
    return response.data.data;
  },

  getById: async (id: string): Promise<Agenda> => {
    const response = await api.get(`/agenda/${id}`);
    return response.data.data;
  },

  create: async (data: CreateAgendaDTO): Promise<Agenda> => {
    const response = await api.post('/agenda', data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateAgendaDTO): Promise<Agenda> => {
    const response = await api.put(`/agenda/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/agenda/${id}`);
  },

  marcarRenovou: async (id: string, data?: { dataPagto: string; valor: number; metodo: string; conta: string; regraValor?: number; observacao?: string }): Promise<Agenda> => {
    const response = await api.put(`/agenda/${id}/renovou`, data || {});
    return response.data.data;
  },

  marcarCancelou: async (id: string, motivo?: string): Promise<Agenda> => {
    const response = await api.put(`/agenda/${id}/cancelou`, { motivo });
    return response.data.data;
  },

  getStats: async () => {
    const response = await api.get('/agenda/stats');
    return response.data.data;
  },

  atualizarDiasParaVencer: async () => {
    const response = await api.put('/agenda/atualizar-dias');
    return response.data;
  }
};

export default agendaService;
