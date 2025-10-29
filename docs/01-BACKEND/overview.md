# 🔧 Backend - Overview

> Visão geral do backend Node.js/Express/TypeScript

---

## 📋 Índice
- [Estrutura](#estrutura)
- [Arquitetura](#arquitetura)
- [Fluxo de Requisição](#fluxo-de-requisição)
- [Padrões](#padrões)
- [Convenções](#convenções)

---

## 📂 Estrutura

```
src/backend/
├── app.ts                  # ⚙️  Configuração Express
├── server.ts               # 🚀 Entry point do servidor
├── controllers/            # 🎮 Controllers (11 arquivos)
│   ├── usuarioController.ts
│   ├── pagamentoController.ts
│   ├── despesaController.ts
│   ├── agendaController.ts
│   ├── churnController.ts
│   ├── comissaoController.ts
│   ├── prospeccaoController.ts
│   ├── relatorioController.ts
│   ├── listaController.ts
│   └── authController.ts
├── services/               # 💼 Business logic (11 arquivos)
│   ├── usuarioService.ts
│   ├── pagamentoService.ts
│   ├── despesaService.ts
│   ├── agendaService.ts
│   ├── churnService.ts
│   ├── comissaoService.ts
│   ├── prospeccaoService.ts
│   ├── relatorioService.ts
│   ├── listaService.ts
│   ├── authService.ts
│   └── auditoriaService.ts
├── routes/                 # 🛣️  Rotas da API (11 arquivos)
│   ├── index.ts           # Router principal
│   ├── usuario.routes.ts
│   ├── pagamento.routes.ts
│   ├── despesa.routes.ts
│   ├── agenda.routes.ts
│   ├── churn.routes.ts
│   ├── comissao.routes.ts
│   ├── prospeccao.routes.ts
│   ├── relatorio.routes.ts
│   ├── lista.routes.ts
│   └── auth.routes.ts
├── middleware/             # 🛡️  Middlewares (3 arquivos)
│   ├── authMiddleware.ts  # Autenticação JWT
│   ├── auditMiddleware.ts # Auditoria de operações
│   └── errorHandler.ts    # Tratamento de erros
├── utils/                  # 🔧 Utilitários (3 arquivos)
│   ├── calculoComissao.ts # Cálculo de comissões
│   ├── dateUtils.ts       # Manipulação de datas
│   └── validators.ts      # Validadores customizados
├── jobs/                   # ⏰ Jobs automáticos
│   └── atualizarFlags.ts  # Atualização diária de flags
└── scripts/                # 📜 Scripts utilitários
    └── atualizarAgenda.ts
```

**Total:**
- ✅ 11 Controllers
- ✅ 11 Services
- ✅ 11 Routes
- ✅ 3 Middlewares
- ✅ 3 Utils
- ✅ 1 Job automático

**Localização base:** `/Users/jonathanmachado/Documents/FINANCASBUSCADOR/src/backend/`

---

## 🏗️ Arquitetura

### Padrão MVC Adaptado

```
Request → Routes → Middleware → Controller → Service → Prisma → PostgreSQL
                        ↓           ↓           ↓
                    Auth/Audit   Validação   Lógica de
                                  HTTP        Negócio
```

### Camadas

#### 1. **Routes Layer** (Roteamento)
**Arquivo:** `routes/*.routes.ts`

**Responsabilidades:**
- ✅ Definir endpoints REST
- ✅ Aplicar middlewares (auth, validation)
- ✅ Mapear HTTP methods para controllers

**Exemplo:**
```typescript
// usuario.routes.ts
import { Router } from 'express';
import { usuarioController } from '../controllers/usuarioController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware); // Todas as rotas protegidas

router.get('/', usuarioController.getAll);
router.post('/', usuarioController.create);
router.get('/:id', usuarioController.getById);
router.put('/:id', usuarioController.update);
router.delete('/:id', usuarioController.delete);

export default router;
```

#### 2. **Controller Layer** (Controle)
**Arquivo:** `controllers/*Controller.ts`

**Responsabilidades:**
- ✅ Receber req/res do Express
- ✅ Validar inputs básicos
- ✅ Chamar services apropriados
- ✅ Formatar respostas HTTP
- ✅ Tratar erros de alto nível

**Exemplo:**
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
      res.status(500).json({
        error: 'Erro ao buscar usuários',
        message: error.message,
      });
    }
  },

  async create(req: Request, res: Response): Promise<void> {
    try {
      const usuario = await usuarioService.create(req.body);
      res.status(201).json(usuario);
    } catch (error) {
      res.status(400).json({
        error: 'Erro ao criar usuário',
        message: error.message,
      });
    }
  },
};
```

#### 3. **Service Layer** (Lógica de Negócio)
**Arquivo:** `services/*Service.ts`

**Responsabilidades:**
- ✅ Implementar regras de negócio
- ✅ Validar dados complexos
- ✅ Interagir com Prisma (database)
- ✅ Calcular valores (comissões, status, etc)
- ✅ Coordenar operações multi-tabela
- ✅ Manter consistência de dados

**Exemplo:**
```typescript
// pagamentoService.ts
import { prisma } from '../../database/client';
import { calculoComissao } from '../utils/calculoComissao';

export const pagamentoService = {
  async create(data: CreatePagamentoDTO): Promise<Pagamento> {
    // 1. Busca usuário
    const usuario = await prisma.usuario.findUnique({
      where: { id: data.usuarioId },
    });

    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    // 2. Determina tipo de pagamento
    const regraTipo = usuario.ciclo === 0 ? 'PRIMEIRO' : 'RECORRENTE';

    // 3. Calcula comissão
    const comissao = calculoComissao(
      data.valor,
      regraTipo,
      usuario.regraValor
    );

    // 4. Transaction: cria pagamento + atualiza usuário + cria comissão
    const result = await prisma.$transaction(async (tx) => {
      // Cria pagamento
      const pagamento = await tx.pagamento.create({
        data: {
          ...data,
          regraTipo,
          comissaoValor: comissao,
          elegivelComissao: comissao > 0,
        },
      });

      // Atualiza usuário
      await tx.usuario.update({
        where: { id: usuario.id },
        data: {
          ciclo: usuario.ciclo + 1,
          dataVenc: addDays(data.dataPagto, 30),
          entrou: regraTipo === 'PRIMEIRO',
          renovou: regraTipo === 'RECORRENTE',
        },
      });

      // Cria comissão (se elegível)
      if (comissao > 0) {
        await tx.comissao.create({
          data: {
            pagamentoId: pagamento.id,
            indicador: usuario.indicador,
            regraTipo,
            valor: comissao,
          },
        });
      }

      return pagamento;
    });

    return result;
  },
};
```

---

## 🔄 Fluxo de Requisição

### Exemplo Completo: POST /api/pagamentos

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. CLIENT                                                        │
│    POST /api/pagamentos                                         │
│    Authorization: Bearer eyJhbGc...                             │
│    Body: { usuarioId: 1, valor: 100, ... }                     │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│ 2. EXPRESS APP (app.ts)                                         │
│    - CORS middleware                                            │
│    - Helmet (security headers)                                  │
│    - Body parser (JSON)                                         │
│    - Routes: /api/* → router                                    │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│ 3. ROUTES (routes/pagamento.routes.ts)                         │
│    POST / → authMiddleware → pagamentoController.create        │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│ 4. AUTH MIDDLEWARE (middleware/authMiddleware.ts)               │
│    - Valida JWT token                                           │
│    - Decodifica payload                                         │
│    - Adiciona req.user                                          │
│    - next() ou 401 Unauthorized                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│ 5. CONTROLLER (controllers/pagamentoController.ts)             │
│    - Recebe req.body                                            │
│    - Validação básica                                           │
│    - Chama pagamentoService.create(data)                       │
│    - Formata resposta HTTP                                      │
│    - Trata erros de alto nível                                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│ 6. SERVICE (services/pagamentoService.ts)                      │
│    - Busca usuário (Prisma)                                     │
│    - Determina regraTipo (PRIMEIRO/RECORRENTE)                 │
│    - Calcula comissão (utils/calculoComissao)                  │
│    - Inicia transaction Prisma                                  │
│    - Cria Pagamento                                             │
│    - Atualiza Usuario (ciclo, datas, flags)                    │
│    - Cria Comissao (se elegível)                               │
│    - Registra Auditoria                                         │
│    - Commit transaction                                         │
│    - Retorna pagamento criado                                   │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│ 7. PRISMA ORM                                                   │
│    - Gera SQL queries                                           │
│    - Executa transaction                                        │
│    - Retorna dados tipados                                      │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│ 8. POSTGRESQL                                                   │
│    - Executa queries                                            │
│    - Persiste dados                                             │
│    - Retorna resultados                                         │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│ 9. RESPONSE                                                     │
│    Status: 201 Created                                          │
│    Body: { id: 123, valor: 100, ... }                          │
└─────────────────────────────────────────────────────────────────┘
```

**Tempo típico:** ~50-150ms

---

## 📏 Padrões e Convenções

### 1. Nomenclatura

#### Arquivos
```typescript
// Controllers: *Controller.ts
usuarioController.ts
pagamentoController.ts

// Services: *Service.ts
usuarioService.ts
pagamentoService.ts

// Routes: *.routes.ts
usuario.routes.ts
pagamento.routes.ts

// Middleware: *Middleware.ts
authMiddleware.ts
auditMiddleware.ts

// Utils: camelCase.ts
calculoComissao.ts
dateUtils.ts
```

#### Variáveis e Funções
```typescript
// camelCase para variáveis e funções
const usuarioAtivo = await getUsuarioAtivo(id);

// PascalCase para types e interfaces
interface CreateUsuarioDTO {
  emailLogin: string;
  nomeCompleto: string;
}

// UPPER_SNAKE_CASE para constantes
const MAX_RETRIES = 3;
const DEFAULT_TIMEOUT = 5000;
```

### 2. Tipagem TypeScript

**Regra de Ouro:** ZERO uso de `any`

```typescript
// ❌ ERRADO
const processData = (data: any) => {
  return data.value;
};

// ✅ CORRETO
interface InputData {
  value: number;
}

const processData = (data: InputData): number => {
  return data.value;
};
```

**Tipos de Retorno Explícitos:**

```typescript
// ❌ ERRADO (tipo inferido)
async function getUsuarios() {
  return prisma.usuario.findMany();
}

// ✅ CORRETO (tipo explícito)
async function getUsuarios(): Promise<Usuario[]> {
  return prisma.usuario.findMany();
}
```

### 3. Error Handling

```typescript
// Service: throw Error com mensagens claras
async create(data: CreateDTO): Promise<Entity> {
  if (!data.required) {
    throw new Error('Campo obrigatório não fornecido');
  }

  // ... lógica
}

// Controller: catch e formata resposta HTTP
async create(req: Request, res: Response): Promise<void> {
  try {
    const result = await service.create(req.body);
    res.status(201).json(result);
  } catch (error) {
    // Log do erro
    console.error('Erro ao criar:', error);

    // Resposta HTTP apropriada
    const status = error.message.includes('não encontrado') ? 404 : 400;
    res.status(status).json({
      error: 'Erro ao criar entidade',
      message: error.message,
    });
  }
}
```

### 4. Async/Await

**Sempre use async/await**, nunca callbacks ou `.then()`

```typescript
// ❌ ERRADO (callbacks)
prisma.usuario.findMany((err, usuarios) => {
  if (err) { /* ... */ }
  // ...
});

