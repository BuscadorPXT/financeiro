# Sistema de Autentica��o - FINANCASBUSCADOR

## Vis�o Geral

Este documento descreve a arquitetura completa para implementar um sistema de autentica��o com login e senha no sistema FINANCASBUSCADOR. Todos os usu�rios autenticados ter�o acesso completo (100%) ao sistema.

### Estado Atual do Sistema

- **Backend**: Node.js + Express + TypeScript (porta 3001)
- **Frontend**: React + TypeScript + Vite (porta 3000)
- **Banco de Dados**: PostgreSQL com Prisma ORM
- **Estrutura**: API RESTful em `/api/*`
- **Middleware**: Error handler, CORS, Helmet (seguran�a)
- **Context**: ThemeContext j� implementado (padr�o para seguir)

## Arquitetura Proposta

### 1. Modelo de Dados

Criar um novo model `Admin` no schema do Prisma para gerenciar usu�rios administradores:

**Arquivo**: `prisma/schema.prisma`

```prisma
// Model Admin (usu�rios do sistema)
model Admin {
  id          String    @id @default(uuid())
  login       String    @unique
  senha       String    // Hash bcrypt
  nome        String
  ativo       Boolean   @default(true)
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  @@map("admins")
}
```

### 2. Backend - Estrutura de Arquivos

#### 2.1 Controller: `src/backend/controllers/authController.ts`

```typescript
import { Request, Response } from 'express';
import authService from '../services/authService';
import { catchAsync } from '../middleware/errorHandler';
import { HTTP_STATUS } from '../../shared/constants';

class AuthController {
  /**
   * POST /api/auth/login
   * Autentica usu�rio e retorna token JWT
   */
  login = catchAsync(async (req: Request, res: Response) => {
    const { login, senha } = req.body;

    if (!login || !senha) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: 'error',
        message: 'Login e senha s�o obrigat�rios',
      });
    }

    const result = await authService.login(login, senha);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: result,
      message: 'Login realizado com sucesso',
    });
  });

  /**
   * POST /api/auth/logout
   * Invalida o token (opcional - pode ser feito apenas no frontend)
   */
  logout = catchAsync(async (req: Request, res: Response) => {
    // Implementar se necess�rio blacklist de tokens
    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      message: 'Logout realizado com sucesso',
    });
  });

  /**
   * GET /api/auth/me
   * Retorna dados do usu�rio autenticado
   */
  me = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id; // Vem do middleware de autentica��o

    const user = await authService.getMe(userId);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: user,
    });
  });

  /**
   * POST /api/auth/change-password
   * Altera senha do usu�rio autenticado
   */
  changePassword = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { senhaAtual, senhaNova } = req.body;

    if (!senhaAtual || !senhaNova) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: 'error',
        message: 'Senha atual e nova senha s�o obrigat�rias',
      });
    }

    await authService.changePassword(userId, senhaAtual, senhaNova);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      message: 'Senha alterada com sucesso',
    });
  });
}

export default new AuthController();
```

#### 2.2 Service: `src/backend/services/authService.ts`

```typescript
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../database/client';
import { AppError } from '../middleware/errorHandler';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

class AuthService {
  /**
   * Autentica usu�rio e retorna token
   */
  async login(login: string, senha: string) {
    // Buscar admin
    const admin = await prisma.admin.findUnique({
      where: { login },
    });

    if (!admin) {
      throw new AppError('Login ou senha inv�lidos', 401);
    }

    if (!admin.ativo) {
      throw new AppError('Usu�rio desativado', 401);
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, admin.senha);

    if (!senhaValida) {
      throw new AppError('Login ou senha inv�lidos', 401);
    }

    // Gerar token JWT
    const token = jwt.sign(
      {
        id: admin.id,
        login: admin.login,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return {
      token,
      user: {
        id: admin.id,
        login: admin.login,
        nome: admin.nome,
      },
    };
  }

  /**
   * Retorna dados do usu�rio autenticado
   */
  async getMe(userId: string) {
    const admin = await prisma.admin.findUnique({
      where: { id: userId },
      select: {
        id: true,
        login: true,
        nome: true,
        ativo: true,
        createdAt: true,
      },
    });

    if (!admin) {
      throw new AppError('Usu�rio n�o encontrado', 404);
    }

    return admin;
  }

  /**
   * Altera senha do usu�rio
   */
  async changePassword(userId: string, senhaAtual: string, senhaNova: string) {
    const admin = await prisma.admin.findUnique({
      where: { id: userId },
    });

    if (!admin) {
      throw new AppError('Usu�rio n�o encontrado', 404);
    }

    // Verificar senha atual
    const senhaValida = await bcrypt.compare(senhaAtual, admin.senha);

    if (!senhaValida) {
      throw new AppError('Senha atual incorreta', 401);
    }

    // Hash da nova senha
    const senhaHash = await bcrypt.hash(senhaNova, 10);

    // Atualizar senha
    await prisma.admin.update({
      where: { id: userId },
      data: { senha: senhaHash },
    });

    return true;
  }

  /**
   * Cria primeiro admin (seed)
   */
  async createAdmin(login: string, senha: string, nome: string) {
    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    const admin = await prisma.admin.create({
      data: {
        login,
        senha: senhaHash,
        nome,
      },
    });

    return {
      id: admin.id,
      login: admin.login,
      nome: admin.nome,
    };
  }
}

export default new AuthService();
```

