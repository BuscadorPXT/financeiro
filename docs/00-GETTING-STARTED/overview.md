# 📋 Overview - Sistema de Controle Financeiro

> Visão geral completa do sistema de gestão de assinaturas e controle financeiro

---

## 🎯 O Que é Este Sistema?

Sistema **full-stack TypeScript** para gerenciar todo o ciclo de vida de assinaturas, desde a prospecção até a análise de churn, incluindo controle financeiro completo.

### Características Principais

- ✅ **100% TypeScript** - Type-safe em toda a stack
- ✅ **RESTful API** - Backend Node.js/Express
- ✅ **React Modern** - Frontend React 19 + Vite
- ✅ **PostgreSQL** - Database robusto com Prisma ORM
- ✅ **JWT Auth** - Autenticação segura
- ✅ **Real-time** - Updates automáticos de status
- ✅ **Import/Export** - CSV e XLSX
- ✅ **Responsive** - Tailwind CSS + Dark Mode

---

## 🎭 Para Quem é Este Sistema?

### Use Cases

1. **Empresas de Assinatura**
   - Gerenciar base de assinantes
   - Acompanhar renovações
   - Calcular comissões automaticamente

2. **Gestores Financeiros**
   - Controlar receitas e despesas
   - Gerar relatórios consolidados
   - Análise de churn e KPIs

3. **Equipes de Vendas**
   - Prospecção de leads
   - Conversão de prospects
   - Tracking de comissões

---

## 🏗️ Arquitetura de Alto Nível

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │  Pages   │  │Components│  │  Hooks   │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/REST (Axios)
                     │
┌────────────────────▼────────────────────────────────────┐
│                  BACKEND (Node.js)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │  Routes  │──│Controller│──│ Services │             │
│  └──────────┘  └──────────┘  └────┬─────┘             │
└─────────────────────────────────────┼───────────────────┘
                                      │ Prisma Client
                                      │
┌─────────────────────────────────────▼───────────────────┐
│                 DATABASE (PostgreSQL)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │ Usuario  │  │Pagamento │  │ Despesa  │    + 7 mais │
│  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 Módulos Principais

### 1. **Usuários** (Assinantes)
Gerenciamento completo de assinantes com:
- Status automático (ATIVO/EM_ATRASO/INATIVO)
- Flags de vencimento (hoje, próximos 7 dias, em atraso)
- Ciclos de pagamento
- Histórico completo

**Arquivos principais:**
- Backend: `src/backend/services/usuarioService.ts`
- Frontend: `frontend/src/pages/Usuarios.tsx`
- Database: Model `Usuario` em `prisma/schema.prisma`

### 2. **Pagamentos**
Processamento de pagamentos com:
- Tipos: PRIMEIRO (entrada) ou RECORRENTE (renovação)
- Cálculo automático de comissões
- Atualização automática de ciclos e datas
- Validação de dados

**Arquivos principais:**
- Backend: `src/backend/services/pagamentoService.ts`
- Frontend: `frontend/src/pages/Pagamentos.tsx`
- Database: Model `Pagamento` em `prisma/schema.prisma`

### 3. **Despesas**
Controle de despesas com:
- Categorização (OPERACIONAL, MARKETING, PESSOAL, etc)
- Status (PAGO/PENDENTE)
- Competência mensal
- Relatórios consolidados

**Arquivos principais:**
- Backend: `src/backend/services/despesaService.ts`
- Frontend: `frontend/src/pages/Despesas.tsx`
- Database: Model `Despesa` em `prisma/schema.prisma`

### 4. **Agenda**
Gestão de renovações com:
- Listagem de vencimentos futuros
- Marcação de renovados/cancelados
- Alertas de vencimento
- Sincronização com pagamentos

**Arquivos principais:**
- Backend: `src/backend/services/agendaService.ts`
- Frontend: `frontend/src/pages/Agenda.tsx`
- Database: Model `Agenda` em `prisma/schema.prisma`

### 5. **Churn**
Análise de cancelamentos com:
- Registro de motivos
- Possibilidade de reversão
- Métricas de churn rate
- Análise temporal

**Arquivos principais:**
- Backend: `src/backend/services/churnService.ts`
- Frontend: `frontend/src/pages/Churn.tsx`
- Database: Model `Churn` em `prisma/schema.prisma`

