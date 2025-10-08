
# Brief: Sistema Local de Controle Financeiro (Cursor + Claude Code)

> **📋 Acompanhamento do Projeto:**
> - **Progresso e Fases:** veja [PLANO.md](./PLANO.md)
> - **Status Atual:** Fase 3 em andamento 🔄 (Backend - Services e Controllers)
> - **Documentação:** veja [README.md](./README.md)

---

## Objetivo

Construir um app local (localhost) para operacionalizar e consolidar o controle financeiro hoje feito nas planilhas. O sistema terá cadastros, lançamentos, cálculo de indicadores (receitas, despesas, comissões, churn), agenda de renovações, relatórios e auditoria.

## Princípios de UX

* Navegação por abas laterais: **Listas**, **Prospecção**, **Usuários**, **Pagamentos**, **Despesas**, **Agenda**, **Churn**, **Comissões**, **Relatórios**.
* Tabelas com filtros rápidos no cabeçalho, busca global, ordenação por coluna e paginação.
* Cores de status (verde=Ativo, amarelo=próximos 7 dias, vermelho=Atraso, cinza=Histórico/Inativo).
* Ações em massa (seleção múltipla) e histórico/auditoria por registro.
* Importar/Exportar CSV/XLSX por tela (com pré-visualização e mapeamento de colunas).

---

## Modelo de Dados (alto nível)

* **Usuário**: email_login, nome_completo, telefone, indicador (quem indicou), status_final, método, conta, ciclo, total_ciclos_usuario, dias_para_vencer, flags (vence_hoje, prox_7_dias, em_atraso), notas/obs, métricas de elegibilidade/ comissão e marcadores de agenda. 
* **Pagamento**: referência ao usuário, data_pagto, mês_pagto, valor, método (PIX/CRÉDITO/DIN), conta (PXT/EAGLE/etc.), regra_tipo (PRIMEIRO/RECORRENTE), regra_valor, elegível_comissão, comissão_valor; efeitos sobre ciclo/ativo/churn. 
* **Despesa**: categoria, descrição, conta, indicador (opcional), valor, status (Pago/Pendente), competência (mês/ano). Ex.: “DEV v1/v2, Comissão, Taxas, Aluguel, Salários, API, Anúncios”. 
* **Agenda** (renovações): data_venc, dias_para_vencer, status (Ativo/Inativo), ciclo, checkboxes “Renovou” / “Cancelou”, integra com Usuários/Pagamentos para registrar evento de renovação ou churn. (vide a grade colorida e colunas da aba AGENDA).
* **Comissão**: vínculo com pagamento (primeira adesão ou recorrente), percentuais por regra, total por indicador/mês. 
* **Relatório**: visões agregadas por mês (Receita, Adesões, Renovações, Ativos, Evasões) e consolidação de **Receitas – Despesas** por competência (JUN, JUL, AGO, SET, OUT…). 
* **Auditoria**: trilha de tudo (quem, quando, o que mudou), incluindo importações.

---

## Telas & Requisitos (sem código)

### 1) **Usuários**

**Objetivo:** cadastro mestre de clientes/assinantes.
**Colunas essenciais:** EMAIL_LOGIN, NOME_COMPLETO, TELEFONE, INDICADOR, DATA_PAGTO, MÊS_PAGTO, DIAS_ACESSO, DATA_VENC, STATUS_FINAL, DIAS_PARA_VENCER, VENCE_HOJE, PROX_7_DIAS, EM_ATRASO, MÉTODO, CONTA, VALOR, OBS, CICLO, TOTAL_CICLOS_USUARIO, E_ULTIMO, FLAG_AGENDA, K_AGENDA, MES_REF, ENTROU, RENOVOU, ATIVO_ATUAL, CHURN, K_CHURN, REGRA_TIPO, REGRA_VALOR, ELEGIVEL_COMISSÃO, COMISSÃO_VALOR, marcadores “ENTROU_ELIG”, “RENOVOU_ELEGIVEL”, flags mensais de ativo/churn/comissão. 
**Filtros rápidos:** por status (Ativo/Histórico/Inativo), por “vence hoje”, “próx. 7 dias”, “em atraso”, por indicador, por método (PIX/CRÉDITO/DIN), por conta (PXT/EAGLE). 
**Ações:**

