# Corrigir Erro de CORS e Login em Produção

## Problemas Identificados

### 1. Erro de CORS
```
Access to XMLHttpRequest at 'https://financeiro-isdw.onrender.com/auth/login'
from origin 'https://financeiro-i31u.vercel.app' has been blocked by CORS policy
```

### 2. Erro 404 nas Rotas
```
Cannot GET /auth/me
```

## Causas

1. **CORS_ORIGIN não configurada** no backend (Render)
2. Backend pode estar desatualizado ou não rodando
3. Rotas podem não estar sendo servidas corretamente

---

## Solução: Configurar CORS no Render.com

### Passo 1: Acessar Dashboard do Render

1. Acesse: https://dashboard.render.com/
2. Clique no seu serviço backend: **financeiro-isdw**

### Passo 2: Configurar CORS_ORIGIN

1. No dashboard do serviço, clique em **"Environment"** no menu lateral
2. Procure pela variável `CORS_ORIGIN`
3. Se não existir, clique em **"Add Environment Variable"**
4. Configure:
   ```
   Key: CORS_ORIGIN
   Value: https://financeiro-i31u.vercel.app
   ```
5. **IMPORTANTE**: NÃO coloque `/` no final da URL!

### Passo 3: Verificar Outras Variáveis

Certifique-se de que estas variáveis também estão configuradas:

```bash
DATABASE_URL=postgresql://neondb_owner:npg_hsbyFa2OnN8B@ep-hidden-grass-acrx4hwf-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require
NODE_ENV=production
PORT=3001
JWT_SECRET=(seu secret - min 32 caracteres)
JWT_EXPIRES_IN=7d
```

### Passo 4: Fazer Redeploy do Backend

Após configurar as variáveis:

1. Clique em **"Manual Deploy"** → **"Deploy latest commit"**
2. Aguarde o deploy completar (~2-5 minutos)
3. Verifique os logs para confirmar que não há erros

### Passo 5: Testar o Backend

Após o deploy, teste o backend:

1. Acesse: https://financeiro-isdw.onrender.com/health
2. Deve retornar:
   ```json
   {
     "status": "ok",
     "timestamp": "2025-10-29T...",
     "environment": "production"
   }
   ```

3. Teste a rota da API: https://financeiro-isdw.onrender.com/api
4. Deve retornar a lista de endpoints

---

## Verificar se CORS está Funcionando

### Teste Manual (via Browser Console)

Abra o console do navegador em `https://financeiro-i31u.vercel.app` e execute:

```javascript
fetch('https://financeiro-isdw.onrender.com/api', {
  method: 'GET',
  headers: { 'Content-Type': 'application/json' }
})
.then(res => res.json())
.then(data => console.log('✅ CORS OK:', data))
.catch(err => console.error('❌ CORS Error:', err));
```

Se CORS estiver configurado corretamente, você verá `✅ CORS OK:` seguido dos dados da API.

---

## Solução Alternativa: CORS para Múltiplas Origens

Se você quiser permitir múltiplas origens (desenvolvimento + produção):

### Opção A: Usar Asterisco (NÃO RECOMENDADO EM PRODUÇÃO)
```bash
CORS_ORIGIN=*
```

### Opção B: Modificar app.ts (RECOMENDADO)

Editar `src/backend/app.ts` para aceitar array de origens:

```typescript
// CORS configuration
const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir requisições sem origin (ex: Postman, curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);
```

Então no Render, configure:
```bash
CORS_ORIGIN=https://financeiro-i31u.vercel.app,http://localhost:3000
```

---

## Troubleshooting

### Problema: CORS ainda não funciona após redeploy

**Solução:**
1. Limpe o cache do browser (Ctrl+Shift+Delete)
2. Tente em uma aba anônima
3. Verifique se o Render fez deploy com sucesso nos logs

### Problema: Backend retorna 404 em /auth/me

**Causa:** As rotas estão em `/api/auth/*`, não `/auth/*`

**Verificação:**
- Frontend deve chamar: `https://financeiro-isdw.onrender.com/api/auth/me`
- O `api.ts` já tem `baseURL` com `/api`, então o authService chama apenas `/auth/me`
- Verifique se `VITE_API_URL` no Vercel está configurada com `/api` no final

### Problema: "Network Error" ou "ERR_FAILED"

**Causas possíveis:**
1. Backend está offline/sleeping (Render free tier)
2. URL do backend incorreta no Vercel
3. Certificado SSL expirado

**Soluções:**
1. Acesse o backend diretamente para "acordá-lo"
2. Verifique `VITE_API_URL` no Vercel
3. Aguarde 1-2 minutos e tente novamente

---

## Checklist Final

Após seguir todos os passos:

- [ ] `CORS_ORIGIN` configurada no Render: `https://financeiro-i31u.vercel.app`
- [ ] Backend fez redeploy com sucesso
- [ ] `/health` retorna status OK
- [ ] `/api` retorna lista de endpoints
- [ ] Teste manual de CORS passou
- [ ] Login funciona em `https://financeiro-i31u.vercel.app`

---

## Configuração Atual

**Frontend (Vercel):**
- URL: https://financeiro-i31u.vercel.app
- Variável: `VITE_API_URL=https://financeiro-isdw.onrender.com/api`

**Backend (Render):**
- URL: https://financeiro-isdw.onrender.com
- Porta: 3001
- Rotas API: `/api/*`
- Rotas Auth: `/api/auth/*`

**Credenciais:**
- Login: `buscadorpxt`
- Senha: `buscador2025`

---

**Documento criado em:** 2025-10-29
**Última atualização:** 2025-10-29