### 6. **Comissões**
Gestão de comissões com:
- Consolidação por pagamento
- Agrupamento por indicador
- Diferentes tipos de regra (PRIMEIRO/RECORRENTE)
- Relatórios mensais

**Arquivos principais:**
- Backend: `src/backend/services/comissaoService.ts`
- Frontend: `frontend/src/pages/Comissoes.tsx`
- Database: Model `Comissao` em `prisma/schema.prisma`

### 7. **Prospecção**
Gestão de leads com:
- Cadastro de prospects
- Tracking de origem
- Conversão para usuário
- Vinculação com indicador

**Arquivos principais:**
- Backend: `src/backend/services/prospeccaoService.ts`
- Frontend: `frontend/src/pages/Prospeccao.tsx`
- Database: Model `Prospeccao` em `prisma/schema.prisma`

### 8. **Relatórios**
Dashboards e KPIs com:
- Receitas e despesas
- MRR (Monthly Recurring Revenue)
- Churn rate
- Idade de títulos
- Performance por indicador

**Arquivos principais:**
- Backend: `src/backend/services/relatorioService.ts`
- Frontend: `frontend/src/pages/Relatorios.tsx`
- Múltiplos models consolidados

---

## 🔄 Fluxo Típico de Uso

### 1. Prospecção → Conversão
```
1. Cadastrar Lead na Prospecção
2. Converter Lead → Cria Usuário
3. Registrar Primeiro Pagamento
4. Sistema calcula comissão de entrada
```

### 2. Ciclo de Renovação
```
1. Sistema adiciona usuário na Agenda (próximos 30 dias)
2. Gestor marca como "Renovado"
3. Sistema cria Pagamento RECORRENTE
4. Atualiza ciclo e data de vencimento
5. Calcula comissão de renovação
```

### 3. Cancelamento
```
1. Gestor marca como "Cancelado" na Agenda
2. Sistema cria registro de Churn
3. Atualiza status do usuário para INATIVO
4. Possibilidade de reverter churn
```

---

## 📊 KPIs Calculados Automaticamente

### Dashboard Principal

| KPI | Descrição | Fonte |
|-----|-----------|-------|
| **Assinantes Ativos** | Total de usuários ATIVO | `Usuario.statusFinal` |
| **MRR** | Receita recorrente mensal | Soma de `Pagamento.valor` do mês |
| **Churn Rate** | Taxa de cancelamento | `Churn` vs `Usuario` ativos |
| **Receita Total** | Soma de todos pagamentos | `Pagamento.valor` |
| **Despesa Total** | Soma de todas despesas | `Despesa.valor` |
| **Lucro Líquido** | Receita - Despesa | Calculado |
| **Vencendo Hoje** | Assinantes vencendo hoje | `Usuario.venceHoje = true` |
| **Próximos 7 Dias** | Vencendo na próxima semana | `Usuario.prox7Dias = true` |
| **Em Atraso** | Usuários em atraso | `Usuario.emAtraso = true` |

---

## 🛡️ Segurança

### Implementações de Segurança

✅ **Autenticação JWT**
- Token expira em 7 dias
- Secret forte configurado em `.env`
- Refresh token (futuro)

✅ **Senhas Criptografadas**
- bcryptjs com salt rounds adequado
- Nunca expõe senha em logs ou API

✅ **CORS Configurado**
- Whitelist de origins permitidas
- Headers apropriados

✅ **Validação de Inputs**
- express-validator em todas as rotas
- Sanitização de dados
- Type-safe via TypeScript

✅ **Prepared Statements**
- Prisma usa prepared statements por padrão
- Zero SQL injection possível

✅ **Rate Limiting** (futuro)
- Proteção contra brute force
- Throttling de API

---

## 🎯 Próximos Passos

1. **Setup Local** → Vá para [setup.md](./setup.md)
2. **Entender Arquitetura** → Vá para [architecture.md](./architecture.md)
3. **Ver Tecnologias** → Vá para [tech-stack.md](./tech-stack.md)

---

## 📞 Suporte Rápido

**Problema comum?** Veja [09-REFERENCE/faq.md](../09-REFERENCE/faq.md)

**Erro de deploy?** Veja [07-DEPLOYMENT/troubleshooting.md](../07-DEPLOYMENT/troubleshooting.md)

**Dúvida de código?** Veja convenções em [08-DEVELOPMENT/conventions.md](../08-DEVELOPMENT/conventions.md)

---

**Última atualização:** 2025-10-29
