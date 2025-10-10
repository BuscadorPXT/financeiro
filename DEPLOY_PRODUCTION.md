# Guia de Deploy em Produção

Este documento contém todas as instruções para fazer deploy do sistema em produção.

## Arquitetura de Deploy

- **Backend**: Render.com
- **Frontend**: Vercel
- **Banco de Dados**: Neon PostgreSQL (já configurado)

---

## 🚀 Deploy do Backend (Render.com)

### 1. Conectar Repositório

1. Acesse [Render.com](https://render.com)
2. Clique em "New +" → "Web Service"
3. Conecte seu repositório GitHub: `BuscadorPXT/financeiro`
4. O Render detectará automaticamente o `render.yaml`

### 2. Configurar Variáveis de Ambiente

**IMPORTANTE**: Configure estas variáveis no painel do Render:

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `DATABASE_URL` | `postgresql://neondb_owner:npg_hsbyFa2OnN8B@ep-hidden-grass-acrx4hwf-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require` | URL do banco Neon |
| `JWT_SECRET` | (gerado automaticamente) | Secret para JWT |
| `NODE_ENV` | `production` | Ambiente |
| `PORT` | `3001` | Porta do servidor |
| `CORS_ORIGIN` | **`https://SEU-APP.vercel.app`** | ⚠️ **ALTERAR** para URL do frontend |

⚠️ **ATENÇÃO**: A variável `CORS_ORIGIN` deve ser a URL completa do seu frontend no Vercel!

### 3. Deploy

O Render fará o deploy automaticamente executando:
```bash
npm ci && npx prisma generate && npm run build:backend
npx prisma migrate deploy && node dist/backend/server.js
```

### 4. Obter URL do Backend

Após o deploy, você terá uma URL tipo:
```
https://financeiro-xxxx.onrender.com
```

**GUARDE ESTA URL** - você vai precisar dela no próximo passo!

---

## 🎨 Deploy do Frontend (Vercel)

### 1. Conectar Repositório

1. Acesse [Vercel](https://vercel.com)
2. Clique em "New Project"
3. Conecte seu repositório GitHub: `BuscadorPXT/financeiro`
4. Vercel detectará automaticamente o `vercel.json`

### 2. Configurar Variáveis de Ambiente

**CRÍTICO**: Configure esta variável no Vercel:

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `VITE_API_URL` | `https://financeiro-xxxx.onrender.com/api` | URL do backend + `/api` |

**Exemplo completo**:
```
VITE_API_URL=https://financeiro-abc123.onrender.com/api
```

⚠️ **NÃO ESQUEÇA** o `/api` no final!

### 3. Deploy

Vercel fará o deploy executando:
```bash
cd frontend && npm install
cd frontend && npm run build
```

---

## ✅ Checklist Pós-Deploy

Após fazer os deploys, verifique:

### Backend (Render)
- [ ] Deploy concluído com sucesso
- [ ] Variáveis de ambiente configuradas
- [ ] `CORS_ORIGIN` apontando para URL do Vercel
- [ ] Migrations executadas (prisma migrate deploy)
- [ ] Backend acessível em `https://SEU-BACKEND.onrender.com/health`

### Frontend (Vercel)
- [ ] Deploy concluído com sucesso
- [ ] `VITE_API_URL` configurada corretamente
- [ ] Site acessível em `https://SEU-APP.vercel.app`

### Teste de Integração
- [ ] Abrir frontend em produção
- [ ] Fazer login com `admin` / `admin123`
- [ ] Verificar que Dashboard carrega dados
- [ ] Verificar console do navegador (F12) - não deve ter erros de CORS

---

## 🔧 Atualizar CORS após Deploy do Frontend

**IMPORTANTE**: Depois do primeiro deploy do frontend no Vercel:

1. Copie a URL do seu app: `https://seu-app.vercel.app`
2. Vá no painel do Render
3. Navegue até seu serviço de backend
4. Vá em "Environment" → "Environment Variables"
5. Edite `CORS_ORIGIN` para a URL do Vercel
6. Clique em "Save Changes"
7. O Render vai fazer redeploy automaticamente

---

## 🐛 Troubleshooting

### Erro de CORS
**Sintoma**: `Access to XMLHttpRequest blocked by CORS policy`

**Solução**:
1. Verifique `CORS_ORIGIN` no Render
2. Deve ser exatamente a URL do Vercel (com https://)
3. Sem barra no final
4. Exemplo: `https://financeiro.vercel.app`

### Erro 500 no Backend
**Sintoma**: Erros ao acessar API

**Solução**:
1. Verifique logs no Render Dashboard
2. Confirme que migrations rodaram
3. Verifique `DATABASE_URL` está correta

### Frontend não conecta ao Backend
**Sintoma**: Timeout ou erro de rede

**Solução**:
1. Verifique `VITE_API_URL` no Vercel
2. Deve incluir `/api` no final
3. Exemplo: `https://financeiro.onrender.com/api`
4. Redeploy do frontend após alterar variável

---

## 🔄 Fluxo de Atualização

Para atualizar o sistema em produção:

### 1. Código
```bash
git add .
git commit -m "Sua mensagem"
git push
```

### 2. Deploys Automáticos
- **Render**: Detecta push e faz redeploy do backend automaticamente
- **Vercel**: Detecta push e faz redeploy do frontend automaticamente

### 3. Verificação
- Aguarde builds completarem (3-5 minutos)
- Teste o sistema em produção
- Verifique logs se houver erros

---

## 📝 Variáveis de Ambiente - Resumo

### Backend (.env no Render)
```bash
DATABASE_URL=postgresql://neondb_owner:...
JWT_SECRET=(gerado automaticamente)
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://seu-app.vercel.app  # ⚠️ ALTERAR
```

### Frontend (.env no Vercel)
```bash
VITE_API_URL=https://seu-backend.onrender.com/api  # ⚠️ ALTERAR
```

---

## 🎯 Checklist de Primeira Configuração

1. [ ] Deploy backend no Render
2. [ ] Configurar variáveis do backend
3. [ ] Anotar URL do backend
4. [ ] Deploy frontend no Vercel
5. [ ] Configurar `VITE_API_URL` no Vercel
6. [ ] Anotar URL do frontend
7. [ ] Atualizar `CORS_ORIGIN` no Render com URL do frontend
8. [ ] Testar login em produção
9. [ ] Verificar que não há erros de CORS

---

Data de criação: 10/10/2025
