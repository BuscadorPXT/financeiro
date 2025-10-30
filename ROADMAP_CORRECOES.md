# 🗺️ Roadmap de Correções - FINANCASBUSCADOR

**Última Atualização:** 30 de Outubro de 2025
**Versão Atual:** 1.0.1
**Total de Itens:** 53 (8 concluídos, 45 pendentes)

---

## 📊 Visão Geral

| Categoria | Total | Concluídos | Pendentes | % Concluído |
|-----------|-------|------------|-----------|-------------|
| **🔴 Crítico** | 4 | 4 | 0 | 100% |
| **🟠 Alto** | 7 | 2 | 5 | 29% |
| **🟡 Médio** | 20 | 2 | 18 | 10% |
| **🟢 Baixo** | 22 | 0 | 22 | 0% |
| **TOTAL** | 53 | 8 | 45 | 15% |

---

## 📅 Linha do Tempo

```
Sprint 1 (Concluída) ✅
├─ [✅] Bug 1.1 - Exclusão de pagamento
├─ [✅] Bug 1.2 - Cancelamento de agenda
├─ [✅] Bug 1.3 - Reversão de churn
├─ [✅] Bug 1.4 - Cálculo de dias
├─ [✅] Bug 1.5 - Job ignora inativos
├─ [✅] Bug 1.6 - Formato de mês
├─ [✅] Lógica 3.1 - Duplicatas na agenda
└─ [✅] Lógica 3.2 - Race condition

Sprint 2 (Atual) 🚧
├─ [ ] Inconsistência 2.1 - Campo ativoAtual
├─ [ ] Inconsistência 2.2 - Status automático vs manual
├─ [ ] Bug 1.7 - Blacklist de tokens
├─ [ ] Má Prática 4.2 - Falta de testes
└─ [ ] Lógica 3.3 - N+1 queries

Sprint 3 (Próxima) 📋
├─ [ ] Inconsistência 2.4 - Repository pattern
├─ [ ] Bug 1.9 - Bcrypt rounds
├─ [ ] Má Prática 4.4 - Rate limiting
├─ [ ] Má Prática 4.5 - Validação de entrada
└─ [ ] Bug 1.10 - Erro em logout

Sprint 4+ (Backlog) 📦
└─ [22 itens de baixa prioridade]
```

---

## ✅ Sprint 1 - CONCLUÍDA (30/10/2025)

### 🔴 Crítico

#### ✅ 1.1 Exclusão de Pagamento Reverte Estado
- **Status:** ✅ CONCLUÍDO
- **Prioridade:** 🔴 Crítico
- **Arquivo:** `src/backend/services/pagamentoService.ts:262-376`
- **Commit:** `740c2a2`
- **Implementação:**
  - Lógica de reversão completa em transação
  - Se PRIMEIRO: zera tudo
  - Se RECORRENTE: restaura pagamento anterior
- **Teste:** ⚠️ Pendente

---

#### ✅ 1.2 Cancelamento Reverte Pagamento
- **Status:** ✅ CONCLUÍDO
- **Prioridade:** 🔴 Crítico
- **Arquivo:** `src/backend/services/agendaService.ts:171-251`
- **Commit:** `740c2a2`
- **Implementação:**
  - Busca e deleta pagamento RECORRENTE se renovado
  - Retorna flag `pagamentoRevertido`
  - Executa em transação
- **Teste:** ⚠️ Pendente

---

#### ✅ 3.1 Duplicatas na Agenda Corrigidas
- **Status:** ✅ CONCLUÍDO
- **Prioridade:** 🔴 Crítico
- **Arquivo:** `src/backend/services/agendaService.ts:64-108, 379-488`
- **Commit:** `740c2a2`
- **Implementação:**
  - Validação no create()
  - Detecção e correção automática na sincronização
  - Índice composto no schema
  - Retorna `duplicatasCorrigidas`
- **Teste:** ⚠️ Pendente

---

#### ✅ 3.2 Race Condition Eliminada
- **Status:** ✅ CONCLUÍDO
- **Prioridade:** 🔴 Crítico
- **Arquivo:** `src/backend/services/pagamentoService.ts:213-247`
- **Commit:** `740c2a2`
- **Implementação:**
  - Valida exatamente UM item antes de atualizar
  - Erros claros para zero ou múltiplos itens
  - Usa update() com ID específico
