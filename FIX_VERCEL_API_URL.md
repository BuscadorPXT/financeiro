# 🚨 URGENTE: Corrigir VITE_API_URL no Vercel

## Problema Identificado

**Erro no Console:**
```
Cannot POST /auth/login
404 - Failed to load resource
```

**Causa:**
O frontend está chamando:
- ❌ `https://financeiro-isdw.onrender.com/auth/login`

Mas deveria chamar:
- ✅ `https://financeiro-isdw.onrender.com/api/auth/login`

**Motivo:**
A variável `VITE_API_URL` no Vercel está **SEM** `/api` no final.

---

## Solução: Configurar VITE_API_URL no Vercel

### Passo 1: Acessar Vercel Dashboard

1. Acesse: https://vercel.com/dashboard
2. Clique no projeto: **financeiro** (frontend)
3. Vá em **"Settings"** (menu superior)

### Passo 2: Configurar Variável de Ambiente

1. No menu lateral, clique em **"Environment Variables"**
2. Procure por `VITE_API_URL`

**Se a variável EXISTE:**
- Clique em **"Edit"** (ícone de lápis)
- Altere o valor para: `https://financeiro-isdw.onrender.com/api`
- **IMPORTANTE:** Deve ter `/api` no final!
- Clique em **"Save"**

**Se a variável NÃO EXISTE:**
- Clique em **"Add New"**
- Key: `VITE_API_URL`
- Value: `https://financeiro-isdw.onrender.com/api`
- Environment: Selecione **Production**, **Preview** e **Development**
- Clique em **"Save"**

### Passo 3: Fazer Redeploy

**IMPORTANTE:** Alterar variáveis de ambiente requer redeploy!

1. Vá em **"Deployments"** (menu superior)
2. Clique nos 3 pontos (⋮) do último deployment
3. Clique em **"Redeploy"**
4. Marque **"Use existing Build Cache"** (opcional, mais rápido)
5. Clique em **"Redeploy"**
6. Aguarde 1-2 minutos

### Passo 4: Testar

1. Limpe o cache do navegador (Ctrl+Shift+Delete)
2. Acesse: https://financeiro-i31u.vercel.app
3. Tente fazer login:
   - **Login:** `buscadorpxt`
   - **Senha:** `buscador2025`

---

## ✅ Deve Funcionar!

Após seguir esses passos, o frontend vai chamar:
- ✅ `https://financeiro-isdw.onrender.com/api/auth/login`

E o login vai funcionar!

---

## Verificação: Como Saber se Está Correto

### Teste 1: Verificar no Console do Browser

Abra o console (F12) em https://financeiro-i31u.vercel.app e execute:

```javascript
console.log('API URL:', import.meta.env.VITE_API_URL);
```

Deve mostrar: `https://financeiro-isdw.onrender.com/api`

### Teste 2: Verificar Requisições no Network Tab

1. Abra DevTools (F12)
2. Vá na aba **"Network"**
3. Tente fazer login
4. Veja a requisição para `/auth/login`
5. A URL completa deve ser: `https://financeiro-isdw.onrender.com/api/auth/login`

---

## 📋 Configuração Correta

**Frontend (Vercel):**
```bash
VITE_API_URL=https://financeiro-isdw.onrender.com/api
```
⚠️ **COM** `/api` no final!

**Backend (Render):**
```bash
CORS_ORIGIN=https://financeiro-i31u.vercel.app
```
⚠️ **SEM** `/` no final!

---

## Troubleshooting

### Problema: Ainda dá 404 após redeploy

**Soluções:**
1. Aguarde 2-3 minutos após o redeploy
2. Limpe o cache do navegador (Ctrl+Shift+Delete)
3. Tente em uma aba anônima
4. Verifique se o redeploy completou com sucesso no Vercel
5. Verifique se a variável foi salva corretamente em "Environment Variables"

### Problema: Backend dá erro de CORS

**Solução:**
Configure `CORS_ORIGIN` no Render (veja `QUICKFIX_LOGIN.md`)

### Problema: "VITE_API_URL não configurada!"

**Causa:** A variável não foi criada no Vercel

**Solução:** Volte ao Passo 2 e adicione a variável

---

## Estrutura de Rotas do Sistema

**Backend (Render):**
- `/health` - Health check
- `/api` - Raiz da API
- `/api/auth/login` - Login
- `/api/auth/me` - Dados do usuário
- `/api/usuarios` - Usuários
- `/api/pagamentos` - Pagamentos
- etc.

**Frontend (Vercel):**
- Define `baseURL` do axios como `VITE_API_URL`
- authService chama `/auth/login` (relativo)
- axios concatena: `baseURL + /auth/login`
- Resultado: `https://financeiro-isdw.onrender.com/api/auth/login` ✅

---

## Resumo da Solução

**1 frase:** Configure `VITE_API_URL=https://financeiro-isdw.onrender.com/api` no Vercel e faça redeploy.

**Tempo:** 2-3 minutos

**Dificuldade:** ⭐ Fácil

---

**Documento criado em:** 2025-10-29
**Prioridade:** 🚨 URGENTE
