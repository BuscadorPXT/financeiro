# PLANO DE REORGANIZAÇÃO DO BANCO DE DADOS

**Data:** 29/10/2025
**Status:** Análise Concluída - Pronto para Execução

---

## 📊 RESUMO EXECUTIVO

### Situação Atual
- **274 usuários únicos** identificados em 3 fontes diferentes
- **213 usuários (77.7%)** com histórico de pagamentos
- **61 usuários (22.3%)** cadastrados no sistema SEM pagamentos
- **191 usuários (69.7%)** com alertas que precisam revisão

### Problemas Identificados

1. **🔴 61 usuários no sistema sem nenhum pagamento registrado**
   - Possíveis contas teste, free trials, ou cadastros incompletos
   - Precisam ser revisados e possivelmente removidos ou marcados

2. **⚠️ 60 usuários no sistema mas não na planilha manual**
   - Falta de indicador e informações complementares
   - Precisam ser adicionados à planilha manual

3. **❌ 28 usuários na planilha mas não no sistema**
   - Usuários que saíram do sistema mas ainda estão na planilha
   - Precisam ser removidos ou marcados como churned

4. **⚠️ 11 usuários com status divergente**
   - Ativos no sistema mas inativos nos pagamentos
   - Possível inconsistência de dados

5. **ℹ️ 155 usuários sem indicador definido**
   - Falta informação de quem indicou
   - Impacta cálculo de comissões

---

## 🎯 ESTRATÉGIA DE CONSOLIDAÇÃO

### Regras de Prioridade Implementadas

O script consolidou os dados com as seguintes prioridades:

1. **Nome e Telefone:**
   - Prioridade: PLANILHA > PAGAMENTOS > SISTEMA
   - Motivo: Planilha tem dados mais detalhados e formatados

2. **Indicador:**
   - Prioridade: PLANILHA > PAGAMENTOS
   - Motivo: Indicador só é preenchido manualmente na planilha

3. **Status e Informações Financeiras:**
   - Prioridade: PAGAMENTOS > SISTEMA
   - Motivo: Pagamentos têm dados mais precisos sobre situação financeira

4. **Plano e Configurações de Sistema:**
   - Fonte: SISTEMA
   - Motivo: Dados operacionais do sistema

### Sistema de Alertas Automáticos

O sistema gera 6 tipos de alertas:

| Alerta | Quantidade | Descrição |
|--------|-----------|-----------|
| ℹ️ Sem indicador definido | 155 | Falta definir quem indicou |
| 🔴 SEM PAGAMENTOS | 61 | Nunca realizou pagamento |
| ⚠️ Não na planilha manual | 60 | Precisa adicionar à planilha |
| ⏸️ Pagamentos inativos | 31 | Histórico de pagamento mas inativo |
| ❌ Fora do sistema | 28 | Na planilha mas não no sistema |
| ⚠️ Divergência de status | 11 | Status inconsistente |

### Tags Automáticas

6 tags foram criadas para facilitar filtragem:

- `SEM_INDICADOR` (155 usuários)
- `SEM_PAGAMENTO` (61 usuários)
- `REVISAR_MANUALMENTE` (60 usuários)
- `INATIVO` (31 usuários)
- `FORA_DO_SISTEMA` (28 usuários)
- `DIVERGENCIA_STATUS` (11 usuários)

---

## 📁 ARQUIVOS GERADOS

### 1. `base_consolidada.csv` ⭐
**Uso:** Arquivo principal para importação no banco

**Campos:**
- Dados básicos: email, nome, telefone, empresa
- Status: status_sistema, status_pagamento
- Financeiro: plano, tem_pagamentos, total_pagamentos, total_ciclos
- Rastreamento: indicador, data_criacao, ultima_atividade
- Gestão: alertas_str, tags_str, obs, fontes_str

**Formato:** CSV com 274 registros

### 2. `usuarios_para_revisar.csv` 🔍
**Uso:** Lista de 191 usuários que precisam revisão manual

**O que fazer:**
1. Abra no Excel/Google Sheets
2. Revise cada alerta
3. Adicione tags personalizadas na coluna `tags_str`
4. Adicione observações na coluna `obs`
5. Salve e use para atualizar a base final

### 3. `script_importacao.sql` 📝
**Uso:** Instruções para importação no banco

**Conteúdo:**
- Comandos de backup
- Instruções de limpeza (comentadas)
- Exemplos de importação
- Estatísticas