- **Teste:** ⚠️ Pendente

---

### 🟠 Alto

#### ✅ 1.3 Reversão de Churn Valida Pagamento
- **Status:** ✅ CONCLUÍDO
- **Prioridade:** 🟠 Alto
- **Arquivo:** `src/backend/services/churnService.ts:132-191`
- **Commit:** `740c2a2`
- **Implementação:**
  - Verifica dataVenc futura
  - Se sem pagamento: reativa mas INATIVO
  - Log de aviso quando necessário
- **Teste:** ⚠️ Pendente

---

#### ✅ 1.5 Job Processa Todos os Usuários
- **Status:** ✅ CONCLUÍDO
- **Prioridade:** 🟠 Alto
- **Arquivo:** `src/backend/jobs/atualizarFlags.ts:23-31`
- **Commit:** `740c2a2`
- **Implementação:**
  - Removido filtro de status
  - Processa TODOS com dataVenc
- **Teste:** ⚠️ Pendente

---

### 🟡 Médio

#### ✅ 1.4 Cálculo de Dias Consistente
- **Status:** ✅ CONCLUÍDO
- **Prioridade:** 🟡 Médio
- **Arquivo:** `src/backend/utils/dateUtils.ts:20-36`
- **Commit:** `740c2a2`
- **Implementação:**
  - Math.floor() ao invés de Math.round()
  - Documentação sobre quando usar floor vs ceil
- **Teste:** ⚠️ Pendente

---

#### ✅ 1.6 Formato de Mês Padronizado
- **Status:** ✅ CONCLUÍDO
- **Prioridade:** 🟡 Médio
- **Arquivo:** `src/backend/services/pagamentoService.ts:513-521`
- **Commit:** `740c2a2`
- **Implementação:**
  - Mudado de "OUT/2024" para "10/2024"
  - Formato numérico MM/YYYY
- **Breaking Change:** ⚠️ Frontend pode precisar ajuste
- **Teste:** ⚠️ Pendente

---

## 🚧 Sprint 2 - PLANEJADA (Próximos 7 dias)

### 🟠 Alto (Prioridade Máxima)

#### [ ] 2.1 Clarificar Campo `ativoAtual`
- **Status:** 📋 PLANEJADO
- **Prioridade:** 🟠 Alto
- **Categoria:** Inconsistência
- **Arquivos:** `prisma/schema.prisma:81`, múltiplos services
- **Descrição:** Campo `ativoAtual` redundante com `statusFinal`
- **Impacto:** Confusão sobre qual campo usar
- **Proposta de Correção:**
  - **Opção A (Recomendada):** Consolidar em `statusFinal` único
    - Remove campo `ativoAtual`
    - Usa apenas enum `StatusFinal`
    - Migration: `ativoAtual=true` → `statusFinal=ATIVO`
  - **Opção B:** Documentar diferença clara
    - `statusFinal`: Status de pagamento (ATIVO/EM_ATRASO/INATIVO/HISTORICO)
    - `ativoAtual`: Flag de assinatura ativa (true/false)
    - Adicionar comentários no schema e código
- **Esforço:** 🔹🔹🔸 Médio (4-6h)
- **Bloqueador:** ⚠️ Requer análise de impacto no frontend

---

#### [ ] 2.2 Decidir: Status Automático ou Manual
- **Status:** 📋 PLANEJADO
- **Prioridade:** 🟠 Alto
- **Categoria:** Inconsistência
- **Arquivo:** `src/backend/controllers/usuarioController.ts:94`
- **Descrição:** `statusFinal` pode ser editado manualmente mas também é atualizado automaticamente
- **Impacto:** Status pode ficar desatualizado
- **Proposta de Correção:**
  - **Opção A (Recomendada):** Status calculado automaticamente
    - Remover da API de update
    - Sempre calculado baseado em regras
    - Adicionar comentário explicando por que não é editável
  - **Opção B:** Status manual
    - Remover cálculo automático
    - Usuário define manualmente
    - Job diário apenas sugere mas não aplica
