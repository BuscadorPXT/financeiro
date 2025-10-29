# ⚙️ Setup - Instalação e Configuração

> Guia completo para configurar o ambiente de desenvolvimento local

---

## 📋 Pré-requisitos

### Obrigatórios

| Software | Versão Mínima | Link |
|----------|---------------|------|
| **Node.js** | 18.x ou superior | https://nodejs.org/ |
| **npm** | 9.x ou superior | (vem com Node.js) |
| **PostgreSQL** | 14.x ou superior | https://www.postgresql.org/ |
| **Git** | 2.x ou superior | https://git-scm.com/ |

### Opcionais (Recomendados)

| Software | Finalidade |
|----------|------------|
| **VSCode** | IDE recomendada com extensões TypeScript |
| **Postman/Insomnia** | Testar API REST |
| **pgAdmin** | Gerenciar PostgreSQL visualmente |
| **Docker** | Rodar PostgreSQL em container |

---

## 🚀 Instalação Passo a Passo

### 1. Clone o Repositório

```bash
# Clone via HTTPS
git clone <repository-url> financasbuscador
cd financasbuscador

# Ou clone via SSH
git clone git@<repository-ssh-url> financasbuscador
cd financasbuscador
```

### 2. Configure PostgreSQL

#### Opção A: PostgreSQL Local

```bash
# No psql ou pgAdmin, crie o banco:
CREATE DATABASE financasbuscador;
CREATE USER financas_user WITH PASSWORD 'sua_senha_forte';
GRANT ALL PRIVILEGES ON DATABASE financasbuscador TO financas_user;
```

#### Opção B: PostgreSQL via Docker (Recomendado)

```bash
# Crie container PostgreSQL
docker run --name financas-postgres \
  -e POSTGRES_DB=financasbuscador \
  -e POSTGRES_USER=financas_user \
  -e POSTGRES_PASSWORD=sua_senha_forte \
  -p 5432:5432 \
  -d postgres:14

# Verifique se está rodando
docker ps
```

#### Opção C: PostgreSQL na Nuvem

Use serviços como:
- **Railway** - https://railway.app (recomendado)
- **Supabase** - https://supabase.com
- **Neon** - https://neon.tech
- **ElephantSQL** - https://elephantsql.com

### 3. Configure Variáveis de Ambiente

#### Backend (.env na raiz)

```bash
# Copie o exemplo
cp .env.example .env

# Edite .env com seus valores
nano .env  # ou use seu editor preferido
```

**Conteúdo do .env:**

```env
# Ambiente
NODE_ENV=development

# Servidor
PORT=3001
HOST=localhost

# Database (ajuste com suas credenciais)
DATABASE_URL="postgresql://financas_user:sua_senha_forte@localhost:5432/financasbuscador?schema=public"

# CORS (frontend em desenvolvimento)
CORS_ORIGIN=http://localhost:3000

# JWT (MUDE este secret em produção!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_EXPIRES_IN=7d

# Logs
LOG_LEVEL=debug
```

#### Frontend (.env no diretório frontend/)

```bash
# Entre no diretório frontend
cd frontend

# Copie o exemplo
cp .env.example .env

# Edite .env
nano .env
```

**Conteúdo do frontend/.env:**

```env
# API URL - em dev, usa proxy do Vite (não precisa configurar)
# Em produção, configure no Vercel:
# VITE_API_URL=https://seu-backend.railway.app/api

# Em desenvolvimento, deixe comentado (usa proxy)
# VITE_API_URL=http://localhost:3001/api
```

**IMPORTANTE:** Em dev, o frontend usa proxy do Vite (configurado em `vite.config.ts`), então não precisa definir `VITE_API_URL`.

### 4. Instale Dependências

#### Backend (raiz do projeto)

```bash
# Certifique-se de estar na raiz
cd /path/to/financasbuscador

# Instale dependências
npm install

# Verifique se instalou corretamente
npm list --depth=0
```

**Principais dependências instaladas:**
- `express` - Framework web
- `prisma` - ORM e migrations
- `@prisma/client` - Cliente do Prisma
- `typescript` - Compilador TypeScript
- `jsonwebtoken` - Autenticação JWT
- `bcryptjs` - Hash de senhas
- `express-validator` - Validação de inputs

#### Frontend

```bash
# Entre no diretório frontend
cd frontend

# Instale dependências
npm install

# Verifique se instalou corretamente
npm list --depth=0
```

**Principais dependências instaladas:**
- `react` - Framework UI
- `vite` - Build tool
- `typescript` - Compilador TypeScript
- `tailwindcss` - CSS framework
- `axios` - HTTP client
- `react-router-dom` - Roteamento
- `recharts` - Gráficos

### 5. Configure o Database

```bash
# Volte para a raiz do projeto
cd ..

# Gere o Prisma Client
npm run prisma:generate

# Aplique migrations (cria tabelas)
npm run prisma:migrate

# Popule com dados iniciais (admin, listas, etc)
npm run prisma:seed
```

**O que o seed cria:**
- Admin padrão: `admin` / `Admin@123`
- Listas auxiliares (contas, métodos, categorias, indicadores)
- (Opcional) Usuários de teste com Faker

### 6. Verifique a Conexão

```bash
# Teste conexão com o banco
npx ts-node src/database/test-connection.ts

# Esperado: "✅ Conectado ao banco de dados com sucesso!"
```