---

## 🚀 PLANO DE EXECUÇÃO

### Fase 1: REVISÃO MANUAL (1-2 horas)

**Passo 1.1:** Revisar usuários críticos
```bash
# Abrir arquivo de revisão
open usuarios_para_revisar.csv
```

Focar em:
- 61 usuários sem pagamentos (decidir se manter ou remover)
- 11 usuários com divergência de status (corrigir status)
- 60 usuários não na planilha (adicionar indicador)

**Passo 1.2:** Editar tags e observações
- Adicione observações relevantes
- Marque usuários para ações específicas:
  - `MANTER` - Usuário válido
  - `REMOVER` - Conta teste ou duplicada
  - `INVESTIGAR` - Precisa mais informações
  - `CONTATAR` - Precisa contato com usuário

**Passo 1.3:** Atualizar base consolidada
- Copie os dados editados de `usuarios_para_revisar.csv`
- Cole de volta em `base_consolidada.csv`

### Fase 2: BACKUP DO BANCO (30 minutos)

**CRÍTICO:** Faça backup completo antes de qualquer alteração!

```bash
# PostgreSQL exemplo
pg_dump -h localhost -U usuario -d nome_banco > backup_$(date +%Y%m%d_%H%M%S).sql

# Ou via interface do sistema
# Navegue até Admin > Backup > Criar Backup Completo
```

### Fase 3: LIMPEZA DO BANCO (Executar com cuidado!)

**Opção A: Limpeza Total (Recomendado se banco está muito inconsistente)**

```sql
-- ATENÇÃO: Isso apaga TODOS os dados de usuários e pagamentos!
-- Use apenas se tiver backup e certeza

BEGIN TRANSACTION;

-- Apagar registros relacionados
DELETE FROM agenda WHERE TRUE;
DELETE FROM churn WHERE TRUE;
DELETE FROM comissao WHERE TRUE;
DELETE FROM pagamentos WHERE TRUE;
DELETE FROM usuarios WHERE TRUE;

-- Verificar se tabelas estão vazias
SELECT COUNT(*) FROM usuarios; -- deve ser 0
SELECT COUNT(*) FROM pagamentos; -- deve ser 0

-- Se tudo OK, confirmar
COMMIT;
-- Se algo errado, reverter
-- ROLLBACK;
```

**Opção B: Limpeza Seletiva (Mais seguro)**

```sql
-- Remover apenas usuários marcados para remoção
-- Você precisa editar a lista abaixo

DELETE FROM usuarios WHERE email IN (
  'email1@exemplo.com',
  'email2@exemplo.com'
  -- adicione emails que devem ser removidos
);
```

### Fase 4: IMPORTAÇÃO DOS DADOS

**Método 1: Via Interface Web (Recomendado)**

1. Acesse o sistema
2. Vá em Admin > Importação > Importar Usuários
3. Selecione o arquivo `base_consolidada.csv`
4. Mapeie as colunas:
   - email → email
   - nome → nome_completo
   - telefone → telefone
   - indicador → indicador
   - plano → plano_assinatura
   - etc.
5. Marque "Atualizar se existir"
6. Execute a importação

**Método 2: Via PostgreSQL**

```sql
-- Criar tabela temporária
CREATE TEMP TABLE usuarios_temp (
  email VARCHAR(255),
  nome VARCHAR(255),
  telefone VARCHAR(50),
  indicador VARCHAR(255),
  plano VARCHAR(50),
  status_sistema VARCHAR(50),
  empresa VARCHAR(255),
  funcao VARCHAR(50),
  verificado VARCHAR(10),
  tem_pagamentos VARCHAR(10),
  total_pagamentos INTEGER,
  total_ciclos INTEGER,
  ultimo_pagamento VARCHAR(20),
  data_vencimento VARCHAR(20),
  status_pagamento VARCHAR(50),
  data_criacao VARCHAR(50),
  ultima_atividade VARCHAR(50),
  obs TEXT,
  alertas_str TEXT,
  tags_str TEXT,
  fontes_str VARCHAR(255)
);

-- Importar CSV
\COPY usuarios_temp FROM 'base_consolidada.csv' WITH CSV HEADER DELIMITER ',';

-- Inserir na tabela principal (ajuste campos conforme schema)
INSERT INTO usuarios (
  email, nome_completo, telefone, indicador, plano_assinatura, status
)
SELECT
  email, nome, telefone, indicador, plano, status_sistema
FROM usuarios_temp
ON CONFLICT (email) DO UPDATE SET
  nome_completo = EXCLUDED.nome_completo,
  telefone = EXCLUDED.telefone,
  indicador = EXCLUDED.indicador,
  plano_assinatura = EXCLUDED.plano_assinatura,
  status = EXCLUDED.status;
```

