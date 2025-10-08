import { api } from './api';

export interface Lista {
  id: string;
  tipo: 'CONTA' | 'METODO' | 'CATEGORIA' | 'INDICADOR';
  valor: string;
  ativo: boolean;
  createdAt: string;
}

export interface CreateListaData {
  tipo: 'CONTA' | 'METODO' | 'CATEGORIA' | 'INDICADOR';
  valor: string;
}

export interface UpdateListaData {
  valor?: string;
  ativo?: boolean;
}

class ListaService {
  /**
   * Lista todas as listas auxiliares
   */
  async getAll(params?: {
    tipo?: string;
    ativo?: boolean;
    page?: number;
    limit?: number;
  }) {
    const response = await api.get('/listas', { params });
    return response.data.data;
  }

  /**
   * Busca por tipo
   */
  async getByTipo(tipo: string) {
    const response = await api.get(`/listas/tipo/${tipo}`);
    return response.data.data;
  }

  /**
   * Busca uma lista por ID
   */
  async getById(id: string) {
    const response = await api.get(`/listas/${id}`);
    return response.data.data;
  }

  /**
   * Cria nova lista
   */
  async create(data: CreateListaData) {
    const response = await api.post('/listas', data);
    return response.data.data;
  }

  /**
   * Atualiza uma lista
   */
  async update(id: string, data: UpdateListaData) {
    const response = await api.put(`/listas/${id}`, data);
    return response.data.data;
  }

  /**
   * Deleta uma lista
   */
  async delete(id: string) {
    const response = await api.delete(`/listas/${id}`);
    return response.data.data;
  }

  /**
   * Ativa/Desativa uma lista
   */
  async toggleAtivo(id: string) {
    const response = await api.patch(`/listas/${id}/toggle-ativo`);
    return response.data.data;
  }
}

export default new ListaService();
