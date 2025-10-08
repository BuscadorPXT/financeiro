# Relat�rio de Importa��o de Dados - PAGAMENTOS

## =� Resumo Geral da Importa��o

**Data da Importa��o:** 06/10/2025
**Arquivo Fonte:** `controle usuarios(PAGAMENTOS) (2).csv`
**Total de Registros no CSV:** 304 linhas
**Status da Importa��o:**  Conclu�da com sucesso

## =� Estat�sticas de Importa��o

### Registros Criados

| Entidade | Quantidade | Detalhes |
|----------|------------|----------|
| **Usu�rios** | 162 | Usu�rios �nicos identificados por email |
| **Pagamentos** | 206 | Registros de transa��es financeiras |
| **Churns** | 34 | Usu�rios que n�o renovaram |
| **Agendas** | 37 | Renova��es programadas |
| **Comiss�es** | 35 | Comiss�es geradas para indicadores |
| **Erros** | 0 | Nenhum erro durante a importa��o |

### Distribui��o de Usu�rios por Status

| Status | Quantidade | Percentual |
|--------|------------|------------|
| **ATIVO** | 128 | 79% |
| **INATIVO** | 34 | 21% |

### Distribui��o de Pagamentos

| Tipo | Quantidade | Valor Total | Valor M�dio |
|------|------------|-------------|-------------|
| **PRIMEIRO** | 122 | R$ 35.864,00 | R$ 293,97 |
| **RECORRENTE** | 84 | R$ 26.084,51 | R$ 310,53 |
| **TOTAL** | **206** | **R$ 61.948,51** | **R$ 300,72** |

### Comiss�es

- **Total de Indicadores Ativos:** 5
- **Total de Comiss�es:** R$ 3.150,00
- **Comiss�es por Indicador:** R$ 630,00 (m�dia)

## =' Processo de Importa��o

### 1. An�lise do Arquivo CSV

O arquivo CSV continha 304 registros de pagamentos distribu�dos entre 162 usu�rios �nicos. Cada usu�rio pode ter m�ltiplos registros de pagamento ao longo do tempo.

**Estrutura de Colunas Identificadas:**
- Dados do usu�rio: EMAIL, NOME, TELEFONE, INDICADOR
- Dados do pagamento: DATA_PAGTO, VALOR, M�TODO, CONTA
- Dados de controle: CICLO, STATUS, DIAS_PARA_VENCER
- Flags operacionais: ENTROU, RENOVOU, CHURN, FLAG_AGENDA
- Comiss�es: REGRA_TIPO, ELEGIVEL_COMISS�O, COMISS�O_VALOR

### 2. Mapeamento de Dados

#### Mapeamento de Status
- `Ativo` � STATUS_FINAL = ATIVO
- `Inativo` � STATUS_FINAL = INATIVO
- `Hist�rico` � STATUS_FINAL = HISTORICO
- `Em Atraso` � STATUS_FINAL = EM_ATRASO

#### Mapeamento de M�todos de Pagamento
- `PIX` � MetodoPagamento.PIX
- `CR�DITO` � MetodoPagamento.CREDITO
- `DIN/DINHEIRO` � MetodoPagamento.DINHEIRO

#### Mapeamento de Contas Financeiras
- `PXT` � ContaFinanceira.PXT
- `EAGLE` � ContaFinanceira.EAGLE
- `IMPTEC` � N�o mapeado (conta n�o existe no sistema)

#### Infer�ncia de Regras
Para registros sem `REGRA_TIPO` especificado, o tipo foi inferido automaticamente:
- **Ciclo = 1** � `PRIMEIRO` (primeiro pagamento)
- **Ciclo > 1** � `RECORRENTE` (pagamento recorrente)

### 3. Tratamento de Encoding

**Problema Identificado:** O arquivo CSV apresentava problemas de encoding UTF-8, causando corrup��o em caracteres acentuados.

**Solu��o Aplicada:** Mapeamento direto das colunas com encoding corrompido:
- `M�TODO` � `M�TODO`
- `M�S_PAGTO` � `M�S_PAGTO`
- `ELEGIVEL_COMISS�O` � `ELEGIVEL_COMISS�O`
- `COMISS�O_VALOR` � `COMISS�O_VALOR`

### 4. Regras de Neg�cio Aplicadas