**Método 3: Via TypeScript/Prisma**

Crie um script de importação:

```typescript
// scripts/importar-base-consolidada.ts
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as csv from 'csv-parser';

const prisma = new PrismaClient();

async function importarUsuarios() {
  const usuarios: any[] = [];

  fs.createReadStream('base_consolidada.csv')
    .pipe(csv())
    .on('data', (row) => usuarios.push(row))
    .on('end', async () => {
      console.log(`Importando ${usuarios.length} usuários...`);

      for (const u of usuarios) {
        try {
          await prisma.usuario.upsert({
            where: { email: u.email },
            update: {
              nome_completo: u.nome,
              telefone: u.telefone,
              indicador: u.indicador,
              // ... outros campos
            },
            create: {
              email: u.email,
              nome_completo: u.nome,
              telefone: u.telefone,
              indicador: u.indicador,
              // ... outros campos
            },
          });
          console.log(`✅ ${u.email}`);
        } catch (error) {
          console.error(`❌ Erro em ${u.email}:`, error);
        }
      }

      console.log('Importação concluída!');
    });
}

importarUsuarios();
```

Execute:
```bash
npx ts-node scripts/importar-base-consolidada.ts
```

### Fase 5: VALIDAÇÃO PÓS-IMPORTAÇÃO

**Verificações necessárias:**

```sql
-- 1. Contar usuários importados
SELECT COUNT(*) FROM usuarios;
-- Deve ser próximo de 274

-- 2. Verificar usuários sem pagamento
SELECT COUNT(*) FROM usuarios u
LEFT JOIN pagamentos p ON u.id = p.usuario_id
WHERE p.id IS NULL;
-- Deve ser próximo de 61

-- 3. Verificar distribuição por plano
SELECT plano_assinatura, COUNT(*)
FROM usuarios
GROUP BY plano_assinatura;
-- Verificar se bate com relatório

-- 4. Verificar indicadores
SELECT indicador, COUNT(*)
FROM usuarios
WHERE indicador IS NOT NULL AND indicador != ''
GROUP BY indicador
ORDER BY COUNT(*) DESC
LIMIT 10;
-- Verificar top 10 indicadores

-- 5. Verificar datas
SELECT
  COUNT(*) FILTER (WHERE data_criacao IS NOT NULL) as com_data_criacao,
  COUNT(*) FILTER (WHERE data_vencimento IS NOT NULL) as com_data_venc
FROM usuarios;
```

### Fase 6: LIMPEZA E AJUSTES FINAIS

1. **Atualizar status de usuários sem pagamento:**
```sql
UPDATE usuarios
SET status = 'INATIVO',
    obs = CONCAT(COALESCE(obs, ''), ' | SEM PAGAMENTOS REGISTRADOS')
WHERE email IN (
  SELECT email FROM usuarios_sem_pagamento_view
);
```

2. **Adicionar tags ao sistema:**
- Implemente campo `tags` na tabela usuarios (se não existir)
- Migre as tags da coluna `tags_str` para o campo

3. **Configurar alertas no sistema:**
- Crie visualizações/filtros para cada tag
- Configure notificações para tags críticas

---

## 📊 ESTATÍSTICAS FINAIS

### Distribuição de Usuários
- **Total:** 274 usuários
- **Com pagamentos:** 213 (77.7%)
- **Sem pagamentos:** 61 (22.3%)
- **Com indicador:** 100 (36.5%)
- **Sem indicador:** 174 (63.5%)

### Distribuição por Plano
- **PRO:** 204 usuários (74.5%)
- **FREE:** 28 usuários (10.2%)
- **APOIADOR:** 9 usuários (3.3%)
- **ADMIN:** 2 usuários (0.7%)

### Top 10 Indicadores
1. (vazio) - 22 usuários
2. CASIMIRO - 10 usuários
3. MARCELO IR - 8 usuários
4. RAYZA - 7 usuários
5. BRYAN FONTES - 6 usuários
6. FELIPE TORRES - 4 usuários
7. ROBERT DOMINGUES - 4 usuários
8. NATANAEL MOTOBOY - 4 usuários
9. ADEL ZAFANI - 4 usuários
10. ZAFANI - 2 usuários