// ❌ ERRADO (.then)
prisma.usuario.findMany()
  .then(usuarios => { /* ... */ })
  .catch(err => { /* ... */ });

// ✅ CORRETO (async/await)
async function getUsuarios(): Promise<Usuario[]> {
  try {
    const usuarios = await prisma.usuario.findMany();
    return usuarios;
  } catch (error) {
    throw new Error(`Erro ao buscar usuários: ${error.message}`);
  }
}
```

### 5. Transactions

**Use transactions para operações multi-tabela:**

```typescript
// ✅ CORRETO
const resultado = await prisma.$transaction(async (tx) => {
  const pagamento = await tx.pagamento.create({ data: { ... } });
  const usuario = await tx.usuario.update({ where: { ... }, data: { ... } });
  const comissao = await tx.comissao.create({ data: { ... } });

  return { pagamento, usuario, comissao };
});
```

---

## 🔐 Segurança

### 1. Autenticação JWT

Todas as rotas (exceto `/api/auth/login`) são protegidas:

```typescript
// routes/index.ts
import { authMiddleware } from '../middleware/authMiddleware';

// Rotas públicas
router.use('/auth', authRoutes); // Login não requer auth

// Todas as outras rotas requerem auth
router.use(authMiddleware);

router.use('/usuarios', usuarioRoutes);
router.use('/pagamentos', pagamentoRoutes);
// ...
```

### 2. Validação de Inputs

```typescript
// express-validator
import { body, validationResult } from 'express-validator';