* Criar/editar usuário (validação obrigatória de e-mail e telefone).
* Registrar pagamento rápido (abre modal da tela Pagamentos já com o usuário preenchido).
* Marcar/desmarcar **Agendar** (gera/atualiza item na Agenda).
* Converter status automaticamente com base em pagamentos (Ativo) ou atraso (Em atraso).
* Histórico de movimentos do usuário (pagamentos, mudanças de plano, observações).
* Exportar CSV da seleção.

### 2) **Pagamentos**

**Objetivo:** lançamentos financeiros de receita.
**Campos de lançamento:** usuário (auto-complete por email/nome), data_pagto, mês_pagto (derivado por competência), valor, método (PIX/CRÉDITO/DIN), conta (PXT/EAGLE/…), regra_tipo (**PRIMEIRO** x **RECORRENTE**), regra_valor (percentual ou fixo p/ comissão), observação. 
**Regras de negócio:**

* **PRIMEIRO** pagamento marca “ENTROU=1”, avalia elegibilidade e calcula **comissão_valor** (ex.: 100,00 ou 70,00). 
* **RECORRENTE**: atualiza **RENOVOU=1**, incrementa **CICLO** e **TOTAL_CICLOS_USUARIO**. 
* Atualiza **DATA_VENC** + **DIAS_PARA_VENCER**; zera flags de atraso; ajusta **ATIVO_ATUAL**. 
  **Relatórios rápidos por tabela:** soma por mês/conta/método; lista últimos pagamentos.

### 3) **Despesas**

**Objetivo:** controle de custos por competência.
**Colunas:** CATEGORIA, DESCRIÇÃO, CONTA, INDICADOR (opcional), VALOR, STATUS (Pago/Pendente). Exemplos de categorias e somatórios mensais constam na planilha (DEV v1/v2, Comissões, Taxas, Aluguel, Salários, API, Anúncios, Permuta etc.). 
**Funções:**

* Lançar, editar, quitar (mudar STATUS).
* Agrupar por Categoria e Competência (mês).
* Dashboard lateral com **Soma de VALOR por categoria e mês** (como na tabela dinâmica mostrada). 

### 4) **Agenda**

**Objetivo:** gestão de renovações por data de vencimento.
**Colunas/visão:** email_login, telefone, nome, **data_venc**, **dias_para_vencer**, **status** (Ativo/Inativo), **ciclo**, checkboxes **Renovou** e **Cancelou** (um desmarca o outro). A grade deve destacar faixas (atrasados em rosa, próximos em amarelo, renovado verde).

* Ao marcar **Renovou**, cria um **Pagamento recorrente** (regra RECORRENTE) e atualiza o usuário.
* Ao marcar **Cancelou**, registra **Churn** para o usuário.
* Filtros: por janela (vencidos, hoje, próximos 7 dias, mês atual). *(Baseado no layout de “AGENDA”)*.

### 5) **Churn**

**Objetivo:** acompanhar evasões.

* Lista usuários com **CHURN=1** ou **Cancelou** na Agenda, com data/motivo (texto livre).
* KPIs: churn do mês, churn acumulado no período, taxa (%) = churn / base.
* Ação “reverter churn” (se reativado com pagamento).

### 6) **Comissões**

**Objetivo:** cálculo e consolidação de comissões por indicador e por regra.

* Fontes: pagamentos elegíveis (**ELEGIVEL_COMISSÃO**) com **COMISSÃO_VALOR** alimentado por **REGRA_TIPO** (PRIMEIRO/RECORRENTE) e **REGRA_VALOR** (ex.: 100, 70). 
* Visões:

  * Por **Indicador** no mês (total e lista de usuários)
  * Por **Regra** (primeiras adesões x recorrentes)
  * Extrato exportável (CSV) por período.

### 7) **Relatórios**

**Objetivo:** visão executiva por mês.
**Indicadores mínimos (todos por competência):**

* **Receita** (soma dos Pagamentos)
* **Despesas** (soma por categoria)
* **Receita – Despesas** (resultado)
* Contagens: **Adesões** (primeiro), **Renovações** (recorrente), **Ativos**, **Evasões**
* Tabelas dinâmicas iguais às da planilha, com totais por **JUN, JUL, AGO, SET, OUT** etc. (valores e estrutura de referência estão no PDF com as somas por mês). 

### 8) **Prospecção** (opcional, se já existir na planilha)

