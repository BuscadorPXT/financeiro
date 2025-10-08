# =Ë Análise da Funcionalidade AGENDA

**Data da Análise:** 2025-10-07
**Objetivo:** Validar se a agenda está funcionando corretamente e identificar problemas

---

## <¯ Objetivo da Agenda (Esperado)

A agenda deveria ser uma página onde você consegue ter uma **visão macro** de:
- Quais usuários você precisa cobrar
- Valores e vencimentos
- Vencimentos nos próximos 7 dias
- Status de renovação/cancelamento

**Comportamento esperado:** Quando você adiciona um pagamento de um usuário, ele deve **sair automaticamente da agenda**.

---

## = Situação Atual (Problemas Identificados)

### L PROBLEMA 1: Agenda não sincroniza com pagamentos diretos
**Comportamento atual:**
- Se você adiciona um pagamento diretamente pela página de Pagamentos, o usuário **NÃO sai da agenda**
- O item continua na agenda mesmo após o pagamento ser registrado
- Não há nenhuma lógica de sincronização entre Pagamento ’ Agenda

**Evidência:** `pagamentoService.ts:106-226`
- Ao criar um pagamento, o sistema atualiza o Usuario
- Mas **não** remove ou atualiza a Agenda

### L PROBLEMA 2: Itens renovados/cancelados ficam na agenda
**Comportamento atual:**
- Quando você marca como "Renovado" ou "Cancelado", o item apenas recebe uma flag (renovou=true ou cancelou=true)
- O item **não é removido** da agenda
- A agenda fica "poluída" com histórico

**Evidência:** `agendaService.ts:227-233` e `agendaService.ts:282-289`
```typescript
// Marca como renovado mas NÃO remove da agenda
const agendaAtualizada = await prisma.agenda.update({
  where: { id },
  data: { renovou: true, cancelou: false },
});
```

### L PROBLEMA 3: Falta de lógica automática de população da agenda
**Como os itens entram na agenda?**
1. **Manualmente** via API POST `/api/agenda`
2. **Importação** via script `importarPagamentos.ts:318` (apenas na importação inicial)
3. **Não existe** job automático que adiciona usuários à agenda quando estão próximos do vencimento

**Evidência:** Não há trigger, job ou hook que popule a agenda automaticamente

### L PROBLEMA 4: Conceito confuso da Agenda
A tabela Agenda está sendo usada para dois propósitos conflitantes:
1. **Fila de cobrança** (usuários que precisam ser cobrados)  Objetivo principal
2. **Histórico de renovações/cancelamentos** (mantém registros antigos)  Uso atual

Isso torna a agenda confusa e dificulta a visualização.

---

## =Ê Fluxos Atuais

### Fluxo 1: Renovação VIA AGENDA  (Funciona parcialmente)
```
1. Usuário aparece na agenda (status=ATIVO, renovou=false)
2. Você clica em "Renovar" na agenda
3. Sistema:
    Cria pagamento RECORRENTE
    Atualiza Usuario (incrementa ciclo, dataVenc, etc)
    Marca renovou=true na Agenda
   L NÃO remove da agenda (apenas marca como renovado)
```

**Código:** `agendaService.ts:188-239` e `Agenda.tsx:63-69`

### Fluxo 2: Pagamento DIRETO (sem usar agenda) L (NÃO funciona)
```
1. Usuário está na agenda
2. Você vai em Pagamentos e adiciona um pagamento RECORRENTE
3. Sistema:
    Cria pagamento
    Atualiza Usuario (incrementa ciclo, dataVenc, etc)
   L Agenda NÃO é atualizada
   L Usuário continua aparecendo na agenda como pendente
```

**Código:** `pagamentoService.ts:106-226` (não tem lógica de agenda)

### Fluxo 3: Cancelamento VIA AGENDA  (Funciona parcialmente)
```
1. Usuário aparece na agenda
2. Você clica em "Cancelar"
3. Sistema:
    Cria registro de Churn
    Marca usuário como churn=true
    Marca cancelou=true na Agenda
    Muda status da agenda para INATIVO
   L NÃO remove da agenda (apenas marca como cancelado)
```

**Código:** `agendaService.ts:244-295`

---

## =Â Estrutura dos Dados

### Tabela: `agenda` (schema.prisma:142-158)
```prisma
model Agenda {
  id              String        @id @default(uuid())
  usuarioId       String        # FK para Usuario
  dataVenc        DateTime      # Data de vencimento
  diasParaVencer  Int           # Calculado diariamente
  status          StatusAgenda  # ATIVO ou INATIVO
  ciclo           Int           # Ciclo do usuário naquele momento
  renovou         Boolean       # Flag se foi renovado
  cancelou        Boolean       # Flag se foi cancelado
  usuario         Usuario       # Relação
}
```

