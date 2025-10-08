# Jobs Automáticos

Este diretório contém scripts de jobs/cron para tarefas automatizadas do sistema.

## atualizarFlags.ts

Job que atualiza diariamente as flags de vencimento dos usuários e agenda.

### Funcionalidades

1. **Atualização de Usuários:**
   - Recalcula `diasParaVencer` baseado na `dataVenc`
   - Atualiza flags: `venceHoje`, `prox7Dias`, `emAtraso`
   - Ajusta `statusFinal` automaticamente (ATIVO/EM_ATRASO)

2. **Atualização de Agenda:**
   - Recalcula `diasParaVencer` para itens ativos
   - Mantém agenda sincronizada com datas atuais

### Execução Manual

```bash
# Via npm script (recomendado)
npm run job:atualizar-flags

# Diretamente via ts-node
npx ts-node src/backend/jobs/atualizarFlags.ts

# Via node (após build)
node dist/backend/jobs/atualizarFlags.js
```

### Configuração de Cron

#### Linux/Mac (crontab)

```bash
# Editar crontab
crontab -e

# Adicionar linha para executar todos os dias às 00:05
5 0 * * * cd /caminho/do/projeto && npm run job:atualizar-flags >> /var/log/financas-job.log 2>&1
```

#### Windows (Task Scheduler)

1. Abrir "Agendador de Tarefas"
2. Criar Tarefa Básica
3. Nome: "Atualizar Flags Financas"
4. Gatilho: Diariamente às 00:05
5. Ação: Iniciar Programa
   - Programa: `npm`
   - Argumentos: `run job:atualizar-flags`
   - Iniciar em: `C:\caminho\do\projeto`

#### PM2 (Process Manager)

```bash
# Instalar PM2
npm install -g pm2

# Configurar job no PM2
pm2 start src/backend/jobs/atualizarFlags.ts --name "job-flags" --cron "5 0 * * *" --no-autorestart

# Listar jobs
pm2 list

# Ver logs
pm2 logs job-flags
```

### Formato de Cron

```
* * * * *
│ │ │ │ │
│ │ │ │ └─── Dia da semana (0-7, 0 e 7 = domingo)
│ │ │ └───── Mês (1-12)
│ │ └─────── Dia do mês (1-31)
│ └───────── Hora (0-23)
└─────────── Minuto (0-59)
```

Exemplos:
- `5 0 * * *` - Todos os dias às 00:05
- `0 */6 * * *` - A cada 6 horas
- `0 0 * * 0` - Todos os domingos à meia-noite
- `30 2 1 * *` - Dia 1 de cada mês às 02:30

### Logs

O job gera logs detalhados:

```
[JOB] ========================================
[JOB] Job iniciado em: 2024-10-29T00:05:00.000Z
[JOB] ========================================
[JOB] Iniciando atualização de flags dos usuários...
[JOB] Encontrados 150 usuários para atualizar
[JOB] Atualização concluída:
  - 45 usuários atualizados
  - 105 sem alterações
  - 0 erros encontrados
[JOB] Iniciando atualização de flags da agenda...
[JOB] Encontrados 80 itens da agenda para atualizar
[JOB] 35 itens da agenda atualizados
[JOB] ========================================
[JOB] Job concluído com sucesso!
[JOB] Duração: 1234ms
[JOB] ========================================
```

### Adicionando ao package.json

Adicione o script ao `package.json`:

```json
{
  "scripts": {
    "job:atualizar-flags": "ts-node src/backend/jobs/atualizarFlags.ts"
  }
}
```

### Monitoramento

Para produção, considere:
- Configurar alertas de falha (email, Slack, etc.)
- Usar ferramentas de monitoramento (PM2, Forever, systemd)
- Implementar retry logic para casos de falha
- Salvar métricas de execução (tempo, registros atualizados, etc.)

### Troubleshooting

**Job não executa:**
- Verificar se o caminho do projeto está correto
- Verificar permissões de execução
- Verificar variáveis de ambiente (.env)
- Verificar conexão com banco de dados

**Erros de conexão:**
- Verificar se o DATABASE_URL está configurado
- Verificar se o banco de dados está acessível
- Verificar timeout de conexão

**Performance:**
- Job processa em lote (batch)
- Média de tempo: ~1s para cada 100 usuários
- Otimização: usar transações e bulk updates se necessário
