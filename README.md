# Sistema de Controle Financeiro

Sistema local de controle financeiro para gestão de assinaturas, pagamentos, despesas, comissões e relatórios.

## 🚀 Tecnologias

### Backend
- **Node.js** + **Express** + **TypeScript**
- **Prisma ORM** com **SQLite**
- **CORS**, **Helmet** (segurança)
- Hot reload com **ts-node-dev**

### Frontend
- **React** + **TypeScript** + **Vite**
- **React Router** para navegação
- **Tailwind CSS** para estilização
- **Axios** para chamadas à API

## 📁 Estrutura do Projeto

```
FINANCASBUSCADOR/
├── src/
│   ├── backend/           # Servidor Express
│   │   ├── app.ts
│   │   ├── server.ts
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   └── utils/
│   ├── database/          # Prisma e migrations
│   │   ├── client.ts
│   │   ├── migrations/
│   │   └── seeds/
│   ├── shared/            # Tipos e constantes compartilhados
│   │   ├── types/
│   │   └── constants/
│   └── generated/         # Prisma Client gerado
├── frontend/              # Aplicação React
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── pages/         # Páginas
│   │   ├── services/      # API services
│   │   ├── hooks/         # Custom hooks
│   │   └── utils/         # Utilitários
├── prisma/
│   └── schema.prisma      # Schema do banco de dados
├── public/
├── tests/
└── config/
```

## 🔧 Instalação

### 1. Clonar o repositório (se aplicável)
```bash
git clone <url-do-repo>
cd FINANCASBUSCADOR
```

### 2. Instalar dependências

**Backend e dependências raiz:**
```bash
npm install
```

**Frontend:**
```bash
cd frontend
npm install
cd ..
```

### 3. Configurar variáveis de ambiente

O arquivo `.env` já está configurado com valores padrão:
```env
NODE_ENV=development
PORT=3001
HOST=localhost
DATABASE_URL="file:./dev.db"
CORS_ORIGIN=http://localhost:3000
```

### 4. Configurar banco de dados

```bash
# Gerar Prisma Client
npm run prisma:generate

# Executar migrations
npm run prisma:migrate

# Popular banco com dados iniciais (RECOMENDADO)
npx ts-node src/database/seeds/index.ts
```

**Seeds incluem:**
- ✅ Listas Auxiliares (2 contas, 3 métodos, 12 categorias, 6 indicadores)
- ✅ 5 usuários de teste com diferentes status

## 🚀 Como Rodar

### Modo Desenvolvimento (Backend + Frontend juntos)

```bash
npm run dev
```

Isso vai iniciar:
- **Backend** em: http://localhost:3001
- **Frontend** em: http://localhost:3000

### Rodar separadamente

**Backend apenas:**
```bash
npm run dev:backend
```

**Frontend apenas:**
```bash
npm run dev:frontend
```

## 📡 Endpoints da API

### Health Check
```
GET http://localhost:3001/health
```

### API Base
```
GET http://localhost:3001/api
```

### Endpoints disponíveis (em desenvolvimento):
- `/api/usuarios` - Gestão de usuários
- `/api/pagamentos` - Lançamentos de pagamentos
- `/api/despesas` - Controle de despesas
- `/api/agenda` - Agenda de renovações
- `/api/churn` - Registro de evasões
- `/api/comissoes` - Cálculo de comissões
- `/api/prospeccao` - Gestão de leads
- `/api/listas` - Listas auxiliares
- `/api/relatorios` - Relatórios e KPIs

## 🗄️ Banco de Dados

### Visualizar banco de dados (Prisma Studio)
```bash
npm run prisma:studio
```

Abre interface visual em: http://localhost:5555

### Modelos principais:
- **Usuario** - Cadastro de clientes/assinantes
- **Pagamento** - Lançamentos financeiros
- **Despesa** - Controle de custos
- **Agenda** - Renovações
- **Churn** - Evasões
- **Comissao** - Comissões calculadas
- **Prospeccao** - Leads
- **ListaAuxiliar** - Listas de apoio
- **Auditoria** - Log de ações

## 🧪 Testes

```bash
npm test
```

## 📦 Build para Produção

```bash
# Build completo (backend + frontend)
npm run build

# Rodar em produção
npm start
```

## 🛠️ Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Roda backend + frontend em paralelo |
| `npm run dev:backend` | Roda apenas o backend |
| `npm run dev:frontend` | Roda apenas o frontend |
| `npm run build` | Build de produção |
| `npm start` | Inicia servidor em produção |
| `npm run prisma:generate` | Gera Prisma Client |
| `npm run prisma:migrate` | Executa migrations |
| `npm run prisma:seed` | Popula banco com dados iniciais |
| `npm run prisma:studio` | Abre Prisma Studio |
| `npm test` | Executa testes |
| `npm run lint` | Executa ESLint |
| `npm run format` | Formata código com Prettier |

## 📋 Roadmap

Confira o arquivo [PLANO.md](./PLANO.md) para detalhes completos do desenvolvimento.

### Fases concluídas:
- ✅ **Fase 1** - Setup e Infraestrutura - **COMPLETO**
- ✅ **Fase 2** - Modelagem de Dados e Migrations - **COMPLETO**
- ✅ **Fase 3** - Backend (Services, Controllers, Routes) - **COMPLETO**
- ✅ **Fase 4** - Frontend (Layout Base e Componentes Comuns) - **COMPLETO**
- ✅ **Fase 5** - Implementação das Telas MVP (9/9 telas) - **COMPLETO**
  - Dashboard, Listas, Prospecção, Usuários, Pagamentos, Despesas, Agenda, Churn, Comissões, Relatórios
- ✅ **Fase 6** - Regras de Negócio e Integrações - **COMPLETO**
  - Cálculos automáticos (status, vencimento, comissão)
  - Fluxos integrados (Adesão → Renovação → Churn)
  - Job/cron diário para atualização de flags
- ✅ **Fase 7** - Importação e Exportação CSV/XLSX - **COMPLETO**
  - Exportação em todas as telas
  - Importação com mapeamento de colunas
  - Idempotência e validações

### Próximas fases (opcionais):
- ⏳ **Fase 8** - Auditoria e Logs - OPCIONAL
- ⏳ **Fase 9** - Testes e Validações - EM DESENVOLVIMENTO
- ✅ **Fase 10** - Documentação e Deploy - **COMPLETO**

## ✨ Novidades da Versão Atual

### Exportação de Dados 📤
Todas as telas possuem botão "Exportar" com opções CSV e XLSX.
- Respeita filtros ativos
- Formatação automática
- Suporte a acentuação (UTF-8 BOM)

### Importação de Dados 📥
Sistema de importação com preview e mapeamento:
- Upload de arquivos CSV/XLSX (drag & drop)
- Preview das primeiras 5 linhas
- Mapeamento automático de colunas
- Validação antes de importar
- Idempotência (não duplica registros)
- Implementado para Usuários (exemplo completo)

### Jobs Automáticos ⏰
Job diário para recalcular flags de vencimento:
```bash
npm run job:atualizar-flags
```
Configurável via cron ou PM2 (veja `src/backend/jobs/README.md`)

### Regras de Negócio Automatizadas 🤖
- Cálculo automático de vencimento (data_pagto + 30 dias)
- Atualização automática de status (ATIVO/EM_ATRASO)
- Cálculo e consolidação de comissões
- Flags automáticas (vence_hoje, prox_7_dias, em_atraso)

## 📝 Licença

ISC

## 👤 Autor

Sistema desenvolvido para controle financeiro local.
