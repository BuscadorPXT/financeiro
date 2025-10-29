# ⚡ Quick Reference - Referência Rápida

> Guia de referência rápida com todas as informações essenciais do sistema

---

## 🚀 Quick Start

```bash
# Setup inicial
git clone <repo-url>
npm install && cd frontend && npm install && cd ..
cp .env.example .env
cp frontend/.env.example frontend/.env

# Configure DATABASE_URL no .env
# DATABASE_URL="postgresql://user:pass@localhost:5432/financas"

# Setup database
npm run prisma:migrate
npm run prisma:seed

# Run
npm run dev  # Backend (3001) + Frontend (3000)

# Login padrão
# user: admin
# pass: Admin@123
```

---

## 📁 Estrutura do Projeto

```
FINANCASBUSCADOR/
├── src/backend/          # Backend Node.js/Express
│   ├── controllers/      # 11 controllers
│   ├── services/         # 11 services (business logic)
│   ├── routes/           # 11 routes
│   ├── middleware/       # auth, audit, errorHandler
│   ├── utils/            # calculoComissao, dateUtils
│   └── jobs/             # atualizarFlags
├── frontend/src/         # Frontend React/Vite
│   ├── pages/            # 12 páginas
│   ├── components/       # 60+ componentes
│   ├── hooks/            # 13 custom hooks
│   ├── services/         # 11 API services
│   └── contexts/         # Auth, Theme
├── prisma/               # Database schema + migrations
└── docs/                 # Esta documentação
```

---

## 🌐 API Endpoints

### Auth
```
POST   /api/auth/login          # Login (público)
POST   /api/auth/logout         # Logout
GET    /api/auth/me             # Dados do usuário logado
```

### Usuarios
```
GET    /api/usuarios            # Listar (paginado)
GET    /api/usuarios/:id        # Buscar por ID
POST   /api/usuarios            # Criar
PUT    /api/usuarios/:id        # Atualizar
DELETE /api/usuarios/:id        # Desativar
GET    /api/usuarios/stats      # Estatísticas
POST   /api/usuarios/import     # Importar CSV/XLSX
```

### Pagamentos
```
GET    /api/pagamentos          # Listar
GET    /api/pagamentos/:id      # Buscar por ID
POST   /api/pagamentos          # Criar
PUT    /api/pagamentos/:id      # Atualizar
DELETE /api/pagamentos/:id      # Deletar
GET    /api/pagamentos/stats    # Estatísticas
```

### Despesas
```
GET    /api/despesas            # Listar
GET    /api/despesas/:id        # Buscar por ID
POST   /api/despesas            # Criar
PUT    /api/despesas/:id        # Atualizar
DELETE /api/despesas/:id        # Deletar
GET    /api/despesas/stats      # Estatísticas
```

### Agenda
```
GET    /api/agenda              # Listar renovações futuras
GET    /api/agenda/:id          # Buscar por ID
POST   /api/agenda/renovar/:id  # Marcar como renovado
POST   /api/agenda/cancelar/:id # Marcar como cancelado
```

### Churn
```
GET    /api/churn               # Listar churns
GET    /api/churn/:id           # Buscar por ID
POST   /api/churn               # Criar churn
POST   /api/churn/reverter/:id  # Reverter churn
```

### Comissoes
```
GET    /api/comissoes           # Listar
GET    /api/comissoes/indicador # Por indicador
GET    /api/comissoes/regra     # Por regra (PRIMEIRO/RECORRENTE)
GET    /api/comissoes/mes/:mes  # Por mês
```

### Prospeccao
```
GET    /api/prospeccao          # Listar leads
GET    /api/prospeccao/:id      # Buscar por ID
POST   /api/prospeccao          # Criar lead
PUT    /api/prospeccao/:id      # Atualizar lead
DELETE /api/prospeccao/:id      # Deletar lead
POST   /api/prospeccao/converter/:id # Converter em usuário
```

### Relatorios
```
GET    /api/relatorios/dashboard      # KPIs do dashboard
GET    /api/relatorios/mensal         # Relatório mensal
GET    /api/relatorios/indicador      # Por indicador
GET    /api/relatorios/idade-titulos  # Idade de títulos
```

### Listas Auxiliares
```
GET    /api/listas/:tipo        # Buscar por tipo (CONTA, METODO, etc)
POST   /api/listas              # Criar
PUT    /api/listas/:id          # Atualizar
DELETE /api/listas/:id          # Deletar
```

**Tipos de listas:** `CONTA`, `METODO`, `CATEGORIA`, `INDICADOR`

---

## 🔑 Autenticação

### Login
```typescript
// POST /api/auth/login
{
  "login": "admin",
  "senha": "Admin@123"
}

// Response
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "usuario": {
    "id": 1,
    "login": "admin",
    "nome": "Administrador"
  }
}
```