---

## ⚠️ PONTOS DE ATENÇÃO

### 1. Usuários Críticos para Revisar

**61 usuários sem pagamentos** - Decidir ação:
- `adelnasser08@icloud.com` - Plano PRO mas sem pagamento
- `bergentalstore@gmail.com` - Plano FREE
- ... (ver `usuarios_para_revisar.csv` completo)

**Ações sugeridas:**
- Planos FREE: manter se forem usuários válidos de teste
- Planos PRO/APOIADOR sem pagamento: investigar e possivelmente remover
- Planos ADMIN: verificar se são contas administrativas válidas

### 2. Divergências de Status

**11 usuários ativos no sistema mas inativos em pagamentos:**
- Podem estar com trial estendido
- Podem ter pagado fora do sistema
- Podem ser erros de sincronização

**Ação recomendada:** Revisar caso a caso e ajustar status correto

### 3. Usuários Fora do Sistema

**28 usuários na planilha mas não no sistema:**
- Provavelmente saíram (churn)
- Devem ser movidos para tabela de churn
- Ou removidos da planilha se não mais relevantes

---

## 🔒 SEGURANÇA E BACKUP

### Backups Recomendados

1. **Antes da limpeza:** Backup completo do banco
2. **Depois da importação:** Backup do novo estado
3. **Semanalmente:** Backup automático

### Pontos de Rollback

Se algo der errado, você pode:

1. **Restaurar backup completo:**
```bash
psql -h localhost -U usuario -d nome_banco < backup_20251029.sql
```

2. **Reverter transação:** Se usou BEGIN/COMMIT
```sql
ROLLBACK;
```

3. **Reimportar dados antigos:** Se manteve backup dos CSVs originais

---

## 📞 PRÓXIMAS AÇÕES

### Imediatas (Hoje)
- [x] Análise completa realizada
- [ ] Revisar `usuarios_para_revisar.csv`
- [ ] Fazer backup do banco atual
- [ ] Decidir sobre usuários sem pagamento

### Curto Prazo (Esta Semana)
- [ ] Executar limpeza do banco
- [ ] Importar base consolidada
- [ ] Validar importação
- [ ] Ajustar status e tags

### Médio Prazo (Próximas 2 Semanas)
- [ ] Implementar sistema de tags no frontend
- [ ] Criar dashboards para alertas
- [ ] Configurar monitoramento automático
- [ ] Documentar processo para futuras importações

### Longo Prazo (Próximo Mês)
- [ ] Criar processo de sincronização automática
- [ ] Implementar validações em tempo real
- [ ] Adicionar alertas automáticos no sistema
- [ ] Treinar equipe no novo processo

---

## 📚 DOCUMENTAÇÃO ADICIONAL

### Arquivos de Referência
- `base_consolidada.csv` - Base final
- `usuarios_para_revisar.csv` - Lista de revisão
- `script_importacao.sql` - Scripts SQL
- `reorganizar_banco.py` - Script Python (para futuras execuções)

### Executar Análise Novamente

Para refazer a análise com dados atualizados:

```bash
python3 reorganizar_banco.py
```

O script irá:
1. Ler os 3 arquivos CSV
2. Cruzar todos os dados
3. Gerar alertas automáticos
4. Criar novos arquivos consolidados

---

## ✅ CHECKLIST DE EXECUÇÃO

### Pré-Execução
- [ ] Ler este documento completamente
- [ ] Fazer backup do banco atual
- [ ] Verificar se tem acesso admin ao sistema
- [ ] Testar backup fazendo restore em ambiente de dev (se possível)

### Durante Execução
- [ ] Abrir `usuarios_para_revisar.csv`
- [ ] Revisar e marcar usuários críticos
- [ ] Atualizar tags e observações
- [ ] Salvar arquivo editado

### Execução
- [ ] Executar limpeza do banco (se aplicável)
- [ ] Importar `base_consolidada.csv`
- [ ] Validar importação com queries SQL
- [ ] Verificar estatísticas finais

### Pós-Execução
- [ ] Fazer novo backup do banco atualizado
- [ ] Documentar problemas encontrados
- [ ] Testar sistema com dados novos
- [ ] Comunicar equipe sobre mudanças

---

**Criado por:** Claude Code
**Data:** 29/10/2025
**Versão:** 1.0
