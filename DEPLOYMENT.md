# Guia de Deploy - Financeiro

## 🚀 Deploy em Produção

### Backend (Render.com)

O backend está configurado para deploy automático no Render.com via `render.yaml`.

**URL Backend:** `https://financeiro-isdw.onrender.com`

#### Variáveis de Ambiente (Render Dashboard)

Configure as seguintes variáveis no painel do Render:

```env
DATABASE_URL=postgresql://...
JWT_SECRET=seu-secret-super-seguro-min-32-chars
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://financeiro-i31u.vercel.app
JWT_EXPIRES_IN=7d
```

**⚠️ IMPORTANTE - Plano Free do Render:**
- O servidor entra em **sleep após 15 minutos** de inatividade
- Primeiro request após sleep leva **30-60 segundos** para acordar
- **Solução implementada:** Sistema de keepalive automático no frontend

### Frontend (Vercel)

O frontend está configurado para deploy automático no Vercel.

**URL Frontend:** `https://financeiro-i31u.vercel.app`

#### Variáveis de Ambiente (Vercel Dashboard)

Configure a seguinte variável no painel do Vercel:

```env
VITE_API_URL=https://financeiro-isdw.onrender.com
```

**Como configurar no Vercel:**
1. Acesse o dashboard do projeto no Vercel
2. Vá em Settings > Environment Variables
3. Adicione:
   - Name: `VITE_API_URL`
   - Value: `https://financeiro-isdw.onrender.com`
   - Environment: Production, Preview, Development

4. Faça redeploy para aplicar as mudanças

## 🔧 Correções CORS Implementadas

### Problema Original

```
Access to XMLHttpRequest from origin 'https://financeiro-i31u.vercel.app'
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header
is present on the requested resource.
```

### Soluções Aplicadas

#### 1. **CORS Configuração Completa** (src/backend/app.ts)

```typescript
app.use(cors({
  origin: [...],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400, // Cache preflight por 24h
}));
```

#### 2. **Helmet Ajustado**

```typescript
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false, // Não conflita com SPA
}));
```

#### 3. **Preflight Requests Explícitos**

```typescript
app.options('*', cors()); // Responde OPTIONS para todas as rotas
```

#### 4. **Sistema de Keepalive** (frontend/src/services/api.ts)

- Ping automático a cada 10 minutos
- Previne cold starts do Render Free Tier
- Iniciado automaticamente no App.tsx

```typescript
startKeepalive(); // Ping /keepalive a cada 10 min
```

#### 5. **Novos Endpoints**

- `GET /health` - Health check com uptime
- `GET /keepalive` - Endpoint para manter servidor acordado
- `GET /cors-test` - Teste de configuração CORS

## 🧪 Como Testar

### 1. Testar CORS

```bash
curl -X OPTIONS https://financeiro-isdw.onrender.com/api/auth/me \
  -H "Origin: https://financeiro-i31u.vercel.app" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: authorization" \
  -v
```

Deve retornar:
```
Access-Control-Allow-Origin: https://financeiro-i31u.vercel.app
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
Access-Control-Allow-Credentials: true
```

### 2. Testar Keepalive

```bash
curl https://financeiro-isdw.onrender.com/keepalive
```

Deve retornar:
```json
{
  "status": "alive",
  "timestamp": "2025-10-31T...",
  "message": "Server is warm"
}
```

### 3. Verificar Logs no Browser

Abra o console do frontend em produção e verifique:
```
🔥 Iniciando keepalive para prevenir cold starts...
💓 Server keepalive: Server is warm
```

## 📝 Checklist de Deploy

### Backend (Render)
- [ ] Variáveis de ambiente configuradas
- [ ] `CORS_ORIGIN` aponta para URL do Vercel
- [ ] Database migrado (`npx prisma migrate deploy`)
- [ ] Build passou sem erros
- [ ] Endpoint `/health` retorna 200
- [ ] Endpoint `/keepalive` retorna 200

### Frontend (Vercel)
- [ ] `VITE_API_URL` configurado
- [ ] Build passou sem erros
- [ ] Console não mostra erros CORS
- [ ] Keepalive funcionando (check console logs)
- [ ] Login funcionando
- [ ] Dados carregando corretamente

## 🐛 Troubleshooting

### Erro: CORS ainda bloqueado

1. Verificar se `VITE_API_URL` está configurado no Vercel
2. Verificar se `CORS_ORIGIN` no Render aponta para o Vercel
3. Fazer redeploy do backend após mudanças
4. Limpar cache do browser (Ctrl+Shift+Delete)

### Erro: ERR_FAILED no primeiro request

- **Causa:** Cold start do Render Free Tier
- **Solução:** Aguardar 30-60 segundos ou implementar retry logic
- **Prevenção:** Keepalive automático está ativado

### Erro: 401 Unauthorized

- Verificar se token está sendo salvo no localStorage
- Verificar se interceptor axios está adicionando Authorization header
- Verificar se JWT_SECRET é o mesmo em todos os deploys

## 🔄 Deploy Workflow

### Mudanças no Backend

1. Commit e push para `main`
2. Render detecta mudanças e faz deploy automático
3. Aguardar build completar (~5 min)
4. Testar endpoint `/health`

### Mudanças no Frontend

1. Commit e push para `main`
2. Vercel detecta mudanças e faz deploy automático
3. Aguardar build completar (~2 min)
4. Testar em produção
5. Verificar console para erros

## 📚 Links Úteis

- **Frontend Produção:** https://financeiro-i31u.vercel.app
- **Backend Produção:** https://financeiro-isdw.onrender.com
- **Backend Health:** https://financeiro-isdw.onrender.com/health
- **Backend Keepalive:** https://financeiro-isdw.onrender.com/keepalive
- **CORS Test:** https://financeiro-isdw.onrender.com/cors-test

- **Render Dashboard:** https://dashboard.render.com
- **Vercel Dashboard:** https://vercel.com/dashboard
- **GitHub Repo:** https://github.com/BuscadorPXT/financeiro
