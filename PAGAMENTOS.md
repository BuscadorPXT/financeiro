# Relatório de Importação de Dados - PAGAMENTOS

## =Ê Resumo Geral da Importação

**Data da Importação:** 06/10/2025
**Arquivo Fonte:** `controle usuarios(PAGAMENTOS) (2).csv`
**Total de Registros no CSV:** 304 linhas
**Status da Importação:**  Concluída com sucesso

## =È Estatísticas de Importação

### Registros Criados

| Entidade | Quantidade | Detalhes |
|----------|------------|----------|
| **Usuários** | 162 | Usuários únicos identificados por email |
| **Pagamentos** | 206 | Registros de transações financeiras |
| **Churns** | 34 | Usuários que não renovaram |
| **Agendas** | 37 | Renovações programadas |
| **Comissões** | 35 | Comissões geradas para indicadores |
| **Erros** | 0 | Nenhum erro durante a importação |

### Distribuição de Usuários por Status

| Status | Quantidade | Percentual |
|--------|------------|------------|
| **ATIVO** | 128 | 79% |
| **INATIVO** | 34 | 21% |

### Distribuição de Pagamentos

| Tipo | Quantidade | Valor Total | Valor Médio |
|------|------------|-------------|-------------|
| **PRIMEIRO** | 122 | R$ 35.864,00 | R$ 293,97 |
| **RECORRENTE** | 84 | R$ 26.084,51 | R$ 310,53 |
| **TOTAL** | **206** | **R$ 61.948,51** | **R$ 300,72** |

### Comissões

- **Total de Indicadores Ativos:** 5
- **Total de Comissões:** R$ 3.150,00
- **Comissões por Indicador:** R$ 630,00 (média)

## =' Processo de Importação

### 1. Análise do Arquivo CSV

O arquivo CSV continha 304 registros de pagamentos distribuídos entre 162 usuários únicos. Cada usuário pode ter múltiplos registros de pagamento ao longo do tempo.

**Estrutura de Colunas Identificadas:**
- Dados do usuário: EMAIL, NOME, TELEFONE, INDICADOR
- Dados do pagamento: DATA_PAGTO, VALOR, MÉTODO, CONTA
- Dados de controle: CICLO, STATUS, DIAS_PARA_VENCER
- Flags operacionais: ENTROU, RENOVOU, CHURN, FLAG_AGENDA
- Comissões: REGRA_TIPO, ELEGIVEL_COMISSÃO, COMISSÃO_VALOR

### 2. Mapeamento de Dados

#### Mapeamento de Status
- `Ativo` ’ STATUS_FINAL = ATIVO
- `Inativo` ’ STATUS_FINAL = INATIVO
- `Histórico` ’ STATUS_FINAL = HISTORICO
- `Em Atraso` ’ STATUS_FINAL = EM_ATRASO

#### Mapeamento de Métodos de Pagamento
- `PIX` ’ MetodoPagamento.PIX
- `CRÉDITO` ’ MetodoPagamento.CREDITO
- `DIN/DINHEIRO` ’ MetodoPagamento.DINHEIRO

#### Mapeamento de Contas Financeiras
- `PXT` ’ ContaFinanceira.PXT
- `EAGLE` ’ ContaFinanceira.EAGLE
- `IMPTEC` ’ Não mapeado (conta não existe no sistema)

#### Inferência de Regras
Para registros sem `REGRA_TIPO` especificado, o tipo foi inferido automaticamente:
- **Ciclo = 1** ’ `PRIMEIRO` (primeiro pagamento)
- **Ciclo > 1** ’ `RECORRENTE` (pagamento recorrente)

### 3. Tratamento de Encoding

**Problema Identificado:** O arquivo CSV apresentava problemas de encoding UTF-8, causando corrupção em caracteres acentuados.

**Solução Aplicada:** Mapeamento direto das colunas com encoding corrompido:
- `MÉTODO` ’ `MýTODO`
- `MÊS_PAGTO` ’ `MýS_PAGTO`
- `ELEGIVEL_COMISSÃO` ’ `ELEGIVEL_COMISSýO`
- `COMISSÃO_VALOR` ’ `COMISSýO_VALOR`