* Cadastro de leads (email, nome, telefone, origem, indicador).
* Conversão de lead em usuário (move para **Usuários** e opcionalmente cria primeiro pagamento).

### 9) **Listas** (opcional)

* Espaço para listas auxiliares (contas financeiras, métodos de pagamento, categorias de despesa, indicadores/afiliados).
* CRUD simples, com proteção para não apagar itens em uso.

---

## Regras Transversais

* **Status automático do Usuário**:

  * “Ativo” quando há pagamento vigente (dias_para_vencer ≥ 1).
  * “Em atraso” quando dias_para_vencer < 0.
  * “Histórico/Inativo” quando explicitamente marcado ou após churn. 
* **Cálculo de vencimento**: ao registrar pagamento, definir **DATA_VENC** e **DIAS_PARA_VENCER** conforme ciclo (30 dias padrão). 
* **Elegibilidade e Comissão**:

  * **PRIMEIRO**: usa **REGRA_VALOR** (ex.: 100,00).
  * **RECORRENTE**: usa **REGRA_VALOR** recorrente (ex.: 70,00 ou 100,00 conforme indicador).
  * Persistir **COMISSÃO_VALOR** no pagamento e consolidar na tela **Comissões**. 
* **Contabilidade mensal**: todas as telas têm filtro “Competência (mês/ano)”. Relatórios agregam por mês como nas tabelas dinâmicas de **Receitas/Despesas** da planilha. 
* **Auditoria**: logar toda criação/edição/remoção/importação (usuário, pagamento, despesa, agenda).
* **Importador**: aceitar CSV/XLSX com **mapeamento de colunas** (mostrar preview e permitir renomear campos para os nomes do sistema).
* **Exportador**: CSV/XLSX da seleção atual (respeita filtros/ordem).
* **Validações**: e-mail obrigatório/único, telefone formatado, datas válidas, valores numéricos, método/conta/categoria existentes.

---

## KPIs no topo (Dashboard rápido)

* Receita do mês, Despesa do mês, Resultado do mês (**Receitas – Despesas**)
* Adesões (qtd e R$), Renovações (qtd e R$), Ativos (qtd), Evasões (qtd) — seguindo os painéis da planilha de **Receita / Adesões / Renovações / Ativos / Evasões**. 

---

## Fluxos Essenciais

1. **Nova adesão (primeiro pagamento)**
   Usuário criado → Pagamento com **REGRA_TIPO=PRIMEIRO** → marca **ENTROU=1**, calcula **COMISSÃO_VALOR** (ex.: 100) e define **DATA_VENC**/**DIAS_PARA_VENCER** → Usuário vira **Ativo** e entra na **Agenda**. 

2. **Renovação**
   Na **Agenda**, marcar **Renovou** → cria Pagamento **RECORRENTE**, incrementa **CICLO/TOTAL_CICLOS_USUARIO**, recalcula vencimento, mantém **Ativo**. 

3. **Churn/Cancelamento**
   Na **Agenda**, marcar **Cancelou** → define **CHURN=1** e desativa o usuário; aparece em **Churn** e deixa de contar em “Ativos”. 

4. **Despesas mensais**
   Lançar despesas na tela **Despesas** por categoria/competência → **Relatórios** consolida **Soma de VALOR** por categoria e mostra **Receitas – Despesas** do período, como nas tabelas dinâmicas da planilha. 

---

## Relatórios obrigatórios

* **Mês a mês**: JUN, JUL, AGO, SET, OUT… com totais (valores de referência exibidos na planilha). 
* **Por Indicador**: total de comissões e base ativa. 
* **Idade de títulos**: vencidos, hoje, próximos 7, próximos 30.
* **Resumo executivo**: cards e gráfico de barras (Receitas, Despesas, Resultado por mês).

---

## Entregáveis & Critérios de Aceite

* Todas as telas descritas, com filtros, buscas, ordenações, exportações e importações funcionando.
* Regras de ciclo, vencimento, elegibilidade e comissão refletindo as colunas/flags da planilha. 
* Relatórios com os mesmos agrupamentos e somas exibidos nas suas tabelas dinâmicas. 
* Auditoria completa e idempotência no importador (não duplicar registros por **EMAIL_LOGIN + Mês**).
* Dados de teste carregados via importador a partir dos CSV/XLSX exportados da planilha atual.

