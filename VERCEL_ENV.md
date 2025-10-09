# ⚙️ Configurar Variável de Ambiente no Vercel

## 🎯 Backend deployado com sucesso!

**URL do Backend**: https://financeiro-isdw.onrender.com

---

## 📝 Passos para Configurar no Vercel

### 1. Acessar Dashboard do Vercel
- Vá em: https://vercel.com/dashboard
- Selecione o projeto: **financeiro** (ou nome do seu projeto)

### 2. Configurar Environment Variable

1. Clique em **"Settings"** (no menu lateral)
2. Clique em **"Environment Variables"**
3. Adicione a seguinte variável:

```
Name: VITE_API_URL
Value: https://financeiro-isdw.onrender.com/api
```

**⚠️ IMPORTANTE**:
- A URL termina com `/api` (sem barra no final)
- Certifique-se de que não há espaços em branco

### 3. Aplicar a Todos os Environments

Marque as checkboxes:
- ✅ Production
- ✅ Preview
- ✅ Development

Clique em **"Save"**

### 4. Redeploy

1. Vá em **"Deployments"** (menu lateral)
2. Encontre o último deployment
3. Clique nos **três pontos (⋯)** ao lado
4. Clique em **"Redeploy"**
5. Confirme o redeploy

---

## ✅ Verificação

Após o redeploy:

1. **Teste o backend diretamente**:
   ```
   https://financeiro-isdw.onrender.com/api/health
   ```
   Deve retornar: `{"status": "ok"}`

2. **Acesse o frontend**:
   ```
   https://financeiro-i31u.vercel.app
   ```

3. **Tente fazer login**:
   - Email: `admin@example.com`
   - Senha: `admin123`

---

## 🐛 Troubleshooting

### Erro: "Network Error" ou "Failed to fetch"

**Solução**:
1. Verifique se `VITE_API_URL` está configurada corretamente
2. Teste o backend diretamente no navegador
3. Verifique se fez redeploy do frontend após configurar a variável

### Erro: CORS

**Solução**:
1. No Render, verifique se `CORS_ORIGIN` está configurada:
   - Valor: `https://financeiro-i31u.vercel.app`
   - Sem `/` no final

2. Redeploy do backend se precisar mudar CORS_ORIGIN

---

**Pronto para testar!** 🚀