### 4. Regras de Negócio Aplicadas

#### 4.1. Criação de Usuários
- **Estratégia:** Upsert (cria se não existe, atualiza se existe)
- **Chave única:** Email (campo `emailLogin`)
- **Dados do usuário:** Utilizados os dados do **registro mais recente** (último pagamento)

#### 4.2. Criação de Pagamentos
Pagamentos são criados apenas quando **todas** as seguintes condições são atendidas:
- `valor > 0` (ignorado pagamentos vazios ou com "R$ -")
- `metodo` é válido (PIX, CRÉDITO ou DINHEIRO)
- `conta` é válida (PXT ou EAGLE)
- `dataPagto` é uma data válida
- `regraTipo` é válido (PRIMEIRO ou RECORRENTE)

**Total de pagamentos não criados:** 98 registros (304 - 206 = 98)
- Motivos: valores zerados, métodos inválidos, contas não reconhecidas

#### 4.3. Criação de Churns
Churns são registrados quando:
- Flag `CHURN = 1` no registro
- Campo `K_CHURN` está preenchido (identificador do churn)
- Data de churn: utilizada `DATA_VENC` ou `DATA_PAGTO`

#### 4.4. Criação de Agendas
Agendas são criadas quando:
- Flag `FLAG_AGENDA = 1`
- Campo `E_ULTIMO = 1` (é o último registro do usuário)
- Status: INATIVO se usuário está inativo, caso contrário ATIVO

#### 4.5. Criação de Comissões
Comissões são registradas quando:
- `ELEGIVEL_COMISSÃO = 1`
- Campo `INDICADOR` está preenchido
- `COMISSÃO_VALOR > 0`
- Pagamento foi criado com sucesso

## <¯ Indicadores Encontrados

Os seguintes indicadores foram identificados no sistema:

1. **ROBERT DOMINGUES**
2. **MARCELO IR** (Marcelo Lima Rodrigues)
3. **BRYAN FONTES**
4. **CASIMIRO**
5. **ADEL ZAFANI**

## =Â Estrutura de Arquivos

### Scripts Criados

#### `src/scripts/limparBanco.ts`
Script para limpeza completa do banco de dados antes da importação.

**Comando:** `npm run db:clean`

**Ordem de limpeza** (respeitando foreign keys):
1. Comissões
2. Pagamentos
3. Agenda
4. Churns
5. Prospecções
6. Usuários
7. Despesas
8. Auditoria

#### `src/scripts/importarPagamentos.ts`
Script principal de importação de dados do CSV.

**Comando:** `npm run import:pagamentos`

**Funcionalidades:**
- Parse do CSV com tratamento de encoding
- Validação e conversão de tipos
- Criação/atualização de usuários
- Criação de pagamentos, churns, agendas e comissões
- Logs detalhados de progresso
- Tratamento de erros por usuário

### Comandos NPM Adicionados

```json
{
  "db:clean": "ts-node src/scripts/limparBanco.ts",
  "import:pagamentos": "ts-node src/scripts/importarPagamentos.ts",
  "import:full": "npm run db:clean && npm run import:pagamentos"
}
```

## = Validação dos Dados

### Queries de Validação Executadas

```sql
-- Contagem geral
SELECT
  (SELECT COUNT(*) FROM usuarios) as usuarios,
  (SELECT COUNT(*) FROM pagamentos) as pagamentos,
  (SELECT COUNT(*) FROM churn) as churns,
  (SELECT COUNT(*) FROM agenda) as agendas,
  (SELECT COUNT(*) FROM comissoes) as comissoes;

-- Distribuição por status
SELECT status_final, COUNT(*)
FROM usuarios
GROUP BY status_final;

-- Pagamentos por tipo
SELECT regra_tipo, COUNT(*), SUM(valor)
FROM pagamentos
GROUP BY regra_tipo;

-- Comissões
SELECT COUNT(DISTINCT indicador), SUM(valor)
FROM comissoes
WHERE indicador IS NOT NULL;
```

