import api from './api';

export interface LoginCredentials {
  login: string;
  senha: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    login: string;
    nome: string;
  };
}

export interface User {
  id: string;
  login: string;
  nome: string;
  ativo: boolean;
  createdAt: string;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<{ data: AuthResponse }>('/auth/login', credentials);
    return response.data.data;
  }

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  }

  async getMe(): Promise<User> {
    const response = await api.get<{ data: User }>('/auth/me');
    return response.data.data;
  }

  async changePassword(senhaAtual: string, senhaNova: string): Promise<void> {
    await api.post('/auth/change-password', { senhaAtual, senhaNova });
  }

  // Gerenciamento de token
  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  removeToken(): void {
    localStorage.removeItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export default new AuthService();
