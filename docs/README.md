# 📚 Documentação Técnica - Sistema de Controle Financeiro

> Documentação completa e estruturada seguindo as **Regras de Ouro para Desenvolvimento com IA** de alto nível.

---

## 🎯 Sobre Este Sistema

Sistema completo de controle financeiro para gerenciamento de:
- **Assinaturas e Usuários** - Gestão completa de assinantes com status automático
- **Pagamentos** - Processamento com cálculo automático de comissões
- **Despesas** - Controle por categoria e competência
- **Agenda** - Renovações e vencimentos
- **Churn** - Análise de cancelamentos
- **Comissões** - Consolidação por indicador e regra
- **Prospecção** - Gestão de leads e conversão
- **Relatórios** - Dashboards e KPIs em tempo real

---

## 📖 Índice de Documentação

### 🚀 [00 - GETTING STARTED](./00-GETTING-STARTED/)
Comece aqui! Tudo o que você precisa para entender e começar a trabalhar no projeto.
- [Overview](./00-GETTING-STARTED/overview.md) - Visão geral do sistema
- [Setup](./00-GETTING-STARTED/setup.md) - Instalação e configuração
- [Architecture](./00-GETTING-STARTED/architecture.md) - Arquitetura do sistema
- [Tech Stack](./00-GETTING-STARTED/tech-stack.md) - Tecnologias utilizadas

### 🔧 [01 - BACKEND](./01-BACKEND/)
Documentação completa do backend Node.js/Express/TypeScript.
- [Overview](./01-BACKEND/overview.md) - Visão geral do backend
- [Controllers](./01-BACKEND/controllers.md) - Todos os 11 controllers
- [Services](./01-BACKEND/services.md) - Lógica de negócio (11 services)
- [Routes](./01-BACKEND/routes.md) - Rotas da API REST
- [Middleware](./01-BACKEND/middleware.md) - Auth, Audit, ErrorHandler
- [Utils](./01-BACKEND/utils.md) - Utilitários e helpers
- [Jobs](./01-BACKEND/jobs.md) - Jobs automáticos

### 🎨 [02 - FRONTEND](./02-FRONTEND/)
Documentação completa do frontend React/TypeScript/Vite.
- [Overview](./02-FRONTEND/overview.md) - Visão geral do frontend
- [Pages](./02-FRONTEND/pages.md) - 12 páginas principais
- [Components](./02-FRONTEND/components.md) - 60+ componentes reutilizáveis
- [Hooks](./02-FRONTEND/hooks.md) - 13 custom hooks
- [Services](./02-FRONTEND/services.md) - API clients
- [Contexts](./02-FRONTEND/contexts.md) - Auth e Theme contexts

### 🗄️ [03 - DATABASE](./03-DATABASE/)
Documentação completa do banco de dados PostgreSQL/Prisma.
- [Overview](./03-DATABASE/overview.md) - Visão geral do database
- [Schema](./03-DATABASE/schema.md) - Schema Prisma completo
- [Models](./03-DATABASE/models.md) - Detalhamento dos 10 models
- [Migrations](./03-DATABASE/migrations.md) - Histórico de migrations
- [Seeds](./03-DATABASE/seeds.md) - Seeds e dados iniciais

### 💼 [04 - BUSINESS RULES](./04-BUSINESS-RULES/)
Regras de negócio, fluxos e lógica do sistema.
- [Overview](./04-BUSINESS-RULES/overview.md) - Visão geral das regras
- [Usuarios](./04-BUSINESS-RULES/usuarios.md) - Status, flags, ciclos
- [Pagamentos](./04-BUSINESS-RULES/pagamentos.md) - PRIMEIRO vs RECORRENTE
- [Agenda](./04-BUSINESS-RULES/agenda.md) - Renovações e vencimentos
- [Churn](./04-BUSINESS-RULES/churn.md) - Cancelamentos e reversão
- [Comissoes](./04-BUSINESS-RULES/comissoes.md) - Cálculo de comissões
- [Prospeccao](./04-BUSINESS-RULES/prospeccao.md) - Conversão de leads

### 🌐 [05 - API REFERENCE](./05-API-REFERENCE/)
Referência completa de todos os endpoints da API.
- [Overview](./05-API-REFERENCE/overview.md) - Convenções da API
- [Auth](./05-API-REFERENCE/auth.md) - `/api/auth` - Login/Logout
- [Usuarios](./05-API-REFERENCE/usuarios.md) - `/api/usuarios` - CRUD de usuários
- [Pagamentos](./05-API-REFERENCE/pagamentos.md) - `/api/pagamentos` - CRUD de pagamentos
- [Despesas](./05-API-REFERENCE/despesas.md) - `/api/despesas` - CRUD de despesas
- [Agenda](./05-API-REFERENCE/agenda.md) - `/api/agenda` - Renovações
- [Churn](./05-API-REFERENCE/churn.md) - `/api/churn` - Churns
- [Comissoes](./05-API-REFERENCE/comissoes.md) - `/api/comissoes` - Relatórios
- [Prospeccao](./05-API-REFERENCE/prospeccao.md) - `/api/prospeccao` - Leads
- [Relatorios](./05-API-REFERENCE/relatorios.md) - `/api/relatorios` - KPIs

### 🧪 [06 - TESTING](./06-TESTING/)
Documentação de testes automatizados.
- [Overview](./06-TESTING/overview.md) - Estratégia de testes
- [Unit Tests](./06-TESTING/unit-tests.md) - Testes unitários
- [Integration Tests](./06-TESTING/integration-tests.md) - Testes de integração
- [E2E Tests](./06-TESTING/e2e-tests.md) - Testes end-to-end