- **Esforço:** 🔹🔹🔸 Médio (3-5h)
- **Recomendação:** Opção A (automático) é mais consistente

---

#### [ ] 1.7 Blacklist de Tokens Persistente
- **Status:** 📋 PLANEJADO
- **Prioridade:** 🟠 Alto
- **Categoria:** Bug de Segurança
- **Arquivo:** `src/backend/services/authService.ts:18-19`
- **Descrição:** Blacklist em memória perde tokens ao reiniciar
- **Impacto:** Tokens revogados voltam a ser válidos após restart
- **Proposta de Correção:**
  - Implementar com Redis (recomendado)
    ```typescript
    import Redis from 'ioredis';
    const redis = new Redis(process.env.REDIS_URL);

    async logout(token: string): Promise<void> {
      const decoded = jwt.decode(token) as any;
      const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
      await redis.setex(`blacklist:${token}`, expiresIn, '1');
    }

    async isTokenBlacklisted(token: string): Promise<boolean> {
      return await redis.exists(`blacklist:${token}`) === 1;
    }
    ```
  - Alternativa: Tabela no PostgreSQL
- **Esforço:** 🔹🔹🔹 Alto (6-8h)
- **Dependências:** ⚠️ Requer Redis (dev + prod)

---

#### [ ] 4.2 Implementar Testes Automatizados
- **Status:** 📋 PLANEJADO
- **Prioridade:** 🟠 Alto (CRÍTICO para qualidade)
- **Categoria:** Má Prática
- **Descrição:** Projeto tem poucos testes implementados
- **Impacto:** Bugs não detectados antes de produção
- **Proposta de Correção:**
  - Fase 1: Testes unitários para services críticos
    - `pagamentoService.test.ts` (create, delete, update)
    - `agendaService.test.ts` (marcarRenovou, marcarCancelou)
    - `usuarioService.test.ts` (create, update, atualizarFlags)
  - Fase 2: Testes de integração
    - POST /api/pagamentos
    - DELETE /api/pagamentos/:id
    - POST /api/agenda/:id/renovar
  - Fase 3: Coverage mínimo 70%
- **Esforço:** 🔹🔹🔹🔹 Muito Alto (16-24h)
- **Ferramentas:** Jest + Supertest (já instalados)

---

### 🟡 Médio

#### [ ] 3.3 Resolver N+1 Queries em Relatórios
- **Status:** 📋 PLANEJADO
- **Prioridade:** 🟡 Médio
- **Categoria:** Performance
- **Arquivos:**
  - `src/backend/services/comissaoService.ts:166-189`
  - `src/backend/services/pagamentoService.ts:350-376`
- **Descrição:** Loops com queries dentro causam N+1
- **Impacto:** Performance ruim com muitos dados
- **Proposta de Correção:**
  - Usar aggregate queries com groupBy
  ```typescript
  // Antes (N+1)
  for (const item of items) {
    const count = await prisma.comissao.count({ where: { mes: item.mes }});
  }

  // Depois (1 query)
  const grouped = await prisma.comissao.groupBy({
    by: ['mesRef'],
    _count: { id: true },
    _sum: { valor: true }
  });
  ```
- **Esforço:** 🔹🔹🔸 Médio (5-7h)
- **Benefício:** 🚀 Performance 10-100x melhor

---

## 📋 Sprint 3 - PRÓXIMA (7-14 dias)

### 🟠 Alto

#### [ ] 2.4 Completar Repository Pattern
- **Status:** 🗓️ BACKLOG
- **Prioridade:** 🟠 Alto
- **Categoria:** Inconsistência Arquitetural
- **Descrição:** Repository pattern parcialmente implementado
- **Impacto:** Falta de padronização
- **Services sem repository:**
  - `authService.ts` - Acessa Prisma diretamente
  - `prospeccaoService.ts` - Parcial
- **Proposta de Correção:**
  - Criar `AdminRepository`
  - Criar `ProspeccaoRepository` (completar)
  - Refatorar services para usar repositories
- **Esforço:** 🔹🔹🔸 Médio (6-8h)

---