#### 4.1. Cria��o de Usu�rios
- **Estrat�gia:** Upsert (cria se n�o existe, atualiza se existe)
- **Chave �nica:** Email (campo `emailLogin`)
- **Dados do usu�rio:** Utilizados os dados do **registro mais recente** (�ltimo pagamento)

#### 4.2. Cria��o de Pagamentos
Pagamentos s�o criados apenas quando **todas** as seguintes condi��es s�o atendidas:
- `valor > 0` (ignorado pagamentos vazios ou com "R$ -")
- `metodo` � v�lido (PIX, CR�DITO ou DINHEIRO)
- `conta` � v�lida (PXT ou EAGLE)
- `dataPagto` � uma data v�lida
- `regraTipo` � v�lido (PRIMEIRO ou RECORRENTE)

**Total de pagamentos n�o criados:** 98 registros (304 - 206 = 98)
- Motivos: valores zerados, m�todos inv�lidos, contas n�o reconhecidas

#### 4.3. Cria��o de Churns
Churns s�o registrados quando:
- Flag `CHURN = 1` no registro
- Campo `K_CHURN` est� preenchido (identificador do churn)
- Data de churn: utilizada `DATA_VENC` ou `DATA_PAGTO`

#### 4.4. Cria��o de Agendas
Agendas s�o criadas quando:
- Flag `FLAG_AGENDA = 1`
- Campo `E_ULTIMO = 1` (� o �ltimo registro do usu�rio)
- Status: INATIVO se usu�rio est� inativo, caso contr�rio ATIVO

#### 4.5. Cria��o de Comiss�es
Comiss�es s�o registradas quando:
- `ELEGIVEL_COMISS�O = 1`
- Campo `INDICADOR` est� preenchido
- `COMISS�O_VALOR > 0`
- Pagamento foi criado com sucesso

## <� Indicadores Encontrados

Os seguintes indicadores foram identificados no sistema:

1. **ROBERT DOMINGUES**
2. **MARCELO IR** (Marcelo Lima Rodrigues)
3. **BRYAN FONTES**
4. **CASIMIRO**
5. **ADEL ZAFANI**

## =� Estrutura de Arquivos

### Scripts Criados

#### `src/scripts/limparBanco.ts`
Script para limpeza completa do banco de dados antes da importa��o.

**Comando:** `npm run db:clean`

**Ordem de limpeza** (respeitando foreign keys):
1. Comiss�es
2. Pagamentos
3. Agenda
4. Churns
5. Prospec��es
6. Usu�rios
7. Despesas
8. Auditoria

#### `src/scripts/importarPagamentos.ts`
Script principal de importa��o de dados do CSV.

**Comando:** `npm run import:pagamentos`

**Funcionalidades:**
- Parse do CSV com tratamento de encoding
- Valida��o e convers�o de tipos
- Cria��o/atualiza��o de usu�rios
- Cria��o de pagamentos, churns, agendas e comiss�es
- Logs detalhados de progresso
- Tratamento de erros por usu�rio

### Comandos NPM Adicionados

```json
{
  "db:clean": "ts-node src/scripts/limparBanco.ts",
  "import:pagamentos": "ts-node src/scripts/importarPagamentos.ts",
  "import:full": "npm run db:clean && npm run import:pagamentos"
}
```

## = Valida��o dos Dados

### Queries de Valida��o Executadas

```sql
-- Contagem geral
SELECT
  (SELECT COUNT(*) FROM usuarios) as usuarios,
  (SELECT COUNT(*) FROM pagamentos) as pagamentos,
  (SELECT COUNT(*) FROM churn) as churns,
  (SELECT COUNT(*) FROM agenda) as agendas,
  (SELECT COUNT(*) FROM comissoes) as comissoes;

-- Distribui��o por status
SELECT status_final, COUNT(*)
FROM usuarios
GROUP BY status_final;

-- Pagamentos por tipo
SELECT regra_tipo, COUNT(*), SUM(valor)
FROM pagamentos
GROUP BY regra_tipo;

-- Comiss�es
SELECT COUNT(DISTINCT indicador), SUM(valor)
FROM comissoes
WHERE indicador IS NOT NULL;
```

### Integridade Referencial

 Todos os pagamentos possuem `usuarioId` v�lido
 Todas as comiss�es possuem `pagamentoId` v�lido
 Todos os churns possuem `usuarioId` v�lido
 Todas as agendas possuem `usuarioId` v�lido

