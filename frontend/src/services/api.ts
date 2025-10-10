import axios from 'axios';

// Usa o proxy do Vite em desenvolvimento, URL completa em produção
const API_BASE_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.DEV
    ? '/api'  // Desenvolvimento: usa proxy do Vite
    : (() => {
        console.error('VITE_API_URL não configurada! Configure no Vercel.');
        return '/api'; // Fallback que vai falhar, mas deixa claro o erro
      })()
);

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos - aumentado para acomodar latência de banco externo
});

// Request interceptor - adicionar token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - tratar erros de autenticação
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Se receber 401, redirecionar para login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    if (error.response) {
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      console.error('Network Error:', error.request);
    } else {
      console.error('Error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
