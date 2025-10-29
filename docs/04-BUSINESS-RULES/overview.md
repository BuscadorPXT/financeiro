# 💼 Business Rules - Regras de Negócio

> Regras de negócio, fluxos e lógica do sistema

---

## 📋 Índice
- [Conceitos Fundamentais](#conceitos-fundamentais)
- [Regras de Status](#regras-de-status)
- [Regras de Pagamento](#regras-de-pagamento)
- [Regras de Comissão](#regras-de-comissão)
- [Fluxos Principais](#fluxos-principais)

---

## 🎯 Conceitos Fundamentais

### 1. Ciclo de Vida do Usuário

```
┌─────────────┐
│ Prospecção  │ Lead cadastrado
└──────┬──────┘
       │ Conversão
       ▼
┌─────────────┐
│   Inativo   │ Usuário criado, sem pagamento
└──────┬──────┘
       │ Primeiro Pagamento (PRIMEIRO)
       ▼
┌─────────────┐
│    Ativo    │ dias_para_vencer >= 1
└──────┬──────┘
       │
       ├─▶ Renovação (RECORRENTE) → Continua Ativo
       │
       ├─▶ Vencimento sem pagamento → Em Atraso
       │
       └─▶ Cancelamento → Churn → Inativo
```

### 2. Status do Usuário

| Status | Condição | Descrição |
|--------|----------|-----------|
| **ATIVO** | `diasParaVencer >= 1` | Assinatura válida |
| **EM_ATRASO** | `diasParaVencer < 0` | Vencido, sem pagamento |
| **INATIVO** | Manual ou churn | Cancelado ou sem atividade |
| **HISTORICO** | Antigo | Usuário histórico do sistema |

### 3. Flags Automáticas

| Flag | Condição | Uso |
|------|----------|-----|
| **venceHoje** | `diasParaVencer === 0` | Alerta de vencimento hoje |
| **prox7Dias** | `diasParaVencer >= 1 && <= 7` | Vence na próxima semana |
| **emAtraso** | `diasParaVencer < 0` | Assinatura vencida |
| **entrou** | Primeiro pagamento | Novo assinante |
| **renovou** | Pagamento recorrente | Renovação |
| **churn** | Cancelamento | Cliente perdido |

---

## 📏 Regras de Status

### Cálculo Automático

**Executado por:** Job diário `atualizarFlags.ts`

```typescript
// Cálculo de dias_para_vencer
diasParaVencer = differenceInDays(dataVenc, hoje);

// Status Final
if (diasParaVencer >= 1) {
  statusFinal = 'ATIVO';
} else if (diasParaVencer < 0) {
  statusFinal = 'EM_ATRASO';
} else {
  // Mantém status atual se for INATIVO ou HISTORICO
}

// Flags
venceHoje = (diasParaVencer === 0);
prox7Dias = (diasParaVencer >= 1 && diasParaVencer <= 7);
emAtraso = (diasParaVencer < 0);
```

### Atualização de Status

**Quando é atualizado:**
1. ✅ Diariamente via job `atualizarFlags.ts`
2. ✅ Ao criar pagamento (PRIMEIRO ou RECORRENTE)
3. ✅ Ao renovar na agenda
4. ✅ Ao cancelar (churn)

---

## 💰 Regras de Pagamento

### Tipos de Pagamento

#### 1. PRIMEIRO (Entrada)

**Condição:** `usuario.ciclo === 0`

**Ações automáticas:**
```typescript
1. Define usuario.entrou = true
2. Incrementa usuario.ciclo para 1
3. Define usuario.ativoAtual = true
4. Calcula dataVenc = dataPagto + 30 dias
5. Calcula comissão de PRIMEIRO (se elegível)
6. Define usuario.statusFinal = 'ATIVO'
7. Atualiza flags (venceHoje, prox7Dias, emAtraso)
8. Cria registro de Comissao (se elegível)
```

**Exemplo:**
```typescript
// Usuário novo (ciclo = 0)
const pagamento = {
  usuarioId: 1,
  valor: 100,
  dataPagto: '2025-01-15',
  regraTipo: 'PRIMEIRO',  // ← Determinado automaticamente
};

// Após processamento:
usuario = {
  ciclo: 1,              // 0 → 1
  dataVenc: '2025-02-14', // +30 dias
  entrou: true,
  ativoAtual: true,
  statusFinal: 'ATIVO',
};
```

#### 2. RECORRENTE (Renovação)

**Condição:** `usuario.ciclo > 0`

**Ações automáticas:**
```typescript
1. Define usuario.renovou = true
2. Incrementa usuario.ciclo (+1)
3. Atualiza dataVenc = dataPagto + 30 dias
4. Calcula comissão de RECORRENTE (se elegível)
5. Atualiza statusFinal = 'ATIVO'
6. Reseta flag emAtraso = false
7. Cria registro de Comissao (se elegível)
```

**Exemplo:**
```typescript
// Usuário existente (ciclo = 5)
const pagamento = {
  usuarioId: 1,
  valor: 100,
  dataPagto: '2025-02-15',
  regraTipo: 'RECORRENTE',  // ← Determinado automaticamente
};

// Após processamento:
usuario = {
  ciclo: 6,              // 5 → 6
  dataVenc: '2025-03-17', // +30 dias
  renovou: true,
  statusFinal: 'ATIVO',
  emAtraso: false,
};
```

### Regras de Validação

```typescript
// 1. Valor deve ser positivo
if (valor <= 0) {
  throw new Error('Valor deve ser maior que zero');
}

// 2. Usuário deve existir
const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
if (!usuario) {
  throw new Error('Usuário não encontrado');
}

// 3. Data de pagamento não pode ser futura
if (dataPagto > hoje) {
  throw new Error('Data de pagamento não pode ser futura');
}

// 4. Método e conta devem ser válidos
if (!metodo || !conta) {
  throw new Error('Método e conta são obrigatórios');
}
```

---

## 💸 Regras de Comissão

### Elegibilidade

**Usuário elegível se:**
1. ✅ Tem indicador definido (`usuario.indicador !== null`)
2. ✅ Tem regraTipo definido (`usuario.regraTipo !== null`)
3. ✅ Tem regraValor > 0 (`usuario.regraValor > 0`)

### Cálculo

```typescript
// Tipo 1: PRIMEIRO (entrada)
if (regraTipo === 'PRIMEIRO') {
  comissaoValor = (valor * regraValor) / 100;
}

// Tipo 2: RECORRENTE (renovação)
if (regraTipo === 'RECORRENTE') {
  comissaoValor = (valor * regraValor) / 100;
}

// Se elegível, cria registro de Comissao
if (comissaoValor > 0) {
  await prisma.comissao.create({
    data: {
      pagamentoId: pagamento.id,
      indicador: usuario.indicador,
      regraTipo: pagamento.regraTipo,
      valor: comissaoValor,
      mesRef: format(pagamento.dataPagto, 'yyyy-MM'),
    },
  });
}
```

### Consolidação

**Comissões são consolidadas por:**
- ✅ Indicador
- ✅ Tipo de regra (PRIMEIRO/RECORRENTE)
- ✅ Mês de referência

**Query de consolidação:**
```typescript
// Comissões por indicador (mês atual)
const comissoes = await prisma.comissao.groupBy({
  by: ['indicador', 'regraTipo'],
  where: {
    mesRef: '2025-01',
  },
  _sum: {
    valor: true,
  },
  _count: {
    id: true,
  },
});

// Resultado:
[
  {
    indicador: 'João Silva',
    regraTipo: 'PRIMEIRO',
    _sum: { valor: 500 },
    _count: { id: 5 },
  },
  {
    indicador: 'João Silva',
    regraTipo: 'RECORRENTE',
    _sum: { valor: 1200 },
    _count: { id: 15 },
  },
]
```

---

## 🔄 Fluxos Principais

### 1. Fluxo de Conversão (Lead → Usuário)

```typescript
// 1. Lead cadastrado na Prospecção
const lead = await prisma.prospeccao.create({
  data: {
    email: 'lead@example.com',
    nome: 'Lead Exemplo',
    indicador: 'João Silva',
    origem: 'Website',
  },
});

// 2. Gestor converte lead
const usuario = await prisma.usuario.create({
  data: {
    emailLogin: lead.email,
    nomeCompleto: lead.nome,
    indicador: lead.indicador,
    statusFinal: 'INATIVO',  // ← Ainda sem pagamento
    ciclo: 0,
  },
});

// 3. Vincula lead ao usuário
await prisma.prospeccao.update({
  where: { id: lead.id },
  data: {
    convertido: true,
    usuarioId: usuario.id,
  },
});

// 4. Registrar primeiro pagamento (ver Fluxo 2)
```

### 2. Fluxo de Primeiro Pagamento

```typescript
// 1. Usuário existente sem pagamentos (ciclo = 0)
const usuario = await prisma.usuario.findUnique({
  where: { id: 1 },
});

// ciclo = 0 → PRIMEIRO pagamento

// 2. Service processa pagamento
const pagamento = await pagamentoService.create({
  usuarioId: 1,
  valor: 100,
  dataPagto: new Date('2025-01-15'),
  metodo: 'PIX',
  conta: 'Conta Principal',
});

// 3. Ações automáticas (dentro de transaction):
await prisma.$transaction(async (tx) => {
  // a) Cria pagamento
  const pag = await tx.pagamento.create({
    data: {
      usuarioId: 1,
      valor: 100,
      regraTipo: 'PRIMEIRO',  // ← Determinado pelo ciclo = 0
      comissaoValor: 10,      // 10% de 100
      elegivelComissao: true,
    },
  });

  // b) Atualiza usuário
  await tx.usuario.update({
    where: { id: 1 },
    data: {
      ciclo: 1,                      // 0 → 1
      dataPagto: new Date('2025-01-15'),
      dataVenc: new Date('2025-02-14'), // +30 dias
      statusFinal: 'ATIVO',
      entrou: true,
      ativoAtual: true,
      diasParaVencer: 30,
    },
  });

  // c) Cria comissão
  await tx.comissao.create({
    data: {
      pagamentoId: pag.id,
      indicador: usuario.indicador,
      regraTipo: 'PRIMEIRO',
      valor: 10,
      mesRef: '2025-01',
    },
  });
});
```

### 3. Fluxo de Renovação (via Agenda)

```typescript
// 1. Sistema popula Agenda automaticamente
// (usuários com dataVenc nos próximos 30 dias)
const agenda = await prisma.agenda.create({
  data: {
    usuarioId: 1,
    dataVenc: new Date('2025-02-14'),
    ciclo: 1,
    status: 'ATIVO',
  },
});

// 2. Gestor marca como "Renovado" na tela de Agenda
await agendaService.marcarRenovado(agenda.id, {
  valor: 100,
  dataPagto: new Date('2025-02-14'),
  metodo: 'PIX',
  conta: 'Conta Principal',
});

// 3. Service processa (dentro de transaction):
await prisma.$transaction(async (tx) => {
  // a) Atualiza agenda
  await tx.agenda.update({
    where: { id: agenda.id },
    data: {
      renovou: true,
      status: 'INATIVO',  // Remove da agenda
    },
  });

  // b) Cria pagamento RECORRENTE
  const pagamento = await tx.pagamento.create({
    data: {
      usuarioId: 1,
      valor: 100,
      regraTipo: 'RECORRENTE',
      comissaoValor: 5,  // 5% de 100
      dataPagto: new Date('2025-02-14'),
    },
  });

  // c) Atualiza usuário
  await tx.usuario.update({
    where: { id: 1 },
    data: {
      ciclo: 2,                      // 1 → 2
      dataVenc: new Date('2025-03-16'), // +30 dias
      renovou: true,
      statusFinal: 'ATIVO',
      emAtraso: false,
    },
  });

  // d) Cria comissão
  await tx.comissao.create({
    data: {
      pagamentoId: pagamento.id,
      indicador: usuario.indicador,
      regraTipo: 'RECORRENTE',
      valor: 5,
      mesRef: '2025-02',
    },
  });
});
```

### 4. Fluxo de Churn (Cancelamento)

```typescript
// 1. Gestor marca como "Cancelado" na Agenda
await agendaService.marcarCancelado(agenda.id, {
  motivo: 'Preço alto',
});

// 2. Service processa (dentro de transaction):
await prisma.$transaction(async (tx) => {
  // a) Atualiza agenda
  await tx.agenda.update({
    where: { id: agenda.id },
    data: {
      cancelou: true,
      status: 'INATIVO',
    },
  });

  // b) Cria registro de Churn
  await tx.churn.create({
    data: {
      usuarioId: 1,
      dataChurn: new Date(),
      motivo: 'Preço alto',
      revertido: false,
    },
  });

  // c) Atualiza usuário
  await tx.usuario.update({
    where: { id: 1 },
    data: {
      churn: true,
      statusFinal: 'INATIVO',
      ativoAtual: false,
    },
  });
});

// 3. (Opcional) Reverter churn
await churnService.reverter(churn.id);

// Service processa:
await prisma.$transaction(async (tx) => {
  await tx.churn.update({
    where: { id: churn.id },
    data: { revertido: true },
  });

  await tx.usuario.update({
    where: { id: 1 },
    data: {
      churn: false,
      statusFinal: 'ATIVO',  // Se ainda válido
      ativoAtual: true,
    },
  });
});
```

---

## 🎯 Regras de Negócio por Módulo

### Usuários
- ✅ Email único (não pode duplicar)
- ✅ Status calculado automaticamente (não editável manualmente)
- ✅ Ciclo incrementa apenas com pagamentos
- ✅ dataVenc sempre +30 dias do último pagamento

### Pagamentos
- ✅ Valor sempre positivo
- ✅ Data não pode ser futura
- ✅ regraTipo determinado automaticamente pelo ciclo
- ✅ Comissão calculada automaticamente

### Agenda
- ✅ Populada automaticamente com vencimentos futuros
- ✅ Status ATIVO = ainda não processado
- ✅ renovado/cancelado mutuamente exclusivos
- ✅ Renovação cria pagamento RECORRENTE

### Churn
- ✅ Marca usuário como INATIVO
- ✅ Pode ser revertido
- ✅ Motivo é obrigatório

### Comissões
- ✅ Criadas automaticamente com pagamentos
- ✅ Consolidadas por indicador + tipo + mês
- ✅ Apenas para usuários elegíveis

---

## 📊 KPIs e Métricas

### Cálculos Principais

```typescript
// 1. MRR (Monthly Recurring Revenue)
const mrr = await prisma.pagamento.aggregate({
  where: {
    mesPagto: mesAtual,
    regraTipo: 'RECORRENTE',
  },
  _sum: { valor: true },
});

// 2. Churn Rate
const totalAtivos = await prisma.usuario.count({
  where: { statusFinal: 'ATIVO' },
});

const churns = await prisma.churn.count({
  where: { dataChurn: mesAtual },
});

const churnRate = (churns / totalAtivos) * 100;

// 3. Receita Total (mês)
const receitaTotal = await prisma.pagamento.aggregate({
  where: { mesPagto: mesAtual },
  _sum: { valor: true },
});

// 4. Despesa Total (mês)
const despesaTotal = await prisma.despesa.aggregate({
  where: {
    competenciaMes: mesAtual.getMonth() + 1,
    competenciaAno: mesAtual.getFullYear(),
  },
  _sum: { valor: true },
});

// 5. Lucro Líquido
const lucro = receitaTotal._sum.valor - despesaTotal._sum.valor;
```

---

## 🎯 Próximos Passos

- **Usuários detalhado** → [usuarios.md](./usuarios.md)
- **Pagamentos detalhado** → [pagamentos.md](./pagamentos.md)
- **Agenda detalhado** → [agenda.md](./agenda.md)
- **Churn detalhado** → [churn.md](./churn.md)
- **Comissões detalhado** → [comissoes.md](./comissoes.md)

---

**Última atualização:** 2025-10-29