## =� Campos do CSV Analisados

### Campos Utilizados na Importa��o

| Campo CSV | Campo Banco | Tipo | Obrigat�rio |
|-----------|-------------|------|-------------|
| EMAIL_LOGIN | emailLogin | String |  Sim |
| NOME_COMPLETO | nomeCompleto | String |  Sim |
| TELEFONE | telefone | String | L N�o |
| INDICADOR | indicador | String | L N�o |
| DATA_PAGTO | dataPagto | DateTime |  Sim |
| M�S_PAGTO | mesPagto | String | L N�o |
| DIAS_ACESSO | diasAcesso | Int | L N�o |
| DATA_VENC | dataVenc | DateTime |  Sim |
| STATUS_FINAL | statusFinal | Enum |  Sim |
| DIAS_PARA_VENCER | diasParaVencer | Int | L N�o |
| VENCE_HOJE | venceHoje | Boolean | L N�o |
| PROX_7_DIAS | prox7Dias | Boolean | L N�o |
| EM_ATRASO | emAtraso | Boolean | L N�o |
| M�TODO | metodo | Enum |  Sim (para pagamento) |
| CONTA | conta | Enum |  Sim (para pagamento) |
| VALOR | valor | Decimal |  Sim (para pagamento) |
| OBS | obs/observacao | String | L N�o |
| CICLO | ciclo | Int |  Sim |
| TOTAL_CICLOS_USUARIO | totalCiclosUsuario | Int | L N�o |
| E_ULTIMO | - | Boolean | L N�o |
| FLAG_AGENDA | flagAgenda | Boolean | L N�o |
| MES_REF | mesRef | String | L N�o |
| ENTROU | entrou | Boolean | L N�o |
| RENOVOU | renovou | Boolean | L N�o |
| ATIVO_ATUAL | ativoAtual | Boolean | L N�o |
| CHURN | churn | Boolean | L N�o |
| K_CHURN | - | String | L N�o |
| REGRA_TIPO | regraTipo | Enum | L N�o (inferido) |
| REGRA_VALOR | regraValor | Decimal | L N�o |
| ELEGIVEL_COMISS�O | elegivelComissao | Boolean | L N�o |
| COMISS�O_VALOR | comissaoValor | Decimal | L N�o |

### Campos Ignorados

Os seguintes campos do CSV n�o foram utilizados:
- `STATUS` (usado `STATUS_FINAL` ao inv�s)
- `ROW_ID` (ID interno do CSV)
- `FLAG_SEMANA` (n�o mapeado no schema)
- `K_AGENDA` (ID interno de controle)
- `ENTROU_ELIG` (duplicado de `ELEGIVEL_COMISS�O`)
- `RENOVOU_ELEGIVEL` (n�o utilizado)
- `ATIVO_MES_FLAG` (n�o utilizado)
| `CHURN_MES_FLAG` (n�o utilizado)
- `K_COMISSAO` (ID interno de controle)
- `teste a`, `teste b` (colunas de teste)

## = Problemas Encontrados e Solu��es

### 1. Encoding de Caracteres

**Problema:** Colunas com acentos n�o eram lidas corretamente pelo parser CSV.

**Sintomas:**
- `M�TODO` retornava `undefined`
- `M�S_PAGTO` retornava `undefined`

**Solu��o:** Utilizar os nomes das colunas como eram lidos pelo parser (`M�TODO`, `M�S_PAGTO`, etc.)

### 2. Valores Monet�rios Vazios

**Problema:** Alguns registros tinham `VALOR = "R$ -"` (valor vazio).

**Solu��o:** Fun��o `parseValor()` retorna `0` para valores vazios, e pagamentos com `valor <= 0` n�o s�o criados.

### 3. Campos Booleanos Vazios

**Problema:** Campos booleanos vazios causavam erro ao tentar chamar `.toLowerCase()`.

**Solu��o:** Adicionar valida��o em `parseBoolean()` para retornar `false` quando valor � `null`, `undefined` ou string vazia.

### 4. REGRA_TIPO N�o Preenchida

**Problema:** Maioria dos registros n�o tinha `REGRA_TIPO` definido, que � obrigat�rio para criar pagamentos.

