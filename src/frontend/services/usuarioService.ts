import api from './api';

export interface Usuario {
  id: number;
  email_login: string;
  nome_completo: string;
  telefone?: string;
  indicador?: string;
  status_final: 'Ativo' | 'Em_Atraso' | 'Inativo' | 'Historico';
  metodo?: 'PIX' | 'CREDITO' | 'DINHEIRO';
  conta?: string;
  ciclo: number;
  total_ciclos_usuario: number;
  data_pagto?: string;
  mes_pagto?: string;
  dias_acesso?: number;
  data_venc?: string;
  dias_para_vencer?: number;
  vence_hoje: boolean;
  prox_7_dias: boolean;
  em_atraso: boolean;
  obs?: string;
  flag_agenda: boolean;
  mes_ref?: string;
  entrou: boolean;
  renovou: boolean;
  ativo_atual: boolean;
  churn: boolean;
  regra_tipo?: 'PRIMEIRO' | 'RECORRENTE';
  regra_valor?: number;
  elegivel_comissao: boolean;
  comissao_valor?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateUsuarioDTO {
  email_login: string;
  nome_completo: string;
  telefone?: string;
  indicador?: string;
  metodo?: 'PIX' | 'CREDITO' | 'DINHEIRO';
  conta?: string;
  obs?: string;
}

export interface UpdateUsuarioDTO {
  email_login?: string;
  nome_completo?: string;
  telefone?: string;
  indicador?: string;
  status_final?: 'Ativo' | 'Em_Atraso' | 'Inativo' | 'Historico';
  metodo?: 'PIX' | 'CREDITO' | 'DINHEIRO';
  conta?: string;
  obs?: string;
  flag_agenda?: boolean;
}

const usuarioService = {
  getAll: async (): Promise<Usuario[]> => {
    const response = await api.get('/usuarios');
    return response.data;
  },

  getById: async (id: number): Promise<Usuario> => {
    const response = await api.get(`/usuarios/${id}`);
    return response.data;
  },

  create: async (data: CreateUsuarioDTO): Promise<Usuario> => {
    const response = await api.post('/usuarios', data);
    return response.data;
  },

  update: async (id: number, data: UpdateUsuarioDTO): Promise<Usuario> => {
    const response = await api.put(`/usuarios/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/usuarios/${id}`);
  },

  getAtivos: async (): Promise<Usuario[]> => {
    const response = await api.get('/usuarios', {
      params: { status_final: 'Ativo' }
    });
    return response.data;
  },

  getVencendoHoje: async (): Promise<Usuario[]> => {
    const response = await api.get('/usuarios', {
      params: { vence_hoje: true }
    });
    return response.data;
  },

  getProximos7Dias: async (): Promise<Usuario[]> => {
    const response = await api.get('/usuarios', {
      params: { prox_7_dias: true }
    });
    return response.data;
  },

  getEmAtraso: async (): Promise<Usuario[]> => {
    const response = await api.get('/usuarios', {
      params: { em_atraso: true }
    });
    return response.data;
  }
};

export default usuarioService;
