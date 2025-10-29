# 🏗️ Architecture - Arquitetura do Sistema

> Arquitetura detalhada do sistema de controle financeiro

---

## 📐 Visão Geral da Arquitetura

Este sistema segue uma **arquitetura em camadas (Layered Architecture)** com separação clara de responsabilidades.

```
┌──────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                        │
│                      (React Frontend)                         │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │   Pages    │  │ Components │  │   Hooks    │            │
│  └──────┬─────┘  └──────┬─────┘  └──────┬─────┘            │
│         └────────────────┴────────────────┘                  │
│                         │                                     │
│                  ┌──────▼───────┐                            │
│                  │   Services   │ (API Clients)              │
│                  └──────────────┘                            │
└────────────────────────┬─────────────────────────────────────┘
                         │ HTTP/REST (JSON)
                         │ JWT Token Auth
┌────────────────────────▼─────────────────────────────────────┐
│                     APPLICATION LAYER                         │
│                   (Express.js Backend)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Routes  │─▶│Controller│─▶│ Services │─▶│  Utils   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│       │              │              │                        │
│       │        ┌─────▼──────┐       │                        │
│       │        │ Middleware │       │                        │
│       │        └────────────┘       │                        │
│       │                             │                        │
└───────┼─────────────────────────────┼────────────────────────┘
        │                             │
        │ Auth/Audit                  │ Business Logic
        │                             │
┌───────▼─────────────────────────────▼────────────────────────┐
│                       DATA LAYER                              │
│                     (Prisma ORM)                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │              Prisma Client                          │     │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐        │     │
│  │  │ Models   │  │ Queries  │  │Migrations│        │     │
│  │  └──────────┘  └──────────┘  └──────────┘        │     │
│  └────────────────────────────────────────────────────┘     │
└────────────────────────┬─────────────────────────────────────┘
                         │ SQL
┌────────────────────────▼─────────────────────────────────────┐
│                    PERSISTENCE LAYER                          │
│                      (PostgreSQL)                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Usuario  │  │Pagamento │  │ Despesa  │  │ Agenda   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │  Churn   │  │ Comissao │  │Prospeccao│  + 3 mais       │
│  └──────────┘  └──────────┘  └──────────┘                 │
└──────────────────────────────────────────────────────────────┘
```

---

## 🎭 Camadas Detalhadas

### 1. Presentation Layer (Frontend)

**Tecnologias:** React 19, TypeScript, Tailwind CSS, Vite

**Estrutura:**

```typescript
frontend/src/
├── pages/              // 📄 Páginas/rotas (12 páginas)
│   ├── Dashboard.tsx   // Página principal com KPIs
│   ├── Usuarios.tsx    // Gestão de usuários
│   └── ...
├── components/         // 🧩 Componentes reutilizáveis (60+)
│   ├── common/         // Componentes genéricos
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   └── Table.tsx
│   └── [feature]/      // Componentes específicos por feature
│       ├── usuarios/
│       ├── pagamentos/
│       └── ...
├── hooks/              // 🪝 Custom hooks (13 hooks)
│   ├── useUsuarios.ts
│   ├── usePagamentos.ts
│   └── ...
├── services/           // 🌐 API clients (11 services)
│   ├── api.ts          // Axios configurado
│   ├── usuarioService.ts
│   └── ...
├── contexts/           // 📦 State management
│   ├── AuthContext.tsx // Autenticação global
│   └── ThemeContext.tsx // Dark/Light mode
└── utils/              // 🔧 Utilitários
    ├── formatters.ts
    └── validators.ts
```

**Responsabilidades:**
- ✅ Renderizar UI responsiva
- ✅ Gerenciar estado local e global
- ✅ Validar inputs do usuário
- ✅ Fazer requisições HTTP para backend
- ✅ Tratar erros de forma amigável
- ✅ Implementar roteamento (React Router)

**Padrões:**
- **Component Pattern** - Componentes reutilizáveis e atômicos
- **Custom Hooks** - Lógica reutilizável extraída em hooks
- **Context API** - Estado global (Auth, Theme)
- **Service Layer** - Separação de lógica de API

---

### 2. Application Layer (Backend)

**Tecnologias:** Node.js, Express.js, TypeScript

**Estrutura:**

```typescript
src/backend/
├── server.ts           // 🚀 Entry point
├── app.ts              // ⚙️ Configuração Express
├── routes/             // 🛣️ Definição de rotas (11 arquivos)
│   ├── index.ts        // Router principal
│   ├── usuario.routes.ts
│   └── ...
├── controllers/        // 🎮 Controllers (11 arquivos)
│   ├── usuarioController.ts
│   ├── pagamentoController.ts
│   └── ...
├── services/           // 💼 Business logic (11 arquivos)
│   ├── usuarioService.ts
│   ├── pagamentoService.ts
│   └── ...
├── middleware/         // 🛡️ Middlewares
│   ├── authMiddleware.ts    // Validação JWT
│   ├── auditMiddleware.ts   // Auditoria
│   └── errorHandler.ts      // Tratamento de erros
├── utils/              // 🔧 Utilitários
│   ├── calculoComissao.ts
│   ├── dateUtils.ts
│   └── validators.ts
└── jobs/               // ⏰ Jobs automáticos
    └── atualizarFlags.ts
```

