# =� An�lise da Funcionalidade AGENDA

**Data da An�lise:** 2025-10-07
**Objetivo:** Validar se a agenda est� funcionando corretamente e identificar problemas

---

## <� Objetivo da Agenda (Esperado)

A agenda deveria ser uma p�gina onde voc� consegue ter uma **vis�o macro** de:
- Quais usu�rios voc� precisa cobrar
- Valores e vencimentos
- Vencimentos nos pr�ximos 7 dias
- Status de renova��o/cancelamento

**Comportamento esperado:** Quando voc� adiciona um pagamento de um usu�rio, ele deve **sair automaticamente da agenda**.

---

## = Situa��o Atual (Problemas Identificados)

### L PROBLEMA 1: Agenda n�o sincroniza com pagamentos diretos
**Comportamento atual:**
- Se voc� adiciona um pagamento diretamente pela p�gina de Pagamentos, o usu�rio **N�O sai da agenda**
- O item continua na agenda mesmo ap�s o pagamento ser registrado
- N�o h� nenhuma l�gica de sincroniza��o entre Pagamento � Agenda

**Evid�ncia:** `pagamentoService.ts:106-226`
- Ao criar um pagamento, o sistema atualiza o Usuario
- Mas **n�o** remove ou atualiza a Agenda

### L PROBLEMA 2: Itens renovados/cancelados ficam na agenda
**Comportamento atual:**
- Quando voc� marca como "Renovado" ou "Cancelado", o item apenas recebe uma flag (renovou=true ou cancelou=true)
- O item **n�o � removido** da agenda
- A agenda fica "polu�da" com hist�rico

**Evid�ncia:** `agendaService.ts:227-233` e `agendaService.ts:282-289`
```typescript
// Marca como renovado mas N�O remove da agenda
const agendaAtualizada = await prisma.agenda.update({
  where: { id },
  data: { renovou: true, cancelou: false },
});
```

### L PROBLEMA 3: Falta de l�gica autom�tica de popula��o da agenda
**Como os itens entram na agenda?**
1. **Manualmente** via API POST `/api/agenda`
2. **Importa��o** via script `importarPagamentos.ts:318` (apenas na importa��o inicial)
3. **N�o existe** job autom�tico que adiciona usu�rios � agenda quando est�o pr�ximos do vencimento

**Evid�ncia:** N�o h� trigger, job ou hook que popule a agenda automaticamente

### L PROBLEMA 4: Conceito confuso da Agenda
A tabela Agenda est� sendo usada para dois prop�sitos conflitantes:
1. **Fila de cobran�a** (usu�rios que precisam ser cobrados) � Objetivo principal
2. **Hist�rico de renova��es/cancelamentos** (mant�m registros antigos) � Uso atual

Isso torna a agenda confusa e dificulta a visualiza��o.

---

## =� Fluxos Atuais

### Fluxo 1: Renova��o VIA AGENDA  (Funciona parcialmente)
```
1. Usu�rio aparece na agenda (status=ATIVO, renovou=false)
2. Voc� clica em "Renovar" na agenda
3. Sistema:
    Cria pagamento RECORRENTE
    Atualiza Usuario (incrementa ciclo, dataVenc, etc)
    Marca renovou=true na Agenda
   L N�O remove da agenda (apenas marca como renovado)
```

**C�digo:** `agendaService.ts:188-239` e `Agenda.tsx:63-69`

### Fluxo 2: Pagamento DIRETO (sem usar agenda) L (N�O funciona)
```
1. Usu�rio est� na agenda
2. Voc� vai em Pagamentos e adiciona um pagamento RECORRENTE
3. Sistema:
    Cria pagamento
    Atualiza Usuario (incrementa ciclo, dataVenc, etc)
   L Agenda N�O � atualizada
   L Usu�rio continua aparecendo na agenda como pendente
```

**C�digo:** `pagamentoService.ts:106-226` (n�o tem l�gica de agenda)

### Fluxo 3: Cancelamento VIA AGENDA  (Funciona parcialmente)
```
1. Usu�rio aparece na agenda
2. Voc� clica em "Cancelar"
3. Sistema:
    Cria registro de Churn
    Marca usu�rio como churn=true
    Marca cancelou=true na Agenda
    Muda status da agenda para INATIVO
   L N�O remove da agenda (apenas marca como cancelado)
```

