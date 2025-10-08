# ✅ Checklist de Deploy Railway - Passo a Passo

## 📋 Pré-requisitos Completos

- [x] Backend compilando sem erros (`npm run build:backend`)
- [x] Frontend deployado no Vercel
- [x] Arquivos de configuração criados:
  - [x] `railway.json` (configuração automática)
  - [x] `.env.example` (referência de variáveis)
  - [x] `RAILWAY_DEPLOY.md` (guia detalhado)
- [x] Start command corrigido: `node dist/backend/backend/server.js`

---

## 🚀 Passos para Deploy

### 1. Criar Conta e Conectar GitHub

1. ✅ Acesse: https://railway.app
2. ✅ Crie conta (pode usar GitHub)
3. ✅ Clique em **"Start a New Project"**
4. ✅ Escolha **"Deploy from GitHub repo"**
5. ✅ Selecione: `BuscadorPXT/financeiro`

### 2. Adicionar PostgreSQL Database

1. ✅ No dashboard, clique **"+ New"**
2. ✅ Selecione **"Database" → "PostgreSQL"**
3. ✅ Railway criará automaticamente `DATABASE_URL`

### 3. Configurar Variáveis de Ambiente

No Railway, vá em **"Variables"** e adicione:

```env
# Automática (Railway gera):
DATABASE_URL=postgresql://...

# Configure manualmente:
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://financeiro-i31u.vercel.app
JWT_SECRET=<GERE UM SECRET SEGURO>
JWT_EXPIRES_IN=7d
LOG_LEVEL=info
```

#### 🔐 Gerar JWT_SECRET Seguro

Execute no seu terminal Mac:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copie o resultado e cole em `JWT_SECRET`.

### 4. Aguardar Deploy Automático

1. ✅ Railway detectará `railway.json` automaticamente
2. ✅ Build levará 2-5 minutos
3. ✅ Migrations rodarão automaticamente no start
4. ✅ Copie a **URL pública** gerada
   - Exemplo: `https://financeiro-backend-production.up.railway.app`

### 5. Configurar Frontend no Vercel

1. ✅ Acesse: https://vercel.com/dashboard
2. ✅ Vá no projeto **financeiro**
3. ✅ Clique **Settings** → **Environment Variables**
4. ✅ Adicione/Edite:

```
Name: VITE_API_URL
Value: https://SEU-BACKEND.up.railway.app/api
```

**⚠️ IMPORTANTE**: Cole a URL DO SEU BACKEND + `/api` no final

5. ✅ Vá em **Deployments**
6. ✅ Clique nos **três pontos** do último deploy
7. ✅ Clique **"Redeploy"** → **"Use existing Build Cache"**

### 6. Testar Aplicação

1. ✅ Teste health check do backend:
   ```
   https://SEU-BACKEND.up.railway.app/api/health
   ```
   - Deve retornar: `{"status": "ok"}`

2. ✅ Acesse o frontend:
   ```
   https://financeiro-i31u.vercel.app
   ```

3. ✅ Tente fazer login com usuário padrão:
   - Email: `admin@example.com`
   - Senha: `admin123`

---

## 🐛 Troubleshooting

### ❌ Backend não inicia

**Sintoma**: Deploy falha, logs mostram erro

**Soluções**:
1. Verifique os logs no Railway dashboard
2. Confirme que todas as variáveis de ambiente estão configuradas
3. Verifique se `DATABASE_URL` existe e está válida
4. Tente fazer redeploy manual

### ❌ Erro de Migrations

**Sintoma**: `Prisma migrate deploy failed`

**Solução**:
1. No Railway CLI:
   ```bash
   railway login
   railway link
   railway run npx prisma migrate deploy
   ```

### ❌ CORS Error no Frontend

**Sintoma**: Login retorna erro CORS no console do navegador

**Soluções**:
1. Verifique se `CORS_ORIGIN` no Railway está: `https://financeiro-i31u.vercel.app` (sem `/` no final)
2. Verifique se `VITE_API_URL` no Vercel está correto
3. Faça redeploy do backend após mudar CORS_ORIGIN

### ❌ Frontend não conecta ao backend

**Sintoma**: Erro de conexão ou timeout

**Soluções**:
1. Verifique se `VITE_API_URL` está configurado no Vercel
2. Teste o health check do backend diretamente
3. Verifique se o backend está rodando no Railway (não em sleep mode)
4. Fez redeploy do frontend após adicionar `VITE_API_URL`?

---

## 📊 Status Esperado Após Deploy

### Railway Backend:
- ✅ Status: **Running**
- ✅ Build: **Completed**
- ✅ Migrations: **Applied**
- ✅ Health check: **200 OK**

### Vercel Frontend:
- ✅ Status: **Ready**
- ✅ Build: **Completed**
- ✅ Environment: **VITE_API_URL configured**

### Funcionalidade:
- ✅ Acessa frontend sem erro 404
- ✅ Login funciona
- ✅ Dados carregam das páginas
- ✅ Operações CRUD funcionam

---

## 📚 Referências

- [Railway Docs](https://docs.railway.app/)
- [Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

**Tempo estimado total**: 15-20 minutos

**Próximo passo**: Acesse Railway.app e siga o checklist! 🚀
