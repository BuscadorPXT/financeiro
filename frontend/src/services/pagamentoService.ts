import api from './api';

export interface Pagamento {
  id: string;
  usuarioId: string;
  dataPagto: string;
  mesPagto: string;
  valor: number;
  metodo: 'PIX' | 'CREDITO' | 'DINHEIRO';
  conta: string;
  regraTipo: 'PRIMEIRO' | 'RECORRENTE';
  regraValor: number;
  elegivelComissao: boolean;
  comissaoValor: number;
  observacao?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePagamentoDTO {
  usuarioId: string;
  dataPagto: string;
  valor: number;
  metodo: 'PIX' | 'CREDITO' | 'DINHEIRO';
  conta: string;
  regraTipo: 'PRIMEIRO' | 'RECORRENTE';
  regraValor: number;
  elegivelComissao?: boolean;
  observacao?: string;
}

export interface UpdatePagamentoDTO {
  dataPagto?: string;
  valor?: number;
  metodo?: 'PIX' | 'CREDITO' | 'DINHEIRO';
  conta?: string;
  regraTipo?: 'PRIMEIRO' | 'RECORRENTE';
  regraValor?: number;
  elegivelComissao?: boolean;
  observacao?: string;
}

// Helper para normalizar pagamento (converter valores string para number)
const normalizePagamento = (pagamento: any): Pagamento => ({
  ...pagamento,
  valor: typeof pagamento.valor === 'string' ? parseFloat(pagamento.valor) : pagamento.valor,
  regraValor: typeof pagamento.regraValor === 'string' ? parseFloat(pagamento.regraValor) : pagamento.regraValor,
  comissaoValor: pagamento.comissaoValor === null ? 0 :
                  typeof pagamento.comissaoValor === 'string' ? parseFloat(pagamento.comissaoValor) : pagamento.comissaoValor
});

const pagamentoService = {
  getAll: async (): Promise<Pagamento[]> => {
    const response = await api.get('/pagamentos', {
      params: { limit: 10000 } // Buscar todos os pagamentos
    });
    return response.data.data.map(normalizePagamento);
  },

  getById: async (id: string): Promise<Pagamento> => {
    const response = await api.get(`/pagamentos/${id}`);
    return normalizePagamento(response.data.data);
  },

  create: async (data: CreatePagamentoDTO): Promise<Pagamento> => {
    const response = await api.post('/pagamentos', data);
    return normalizePagamento(response.data.data);
  },

  update: async (id: string, data: UpdatePagamentoDTO): Promise<Pagamento> => {
    const response = await api.put(`/pagamentos/${id}`, data);
    return normalizePagamento(response.data.data);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/pagamentos/${id}`);
  },

  getByUsuario: async (usuarioId: string): Promise<Pagamento[]> => {
    const response = await api.get(`/pagamentos/usuario/${usuarioId}`, {
      params: { limit: 10000 }
    });
    return response.data.data.map(normalizePagamento);
  },

  getByMes: async (mes: string): Promise<Pagamento[]> => {
    const response = await api.get('/pagamentos', {
      params: { mes: mes, limit: 10000 }
    });
    return response.data.data.map(normalizePagamento);
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