**Camadas Internas:**

#### A. Routes Layer
```typescript
// usuario.routes.ts
import { Router } from 'express';
import { usuarioController } from '../controllers/usuarioController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Todas as rotas protegidas
router.use(authMiddleware);

// Define endpoints
router.get('/', usuarioController.getAll);
router.post('/', usuarioController.create);
router.get('/:id', usuarioController.getById);
router.put('/:id', usuarioController.update);
router.delete('/:id', usuarioController.delete);

export default router;
```

**Responsabilidades:**
- ✅ Definir endpoints REST
- ✅ Aplicar middlewares (auth, validation)
- ✅ Mapear HTTP methods para controllers

---

#### B. Controller Layer
```typescript
// usuarioController.ts
import type { Request, Response } from 'express';
import { usuarioService } from '../services/usuarioService';

export const usuarioController = {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const usuarios = await usuarioService.getAll();
      res.json(usuarios);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
  },

  async create(req: Request, res: Response): Promise<void> {
    try {
      const usuario = await usuarioService.create(req.body);
      res.status(201).json(usuario);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // ... outros métodos
};
```

**Responsabilidades:**
- ✅ Receber requisições HTTP
- ✅ Validar inputs básicos
- ✅ Chamar services apropriados
- ✅ Formatar respostas HTTP
- ✅ Tratar erros de alto nível

---

#### C. Service Layer
```typescript
// usuarioService.ts
import { prisma } from '../../database/client';
import type { Usuario, Prisma } from '@prisma/client';

export const usuarioService = {
  async getAll(): Promise<Usuario[]> {
    return prisma.usuario.findMany({
      orderBy: { createdAt: 'desc' },
    });
  },

  async create(data: Prisma.UsuarioCreateInput): Promise<Usuario> {
    // Validações de negócio
    if (!data.emailLogin) {
      throw new Error('Email é obrigatório');
    }

    // Verifica duplicatas
    const existing = await prisma.usuario.findUnique({
      where: { emailLogin: data.emailLogin },
    });

    if (existing) {
      throw new Error('Email já cadastrado');
    }

    // Cria usuário
    const usuario = await prisma.usuario.create({
      data: {
        ...data,
        statusFinal: 'INATIVO', // Status inicial
        ciclo: 0,
      },
    });

    return usuario;
  },

  // ... lógica complexa de negócio
};
```

**Responsabilidades:**
- ✅ Implementar regras de negócio
- ✅ Validar dados complexos
- ✅ Interagir com database via Prisma
- ✅ Calcular valores (comissões, status, etc)
- ✅ Coordenar operações multi-tabela
- ✅ Manter consistência de dados

---

#### D. Middleware Layer
```typescript
// authMiddleware.ts
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    res.status(401).json({ error: 'Token não fornecido' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};
```

**Tipos de Middleware:**
1. **authMiddleware** - Valida JWT
2. **auditMiddleware** - Registra operações
3. **errorHandler** - Trata erros globalmente
4. **express-validator** - Valida inputs

---

### 3. Data Layer (Prisma ORM)

**Tecnologias:** Prisma Client, Prisma Migrate

**Estrutura:**

```typescript
prisma/
├── schema.prisma       // 📋 Schema do banco
├── migrations/         // 📦 Histórico de migrations
│   ├── 20251004_init/
│   └── ...
└── seed.ts            // 🌱 Seeds (futuro)

src/database/
├── client.ts          // 🔌 Prisma Client singleton
└── seeds/             // 🌱 Scripts de seed
    ├── index.ts
    ├── createFirstAdmin.ts
    └── listasAuxiliares.seed.ts
```

**Prisma Client Singleton:**

```typescript
// src/database/client.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

**Responsabilidades:**
- ✅ Gerar cliente TypeScript type-safe
- ✅ Executar queries SQL
- ✅ Gerenciar conexões com DB
- ✅ Aplicar migrations
- ✅ Popular banco com seeds

**Vantagens do Prisma:**
- ✅ Type-safe - TypeScript end-to-end
- ✅ Auto-completion no VSCode
- ✅ Migrations automáticas
- ✅ Prepared statements (SQL injection protection)
- ✅ Prisma Studio para visualização

---

### 4. Persistence Layer (PostgreSQL)

**Tecnologias:** PostgreSQL 14+

**Estrutura do Banco:**

```sql
-- 10 tabelas principais
Usuario        -- Assinantes
Pagamento      -- Pagamentos recebidos
Despesa        -- Despesas
Agenda         -- Renovações futuras
Churn          -- Cancelamentos
Comissao       -- Comissões consolidadas
Prospeccao     -- Leads
ListaAuxiliar  -- Listas (contas, métodos, etc)
Auditoria      -- Log de operações
Admin          -- Usuários admin do sistema
```

**Relacionamentos:**

```
Usuario (1) ──< (N) Pagamento
Usuario (1) ──< (N) Agenda
Usuario (1) ──< (N) Churn
Usuario (1) ──> (1) Prospeccao (opcional)

