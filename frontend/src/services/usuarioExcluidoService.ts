import api from './api';

export interface UsuarioExcluido {
  id: string;
  usuarioIdOriginal: string;
  emailLogin: string;
  nomeCompleto: string;
  telefone?: string;
  indicador?: string;
  statusFinal: 'ATIVO' | 'EM_ATRASO' | 'INATIVO' | 'HISTORICO';
  metodo?: 'PIX' | 'CREDITO' | 'DINHEIRO';
  conta?: string;
  ciclo: number;
  totalCiclosUsuario: number;
  dataPagto?: string;
  dataVenc?: string;
  obs?: string;
  excluidoPor?: string;
  motivoExclusao?: string;
  dataExclusao: string;
  totalPagamentos: number;
  valorTotalPago: number;
  criadoEm: string;
  atualizadoEm: string;
}

export interface UsuarioExcluidoStats {
  total: number;
  ultimoMes: number;
  totalPagamentosHistorico: number;
  valorTotalHistorico: number;
}

const usuarioExcluidoService = {
  getAll: async (limit?: number): Promise<UsuarioExcluido[]> => {
    const response = await api.get('/usuarios-excluidos', {
      params: { limit: limit || 100 }
    });
    return response.data.data;
  },

  getById: async (id: string): Promise<UsuarioExcluido> => {
    const response = await api.get(`/usuarios-excluidos/${id}`);
    return response.data.data;
  },

  findByEmail: async (email: string): Promise<UsuarioExcluido[]> => {
    const response = await api.get(`/usuarios-excluidos/buscar/${email}`);
    return response.data.data;
  },

  getStats: async (): Promise<UsuarioExcluidoStats> => {
    const response = await api.get('/usuarios-excluidos/stats');
    return response.data.data;
  },
};

export default usuarioExcluidoService;