#### [ ] 1.9 Aumentar Rounds do Bcrypt
- **Status:** 🗓️ BACKLOG
- **Prioridade:** 🟠 Alto (Segurança)
- **Categoria:** Bug de Segurança
- **Arquivo:** `src/backend/services/authService.ts:124, 164`
- **Descrição:** Usando apenas 8 rounds (padrão atual: 10-12)
- **Impacto:** Senhas vulneráveis a força bruta
- **Proposta de Correção:**
  ```typescript
  const BCRYPT_ROUNDS = 12; // ou env: BCRYPT_ROUNDS
  const senhaHash = await bcrypt.hash(senha, BCRYPT_ROUNDS);
  ```
- **Esforço:** 🔹 Baixo (1h)
- **Migração:** ⚠️ Não afeta senhas existentes (apenas novas)

---

### 🟡 Médio

#### [ ] 4.4 Rate Limiting Específico para Auth
- **Status:** 🗓️ BACKLOG
- **Prioridade:** 🟡 Médio
- **Categoria:** Segurança
- **Arquivo:** `src/backend/app.ts:67`
- **Descrição:** Apenas rate limit global, endpoints críticos precisam de limites mais restritivos
- **Impacto:** Vulnerável a ataques de força bruta
- **Proposta de Correção:**
  ```typescript
  // Rate limit específico para login
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 5, // 5 tentativas
    message: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
  });

  app.post('/api/auth/login', loginLimiter, authController.login);

  // Rate limit para registro
  const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 3, // 3 registros
  });

  app.post('/api/auth/register', registerLimiter, authController.register);
  ```
- **Esforço:** 🔹 Baixo (2h)

---

#### [ ] 4.5 Validação de Entrada com Zod
- **Status:** 🗓️ BACKLOG
- **Prioridade:** 🟡 Médio
- **Categoria:** Má Prática
- **Descrição:** Alguns endpoints não usam validação de schema
- **Impacto:** Dados inválidos podem entrar no sistema
- **Proposta de Correção:**
  - Criar schemas Zod para todos os endpoints
  - Adicionar middleware de validação
  ```typescript
  // exemplo: usuario.schema.ts
  export const createUsuarioSchema = z.object({
    body: z.object({
      emailLogin: z.string().email(),
      nomeCompleto: z.string().min(3).max(100),
      telefone: z.string().regex(/^\d{10,11}$/).optional(),
      indicador: z.string().max(50).optional(),
    })
  });

  // uso na route
  router.post('/', validate(createUsuarioSchema), usuarioController.create);
  ```
- **Esforço:** 🔹🔹🔸 Médio (8-10h para todos os endpoints)

---

#### [ ] 1.10 Corrigir Erro em Logout
- **Status:** 🗓️ BACKLOG
- **Prioridade:** 🟡 Médio
- **Categoria:** Bug
- **Arquivo:** `src/backend/services/authService.ts:215-218`
- **Descrição:** Lança erro 500 em caso de falha, mas deveria ignorar
- **Impacto:** Usuário pode não conseguir fazer logout
- **Proposta de Correção:**
  ```typescript
  async logout(token: string): Promise<void> {
    try {
      const decoded = jwt.decode(token) as any;
      // ... lógica de blacklist
    } catch (error) {
      // Logout é idempotente - ignora erros silenciosamente
      console.warn('[AUTH] Erro ao processar logout:', error);
      return; // Não lança erro
    }
  }
  ```
- **Esforço:** 🔹 Baixo (30min)

---

## 📦 Sprint 4+ - BACKLOG (Baixa Prioridade)

### 🟢 Bugs Baixa Prioridade (7 itens)

#### [ ] 1.8 Limpeza de Blacklist com Clusters
- **Prioridade:** 🟢 Baixo
- **Descrição:** setTimeout não funciona em múltiplas instâncias
- **Solução:** TTL do Redis ou job periódico
- **Esforço:** 🔹 Baixo (integrado com 1.7)

---

#### [ ] 1.11 Controller Retorna Resposta Manualmente
- **Prioridade:** 🟢 Baixo
- **Descrição:** Uso inconsistente de `return res.status()`
- **Solução:** Usar validação em middleware
- **Esforço:** 🔹 Baixo (2h)

---

#### [ ] 1.12 CORS Permite Origin Undefined
- **Prioridade:** 🟢 Baixo
- **Descrição:** Permite requests sem origin
- **Solução:** Avaliar necessidade e restringir se possível
- **Esforço:** 🔹 Baixo (1h)

