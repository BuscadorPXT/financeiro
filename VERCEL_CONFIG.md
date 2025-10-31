# ⚙️ Configuração Vercel - Variáveis de Ambiente

## 🚨 IMPORTANTE: Configure ANTES do Deploy

O frontend precisa saber onde está o backend. **Sem esta configuração, os requests vão falhar com erro 404.**

---

## 📝 Passo a Passo

### 1. Acesse o Dashboard do Vercel

Vá para: https://vercel.com/dashboard

### 2. Selecione o Projeto

Clique no projeto **financeiro** (ou nome que você deu)

### 3. Vá em Settings

Clique em **Settings** no menu superior

### 4. Clique em Environment Variables

No menu lateral, clique em **Environment Variables**

### 5. Adicione a Variável

Clique em **Add New**

Preencha:

| Campo | Valor |
|-------|-------|
| **Name** | `VITE_API_URL` |
| **Value** | `https://financeiro-isdw.onrender.com` |
| **Environment** | ✅ Production<br>✅ Preview<br>✅ Development |

**⚠️ IMPORTANTE:**
- **NÃO** adicione `/api` no final
- **NÃO** adicione trailing slash `/`
- Apenas a URL base do backend

**✅ CORRETO:**
```
VITE_API_URL=https://financeiro-isdw.onrender.com
```

**❌ ERRADO:**
```
VITE_API_URL=https://financeiro-isdw.onrender.com/api
VITE_API_URL=https://financeiro-isdw.onrender.com/
```

### 6. Salvar

Clique em **Save**

### 7. Redeploy

Após salvar a variável, você precisa fazer **redeploy**:

1. Vá em **Deployments** no menu superior
2. Clique nos três pontos `...` do último deployment
3. Clique em **Redeploy**
4. Confirme

**Aguarde ~2-3 minutos** para o novo deploy completar.

---

## 🧪 Como Testar se Está Funcionando

### 1. Abra o Console do Browser

Pressione `F12` ou `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)

### 2. Verifique os Logs

Você deve ver no console:

```javascript
🔧 API Config: {
  VITE_API_URL: "https://financeiro-isdw.onrender.com",
  API_BASE_URL: "https://financeiro-isdw.onrender.com",
  baseURL: "https://financeiro-isdw.onrender.com/api"
}
```

### 3. Verifique os Requests na Aba Network

1. Vá na aba **Network**
2. Filtre por **XHR**
3. Tente fazer login ou registro
4. Verifique a URL do request:

**✅ CORRETO:**
```
POST https://financeiro-isdw.onrender.com/api/auth/login
POST https://financeiro-isdw.onrender.com/api/auth/register
```

**❌ ERRADO (se aparecer isso, a variável está mal configurada):**
```
POST https://financeiro-isdw.onrender.com/api/api/auth/login
                                        ^^^^^^^^ duplicado!
```

---

## 🐛 Troubleshooting

### Erro: `Cannot POST /api/api/auth/register`

**Causa:** `VITE_API_URL` está configurado com `/api` no final

**Solução:**
1. Remova `/api` da variável no Vercel
2. Deve ficar: `https://financeiro-isdw.onrender.com`
3. Faça redeploy

---

### Erro: `Access-Control-Allow-Origin header is not present`

**Causa:** CORS ainda não está configurado no backend ou backend não fez redeploy

**Solução:**

1. **Verifique se o backend fez redeploy:**
   - Acesse: https://dashboard.render.com
   - Verifique se o último deploy tem a configuração CORS
   - Se não, force um redeploy

2. **Teste o CORS manualmente:**
   ```bash
   curl -X OPTIONS https://financeiro-isdw.onrender.com/api/auth/login \
     -H "Origin: https://financeiro-i31u.vercel.app" \
     -H "Access-Control-Request-Method: POST" \
     -v
   ```

   Deve retornar:
   ```
   Access-Control-Allow-Origin: https://financeiro-i31u.vercel.app
   Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
   ```

3. **Verifique a variável CORS_ORIGIN no Render:**
   - Dashboard Render > Service > Environment
   - `CORS_ORIGIN` deve ser `https://financeiro-i31u.vercel.app`

---

### Erro: `Network Error` ou `ERR_FAILED`

**Causa:** Servidor Render em cold start (plano free)

**Solução:**
- Aguarde 30-60 segundos e tente novamente
- O keepalive automático vai prevenir isso no futuro
- Primeira vez após inatividade sempre demora

---

## ✅ Checklist de Configuração

Antes de considerar pronto:

- [ ] `VITE_API_URL` configurado no Vercel
- [ ] Variável **sem** `/api` no final
- [ ] Variável aplicada em **Production, Preview e Development**
- [ ] Redeploy feito após adicionar variável
- [ ] Console mostra config correta (veja seção "Como Testar")
- [ ] Requests vão para `/api/auth/...` (sem duplicação)
- [ ] Login/registro funcionando
- [ ] Nenhum erro CORS no console

---

## 📚 Links Úteis

- **Frontend Produção:** https://financeiro-i31u.vercel.app
- **Backend Produção:** https://financeiro-isdw.onrender.com
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Render Dashboard:** https://dashboard.render.com

---

## 🆘 Ainda com Problemas?

Se após seguir todos os passos ainda tiver erros:

1. **Limpe o cache do navegador:**
   - `Ctrl+Shift+Delete` (Windows)
   - `Cmd+Shift+Delete` (Mac)
   - Marque "Cached images and files"
   - Clique em "Clear data"

2. **Teste em uma aba anônima:**
   - `Ctrl+Shift+N` (Windows)
   - `Cmd+Shift+N` (Mac)

3. **Verifique os logs do Render:**
   - Dashboard Render > Service > Logs
   - Procure por erros relacionados a CORS ou 404

4. **Force rebuild no Vercel:**
   - Deployments > últim deployment > Redeploy
   - Marque "Use existing Build Cache" como **OFF**
