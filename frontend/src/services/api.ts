import axios from 'axios';

// Configuração da URL da API
// Remove trailing slash e garante que não tenha /api duplicado
const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const API_BASE_URL = rawApiUrl.replace(/\/+$/, ''); // Remove trailing slashes

// Criar instância do axios
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000, // 30 segundos
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Log para debug (apenas em dev)
if (import.meta.env.DEV) {
  console.log('🔧 API Config:', {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    API_BASE_URL,
    baseURL: `${API_BASE_URL}/api`,
  });
}

// Interceptor de request para adicionar token
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

// Interceptor de response para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Erro de resposta do servidor
      console.error('API Error Response:', error.response.data);

      // Se for 401, redirecionar para login
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    } else if (error.request) {
      // Request foi feito mas não houve resposta
      console.error('API No Response:', error.request);
      console.error('Possível cold start do servidor. Tentando novamente...');
    } else {
      // Erro na configuração do request
      console.error('API Request Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Função de keepalive para prevenir cold starts do Render
let keepaliveInterval: NodeJS.Timeout | null = null;

export const startKeepalive = () => {
  // Evitar múltiplos intervals
  if (keepaliveInterval) {
    return;
  }

  console.log('🔥 Iniciando keepalive para prevenir cold starts...');

  // Ping inicial
  pingServer();

  // Ping a cada 10 minutos (Render free tier dorme após 15 min de inatividade)
  keepaliveInterval = setInterval(() => {
    pingServer();
  }, 10 * 60 * 1000); // 10 minutos
};

export const stopKeepalive = () => {
  if (keepaliveInterval) {
    clearInterval(keepaliveInterval);
    keepaliveInterval = null;
    console.log('❄️ Keepalive desativado');
  }
};

const pingServer = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/keepalive`, {
      timeout: 5000,
      withCredentials: true,
    });
    console.log('💓 Server keepalive:', response.data.message);
  } catch (error) {
    console.warn('⚠️ Keepalive falhou (servidor pode estar acordando):', error);
  }
};

export default api;