### Problemas da estrutura:
1. L Permite múltiplos registros para o mesmo usuário (sem unique constraint)
2. L Não tem relação com Pagamento (não sabe qual pagamento criou a renovação)
3. L Mantém histórico (renovou/cancelou) em vez de remover

---

## =È Dashboard da Agenda (Correto) 

O dashboard mostra estatísticas corretas, mas baseadas em dados incorretos:
- Total na Agenda
- =4 Vencidos (diasParaVencer < 0)
- =à Vence Hoje (diasParaVencer = 0)
- =á Próximos 7 Dias (diasParaVencer 1-7)
- =â Mês Atual (diasParaVencer 1-30)
-  Renovados (renovou=true)
- L Cancelados (cancelou=true)
- =Ê Taxa de Renovação

**Código:** `DashboardAgenda.tsx:11-54`

**Problema:** As estatísticas incluem itens já renovados/cancelados, distorcendo a visão real.

---

## =' Jobs e Manutenção

### Job: `atualizarFlags.ts`
**O que faz:**
-  Atualiza `diasParaVencer` dos Usuários
-  Atualiza flags (venceHoje, prox7Dias, emAtraso)
-  Atualiza `diasParaVencer` da Agenda (apenas itens ATIVO + não renovados + não cancelados)
- L NÃO popula novos itens na agenda
- L NÃO remove itens pagos da agenda

**Código:** `atualizarFlags.ts:96-136`

---

## =¡ Soluções Propostas

### <¯ SOLUÇÃO 1: Agenda Automática e Limpa (RECOMENDADO)

**Mudanças necessárias:**

#### 1.1. Modificar `pagamentoService.create()` para atualizar agenda
```typescript
// Adicionar após criar pagamento (linha ~223)
if (data.regraTipo === RegraTipo.RECORRENTE) {
  // Marcar item da agenda como renovado (se existir)
  await tx.agenda.updateMany({
    where: {
      usuarioId: data.usuarioId,
      renovou: false,
      cancelou: false
    },
    data: { renovou: true }
  });
}
```

#### 1.2. Adicionar lógica de população automática da agenda
Criar função que adiciona usuários à agenda quando:
- dataVenc <= 30 dias (vence no mês atual)
- statusFinal = ATIVO ou EM_ATRASO
- Ainda não está na agenda (ou está mas foi renovado/cancelado)

```typescript
// Nova função em agendaService.ts
async sincronizarAgenda(): Promise<void> {
  const hoje = new Date();
  const daqui30Dias = new Date(hoje);
  daqui30Dias.setDate(daqui30Dias.getDate() + 30);

  // Buscar usuários que precisam estar na agenda
  const usuarios = await prisma.usuario.findMany({
    where: {
      dataVenc: { lte: daqui30Dias },
      statusFinal: { in: [StatusFinal.ATIVO, StatusFinal.EM_ATRASO] },
      ativoAtual: true,
    }
  });

  for (const usuario of usuarios) {
    // Verificar se já existe na agenda ativo
    const existeNaAgenda = await prisma.agenda.findFirst({
      where: {
        usuarioId: usuario.id,
        status: StatusAgenda.ATIVO,
        renovou: false,
        cancelou: false
      }
    });

    if (!existeNaAgenda && usuario.dataVenc) {
      // Adicionar à agenda
      await prisma.agenda.create({
        data: {
          usuarioId: usuario.id,
          dataVenc: usuario.dataVenc,
          diasParaVencer: calcularDiasParaVencer(usuario.dataVenc),
          status: StatusAgenda.ATIVO,
          ciclo: usuario.ciclo || 0,
        }
      });
    }
  }
}
```

#### 1.3. Modificar filtros da página para ocultar renovados/cancelados
```typescript
// Em Agenda.tsx, modificar linha 26
const filteredAgenda = useMemo(() => {
  let filtered = agenda.filter((item) => {
    // OCULTAR itens renovados/cancelados por padrão
    if (filtroRapido !== 'renovados' && item.renovou) return false;
    if (filtroRapido !== 'cancelados' && item.cancelou) return false;

    // resto dos filtros...
  });
}, [agenda, usuarios, searchTerm, filtroRapido]);
```