Pagamento (1) ──> (1) Comissao (opcional)
```

---

## 🔄 Fluxo de Dados

### Exemplo: Criar Pagamento

```
┌──────────┐
│ Frontend │
└────┬─────┘
     │ 1. POST /api/pagamentos { usuarioId, valor, ... }
     ▼
┌──────────────────┐
│ Backend - Routes │
└────┬─────────────┘
     │ 2. authMiddleware valida JWT
     ▼
┌─────────────────────┐
│ Backend - Controller│
└────┬────────────────┘
     │ 3. pagamentoController.create(req, res)
     │ 4. Valida inputs
     ▼
┌─────────────────────┐
│ Backend - Service   │
└────┬────────────────┘
     │ 5. pagamentoService.create(data)
     │ 6. Busca usuário no Prisma
     │ 7. Determina regraTipo (PRIMEIRO/RECORRENTE)
     │ 8. Calcula comissão
     │ 9. Cria Pagamento
     │ 10. Atualiza Usuario (ciclo, datas, flags)
     │ 11. Cria Comissao (se elegível)
     ▼
┌──────────────┐
│ Prisma ORM   │
└────┬─────────┘
     │ 12. Executa queries SQL (transaction)
     ▼
┌──────────────┐
│ PostgreSQL   │
└────┬─────────┘
     │ 13. Persiste dados
     │ 14. Retorna resultados
     ▼
┌─────────────────────┐
│ Backend - Service   │
└────┬────────────────┘
     │ 15. Registra auditoria
     │ 16. Retorna pagamento criado
     ▼
┌─────────────────────┐
│ Backend - Controller│
└────┬────────────────┘
     │ 17. Formata resposta HTTP
     ▼
┌──────────┐
│ Frontend │ 18. Atualiza UI
└──────────┘
```

---

## 🛡️ Segurança na Arquitetura

### 1. Autenticação JWT

```
┌──────────┐                   ┌──────────┐
│ Frontend │ 1. POST /login    │ Backend  │
│          │ ──────────────────▶          │
│          │                    │          │
│          │ 2. Valida credenc.│          │
│          │ 3. Gera JWT token │          │
│          │ 4. {token: "xyz"} │          │
│          │ ◀──────────────────          │
│          │                    │          │
│          │ 5. Salva em        │          │
│          │    localStorage    │          │
│          │                    │          │
│          │ 6. Toda req inclui:│          │
│          │    Authorization:  │          │
│          │    Bearer xyz      │          │
│          │ ──────────────────▶          │
│          │                    │          │
│          │ 7. authMiddleware  │          │
│          │    valida token    │          │
│          │                    │          │
│          │ 8. Se válido, cont.│          │
│          │ ◀──────────────────          │
└──────────┘                   └──────────┘
```

### 2. CORS

```typescript
// app.ts
import cors from 'cors';

app.use(cors({
  origin: process.env.CORS_ORIGIN, // http://localhost:3000
  credentials: true,
}));
```

### 3. Validação de Inputs

```typescript
// Nível 1: TypeScript (compile-time)
interface CreatePagamentoDTO {
  usuarioId: number;
  valor: number;
  dataPagto: Date;
}

// Nível 2: express-validator (runtime)
router.post('/',
  body('usuarioId').isInt(),
  body('valor').isFloat({ min: 0 }),
  body('dataPagto').isISO8601(),
  pagamentoController.create
);

// Nível 3: Service (business rules)
if (valor <= 0) {
  throw new Error('Valor deve ser positivo');
}
```

---

## 📊 Escalabilidade

### Pontos de Escalabilidade

1. **Horizontal Scaling**
   - Backend stateless (JWT, sem sessões)
   - Load balancer (Nginx, Railway, Vercel)
   - Database connection pooling

2. **Caching** (futuro)
   - Redis para cache de queries frequentes
   - Cache de relatórios

3. **Database Optimization**
   - Índices em colunas frequentemente consultadas
   - Paginação em todas as listagens
   - Lazy loading de relacionamentos

---

## 🎯 Próximos Passos

1. **Ver Tecnologias** → [tech-stack.md](./tech-stack.md)
2. **Explorar Backend** → [../01-BACKEND/overview.md](../01-BACKEND/overview.md)
3. **Explorar Frontend** → [../02-FRONTEND/overview.md](../02-FRONTEND/overview.md)
4. **Explorar Database** → [../03-DATABASE/overview.md](../03-DATABASE/overview.md)

---

**Última atualização:** 2025-10-29