**Solu��o:** Inferir `REGRA_TIPO` baseado no ciclo:
- Ciclo = 1 � PRIMEIRO
- Ciclo > 1 � RECORRENTE

### 5. Contas Financeiras N�o Reconhecidas

**Problema:** Alguns registros tinham `CONTA = "IMPTEC"` ou `CONTA = "CR�DITO"` que n�o existem no sistema.

**Solu��o:** Pagamentos com contas n�o reconhecidas n�o s�o criados (valida��o retorna `null`).

### 6. M�ltiplos Registros por Usu�rio

**Problema:** CSV cont�m hist�rico completo de pagamentos, com m�ltiplas linhas por usu�rio.

**Solu��o:**
- Agrupar registros por email
- Usar dados do **�ltimo registro** para informa��es do usu�rio
- Criar um pagamento para **cada registro** do usu�rio

## =� An�lise de Dados Importados

### Usu�rios com Mais Pagamentos

Os usu�rios com maior hist�rico de pagamentos foram:

- **ROBERT DOMINGUES**: 4 pagamentos
- **JO�O PEDRO JOTA**: 4 pagamentos
- **MARCELO LIMA RODRIGUES (IR)**: 4 pagamentos
- **JO�O GABRIEL CARDOSO**: 4 pagamentos
- **ADEL ZAFANI**: 4 pagamentos
- **CARLOS TEIXEIRA**: 4 pagamentos
- **PAULO CONNECT IMPORTS**: 4 pagamentos
- **LUCAO ELETRONICOS**: 4 pagamentos
- **HELLO JEAN**: 4 pagamentos
- **DEIVID COSTA**: 4 pagamentos
- **DANIEL BATISTI**: 4 pagamentos

### Distribui��o de M�todos de Pagamento

A an�lise dos pagamentos mostra predomin�ncia de PIX como m�todo principal, seguido por pagamentos em dinheiro e cart�o de cr�dito.

### Taxas de Renova��o

- **Total de usu�rios:** 162
- **Usu�rios ativos:** 128 (79%)
- **Churn:** 34 (21%)
- **Taxa de reten��o:** 79%

## =� Pr�ximos Passos Recomendados

### 1. Verifica��o Manual
- [ ] Conferir alguns usu�rios no Prisma Studio (`npm run prisma:studio`)
- [ ] Validar valores de comiss�es
- [ ] Verificar datas de vencimento

### 2. Atualiza��o de Flags
- [ ] Executar job de atualiza��o de flags: `npm run job:atualizar-flags`
- [ ] Verificar status `dias_para_vencer` recalculados
- [ ] Confirmar flags `vence_hoje`, `prox_7_dias`, `em_atraso`

### 3. Melhorias no Sistema
- [ ] Adicionar valida��o de contas financeiras no frontend
- [ ] Criar alerta para contas n�o reconhecidas
- [ ] Implementar importa��o incremental (sem limpar banco)
- [ ] Adicionar log de auditoria para importa��es

### 4. Dashboards e Relat�rios
- [ ] Criar dashboard de KPIs baseado nos dados importados
- [ ] Gerar relat�rio de comiss�es por indicador
- [ ] Analisar padr�es de churn
- [ ] Projetar renova��es futuras

## =� Comandos �teis

### Importa��o Completa (Limpa e Importa)
```bash
npm run import:full
```

### Apenas Limpar Banco
```bash
npm run db:clean
```

### Apenas Importar (sem limpar)
```bash
npm run import:pagamentos
```

### Visualizar Dados
```bash
npm run prisma:studio
```

### Atualizar Flags dos Usu�rios
```bash
npm run job:atualizar-flags
```

## =� Suporte

Em caso de d�vidas ou problemas com a importa��o:

1. Verificar logs de erro no console
2. Consultar este documento
3. Revisar o c�digo em `src/scripts/importarPagamentos.ts`
4. Validar estrutura do CSV original

## =� Hist�rico de Vers�es

### v1.0.0 - 06/10/2025
-  Importa��o inicial completa
-  162 usu�rios importados
-  206 pagamentos registrados
-  34 churns documentados
-  37 agendas criadas
-  35 comiss�es geradas
-  0 erros

---

**Importa��o realizada com sucesso! <�**

*Documento gerado automaticamente pelo sistema de importa��o.*