### 🚀 [07 - DEPLOYMENT](./07-DEPLOYMENT/)
Guias de deploy e troubleshooting.
- [Overview](./07-DEPLOYMENT/overview.md) - Estratégias de deploy
- [Railway](./07-DEPLOYMENT/railway.md) - Deploy no Railway
- [Vercel](./07-DEPLOYMENT/vercel.md) - Deploy no Vercel
- [Troubleshooting](./07-DEPLOYMENT/troubleshooting.md) - Solução de problemas

### 🛠️ [08 - DEVELOPMENT](./08-DEVELOPMENT/)
Convenções, workflow e boas práticas.
- [Conventions](./08-DEVELOPMENT/conventions.md) - Convenções de código
- [Git Workflow](./08-DEVELOPMENT/git-workflow.md) - Fluxo de trabalho Git
- [Code Review](./08-DEVELOPMENT/code-review.md) - Processo de code review
- [Best Practices](./08-DEVELOPMENT/best-practices.md) - Boas práticas

### 📘 [09 - REFERENCE](./09-REFERENCE/)
Referências rápidas e glossário.
- [Glossary](./09-REFERENCE/glossary.md) - Glossário de termos
- [Environment Variables](./09-REFERENCE/environment-variables.md) - Variáveis de ambiente
- [NPM Scripts](./09-REFERENCE/npm-scripts.md) - Comandos NPM
- [FAQ](./09-REFERENCE/faq.md) - Perguntas frequentes

---

## 🎓 Regras de Ouro

Esta documentação segue rigorosamente as **Regras de Ouro para Desenvolvimento com IA** de alto nível:

### ✅ Princípios Aplicados

1. **Tipagem Forte** - Todo código TypeScript 100% tipado, zero `any`
2. **Convenções** - Padrões consistentes em todo o projeto
3. **Segurança** - Validação de inputs, prepared statements, JWT
4. **Performance** - Paginação, cache, queries otimizadas
5. **Testes** - 80%+ de cobertura crítica
6. **Documentação Viva** - Código autodocumentado + JSDoc
7. **Consistência** - Prettier + ESLint configurados
8. **CI/CD** - Deploy automático via Railway/Vercel

### 🎯 Checklist de Qualidade

Antes de considerar qualquer código pronto:

- ✅ **Tipagem:** 100% explícita e validada
- ✅ **Convenções:** Alinhado com padrões do projeto
- ✅ **Segurança:** Inputs validados, secrets protegidos
- ✅ **Performance:** Otimizado e testado
- ✅ **Testes:** Cobertura adequada e passando
- ✅ **Documentação:** Código claro e documentado
- ✅ **Review:** Auto-revisado e aprovado
- ✅ **Deploy:** Pronto para CI/CD

---

## 🚀 Quick Start

### 1. Clone e Configure

```bash
git clone <repository-url>
cd FINANCASBUSCADOR
cp .env.example .env
cp frontend/.env.example frontend/.env
```

### 2. Configure Database

Edite `.env` e configure `DATABASE_URL`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/financasbuscador"
```

### 3. Instale Dependencies

```bash
# Root (backend)
npm install

# Frontend
cd frontend
npm install
cd ..
```

### 4. Setup Database

```bash
npm run prisma:migrate    # Aplica migrations
npm run prisma:seed       # Popula dados iniciais
```

### 5. Execute em Dev Mode

```bash
npm run dev   # Backend (3001) + Frontend (3000)
```

### 6. Acesse o Sistema

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001/api
- **Prisma Studio:** `npm run prisma:studio` → http://localhost:5555

**Credenciais padrão:**
- Login: `admin`
- Senha: `Admin@123`

---

## 📊 Estrutura do Projeto

```
FINANCASBUSCADOR/
├── docs/                      # 📚 Esta documentação
├── src/
│   ├── backend/              # 🔧 Node.js/Express backend
│   ├── database/             # 🗄️ Prisma client e seeds
│   └── shared/               # 🔗 Código compartilhado
├── frontend/                 # 🎨 React/Vite frontend
├── prisma/                   # 🗄️ Schema e migrations
├── tests/                    # 🧪 Testes
└── [config files]            # ⚙️ Configs (tsconfig, eslint, etc)
```

---

## 🤝 Contribuindo

1. Leia [08-DEVELOPMENT/conventions.md](./08-DEVELOPMENT/conventions.md)
2. Siga [08-DEVELOPMENT/git-workflow.md](./08-DEVELOPMENT/git-workflow.md)
3. Execute testes: `npm test`
4. Execute lint: `npm run lint`
5. Abra Pull Request

---

## 📞 Suporte

- **Issues:** Use o sistema de issues do Git
- **Docs:** Esta documentação está sempre atualizada
- **Code Review:** Todo PR passa por review automático
- **CI/CD:** Deploy automático após merge

---

## 📄 Licença

[Definir licença do projeto]

---

## 🎯 Próximos Passos

1. **Novo Desenvolvedor?** → Leia [00-GETTING-STARTED/overview.md](./00-GETTING-STARTED/overview.md)
2. **Backend?** → Vá para [01-BACKEND/overview.md](./01-BACKEND/overview.md)
3. **Frontend?** → Vá para [02-FRONTEND/overview.md](./02-FRONTEND/overview.md)
4. **Database?** → Vá para [03-DATABASE/overview.md](./03-DATABASE/overview.md)
5. **Deploy?** → Vá para [07-DEPLOYMENT/overview.md](./07-DEPLOYMENT/overview.md)

---

**Última atualização:** 2025-10-29
**Versão da documentação:** 1.0.0