### Integridade Referencial

 Todos os pagamentos possuem `usuarioId` válido
 Todas as comissões possuem `pagamentoId` válido
 Todos os churns possuem `usuarioId` válido
 Todas as agendas possuem `usuarioId` válido

## =Ë Campos do CSV Analisados

### Campos Utilizados na Importação

| Campo CSV | Campo Banco | Tipo | Obrigatório |
|-----------|-------------|------|-------------|
| EMAIL_LOGIN | emailLogin | String |  Sim |
| NOME_COMPLETO | nomeCompleto | String |  Sim |
| TELEFONE | telefone | String | L Não |
| INDICADOR | indicador | String | L Não |
| DATA_PAGTO | dataPagto | DateTime |  Sim |
| MýS_PAGTO | mesPagto | String | L Não |
| DIAS_ACESSO | diasAcesso | Int | L Não |
| DATA_VENC | dataVenc | DateTime |  Sim |
| STATUS_FINAL | statusFinal | Enum |  Sim |
| DIAS_PARA_VENCER | diasParaVencer | Int | L Não |
| VENCE_HOJE | venceHoje | Boolean | L Não |
| PROX_7_DIAS | prox7Dias | Boolean | L Não |
| EM_ATRASO | emAtraso | Boolean | L Não |
| MýTODO | metodo | Enum |  Sim (para pagamento) |
| CONTA | conta | Enum |  Sim (para pagamento) |
| VALOR | valor | Decimal |  Sim (para pagamento) |
| OBS | obs/observacao | String | L Não |
| CICLO | ciclo | Int |  Sim |
| TOTAL_CICLOS_USUARIO | totalCiclosUsuario | Int | L Não |
| E_ULTIMO | - | Boolean | L Não |
| FLAG_AGENDA | flagAgenda | Boolean | L Não |
| MES_REF | mesRef | String | L Não |
| ENTROU | entrou | Boolean | L Não |
| RENOVOU | renovou | Boolean | L Não |
| ATIVO_ATUAL | ativoAtual | Boolean | L Não |
| CHURN | churn | Boolean | L Não |
| K_CHURN | - | String | L Não |
| REGRA_TIPO | regraTipo | Enum | L Não (inferido) |
| REGRA_VALOR | regraValor | Decimal | L Não |
| ELEGIVEL_COMISSýO | elegivelComissao | Boolean | L Não |
| COMISSýO_VALOR | comissaoValor | Decimal | L Não |

### Campos Ignorados

Os seguintes campos do CSV não foram utilizados:
- `STATUS` (usado `STATUS_FINAL` ao invés)
- `ROW_ID` (ID interno do CSV)
- `FLAG_SEMANA` (não mapeado no schema)
- `K_AGENDA` (ID interno de controle)
- `ENTROU_ELIG` (duplicado de `ELEGIVEL_COMISSÃO`)
- `RENOVOU_ELEGIVEL` (não utilizado)
- `ATIVO_MES_FLAG` (não utilizado)
| `CHURN_MES_FLAG` (não utilizado)
- `K_COMISSAO` (ID interno de controle)
- `teste a`, `teste b` (colunas de teste)

## = Problemas Encontrados e Soluções

### 1. Encoding de Caracteres

**Problema:** Colunas com acentos não eram lidas corretamente pelo parser CSV.

**Sintomas:**
- `MÉTODO` retornava `undefined`
- `MÊS_PAGTO` retornava `undefined`

**Solução:** Utilizar os nomes das colunas como eram lidos pelo parser (`MýTODO`, `MýS_PAGTO`, etc.)

### 2. Valores Monetários Vazios

**Problema:** Alguns registros tinham `VALOR = "R$ -"` (valor vazio).

**Solução:** Função `parseValor()` retorna `0` para valores vazios, e pagamentos com `valor <= 0` não são criados.

### 3. Campos Booleanos Vazios

**Problema:** Campos booleanos vazios causavam erro ao tentar chamar `.toLowerCase()`.