---

#### [ ] 1.13 Startup Job Pode Bloquear
- **Prioridade:** 🟢 Baixo
- **Descrição:** Jobs no startup podem atrasar inicialização
- **Solução:** Executar assincronamente após startup
- **Esforço:** 🔹 Baixo (2h)

---

#### [ ] 1.14 Tipos Any em Vários Locais
- **Prioridade:** 🟢 Baixo
- **Descrição:** Uso de `any` perde type safety
- **Solução:** Definir interfaces apropriadas
- **Esforço:** 🔹🔹 Médio (4-6h)

---

#### [ ] 1.15 Validação em Importação
- **Prioridade:** 🟢 Baixo
- **Descrição:** importBulk não valida todos os campos
- **Solução:** Adicionar validação completa com Zod
- **Esforço:** 🔹 Baixo (2h)

---

### 🟢 Inconsistências Baixa Prioridade (10 itens)

#### [ ] 2.3 Dois Formatos de Mês
- **Status:** ✅ PARCIALMENTE RESOLVIDO
- **Descrição:** Backend padronizado, verificar frontend
- **Esforço:** 🔹 Baixo (1h)

---

#### [ ] 2.5 Campos Calculados vs Tempo Real
- **Prioridade:** 🟢 Baixo
- **Descrição:** diasParaVencer armazenado mas poderia ser calculado
- **Solução:** Avaliar custo-benefício
- **Esforço:** 🔹🔹 Médio (discussão + implementação)

---

#### [ ] 2.6 Comissão elegivelComissao Redundante
- **Prioridade:** 🟢 Baixo
- **Descrição:** Campo existe em Usuario e Pagamento
- **Solução:** Manter apenas em Pagamento
- **Esforço:** 🔹🔹 Médio (3-4h + migration)

---

#### [ ] 2.7 Nomenclatura Inconsistente
- **Prioridade:** 🟢 Baixo
- **Descrição:** camelCase no código, snake_case no banco
- **Solução:** Padronizar ou documentar
- **Esforço:** 🔹 Baixo (documentação)

---

#### [ ] 2.8 Enums Duplicados
- **Prioridade:** 🟢 Baixo
- **Descrição:** Enums redefinidos em vários lugares
- **Solução:** Centralizar em types/constants
- **Esforço:** 🔹 Baixo (2h)

---

#### [ ] 2.9 Campos obs vs observacao
- **Prioridade:** 🟢 Baixo
- **Descrição:** Nomenclatura diferente para conceito similar
- **Solução:** Padronizar para `observacao`
- **Esforço:** 🔹 Baixo (1h + migration)

---

#### [ ] 2.10 Resposta de API Inconsistente
- **Prioridade:** 🟢 Baixo
- **Descrição:** Formatos variados de resposta
- **Solução:** Padronizar `{ status, data, pagination?, message? }`
- **Esforço:** 🔹🔹 Médio (4-6h)

---

#### [ ] 2.11 Datas com/sem Timezone
- **Prioridade:** 🟢 Baixo
- **Descrição:** Normalização inconsistente
- **Solução:** Usar UTC sempre, converter no frontend
- **Esforço:** 🔹 Baixo (2h)

---

#### [ ] 2.12 Prisma Client Importado Diferente
- **Prioridade:** 🟢 Baixo
- **Descrição:** Caminhos relativos diferentes
- **Solução:** Usar path alias `@/database/client`
- **Esforço:** 🔹 Baixo (1h)

---

### 🟢 Lógica Falha Baixa Prioridade (6 itens)

#### [ ] 3.4 Cálculo de Comissão Ignora Valor
- **Prioridade:** 🟢 Baixo
- **Descrição:** Parâmetros não usados na função
- **Solução:** Implementar cálculo por tipo ou remover parâmetros
- **Esforço:** 🔹 Baixo (1h)

---

#### [ ] 3.5 Validação de Email Simples
- **Prioridade:** 🟢 Baixo
- **Descrição:** Regex simples pode aceitar emails inválidos
- **Solução:** Usar biblioteca robusta (Zod, validator.js)
- **Esforço:** 🔹 Baixo (integrado com 4.5)