#### 1.4. Adicionar sincronização ao job diário
```typescript
// Em atualizarFlags.ts, adicionar função
async function sincronizarAgenda() {
  console.log('[JOB] Iniciando sincronização da agenda...');
  await agendaService.sincronizarAgenda();
  console.log('[JOB] Sincronização da agenda concluída');
}

// Chamar no executarJob (linha ~150)
await sincronizarAgenda();
```

---

### <¯ SOLUÇÃO 2: Limpar Agenda ao Renovar (MAIS SIMPLES)

Se você quer que itens **saiam completamente** da agenda ao renovar:

#### 2.1. Modificar `marcarRenovou` para remover item
```typescript
// Em agendaService.ts, linha 227-233, substituir por:
const agendaAtualizada = await prisma.agenda.delete({
  where: { id },
});
```

#### 2.2. Modificar `pagamentoService.create()` para remover da agenda
```typescript
// Adicionar após criar pagamento
if (data.regraTipo === RegraTipo.RECORRENTE) {
  await tx.agenda.deleteMany({
    where: {
      usuarioId: data.usuarioId,
      renovou: false,
      cancelou: false
    }
  });
}
```

---

### <¯ SOLUÇÃO 3: Agenda como View (SEM TABELA)

Transformar a agenda em uma **view calculada** em tempo real:

#### 3.1. Remover tabela Agenda do banco (mais drástico)
#### 3.2. Criar query dinâmica que busca usuários:
```typescript
async getAgendaDinamica() {
  const hoje = new Date();
  const daqui30Dias = new Date(hoje);
  daqui30Dias.setDate(daqui30Dias.getDate() + 30);

  return await prisma.usuario.findMany({
    where: {
      dataVenc: { lte: daqui30Dias },
      statusFinal: { in: [StatusFinal.ATIVO, StatusFinal.EM_ATRASO] },
      ativoAtual: true,
    },
    select: {
      id: true,
      emailLogin: true,
      nomeCompleto: true,
      telefone: true,
      dataVenc: true,
      diasParaVencer: true,
      statusFinal: true,
      ciclo: true,
    }
  });
}
```

**Vantagens:**
-  Sempre sincronizado
-  Sem duplicação de dados
-  Sem necessidade de manutenção

**Desvantagens:**
- L Perde histórico de renovações/cancelamentos pela agenda
- L Precisa refatorar toda a lógica atual

---

## =Ý Resumo Executivo

### L **Problemas Críticos:**
1. Pagamentos diretos não atualizam a agenda
2. Itens renovados/cancelados ficam na agenda "poluindo" a visualização
3. Não há população automática da agenda
4. Conceito confuso (fila vs histórico)

###  **O que funciona:**
1. Renovação pela agenda cria pagamento corretamente
2. Cancelamento pela agenda cria churn corretamente
3. Dashboard mostra estatísticas (mas com dados distorcidos)
4. Job atualiza diasParaVencer

### <¯ **Recomendação:**
Implementar **SOLUÇÃO 1** (Agenda Automática e Limpa) porque:
-  Mantém a tabela Agenda (sem grandes mudanças no schema)
-  Adiciona sincronização automática
-  Oculta itens já processados
-  Popula automaticamente usuários que estão vencendo
-  Resolve o problema de pagamentos diretos

### ™ **Arquivos que precisam ser modificados:**
1. `src/backend/services/pagamentoService.ts` - Adicionar atualização da agenda
2. `src/backend/services/agendaService.ts` - Adicionar função sincronizarAgenda
3. `src/backend/jobs/atualizarFlags.ts` - Adicionar sincronização ao job
4. `frontend/src/pages/Agenda.tsx` - Modificar filtros para ocultar processados por padrão

---

## =Î Referências de Código

| Arquivo | Linhas | Descrição |
|---------|--------|-----------|
| `agendaService.ts` | 188-239 | marcarRenovou - cria pagamento mas não remove da agenda |
| `agendaService.ts` | 244-295 | marcarCancelou - cria churn mas não remove da agenda |
| `pagamentoService.ts` | 106-226 | create - não atualiza agenda quando pagamento é criado |
| `Agenda.tsx` | 25-55 | Filtros - mostra todos os itens incluindo processados |
| `atualizarFlags.ts` | 96-136 | Job - apenas atualiza dias, não popula nem limpa |
| `schema.prisma` | 142-158 | Tabela Agenda - sem unique constraint por usuário |

---

**Conclusão:** A agenda **não está funcionando corretamente** para o objetivo esperado. É necessário implementar sincronização entre Pagamento ’ Agenda e adicionar lógica de população/limpeza automática.
