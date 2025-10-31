-- Script de importação para banco de dados
-- Gerado em: 2025-10-29 18:21:03
-- Total de usuários: 274

-- PASSO 1: BACKUP DO BANCO ATUAL
-- Faça um backup completo antes de executar este script!

-- PASSO 2: LIMPEZA (OPCIONAL - USE COM CUIDADO)
-- DELETE FROM usuarios WHERE TRUE;
-- DELETE FROM pagamentos WHERE TRUE;

-- PASSO 3: IMPORTAR USUÁRIOS CONSOLIDADOS
-- Use o arquivo base_consolidada.csv para importar via:
-- 1. Interface web de importação do sistema
-- 2. Comando SQL COPY (PostgreSQL)
-- 3. Script de importação TypeScript/Prisma

-- Exemplo PostgreSQL:
-- \COPY usuarios FROM 'base_consolidada.csv' WITH CSV HEADER DELIMITER ',';

-- ESTATÍSTICAS DA IMPORTAÇÃO:
-- Total de usuários: 274
--   pro: 204
--   SEM_PLANO: 31
--   free: 28
--   apoiador: 9
--   admin: 2