---

#### [ ] 3.6 Import Bulk Limites de Memória
- **Prioridade:** 🟢 Baixo
- **Descrição:** Processa tudo em memória
- **Solução:** Usar streaming para importações grandes
- **Esforço:** 🔹🔹 Médio (4-6h)

---

#### [ ] 3.7 Flags Booleanas Conflitam
- **Prioridade:** 🟢 Baixo
- **Descrição:** venceHoje e emAtraso podem ser true simultaneamente
- **Solução:** Usar enum ao invés de múltiplas flags
- **Esforço:** 🔹🔹 Médio (discussão + refactor)

---

#### [ ] 3.8 Total Ciclos vs Ciclo Atual
- **Prioridade:** 🟢 Baixo
- **Descrição:** Diferença não documentada
- **Solução:** Adicionar comentários ou consolidar
- **Esforço:** 🔹 Baixo (documentação)

---

### 🟢 Más Práticas Baixa Prioridade (13 itens)

#### [ ] 4.1 Verificar Secrets em Código
- **Prioridade:** 🟢 Baixo (verificação)
- **Solução:** Audit de segurança
- **Esforço:** 🔹 Baixo (1h)

---

#### [ ] 4.3 Logs Sensíveis
- **Prioridade:** 🟢 Baixo
- **Solução:** Sanitização de logs
- **Esforço:** 🔹 Baixo (2h)

---

#### [ ] 4.6 Queries Sem Paginação
- **Prioridade:** 🟢 Baixo
- **Solução:** Adicionar paginação em relatórios
- **Esforço:** 🔹🔹 Médio (4-6h)

---

#### [ ] 4.7 Falta de Índices Compostos
- **Prioridade:** 🟢 Baixo (otimização)
- **Solução:** Analisar queries lentas e adicionar índices
- **Esforço:** 🔹 Baixo (contínuo)

---

#### [ ] 4.8 Falta de Soft Delete
- **Prioridade:** 🟢 Baixo
- **Solução:** Implementar campo deletedAt
- **Esforço:** 🔹🔹🔹 Alto (design decision + migration)

---

#### [ ] 4.9 Error Handling Inconsistente
- **Prioridade:** 🟢 Baixo
- **Solução:** Padronizar tratamento de erros
- **Esforço:** 🔹🔹 Médio (refactor)

---

#### [ ] 4.10 Comentários PT + EN
- **Prioridade:** 🟢 Baixo
- **Solução:** Padronizar em inglês
- **Esforço:** 🔹 Baixo (contínuo)

---

#### [ ] 4.11 Magic Numbers
- **Prioridade:** 🟢 Baixo
- **Solução:** Extrair para constantes
- **Esforço:** 🔹 Baixo (2h)

---

#### [ ] 4.12 Falta de JSDoc
- **Prioridade:** 🟢 Baixo
- **Solução:** Documentar funções públicas
- **Esforço:** 🔹🔹 Médio (contínuo)

---

#### [ ] 4.13 Arquivos Não Utilizados
- **Prioridade:** 🟢 Baixo
- **Solução:** Cleanup periódico
- **Esforço:** 🔹 Baixo (1h)

---

#### [ ] 4.14 Versões de Dependências
- **Prioridade:** 🟢 Baixo
- **Solução:** Fixar versões ou usar lock file rigoroso
- **Esforço:** 🔹 Baixo (configuração)

---

#### [ ] 4.15 Health Check Básico
- **Prioridade:** 🟢 Baixo
- **Solução:** Adicionar check de DB
- **Esforço:** 🔹 Baixo (1h)
- **Código:**
  ```typescript
  app.get('/health', async (req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({ status: 'ok', db: 'connected' });
    } catch (error) {
      res.status(503).json({ status: 'error', db: 'disconnected' });
    }
  });
  ```

---

#### [ ] 4.16 Falta de Monitoramento
- **Prioridade:** 🟢 Baixo
- **Solução:** Integrar Sentry/New Relic
- **Esforço:** 🔹🔹 Médio (configuração + integração)

---

#### [ ] 4.17 CORS em Produção
- **Prioridade:** 🟢 Baixo
- **Solução:** Validar CORS_ORIGIN em produção
- **Esforço:** 🔹 Baixo (1h)