#### 2.3 Middleware de Autentica��o: `src/backend/middleware/authMiddleware.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler';
import prisma from '../../database/client';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

// Estender interface Request do Express
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        login: string;
      };
    }
  }
}

/**
 * Middleware para verificar autentica��o JWT
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Pegar token do header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Token n�o fornecido', 401);
    }

    const token = authHeader.substring(7); // Remove "Bearer "

    // Verificar token
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      login: string;
    };

    // Verificar se usu�rio ainda existe e est� ativo
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.id },
    });

    if (!admin || !admin.ativo) {
      throw new AppError('Usu�rio n�o autorizado', 401);
    }

    // Adicionar usu�rio ao request
    req.user = {
      id: decoded.id,
      login: decoded.login,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError('Token inv�lido', 401));
    }
    if (error instanceof jwt.TokenExpiredError) {
      return next(new AppError('Token expirado', 401));
    }
    next(error);
  }
};

/**
 * Middleware opcional - pode ser aplicado em rotas espec�ficas
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, JWT_SECRET) as {
        id: string;
        login: string;
      };

      req.user = {
        id: decoded.id,
        login: decoded.login,
      };
    }

    next();
  } catch (error) {
    // Ignora erros de autentica��o, continua sem usu�rio
    next();
  }
};
```

#### 2.4 Rotas: `src/backend/routes/auth.routes.ts`

```typescript
import { Router } from 'express';
import authController from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// Rotas p�blicas
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Rotas protegidas
router.get('/me', authenticate, authController.me);
router.post('/change-password', authenticate, authController.changePassword);

export default router;
```

#### 2.5 Atualizar `src/backend/routes/index.ts`

```typescript
import { Router } from 'express';
import authRoutes from './auth.routes';
import listaRoutes from './lista.routes';
import usuarioRoutes from './usuario.routes';
import pagamentoRoutes from './pagamento.routes';
import despesaRoutes from './despesa.routes';
import agendaRoutes from './agenda.routes';
import churnRoutes from './churn.routes';
import comissaoRoutes from './comissao.routes';
import prospeccaoRoutes from './prospeccao.routes';
import relatorioRoutes from './relatorio.routes';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// Test route (p�blica)
router.get('/', (_req, res) => {
  res.json({
    message: 'API FINANCASBUSCADOR - Sistema de Controle Financeiro',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api',
      auth: '/api/auth',
      listas: '/api/listas',
      usuarios: '/api/usuarios',
      pagamentos: '/api/pagamentos',
      despesas: '/api/despesas',
      agenda: '/api/agenda',
      churn: '/api/churn',
      comissoes: '/api/comissoes',
      prospeccao: '/api/prospeccao',
      relatorios: '/api/relatorios',
    },
  });
});

// Rotas de autentica��o (p�blicas)
router.use('/auth', authRoutes);

// TODAS as outras rotas protegidas por autentica��o
router.use('/listas', authenticate, listaRoutes);
router.use('/usuarios', authenticate, usuarioRoutes);
router.use('/pagamentos', authenticate, pagamentoRoutes);
router.use('/despesas', authenticate, despesaRoutes);
router.use('/agenda', authenticate, agendaRoutes);
router.use('/churn', authenticate, churnRoutes);
router.use('/comissoes', authenticate, comissaoRoutes);
router.use('/prospeccao', authenticate, prospeccaoRoutes);
router.use('/relatorios', authenticate, relatorioRoutes);

export default router;
```

### 3. Frontend - Estrutura de Arquivos

#### 3.1 Service: `frontend/src/services/authService.ts`

```typescript
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
```

#### 3.2 Context: `frontend/src/contexts/AuthContext.tsx`

```typescript
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import authService, { LoginCredentials, User } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Verificar autentica��o ao carregar
  useEffect(() => {
    const initAuth = async () => {
      const token = authService.getToken();

      if (token) {
        try {
          const userData = await authService.getMe();
          setUser(userData);
        } catch (error) {
          console.error('Erro ao buscar dados do usu�rio:', error);
          authService.removeToken();
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const { token, user: userData } = await authService.login(credentials);

      authService.setToken(token);
      setUser(userData as User);

      navigate('/');
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      authService.removeToken();
      setUser(null);
      navigate('/login');
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await authService.getMe();
      setUser(userData);
    } catch (error) {
      console.error('Erro ao atualizar usu�rio:', error);
      logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

#### 3.3 Componente de Rota Protegida: `frontend/src/components/auth/PrivateRoute.tsx`

```typescript
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const PrivateRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
```

#### 3.4 P�gina de Login: `frontend/src/pages/Login.tsx`

```typescript
import { useState, FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login: authLogin, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Se j� est� autenticado, redirecionar
  if (isAuthenticated) {
    navigate('/');
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await authLogin({ login, senha });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao fazer login';
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-xl">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">FINANCASBUSCADOR</h1>
          <p className="text-gray-600 mt-2">Sistema de Controle Financeiro</p>
        </div>

        {/* Formul�rio */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mensagem de erro */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {/* Campo Login */}
          <div>
            <label htmlFor="login" className="block text-sm font-medium text-gray-700 mb-2">
              Login
            </label>
            <input
              type="text"
              id="login"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Digite seu login"
              required
              disabled={isLoading}
            />
          </div>

          {/* Campo Senha */}
          <div>
            <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <input
              type="password"
              id="senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Digite sua senha"
              required
              disabled={isLoading}
            />
          </div>

          {/* Bot�o Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
```

#### 3.5 Atualizar `frontend/src/services/api.ts`

```typescript
import axios from 'axios';
import authService from './authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.DEV ? '/api' : 'http://localhost:3001/api'
);

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor - adicionar token
api.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - tratar erros de autentica��o
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Se receber 401, redirecionar para login
    if (error.response?.status === 401) {
      authService.removeToken();
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
```

#### 3.6 Atualizar `frontend/src/App.tsx`

```typescript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/auth/PrivateRoute';
import Layout from './components/common/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Listas from './pages/Listas';
import Prospeccao from './pages/Prospeccao';
import Usuarios from './pages/Usuarios';
import Pagamentos from './pages/Pagamentos';
import Despesas from './pages/Despesas';
import Agenda from './pages/Agenda';
import Churn from './pages/Churn';
import Comissoes from './pages/Comissoes';
import Relatorios from './pages/Relatorios';
import './index.css';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <Routes>
            {/* Rota p�blica de login */}
            <Route path="/login" element={<Login />} />

            {/* Rotas protegidas */}
            <Route element={<PrivateRoute />}>
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="/listas" element={<Listas />} />
                <Route path="/prospeccao" element={<Prospeccao />} />
                <Route path="/usuarios" element={<Usuarios />} />
                <Route path="/pagamentos" element={<Pagamentos />} />
                <Route path="/despesas" element={<Despesas />} />
                <Route path="/agenda" element={<Agenda />} />
                <Route path="/churn" element={<Churn />} />
                <Route path="/comissoes" element={<Comissoes />} />
                <Route path="/relatorios" element={<Relatorios />} />
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
```

#### 3.7 Adicionar bot�o de logout ao Header: `frontend/src/components/common/Header.tsx`

Adicionar ao Header existente:

```typescript
import { useAuth } from '../../contexts/AuthContext';

