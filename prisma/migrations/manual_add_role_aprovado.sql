-- Migration: Adicionar campos role, aprovado e email à tabela admins
-- Execute este SQL manualmente no banco de dados de produção

-- 1. Criar tipo enum para RoleAdmin
CREATE TYPE "RoleAdmin" AS ENUM ('ADMIN', 'USER');

-- 2. Adicionar novas colunas
ALTER TABLE admins ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS role "RoleAdmin" DEFAULT 'USER';
ALTER TABLE admins ADD COLUMN IF NOT EXISTS aprovado BOOLEAN DEFAULT false;

-- 3. Criar constraint unique para email
ALTER TABLE admins ADD CONSTRAINT admins_email_key UNIQUE (email);

-- 4. Atualizar usuários existentes para serem aprovados e admin
UPDATE admins
SET aprovado = true, role = 'ADMIN'
WHERE aprovado = false;

-- 5. Verificar resultado
SELECT id, login, nome, email, role, aprovado, ativo FROM admins;