Se der erro:
- Verifique se PostgreSQL está rodando
- Verifique `DATABASE_URL` no `.env`
- Teste conexão: `psql -U financas_user -d financasbuscador`

---

## 🏃 Execute o Sistema

### Opção 1: Backend + Frontend Juntos (Recomendado)

```bash
# Na raiz do projeto
npm run dev
```

Isso inicia:
- ✅ Backend em http://localhost:3001
- ✅ Frontend em http://localhost:3000

### Opção 2: Backend e Frontend Separados

#### Terminal 1 - Backend

```bash
# Na raiz
npm run dev:backend
```

#### Terminal 2 - Frontend

```bash
# No diretório frontend
cd frontend
npm run dev
```

---

## 🌐 Acesse o Sistema

### URLs Locais

| Serviço | URL | Credenciais |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | admin / Admin@123 |
| **Backend API** | http://localhost:3001/api | - |
| **API Docs** | http://localhost:3001/api/health | - |
| **Prisma Studio** | http://localhost:5555 | (execute `npm run prisma:studio`) |

### Primeiro Acesso

1. Abra http://localhost:3000
2. Faça login:
   - **Login:** `admin`
   - **Senha:** `Admin@123`
3. Será redirecionado para o Dashboard

**⚠️ IMPORTANTE:** Mude a senha padrão em produção!

---

## 🧪 Teste a Instalação

### 1. Teste Backend

```bash
# Health check
curl http://localhost:3001/api/health

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login": "admin", "senha": "Admin@123"}'

# Esperado: { "token": "eyJhbGc...", "usuario": {...} }
```

### 2. Teste Frontend

1. Abra http://localhost:3000
2. Deve ver a tela de Login
3. Após login, deve ver o Dashboard com KPIs

### 3. Execute Testes Automatizados

```bash
# Backend - Testes unitários
npm test

# Frontend - Testes de componentes
cd frontend
npm test
```

---

## 🛠️ Ferramentas de Desenvolvimento

### VSCode Extensions (Recomendadas)

Instale estas extensões para melhor experiência:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "prisma.prisma",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "usernamehw.errorlens"
  ]
}
```

### Configuração do VSCode

Crie `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

### Prisma Studio

Ferramenta visual para explorar o banco:

```bash
# Abre interface web em http://localhost:5555
npm run prisma:studio
```

---

## 🔧 Comandos Úteis

### Database

```bash
# Gerar Prisma Client após mudar schema
npm run prisma:generate

# Criar nova migration
npx prisma migrate dev --name nome_da_migration

# Aplicar migrations
npm run prisma:migrate

# Resetar banco (CUIDADO: apaga tudo!)
npx prisma migrate reset

# Popular com seeds
npm run prisma:seed

# Abrir Prisma Studio
npm run prisma:studio
```

### Development

```bash
# Dev mode (backend + frontend)
npm run dev

# Apenas backend
npm run dev:backend

# Apenas frontend
npm run dev:frontend

# Build de produção
npm run build

# Start produção
npm start
```

### Testing & Quality

```bash
# Rodar testes
npm test

# Testes em watch mode
npm run test:watch

# Coverage
npm run test:coverage

# Lint
npm run lint

# Format
npm run format
```

### Jobs

```bash
# Atualizar flags de vencimento
npm run job:atualizar-flags
```

---

## 🐛 Troubleshooting

### Erro: "Cannot connect to database"

**Solução:**
```bash
# Verifique se PostgreSQL está rodando
# Docker:
docker ps

# Local:
sudo service postgresql status  # Linux
brew services list               # macOS

# Teste conexão manual
psql -U financas_user -d financasbuscador -h localhost -p 5432
```

### Erro: "Port 3001 already in use"

**Solução:**
```bash
# Linux/macOS - Encontre e mate o processo
lsof -ti:3001 | xargs kill -9

# Ou mude a porta no .env
PORT=3002
```

### Erro: "Prisma Client not generated"

**Solução:**
```bash
npm run prisma:generate
```

### Erro: "Cannot find module '@prisma/client'"

**Solução:**
```bash
# Reinstale dependências
rm -rf node_modules
npm install
npm run prisma:generate
```

### Frontend não conecta ao Backend

**Solução:**
```bash
# 1. Verifique se backend está rodando
curl http://localhost:3001/api/health

# 2. Verifique CORS no .env backend
CORS_ORIGIN=http://localhost:3000

# 3. Verifique proxy no vite.config.ts
# Deve ter:
# server: {
#   proxy: {
#     '/api': 'http://localhost:3001'
#   }
# }
```

---

## 🔄 Atualizar Projeto

```bash
# Puxe últimas mudanças
git pull origin main

# Instale novas dependências
npm install
cd frontend && npm install && cd ..

# Aplique migrations
npm run prisma:migrate

# Gere Prisma Client
npm run prisma:generate

# Reinicie
npm run dev
```

---

## 🎯 Próximos Passos

Agora que o sistema está rodando:

1. **Explore a Arquitetura** → [architecture.md](./architecture.md)
2. **Veja as Tecnologias** → [tech-stack.md](./tech-stack.md)
3. **Comece a Desenvolver** → [../08-DEVELOPMENT/conventions.md](../08-DEVELOPMENT/conventions.md)

---

## 📞 Ajuda

**Problema não resolvido?**
- Veja [FAQ](../09-REFERENCE/faq.md)
- Veja [Troubleshooting completo](../07-DEPLOYMENT/troubleshooting.md)
- Abra uma issue no repositório

---

**Última atualização:** 2025-10-29