**C�digo:** `agendaService.ts:244-295`

---

## =� Estrutura dos Dados

### Tabela: `agenda` (schema.prisma:142-158)
```prisma
model Agenda {
  id              String        @id @default(uuid())
  usuarioId       String        # FK para Usuario
  dataVenc        DateTime      # Data de vencimento
  diasParaVencer  Int           # Calculado diariamente
  status          StatusAgenda  # ATIVO ou INATIVO
  ciclo           Int           # Ciclo do usu�rio naquele momento
  renovou         Boolean       # Flag se foi renovado
  cancelou        Boolean       # Flag se foi cancelado
  usuario         Usuario       # Rela��o
}
```

### Problemas da estrutura:
1. L Permite m�ltiplos registros para o mesmo usu�rio (sem unique constraint)
2. L N�o tem rela��o com Pagamento (n�o sabe qual pagamento criou a renova��o)
3. L Mant�m hist�rico (renovou/cancelou) em vez de remover

---

## =� Dashboard da Agenda (Correto) 

O dashboard mostra estat�sticas corretas, mas baseadas em dados incorretos:
- Total na Agenda
- =4 Vencidos (diasParaVencer < 0)
- =� Vence Hoje (diasParaVencer = 0)
- =� Pr�ximos 7 Dias (diasParaVencer 1-7)
- =� M�s Atual (diasParaVencer 1-30)
-  Renovados (renovou=true)
- L Cancelados (cancelou=true)
- =� Taxa de Renova��o

**C�digo:** `DashboardAgenda.tsx:11-54`

**Problema:** As estat�sticas incluem itens j� renovados/cancelados, distorcendo a vis�o real.

---

## =' Jobs e Manuten��o

### Job: `atualizarFlags.ts`
**O que faz:**
-  Atualiza `diasParaVencer` dos Usu�rios
-  Atualiza flags (venceHoje, prox7Dias, emAtraso)
-  Atualiza `diasParaVencer` da Agenda (apenas itens ATIVO + n�o renovados + n�o cancelados)
- L N�O popula novos itens na agenda
- L N�O remove itens pagos da agenda

**C�digo:** `atualizarFlags.ts:96-136`

---

## =� Solu��es Propostas

### <� SOLU��O 1: Agenda Autom�tica e Limpa (RECOMENDADO)

**Mudan�as necess�rias:**

