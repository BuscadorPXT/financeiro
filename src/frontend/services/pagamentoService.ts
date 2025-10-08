import api from './api';

export interface Pagamento {
  id: number;
  usuario_id: number;
  data_pagto: string;
  mes_pagto: string;
  valor: number;
  metodo: 'PIX' | 'CREDITO' | 'DINHEIRO';
  conta: string;
  regra_tipo: 'PRIMEIRO' | 'RECORRENTE';
  regra_valor: number;
  elegivel_comissao: boolean;
  comissao_valor: number;
  observacao?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePagamentoDTO {
  usuario_id: number;
  data_pagto: string;
  valor: number;
  metodo: 'PIX' | 'CREDITO' | 'DINHEIRO';
  conta: string;
  regra_tipo: 'PRIMEIRO' | 'RECORRENTE';
  regra_valor: number;
  elegivel_comissao?: boolean;
  observacao?: string;
}

export interface UpdatePagamentoDTO {
  data_pagto?: string;
  valor?: number;
  metodo?: 'PIX' | 'CREDITO' | 'DINHEIRO';
  conta?: string;
  regra_tipo?: 'PRIMEIRO' | 'RECORRENTE';
  regra_valor?: number;
  elegivel_comissao?: boolean;
  observacao?: string;
}

const pagamentoService = {
  getAll: async (): Promise<Pagamento[]> => {
    const response = await api.get('/pagamentos');
    return response.data;
  },

  getById: async (id: number): Promise<Pagamento> => {
    const response = await api.get(`/pagamentos/${id}`);
    return response.data;
  },

  create: async (data: CreatePagamentoDTO): Promise<Pagamento> => {
    const response = await api.post('/pagamentos', data);
    return response.data;
  },

  update: async (id: number, data: UpdatePagamentoDTO): Promise<Pagamento> => {
    const response = await api.put(`/pagamentos/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/pagamentos/${id}`);
  },

  getByUsuario: async (usuarioId: number): Promise<Pagamento[]> => {
    const response = await api.get(`/pagamentos/usuario/${usuarioId}`);
    return response.data;
  },

  getByMes: async (mes: string): Promise<Pagamento[]> => {
    const response = await api.get('/pagamentos', {
      params: { mes_pagto: mes }
    });
    return response.data;
  },

  getSomaPorMes: async (mes: string): Promise<number> => {
    const response = await api.get('/pagamentos/soma-mes', {
      params: { mes }
    });
    return response.data.total;
  },

  getSomaPorConta: async (conta: string): Promise<number> => {
    const response = await api.get('/pagamentos/soma-conta', {
      params: { conta }
    });
    return response.data.total;
  }
};

export default pagamentoService;
