# 🚂 Deploy Backend no Railway - Passo a Passo

## 1️⃣ Criar Conta e Projeto

1. Acesse: https://railway.app
2. Clique em **"Start a New Project"**
3. Escolha **"Deploy from GitHub repo"**
4. Selecione o repositório: `BuscadorPXT/financeiro`

## 2️⃣ Configurar o Projeto

### Configurações Iniciais:
- **Name**: financeiro-backend
- **Branch**: main
- **Root Directory**: (deixe vazio)

### Build Command:
```bash
npm run build:backend
```

### Start Command:
```bash
node dist/backend/server.js
```

## 3️⃣ Adicionar Banco de Dados PostgreSQL

1. No dashboard do Railway, clique em **"+ New"**
2. Escolha **"Database" → "PostgreSQL"**
3. Railway criará automaticamente a variável `DATABASE_URL`

## 4️⃣ Configurar Variáveis de Ambiente

Vá em **"Variables"** e adicione:

```env
# Gerado automaticamente pelo Railway
DATABASE_URL=postgresql://...

# Configure manualmente:
NODE_ENV=production
PORT=3001
JWT_SECRET=seu-secret-super-seguro-aqui-xyz123
CORS_ORIGIN=https://financeiro-i31u.vercel.app
```

### ⚠️ IMPORTANTE: Gere um JWT_SECRET seguro:
```bash
# Execute no seu terminal:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 5️⃣ Deploy e Obter URL

1. Railway fará deploy automaticamente
2. Aguarde o build completar (2-3 minutos)
3. Copie a **URL pública** do seu backend
   - Exemplo: `https://financeiro-backend-production.up.railway.app`

## 6️⃣ Configurar Frontend no Vercel

1. Acesse: https://vercel.com/dashboard
2. Vá no projeto **financeiro**
3. Clique em **Settings** → **Environment Variables**
4. Adicione:

```
Name: VITE_API_URL
Value: https://SEU-BACKEND.up.railway.app/api
```

5. Vá em **Deployments**
6. Clique nos **três pontos** do último deploy
7. Clique em **"Redeploy"**

## 7️⃣ Rodar Migrations (Se necessário)

Se precisar rodar migrations no Railway:

1. No Railway, vá em **"Settings" → "Service"**
2. Em **"Custom Start Command"** adicione antes do start:
```bash
npx prisma migrate deploy && node dist/backend/server.js
```

OU execute manualmente via CLI:
```bash
# Instale Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link ao projeto
railway link

# Rode migrations
railway run npx prisma migrate deploy
```

## ✅ Verificar que Funcionou

1. Acesse: `https://SEU-BACKEND.up.railway.app/api/health`
2. Deve retornar: `{"status": "ok"}`
3. Acesse seu frontend: `https://financeiro-i31u.vercel.app`
4. Tente fazer login!

## 🐛 Troubleshooting

### Erro de Conexão com Banco:
- Verifique se `DATABASE_URL` está configurada
- Rode: `railway run npx prisma migrate deploy`

### Erro CORS:
- Verifique se `CORS_ORIGIN` está configurada corretamente
- Deve ser: `https://financeiro-i31u.vercel.app` (sem / no final)

### Backend não inicia:
- Verifique os logs no Railway
- Certifique-se de que o build completou
- Verifique se todas as variáveis de ambiente estão configuradas

## 📊 Limites do Plano Gratuito Railway

- ✅ 500 horas/mês de execução
- ✅ PostgreSQL incluído
- ✅ Deploy automático via GitHub
- ✅ Sem cartão de crédito necessário inicialmente

---

**Tempo estimado**: 10-15 minutos

Depois de concluir, volte e confirme que está funcionando! 🚀
