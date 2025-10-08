# 🚀 Instruções de Deploy - Financas Buscador

## Status Atual ✅

### Frontend
- ✅ **Build**: Passando sem erros TypeScript
- ✅ **Deploy**: Configurado no Vercel
- ✅ **Configuração**: vercel.json criado para SPA

### Backend
- ⚠️ **Pendente**: Precisa ser deployado separadamente

---

## 📋 Próximos Passos

### Opção 1: Deploy Backend Separado (Recomendado)

#### 1.1. Railway.app (Grátis)
```bash
# 1. Criar conta em https://railway.app
# 2. Conectar repositório GitHub
# 3. Configurar variáveis de ambiente:
DATABASE_URL=postgresql://...
JWT_SECRET=seu-secret-aqui
NODE_ENV=production
PORT=3001
```

#### 1.2. Configurar Frontend para apontar ao Backend
No Vercel, adicione a variável de ambiente:
```
VITE_API_URL=https://seu-projeto.up.railway.app/api
```

### Opção 2: Backend como Serverless no Vercel

Requer refatoração do código Express para serverless functions.

---

## 🔧 Configuração Atual

### Vercel (Frontend)
- **Output Directory**: `frontend/dist`
- **Build Command**: `npm run build`
- **Framework**: React SPA
- **Routing**: Client-side (index.html fallback)

### Variáveis de Ambiente Necessárias

#### Frontend (.env no Vercel)
```env
VITE_API_URL=https://sua-api-url.com/api
```

#### Backend
```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname
JWT_SECRET=seu-secret-super-seguro
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://seu-frontend.vercel.app
```

---

## 🐛 Troubleshooting

### Erro 404 NOT_FOUND
✅ **Resolvido**: Adicionado `vercel.json` com rotas SPA

### API não conecta
⚠️ **Pendente**: Configure `VITE_API_URL` no Vercel apontando para seu backend

### Erro de CORS
Configure a variável `CORS_ORIGIN` no backend com a URL do Vercel

---

## 📚 Recursos

- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app/)
- [Render Docs](https://render.com/docs)

---

**Última atualização**: Deploy do frontend concluído, backend pendente
