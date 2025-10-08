import api from './api';

export interface Usuario {
  id: string;
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
  mesPagto?: string;
  diasAcesso?: number;
  dataVenc?: string;
  diasParaVencer?: number;
  venceHoje: boolean;
  prox7Dias: boolean;
  emAtraso: boolean;
  obs?: string;
  flagAgenda: boolean;
  mesRef?: string;
  entrou: boolean;
  renovou: boolean;
  ativoAtual: boolean;
  churn: boolean;
  regraTipo?: 'PRIMEIRO' | 'RECORRENTE';
  regraValor?: number;
  elegivelComissao: boolean;
  comissaoValor?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUsuarioDTO {
  emailLogin: string;
  nomeCompleto: string;
  telefone?: string;
  indicador?: string;
  metodo?: 'PIX' | 'CREDITO' | 'DINHEIRO';
  conta?: string;
  obs?: string;
}

export interface UpdateUsuarioDTO {
  emailLogin?: string;
  nomeCompleto?: string;
  telefone?: string;
  indicador?: string;
  statusFinal?: 'ATIVO' | 'EM_ATRASO' | 'INATIVO' | 'HISTORICO';
  metodo?: 'PIX' | 'CREDITO' | 'DINHEIRO';
  conta?: string;
  obs?: string;
  flagAgenda?: boolean;
}

const usuarioService = {
  getAll: async (): Promise<Usuario[]> => {
    const response = await api.get('/usuarios', {
      params: { limit: 1000 }
    });
    return response.data.data;
  },

  getById: async (id: string): Promise<Usuario> => {
    const response = await api.get(`/usuarios/${id}`);
    return response.data.data;
  },

  create: async (data: CreateUsuarioDTO): Promise<Usuario> => {
    const response = await api.post('/usuarios', data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateUsuarioDTO): Promise<Usuario> => {
    const response = await api.put(`/usuarios/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/usuarios/${id}`);
  },

  getAtivos: async (): Promise<Usuario[]> => {
    const response = await api.get('/usuarios', {
      params: { status: 'ATIVO' }
    });
    return response.data.data;
  },

  getVencendoHoje: async (): Promise<Usuario[]> => {
    const response = await api.get('/usuarios', {
      params: { venceHoje: true }
    });
    return response.data.data;
  },

  getProximos7Dias: async (): Promise<Usuario[]> => {
    const response = await api.get('/usuarios', {
      params: { prox7Dias: true }
    });
    return response.data.data;
  },

  getEmAtraso: async (): Promise<Usuario[]> => {
    const response = await api.get('/usuarios', {
      params: { emAtraso: true }
    });
    return response.data.data;
  },

  importar: async (usuarios: any[]): Promise<{
    success: number;
    errors: number;
    skipped: number;
    details: Array<{ email: string; status: 'success' | 'error' | 'skipped'; message?: string }>;
  }> => {
    // Usa timeout maior para importações em lote (60 segundos)
    const response = await api.post('/usuarios/import', { usuarios }, {
      timeout: 60000
    });
    return response.data.data;
  }
};

export default usuarioService;

export const importarUsuarios = usuarioService.importar;