// No componente Header:
const { user, logout } = useAuth();

// Adicionar bot�o de logout:
<button
  onClick={logout}
  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
>
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
  Sair ({user?.nome})
</button>
```

### 4. Vari�veis de Ambiente

#### `.env` (Backend)

```env
# Backend Server
NODE_ENV=development
PORT=3001
HOST=localhost

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/financasbuscador"

# CORS
CORS_ORIGIN=http://localhost:3000

# JWT
JWT_SECRET=seu-secret-super-seguro-aqui-min-32-caracteres
JWT_EXPIRES_IN=7d

# Outros
LOG_LEVEL=debug
```

### 5. Seed para Criar Primeiro Admin

**Arquivo**: `src/database/seeds/createFirstAdmin.ts`

```typescript
import prisma from '../client';
import authService from '../../backend/services/authService';

async function createFirstAdmin() {
  console.log('<1 Criando primeiro admin...');

  try {
    // Verificar se j� existe algum admin
    const existingAdmin = await prisma.admin.findFirst();

    if (existingAdmin) {
      console.log('�  J� existe um admin cadastrado. Pulando seed.');
      return;
    }

    // Criar admin padr�o
    const admin = await authService.createAdmin(
      'admin',      // login
      'admin123',   // senha (MUDAR EM PRODU��O!)
      'Administrador'  // nome
    );

    console.log(' Admin criado com sucesso:');
    console.log(`   Login: admin`);
    console.log(`   Senha: admin123`);
    console.log(`   IMPORTANTE: Altere a senha ap�s o primeiro login!`);

  } catch (error) {
    console.error('L Erro ao criar admin:', error);
    throw error;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  createFirstAdmin()
    .then(() => {
      console.log(' Seed conclu�do');
      process.exit(0);
    })
    .catch((error) => {
      console.error('L Erro no seed:', error);
      process.exit(1);
    });
}

export default createFirstAdmin;
```

### 6. Depend�ncias Necess�rias

Adicionar ao `package.json`:

```json
{
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.5"
  }
}
```

## Fluxo de Autentica��o

### 1. Login
```
1. Usu�rio acessa /login
2. Digita login e senha
3. Frontend envia POST /api/auth/login
4. Backend valida credenciais
5. Backend gera token JWT
6. Frontend armazena token no localStorage
7. Frontend redireciona para /
```

### 2. Requisi��es Autenticadas
```
1. Frontend intercepta requisi��o (api.ts)
2. Adiciona header: Authorization: Bearer {token}
3. Backend valida token (authMiddleware)
4. Backend processa requisi��o
5. Retorna resposta
```

### 3. Logout
```
1. Usu�rio clica em "Sair"
2. Frontend remove token do localStorage
3. Frontend redireciona para /login
```

### 4. Token Expirado
```
1. Backend retorna 401 Unauthorized
2. Interceptor do axios detecta 401
3. Remove token e redireciona para /login
```

## Passos de Implementa��o

### Passo 1: Preparar Backend

```bash
# Instalar depend�ncias
npm install bcryptjs jsonwebtoken
npm install -D @types/bcryptjs @types/jsonwebtoken

