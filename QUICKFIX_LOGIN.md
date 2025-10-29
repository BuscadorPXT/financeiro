# 🚨 Guia Rápido: Corrigir Erro de Login em Produção

## Problema
Login falha com erro de CORS e 404.

## Solução em 3 Passos

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

### 📍 Passo 2: Fazer Redeploy

1. No Render, clique em **"Manual Deploy"**
2. Clique em **"Deploy latest commit"**
3. Aguarde 2-5 minutos

### 📍 Passo 3: Testar

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

## 📋 Variáveis que Devem Estar no Render

```bash
CORS_ORIGIN=https://financeiro-i31u.vercel.app
DATABASE_URL=(sua URL do Neon)
JWT_SECRET=(gerado automaticamente)
JWT_EXPIRES_IN=7d
NODE_ENV=production
PORT=3001
```

---

**Se precisar de mais detalhes:** Consulte `FIX_PRODUCTION_CORS.md`
