# 🚨 Guia Rápido: Corrigir Erro de Login em Produção

## Problema
Login falha com erro de CORS e 404.

## ⚠️ IMPORTANTE: São 2 Configurações Necessárias

1. **CORS no Render** (backend)
2. **VITE_API_URL no Vercel** (frontend)

---

## Solução em 5 Passos

### 📍 Passo 1: Configurar CORS no Render

1. Acesse: https://dashboard.render.com/
2. Clique no serviço: **financeiro-isdw**
3. Vá em **"Environment"** (menu lateral)
4. Procure `CORS_ORIGIN`:
   - Se existir: edite para `https://financeiro-i31u.vercel.app`
   - Se não existir: clique **"Add Environment Variable"**
     - Key: `CORS_ORIGIN`
     - Value: `https://financeiro-i31u.vercel.app`
5. **NÃO coloque `/` no final!**

### 📍 Passo 2: Configurar VITE_API_URL no Vercel

1. Acesse: https://vercel.com/dashboard
2. Clique no projeto: **financeiro** (frontend)
3. Vá em **"Settings"** → **"Environment Variables"**
4. Procure `VITE_API_URL`:
   - Se existir: edite para `https://financeiro-isdw.onrender.com/api`
   - Se não existir: adicione
     - Key: `VITE_API_URL`
     - Value: `https://financeiro-isdw.onrender.com/api`
5. **IMPORTANTE:** Deve ter `/api` no final!

### 📍 Passo 3: Redeploy do Backend (Render)

1. Volte ao Render
2. Clique em **"Manual Deploy"** → **"Deploy latest commit"**
3. Aguarde 2-5 minutos

### 📍 Passo 4: Redeploy do Frontend (Vercel)

1. Volte ao Vercel
2. Vá em **"Deployments"**
3. Clique nos 3 pontos (⋮) do último deployment
4. Clique em **"Redeploy"**
5. Aguarde 1-2 minutos

### 📍 Passo 5: Testar

1. Acesse: https://financeiro-isdw.onrender.com/health
   - Deve retornar: `{"status":"ok",...}`

2. Acesse: https://financeiro-i31u.vercel.app
   - Faça login com:
     - **Login:** `buscadorpxt`
     - **Senha:** `buscador2025`

---

## ✅ Deve Funcionar!

Se ainda não funcionar:

1. Limpe o cache do navegador (Ctrl+Shift+Delete)
2. Abra uma aba anônima
3. Aguarde 1-2 minutos para o backend "acordar" (Render free tier hiberna)

---

## 📋 Variáveis de Ambiente Corretas

**Backend (Render):**
```bash
CORS_ORIGIN=https://financeiro-i31u.vercel.app  # SEM / no final
DATABASE_URL=(sua URL do Neon)
JWT_SECRET=(gerado automaticamente)
JWT_EXPIRES_IN=7d
NODE_ENV=production
PORT=3001
```

**Frontend (Vercel):**
```bash
VITE_API_URL=https://financeiro-isdw.onrender.com/api  # COM /api no final
```

---

## 🔍 Como Identificar o Problema

### Erro de CORS:
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solução:** Configure CORS_ORIGIN no Render (Passo 1)

### Erro 404:
```
Cannot POST /auth/login
404 - Failed to load resource
```
**Solução:** Configure VITE_API_URL no Vercel (Passo 2)

---

**Guias Detalhados:**
- CORS: `FIX_PRODUCTION_CORS.md`
- VITE_API_URL: `FIX_VERCEL_API_URL.md`