# Atualizar schema do Prisma (adicionar model Admin)
# Executar migration
npx prisma migrate dev --name add-admin-auth

# Gerar Prisma Client
npx prisma generate
```

### Passo 2: Criar Arquivos Backend

1.  Criar `src/backend/middleware/authMiddleware.ts`
2.  Criar `src/backend/services/authService.ts`
3.  Criar `src/backend/controllers/authController.ts`
4.  Criar `src/backend/routes/auth.routes.ts`
5.  Atualizar `src/backend/routes/index.ts`

### Passo 3: Criar Primeiro Admin

```bash
# Criar seed
npx ts-node src/database/seeds/createFirstAdmin.ts

# Ou adicionar ao seed principal
```

### Passo 4: Criar Arquivos Frontend

1.  Criar `frontend/src/services/authService.ts`
2.  Criar `frontend/src/contexts/AuthContext.tsx`
3.  Criar `frontend/src/components/auth/PrivateRoute.tsx`
4.  Criar `frontend/src/pages/Login.tsx`
5.  Atualizar `frontend/src/services/api.ts`
6.  Atualizar `frontend/src/App.tsx`
7.  Atualizar `frontend/src/components/common/Header.tsx` (adicionar logout)

### Passo 5: Testar

```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend

# Acessar http://localhost:3000
# Login: admin
# Senha: admin123
```

### Passo 6: Funcionalidades Adicionais (Opcional)

1. **Gerenciamento de Admins**
   - CRUD de admins
   - Ativar/desativar admins
   - Resetar senha

2. **Seguran�a Avan�ada**
   - Rate limiting (limitar tentativas de login)
   - Refresh tokens
   - Blacklist de tokens
   - 2FA (autentica��o de dois fatores)

3. **Auditoria**
   - Log de logins
   - Hist�rico de acessos
   - Usar tabela Auditoria existente

## Seguran�a

### Boas Pr�ticas Implementadas

1.  Senhas com bcrypt (hash + salt)
2.  JWT com expira��o
3.  Token no header (n�o em query params)
4.  Valida��o de token em cada requisi��o
5.  Verifica��o de usu�rio ativo
6.  HTTPS em produ��o (configurar no servidor)
7.  Helmet.js j� configurado
8.  CORS configurado

### Recomenda��es de Produ��o

1. **JWT_SECRET**: Use um secret forte (min 32 caracteres aleat�rios)
2. **HTTPS**: Obrigat�rio em produ��o
3. **Rate Limiting**: Implementar para /auth/login
4. **Logs**: Monitorar tentativas de login falhas
5. **Backup**: Fazer backup regular do banco
6. **Senhas**: For�ar troca da senha padr�o

## Troubleshooting

### Erro: "Token inv�lido"
- Verificar se JWT_SECRET � o mesmo no backend
- Verificar formato do token no header
- Verificar expira��o do token

### Erro: "CORS"
- Verificar CORS_ORIGIN no .env
- Verificar se frontend est� na porta correta

### Erro: "Cannot read property 'id' of undefined"
- Verificar se middleware authenticate est� aplicado na rota
- Verificar se token est� sendo enviado

### Login n�o funciona
- Verificar senha (bcrypt � case-sensitive)
- Verificar se usu�rio est� ativo
- Verificar logs do backend

---

**Documento criado em**: 2025-10-08
**Vers�o**: 1.0
**Sistema**: FINANCASBUSCADOR


## Log de Implementação

### [2025-10-08] Início da Implementação

#### ✅ Passo 1: Instalação de Dependências (CONCLUÍDO)
- Instalado `bcryptjs` e `jsonwebtoken`
- Instalado types: `@types/bcryptjs` e `@types/jsonwebtoken`
- Comando: `npm install bcryptjs jsonwebtoken`
- Comando: `npm install -D @types/bcryptjs @types/jsonwebtoken`

#### ✅ Passo 2: Atualização do Schema Prisma (CONCLUÍDO)
- Adicionado model `Admin` ao schema.prisma
- Campos: id, login (unique), senha (hash), nome, ativo, createdAt, updatedAt
- Tabela mapeada para: `admins`

#### 🔄 Passo 3: Migration do Banco de Dados
- Em andamento...


#### ✅ Passo 3: Migration do Banco de Dados (CONCLUÍDO)
- Executado: `npx prisma db push`
- Tabela `admins` criada com sucesso no PostgreSQL
- Prisma Client regenerado

#### 🔄 Passo 4: Criando arquivos do Backend
- Iniciando criação dos arquivos...


#### ✅ Passo 4: Criando arquivos do Backend (CONCLUÍDO)
- ✅ authMiddleware.ts criado - Middleware JWT para autenticação
- ✅ authService.ts criado - Lógica de login, senha, tokens
- ✅ authController.ts criado - Endpoints de autenticação
- ✅ auth.routes.ts criado - Rotas /api/auth/*
- ✅ routes/index.ts atualizado - Todas rotas protegidas com authenticate

#### 🔄 Passo 5: Criando seed do primeiro admin
- Script criado: createFirstAdmin.ts
- Executando seed...


#### ✅ Passo 5: Seed do Primeiro Admin (CONCLUÍDO)
- Script executado: `npx ts-node src/database/seeds/createFirstAdmin.ts`
- Admin criado com sucesso!
  - Login: **admin**
  - Senha: **admin123**
  - ⚠️ IMPORTANTE: Alterar senha após primeiro login

---

## Backend Completo! ✅

Todos os arquivos do backend foram criados e o banco de dados está pronto.

---

#### 🔄 Passo 6: Criando arquivos do Frontend
- Iniciando criação dos arquivos React/TypeScript...


#### ✅ Passo 6: Frontend Completo! (CONCLUÍDO)
- ✅ authService.ts (frontend) - Gerenciamento de autenticação
- ✅ AuthContext.tsx - Context API para autenticação
- ✅ PrivateRoute.tsx - Componente de proteção de rotas
- ✅ Login.tsx - Página de login com dark mode
- ✅ api.ts atualizado - Interceptor de token JWT
- ✅ App.tsx atualizado - Rotas protegidas e públicas
- ✅ Header.tsx atualizado - Botão de logout e nome do usuário
- ✅ .env.example atualizado - Variáveis JWT_SECRET e JWT_EXPIRES_IN

---

## Frontend Completo! ✅

Todos os arquivos do frontend foram criados e integrados com sucesso!

---

#### 🧪 Passo 7: Testando o Sistema
- Iniciando testes...


#### ✅ Passo 7: Testes do Sistema (CONCLUÍDO)

**Testes realizados com sucesso:**

1. ✅ **Health Check**: `GET /health` - Sistema online
2. ✅ **Login**: `POST /api/auth/login` 
   - Credenciais: admin / admin123
   - Retornou token JWT válido
   - Retornou dados do usuário
3. ✅ **Autenticação**: `GET /api/auth/me`
   - Token JWT aceito
   - Dados do usuário retornados corretamente
4. ✅ **Proteção de rotas**: Rotas sem token retornam 401 Unauthorized
5. ✅ **Middleware**: Todas as rotas da API estão protegidas

---

## 🎉 IMPLEMENTAÇÃO COMPLETA! 

### Resumo da Implementação

✅ **Backend (100%)**
- Model Admin no Prisma (PostgreSQL)
- JWT com bcrypt para senhas
- Middleware de autenticação
- Controller, Service e Routes de autenticação
- Todas as rotas protegidas
- Seed do primeiro admin criado

✅ **Frontend (100%)**
- AuthContext com React Context API
- PrivateRoute para proteção de rotas
- Página de Login responsiva com dark mode
- Interceptor axios para token JWT
- Header com logout e nome do usuário
- Integração completa com backend

✅ **Segurança**
- Senhas com hash bcrypt
- Token JWT com expiração (7 dias)
- Todas as rotas protegidas por autenticação
- Logout automático em caso de token inválido/expirado
- CORS configurado

### Como Usar

1. **Iniciar backend**: `npm run dev:backend`
2. **Iniciar frontend**: `npm run dev:frontend`
3. **Acessar**: http://localhost:3000
4. **Login**: admin / admin123
5. **⚠️ IMPORTANTE**: Alterar senha padrão em produção!

### Próximos Passos (Opcional)

- [ ] Implementar troca de senha via interface
- [ ] Criar CRUD de administradores
- [ ] Adicionar refresh tokens
- [ ] Implementar rate limiting no login
- [ ] Adicionar auditoria de acessos
- [ ] Configurar 2FA (autenticação de dois fatores)

---

**Implementação finalizada em**: 2025-10-08
**Status**: ✅ COMPLETO
**Testado**: ✅ SIM


---

## Atualização: Sidebar com Logout e Informações do Usuário

### [2025-10-08] Melhorias na Sidebar

#### ✅ Modificações Implementadas

**Arquivo modificado**: `frontend/src/components/common/Sidebar.tsx`

**Funcionalidades adicionadas:**

1. **Seção de Usuário**
   - Avatar com gradiente azul/cyan
   - Nome completo do usuário
   - Login/username
   - Versão expandida e colapsada (responsiva)

2. **Botão de Logout**
   - Ícone de logout (LogOut do lucide-react)
   - Confirmação antes de sair ("Deseja realmente sair do sistema?")
   - Estilo com hover vermelho para indicar ação de saída
   - Funciona tanto expandido quanto colapsado

3. **Integração com AuthContext**
   - Usa `useAuth()` para obter dados do usuário
   - Usa função `logout()` do contexto
   - Exibe informações em tempo real

4. **UX/UI Melhorada**
   - Animações suaves com framer-motion
   - Tooltips quando sidebar está colapsada
   - Avatar visual com ícone de usuário
   - Border e cores consistentes com o design system

**Código das alterações:**

```tsx
// Imports adicionados
import { LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

// No componente Sidebar
const { user, logout } = useAuth();

const handleLogout = () => {
  if (window.confirm('Deseja realmente sair do sistema?')) {
    logout();
  }
};

// Nova seção User Section (acima do Footer)
// - Modo expandido: mostra avatar + nome/login + botão "Sair do Sistema"
// - Modo colapsado: mostra apenas avatar e ícone de logout com tooltips
```

**Resultado:**
- ✅ Nome do usuário exibido na sidebar
- ✅ Botão de logout na sidebar
- ✅ Confirmação antes de logout
- ✅ Design responsivo (expandido/colapsado)
- ✅ Animações suaves
- ✅ Tooltips informativos

**Preview das funcionalidades:**

**Sidebar Expandida:**
```
┌────────────────────────┐
│ [Avatar] Administrador │
│          admin         │
├────────────────────────┤
│ 🚪 Sair do Sistema     │
└────────────────────────┘
```

**Sidebar Colapsada:**
```
┌──┐
│ A│ <- Avatar (com tooltip: "Administrador")
├──┤
│🚪│ <- Logout (com tooltip: "Sair do Sistema")
└──┘
```

---

**Última atualização**: 2025-10-08
**Feature**: Sidebar com Logout ✅