#### 1.1. Modificar `pagamentoService.create()` para atualizar agenda
```typescript
// Adicionar ap�s criar pagamento (linha ~223)
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

#### 1.2. Adicionar l�gica de popula��o autom�tica da agenda
Criar fun��o que adiciona usu�rios � agenda quando:
- dataVenc <= 30 dias (vence no m�s atual)
- statusFinal = ATIVO ou EM_ATRASO
- Ainda n�o est� na agenda (ou est� mas foi renovado/cancelado)

```typescript
// Nova fun��o em agendaService.ts
async sincronizarAgenda(): Promise<void> {
  const hoje = new Date();
  const daqui30Dias = new Date(hoje);
  daqui30Dias.setDate(daqui30Dias.getDate() + 30);

  // Buscar usu�rios que precisam estar na agenda
  const usuarios = await prisma.usuario.findMany({
    where: {
      dataVenc: { lte: daqui30Dias },
      statusFinal: { in: [StatusFinal.ATIVO, StatusFinal.EM_ATRASO] },
      ativoAtual: true,
    }
  });

  for (const usuario of usuarios) {
    // Verificar se j� existe na agenda ativo
    const existeNaAgenda = await prisma.agenda.findFirst({
      where: {
        usuarioId: usuario.id,
        status: StatusAgenda.ATIVO,
        renovou: false,
        cancelou: false
      }
    });

    if (!existeNaAgenda && usuario.dataVenc) {
      // Adicionar � agenda
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

#### 1.3. Modificar filtros da p�gina para ocultar renovados/cancelados
```typescript
// Em Agenda.tsx, modificar linha 26
const filteredAgenda = useMemo(() => {
  let filtered = agenda.filter((item) => {
    // OCULTAR itens renovados/cancelados por padr�o
    if (filtroRapido !== 'renovados' && item.renovou) return false;
    if (filtroRapido !== 'cancelados' && item.cancelou) return false;

    // resto dos filtros...
  });
}, [agenda, usuarios, searchTerm, filtroRapido]);
```

#### 1.4. Adicionar sincroniza��o ao job di�rio
```typescript
// Em atualizarFlags.ts, adicionar fun��o
async function sincronizarAgenda() {
  console.log('[JOB] Iniciando sincroniza��o da agenda...');
  await agendaService.sincronizarAgenda();
  console.log('[JOB] Sincroniza��o da agenda conclu�da');
}

// Chamar no executarJob (linha ~150)
await sincronizarAgenda();
```

---

### <� SOLU��O 2: Limpar Agenda ao Renovar (MAIS SIMPLES)

Se voc� quer que itens **saiam completamente** da agenda ao renovar:

#### 2.1. Modificar `marcarRenovou` para remover item
```typescript
// Em agendaService.ts, linha 227-233, substituir por:
const agendaAtualizada = await prisma.agenda.delete({
  where: { id },
});
```

#### 2.2. Modificar `pagamentoService.create()` para remover da agenda
```typescript
// Adicionar ap�s criar pagamento
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

### <� SOLU��O 3: Agenda como View (SEM TABELA)

Transformar a agenda em uma **view calculada** em tempo real:

#### 3.1. Remover tabela Agenda do banco (mais dr�stico)
#### 3.2. Criar query din�mica que busca usu�rios:
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
-  Sem duplica��o de dados
-  Sem necessidade de manuten��o

**Desvantagens:**
- L Perde hist�rico de renova��es/cancelamentos pela agenda
- L Precisa refatorar toda a l�gica atual

---

## =� Resumo Executivo

### L **Problemas Cr�ticos:**
1. Pagamentos diretos n�o atualizam a agenda
2. Itens renovados/cancelados ficam na agenda "poluindo" a visualiza��o
3. N�o h� popula��o autom�tica da agenda
4. Conceito confuso (fila vs hist�rico)

###  **O que funciona:**
1. Renova��o pela agenda cria pagamento corretamente
2. Cancelamento pela agenda cria churn corretamente
3. Dashboard mostra estat�sticas (mas com dados distorcidos)
4. Job atualiza diasParaVencer

### <� **Recomenda��o:**
Implementar **SOLU��O 1** (Agenda Autom�tica e Limpa) porque:
-  Mant�m a tabela Agenda (sem grandes mudan�as no schema)
-  Adiciona sincroniza��o autom�tica
-  Oculta itens j� processados
-  Popula automaticamente usu�rios que est�o vencendo
-  Resolve o problema de pagamentos diretos

### � **Arquivos que precisam ser modificados:**
1. `src/backend/services/pagamentoService.ts` - Adicionar atualiza��o da agenda
2. `src/backend/services/agendaService.ts` - Adicionar fun��o sincronizarAgenda
3. `src/backend/jobs/atualizarFlags.ts` - Adicionar sincroniza��o ao job
4. `frontend/src/pages/Agenda.tsx` - Modificar filtros para ocultar processados por padr�o

---

## =� Refer�ncias de C�digo

| Arquivo | Linhas | Descri��o |
|---------|--------|-----------|
| `agendaService.ts` | 188-239 | marcarRenovou - cria pagamento mas n�o remove da agenda |
| `agendaService.ts` | 244-295 | marcarCancelou - cria churn mas n�o remove da agenda |
| `pagamentoService.ts` | 106-226 | create - n�o atualiza agenda quando pagamento � criado |
| `Agenda.tsx` | 25-55 | Filtros - mostra todos os itens incluindo processados |
| `atualizarFlags.ts` | 96-136 | Job - apenas atualiza dias, n�o popula nem limpa |
| `schema.prisma` | 142-158 | Tabela Agenda - sem unique constraint por usu�rio |

---

**Conclus�o:** A agenda **n�o est� funcionando corretamente** para o objetivo esperado. � necess�rio implementar sincroniza��o entre Pagamento � Agenda e adicionar l�gica de popula��o/limpeza autom�tica.
