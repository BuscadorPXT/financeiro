# 🔧 Solução Temporária - Testar Frontend com Backend Local

Se você quiser testar rapidamente o frontend do Vercel com seu backend local:

## ⚠️ Esta é uma solução TEMPORÁRIA para testes!

### Opção A: Usar Ngrok (Expor localhost para internet)

1. **Instale o Ngrok**:
   ```bash
   # macOS
   brew install ngrok

   # Ou baixe em: https://ngrok.com/download
   ```

2. **Rode seu backend local**:
   ```bash
   npm run dev:backend
   ```

3. **Exponha o backend com ngrok**:
   ```bash
   ngrok http 3001
   ```

4. **Copie a URL gerada** (ex: `https://abc123.ngrok.io`)

5. **Configure no Vercel**:
   - Vá em Settings → Environment Variables
   - Adicione:
     ```
     VITE_API_URL=https://abc123.ngrok.io/api
     ```
   - Faça redeploy

### Opção B: Executar Frontend Localmente Apontando para Localhost

1. **Clone e rode localmente**:
   ```bash
   cd frontend
   npm run dev
   ```

2. **Acesse**: `http://localhost:3000`

3. **Faça login normalmente** (conecta em localhost:3001)

---

## ✅ Solução DEFINITIVA: Deploy Backend

Para produção real, você DEVE fazer deploy do backend:

- 🚂 **Railway**: Ver `RAILWAY_DEPLOY.md`
- 🎨 **Render**: https://render.com
- 🔷 **Heroku**: https://heroku.com
- ☁️ **AWS/Azure/Google Cloud**

---

**Recomendação**: Siga o guia `RAILWAY_DEPLOY.md` para deploy em 10 minutos! 🚀