**Solução:** Adicionar validação em `parseBoolean()` para retornar `false` quando valor é `null`, `undefined` ou string vazia.

### 4. REGRA_TIPO Não Preenchida

**Problema:** Maioria dos registros não tinha `REGRA_TIPO` definido, que é obrigatório para criar pagamentos.

**Solução:** Inferir `REGRA_TIPO` baseado no ciclo:
- Ciclo = 1 ’ PRIMEIRO
- Ciclo > 1 ’ RECORRENTE

### 5. Contas Financeiras Não Reconhecidas

**Problema:** Alguns registros tinham `CONTA = "IMPTEC"` ou `CONTA = "CRýDITO"` que não existem no sistema.

**Solução:** Pagamentos com contas não reconhecidas não são criados (validação retorna `null`).

### 6. Múltiplos Registros por Usuário

**Problema:** CSV contém histórico completo de pagamentos, com múltiplas linhas por usuário.

**Solução:**
- Agrupar registros por email
- Usar dados do **último registro** para informações do usuário
- Criar um pagamento para **cada registro** do usuário

## =Ê Análise de Dados Importados

### Usuários com Mais Pagamentos

Os usuários com maior histórico de pagamentos foram:

- **ROBERT DOMINGUES**: 4 pagamentos
- **JOýO PEDRO JOTA**: 4 pagamentos
- **MARCELO LIMA RODRIGUES (IR)**: 4 pagamentos
- **JOýO GABRIEL CARDOSO**: 4 pagamentos
- **ADEL ZAFANI**: 4 pagamentos
- **CARLOS TEIXEIRA**: 4 pagamentos
- **PAULO CONNECT IMPORTS**: 4 pagamentos
- **LUCAO ELETRONICOS**: 4 pagamentos
- **HELLO JEAN**: 4 pagamentos
- **DEIVID COSTA**: 4 pagamentos
- **DANIEL BATISTI**: 4 pagamentos

### Distribuição de Métodos de Pagamento

A análise dos pagamentos mostra predominância de PIX como método principal, seguido por pagamentos em dinheiro e cartão de crédito.

### Taxas de Renovação

- **Total de usuários:** 162
- **Usuários ativos:** 128 (79%)
- **Churn:** 34 (21%)
- **Taxa de retenção:** 79%

## =€ Próximos Passos Recomendados

### 1. Verificação Manual
- [ ] Conferir alguns usuários no Prisma Studio (`npm run prisma:studio`)
- [ ] Validar valores de comissões
- [ ] Verificar datas de vencimento

### 2. Atualização de Flags
- [ ] Executar job de atualização de flags: `npm run job:atualizar-flags`
- [ ] Verificar status `dias_para_vencer` recalculados
- [ ] Confirmar flags `vence_hoje`, `prox_7_dias`, `em_atraso`

### 3. Melhorias no Sistema
- [ ] Adicionar validação de contas financeiras no frontend
- [ ] Criar alerta para contas não reconhecidas
- [ ] Implementar importação incremental (sem limpar banco)
- [ ] Adicionar log de auditoria para importações

### 4. Dashboards e Relatórios
- [ ] Criar dashboard de KPIs baseado nos dados importados
- [ ] Gerar relatório de comissões por indicador
- [ ] Analisar padrões de churn
- [ ] Projetar renovações futuras

## =Ý Comandos Úteis

### Importação Completa (Limpa e Importa)
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

### Atualizar Flags dos Usuários
```bash
npm run job:atualizar-flags
```

## =Þ Suporte

Em caso de dúvidas ou problemas com a importação:

1. Verificar logs de erro no console
2. Consultar este documento
3. Revisar o código em `src/scripts/importarPagamentos.ts`
4. Validar estrutura do CSV original

## =Å Histórico de Versões

### v1.0.0 - 06/10/2025
-  Importação inicial completa
-  162 usuários importados
-  206 pagamentos registrados
-  34 churns documentados
-  37 agendas criadas
-  35 comissões geradas
-  0 erros

---

**Importação realizada com sucesso! <‰**

*Documento gerado automaticamente pelo sistema de importação.*