router.post('/',
  body('emailLogin').isEmail(),
  body('valor').isFloat({ min: 0 }),
  body('dataPagto').isISO8601(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Processa...
  }
);
```

### 3. Prepared Statements

Prisma usa prepared statements por padrão. **Zero SQL injection possível.**

---

## 📊 Performance

### 1. Paginação

```typescript
// ✅ Sempre pagine listagens
async function getAll(page = 1, limit = 10): Promise<Usuario[]> {
  return prisma.usuario.findMany({
    skip: (page - 1) * limit,
    take: limit,
  });
}
```

### 2. Seleção de Campos

```typescript
// ❌ EVITE (seleciona todos os campos)
const usuario = await prisma.usuario.findUnique({
  where: { id },
});

// ✅ PREFIRA (seleciona apenas necessários)
const usuario = await prisma.usuario.findUnique({
  where: { id },
  select: {
    id: true,
    emailLogin: true,
    nomeCompleto: true,
  },
});
```

### 3. Índices

Schema Prisma com índices apropriados:

```prisma
model Usuario {
  id           Int    @id @default(autoincrement())
  emailLogin   String @unique  // ← índice automático
  statusFinal  StatusFinal
  venceHoje    Boolean

  @@index([statusFinal])     // ← índice para filtros
  @@index([venceHoje])
}
```

---

## 🎯 Próximos Passos

- **Controllers detalhados** → [controllers.md](./controllers.md)
- **Services detalhados** → [services.md](./services.md)
- **Routes detalhadas** → [routes.md](./routes.md)
- **Middleware** → [middleware.md](./middleware.md)
- **Utils** → [utils.md](./utils.md)
- **Jobs** → [jobs.md](./jobs.md)

---

**Última atualização:** 2025-10-29
