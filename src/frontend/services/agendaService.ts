import api from './api';

export interface Agenda {
  id: number;
  usuario_id: number;
  data_venc: string;
  dias_para_vencer: number;
  status: 'Ativo' | 'Inativo';
  ciclo: number;
  renovou: boolean;
  cancelou: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAgendaDTO {
  usuario_id: number;
  data_venc: string;
  status?: 'Ativo' | 'Inativo';
  ciclo?: number;
}

export interface UpdateAgendaDTO {
  data_venc?: string;
  status?: 'Ativo' | 'Inativo';
  ciclo?: number;
  renovou?: boolean;
  cancelou?: boolean;
}

const agendaService = {
  getAll: async (): Promise<Agenda[]> => {
    const response = await api.get('/agenda');
    return response.data;
  },

  getById: async (id: number): Promise<Agenda> => {
    const response = await api.get(`/agenda/${id}`);
    return response.data;
  },

  create: async (data: CreateAgendaDTO): Promise<Agenda> => {
    const response = await api.post('/agenda', data);
    return response.data;
  },

  update: async (id: number, data: UpdateAgendaDTO): Promise<Agenda> => {
    const response = await api.put(`/agenda/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/agenda/${id}`);
  },

  marcarRenovou: async (id: number): Promise<Agenda> => {
    const response = await api.patch(`/agenda/${id}/renovou`);
    return response.data;
  },

  marcarCancelou: async (id: number): Promise<Agenda> => {
    const response = await api.patch(`/agenda/${id}/cancelou`);
    return response.data;
  },

  getVencidos: async (): Promise<Agenda[]> => {
    const response = await api.get('/agenda/vencidos');
    return response.data;
  },

  getHoje: async (): Promise<Agenda[]> => {
    const response = await api.get('/agenda/hoje');
    return response.data;
  },

  getProximos7Dias: async (): Promise<Agenda[]> => {
    const response = await api.get('/agenda/proximos-7-dias');
    return response.data;
  }
};

export default agendaService;