---

#### [ ] 4.18 Falta de Documentação de API
- **Prioridade:** 🟢 Baixo
- **Solução:** Gerar Swagger/OpenAPI
- **Esforço:** 🔹🔹🔹 Alto (8-12h)

---

## 📈 Métricas de Progresso

### Por Sprint

| Sprint | Itens | Concluídos | % |
|--------|-------|------------|---|
| Sprint 1 | 8 | 8 | 100% ✅ |
| Sprint 2 | 5 | 0 | 0% 📋 |
| Sprint 3 | 5 | 0 | 0% 🗓️ |
| Backlog | 35 | 0 | 0% 📦 |

### Por Categoria

| Categoria | Total | Concluído |
|-----------|-------|-----------|
| Bugs | 15 | 6 (40%) |
| Inconsistências | 12 | 1 (8%) |
| Lógica Falha | 8 | 2 (25%) |
| Más Práticas | 18 | 0 (0%) |

### Por Prioridade

| Prioridade | Total | Concluído | Pendente |
|------------|-------|-----------|----------|
| 🔴 Crítico | 4 | 4 | 0 |
| 🟠 Alto | 7 | 2 | 5 |
| 🟡 Médio | 20 | 2 | 18 |
| 🟢 Baixo | 22 | 0 | 22 |

---

## 🎯 Metas de Qualidade

### Objetivos por Trimestre

**Q4 2025 (Atual)**
- ✅ Correção de todos os bugs críticos (100% concluído)
- 🎯 Correção de 80% dos bugs de alta prioridade (29% atual)
- 🎯 Implementar testes para fluxos críticos (0% atual)
- 🎯 Coverage de código > 50%

**Q1 2026**
- 🎯 Resolver todas as inconsistências arquiteturais
- 🎯 Coverage de código > 70%
- 🎯 Implementar monitoramento em produção
- 🎯 Documentação completa da API (Swagger)

**Q2 2026**
- 🎯 Resolver 100% dos itens de média prioridade
- 🎯 Coverage de código > 80%
- 🎯 Zero debt técnico crítico/alto

---

## 🔄 Processo de Atualização

Este roadmap deve ser atualizado:
- ✅ Após cada correção (mover para "Concluído")
- ✅ Semanalmente (revisar prioridades)
- ✅ Mensalmente (adicionar novos itens)
- ✅ Trimestralmente (revisar metas)

**Como marcar item como concluído:**
1. Mudar status para `✅ CONCLUÍDO`
2. Adicionar número do commit
3. Atualizar métricas
4. Mover para seção "Concluídos"

---

## 📝 Notas

### Convenções
- ✅ = Concluído
- 🚧 = Em andamento
- 📋 = Planejado (próxima sprint)
- 🗓️ = Backlog (sprint futura)
- ❌ = Cancelado/Não aplicável

### Estimativas de Esforço
- 🔹 = Baixo (< 4h)
- 🔹🔹 = Médio (4-8h)
- 🔹🔹🔹 = Alto (8-16h)
- 🔹🔹🔹🔹 = Muito Alto (> 16h)

### Prioridades
- 🔴 Crítico = Bloqueia produção ou causa perda de dados
- 🟠 Alto = Impacta negativamente a experiência ou segurança
- 🟡 Médio = Melhoria significativa mas não urgente
- 🟢 Baixo = Nice to have, pode esperar

---

**Última atualização:** 30/10/2025 23:45
**Próxima revisão:** 06/11/2025
**Responsável:** Jonathan Machado / Claude Code

---

## 🚀 Quick Actions

### Para começar Sprint 2:
```bash
# 1. Criar branch
git checkout -b sprint-2-correcoes

# 2. Implementar testes primeiro (TDD)
npm test -- --watch

# 3. Corrigir itens na ordem de prioridade
# 4. Commit incremental após cada correção
# 5. Atualizar este roadmap
```

### Para reportar novo bug:
1. Adicionar na seção apropriada por prioridade
2. Incluir: arquivo, descrição, impacto, proposta
3. Atualizar métricas
4. Commit do roadmap atualizado

---

**Fim do Roadmap** 🎯