### Uso do Token
```typescript
// Todas as requisições (exceto /auth/login)
headers: {
  'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIs...'
}
```

### Frontend (Axios)
```typescript
// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Interceptor para adicionar token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## 📊 Models do Database

### Usuario
```typescript
{
  id: number;
  emailLogin: string;          // único
  nomeCompleto: string;
  telefone?: string;
  indicador?: string;
  statusFinal: StatusFinal;    // ATIVO | EM_ATRASO | INATIVO | HISTORICO
  venceHoje: boolean;
  prox7Dias: boolean;
  emAtraso: boolean;
  metodo?: MetodoPagamento;
  conta?: string;
  ciclo: number;
  totalCiclosUsuario: number;
  dataPagto?: Date;
  mesPagto?: string;
  dataVenc?: Date;
  diasParaVencer?: number;
  regraTipo?: RegraTipo;       // PRIMEIRO | RECORRENTE
  regraValor?: number;
  elegivelComissao: boolean;
  comissaoValor?: number;
  flagAgenda: boolean;
  entrou: boolean;
  renovou: boolean;
  ativoAtual: boolean;
  churn: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Pagamento
```typescript
{
  id: number;
  usuarioId: number;
  dataPagto: Date;
  mesPagto: string;            // YYYY-MM
  metodo: MetodoPagamento;
  conta: string;
  valor: number;
  regraTipo: RegraTipo;
  regraValor: number;
  elegivelComissao: boolean;
  comissaoValor: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### Despesa
```typescript
{
  id: number;
  categoria: string;
  descricao: string;
  conta: string;
  indicador?: string;
  valor: number;
  status: StatusDespesa;       // PAGO | PENDENTE
  competenciaMes: number;      // 1-12
  competenciaAno: number;      // YYYY
  createdAt: Date;
  updatedAt: Date;
}
```

### Agenda
```typescript
{
  id: number;
  usuarioId: number;
  dataVenc: Date;
  diasParaVencer: number;
  ciclo: number;
  status: StatusAgenda;        // ATIVO | INATIVO
  renovou: boolean;
  cancelou: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Churn
```typescript
{
  id: number;
  usuarioId: number;
  dataChurn: Date;
  motivo?: string;
  revertido: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Comissao
```typescript
{
  id: number;
  pagamentoId: number;
  indicador: string;
  regraTipo: RegraTipo;
  valor: number;
  mesRef: string;              // YYYY-MM
  createdAt: Date;
  updatedAt: Date;
}
```

### Prospeccao
```typescript
{
  id: number;
  email: string;
  nome: string;
  telefone?: string;
  origem?: string;
  indicador?: string;
  convertido: boolean;
  usuarioId?: number;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 🔄 Regras de Negócio Essenciais

### Status do Usuário

```typescript
// Cálculo automático
if (diasParaVencer >= 1) {
  statusFinal = 'ATIVO';
} else if (diasParaVencer < 0) {
  statusFinal = 'EM_ATRASO';
}

// Flags
venceHoje = (diasParaVencer === 0);
prox7Dias = (diasParaVencer >= 1 && diasParaVencer <= 7);
emAtraso = (diasParaVencer < 0);
```

### Tipo de Pagamento

```typescript
// PRIMEIRO: primeiro pagamento (ciclo = 0)
if (usuario.ciclo === 0) {
  regraTipo = 'PRIMEIRO';
  // Ações: entrou = true, ciclo = 1
}

// RECORRENTE: renovação (ciclo > 0)
if (usuario.ciclo > 0) {
  regraTipo = 'RECORRENTE';
  // Ações: renovou = true, ciclo++
}
```

### Comissão

```typescript
// Elegível se:
if (usuario.indicador && usuario.regraTipo && usuario.regraValor > 0) {
  elegivelComissao = true;
  comissaoValor = (valor * regraValor) / 100;
}
```

### Data de Vencimento

```typescript
// Sempre +30 dias do pagamento
dataVenc = addDays(dataPagto, 30);
```

---

## 🛠️ NPM Scripts

### Development
```bash
npm run dev              # Backend + Frontend juntos
npm run dev:backend      # Backend apenas (3001)
npm run dev:frontend     # Frontend apenas (3000)
```

### Build
```bash
npm run build            # Build backend
npm run build:frontend   # Build frontend
npm run build:all        # Build tudo
npm start                # Start produção
```

### Database
```bash
npm run prisma:generate  # Gera Prisma Client
npm run prisma:migrate   # Aplica migrations
npm run prisma:seed      # Popula banco
npm run prisma:studio    # Abre Prisma Studio (5555)
```

### Tests
```bash
npm test                 # Todos os testes
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage
npm run test:backend     # Testes backend
```

### Quality
```bash
npm run lint             # ESLint
npm run format           # Prettier
```

### Jobs
```bash
npm run job:atualizar-flags  # Atualiza flags de vencimento
```

---

## 🌍 Variáveis de Ambiente

### Backend (.env)
```env
NODE_ENV=development
PORT=3001
HOST=localhost
DATABASE_URL="postgresql://user:pass@host:5432/db"
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=your-super-secret-min-32-chars
JWT_EXPIRES_IN=7d
LOG_LEVEL=debug
```

### Frontend (frontend/.env)
```env
# Dev: usa proxy, não precisa configurar
# Prod: configurar no Vercel
VITE_API_URL=https://seu-backend.railway.app/api
```

---

## 📦 Tech Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express 5.1.0
- **Language:** TypeScript 5.9.3
- **Database:** PostgreSQL 14+
- **ORM:** Prisma 6.16.3
- **Auth:** JWT (jsonwebtoken 9.0.2)
- **Security:** bcryptjs, helmet, cors

### Frontend
- **Framework:** React 19.1.1
- **Build:** Vite 7.1.7
- **Language:** TypeScript 5.9.3
- **Styling:** Tailwind CSS 3.4.18
- **HTTP:** Axios 1.12.2
- **Router:** React Router DOM 7.9.3
- **Charts:** Recharts 3.2.1
- **Icons:** Lucide React 0.544.0

---

## 🐛 Troubleshooting Comum

### "Cannot connect to database"
```bash
# Verifique se PostgreSQL está rodando
docker ps  # Se usando Docker
psql -U user -d db -h localhost  # Teste conexão

# Verifique DATABASE_URL no .env
```

### "Port 3001 already in use"
```bash
# Linux/macOS
lsof -ti:3001 | xargs kill -9

# Ou mude a porta no .env
PORT=3002
```

### "Prisma Client not generated"
```bash
npm run prisma:generate
```

### "Cannot find module '@prisma/client'"
```bash
rm -rf node_modules
npm install
npm run prisma:generate
```

### Frontend não conecta ao Backend
```bash
# 1. Verifique se backend está rodando
curl http://localhost:3001/api/health

# 2. Verifique CORS no .env backend
CORS_ORIGIN=http://localhost:3000

# 3. Verifique proxy no vite.config.ts
```

### Erro de Login
```bash
# Verifique credenciais padrão
# Login: admin
# Senha: Admin@123

# Ou crie novo admin
npx ts-node src/database/seeds/createFirstAdmin.ts
```

---

## 🎯 Fluxos Principais

### 1. Lead → Usuário → Pagamento
```
Prospeccao → Converter → Usuario (ciclo=0) → Pagamento PRIMEIRO → Ativo
```

### 2. Renovação
```
Agenda → Marcar Renovado → Pagamento RECORRENTE → Atualiza ciclo + dataVenc
```

### 3. Cancelamento
```
Agenda → Marcar Cancelado → Churn → Usuario INATIVO
```

---

## 📞 Recursos

### Documentação
- **Getting Started:** [docs/00-GETTING-STARTED/](../00-GETTING-STARTED/)
- **Backend:** [docs/01-BACKEND/](../01-BACKEND/)
- **Frontend:** [docs/02-FRONTEND/](../02-FRONTEND/)
- **Database:** [docs/03-DATABASE/](../03-DATABASE/)
- **Business Rules:** [docs/04-BUSINESS-RULES/](../04-BUSINESS-RULES/)
- **API Reference:** [docs/05-API-REFERENCE/](../05-API-REFERENCE/)

### Links Úteis
- **Node.js:** https://nodejs.org/
- **TypeScript:** https://www.typescriptlang.org/
- **Prisma:** https://www.prisma.io/
- **React:** https://react.dev/
- **Vite:** https://vitejs.dev/
- **Tailwind:** https://tailwindcss.com/

---

## ⚡ Atalhos de Desenvolvimento

```bash
# Desenvolvimento rápido
npm run dev

# Testar API
curl http://localhost:3001/api/health

# Ver banco
npm run prisma:studio

# Rodar testes
npm test

# Verificar tipos
npx tsc --noEmit

# Lint + fix
npm run lint -- --fix

# Format
npm run format
```

---

## 🎓 Checklist de Qualidade

Antes de commit:
- ✅ **Tipagem:** 100% explícita, zero `any`
- ✅ **Testes:** Passando (`npm test`)
- ✅ **Lint:** Sem erros (`npm run lint`)
- ✅ **Format:** Formatado (`npm run format`)
- ✅ **Build:** Compila (`npm run build`)
- ✅ **Tipos:** Type check passa (`npx tsc --noEmit`)

---

**Última atualização:** 2025-10-29
