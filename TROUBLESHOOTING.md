# Troubleshooting

Este documento contém soluções para problemas comuns encontrados durante o desenvolvimento.

## Erro de Login: "Network Error: XMLHttpRequest"

### Sintomas
- Login falha mesmo com credenciais corretas
- Console do navegador mostra: `Network Error: XMLHttpRequest`
- Erro de CORS no console

### Causa
Configuração incorreta de CORS no arquivo `.env`. O backend estava configurado para aceitar requisições da própria porta (3001) em vez da porta do frontend (3000).

### Solução
1. Verifique o arquivo `.env` na raiz do projeto
2. Certifique-se que a variável `CORS_ORIGIN` está configurada corretamente:
   ```
   CORS_ORIGIN=http://localhost:3000
   ```
3. **NÃO** use `http://localhost:3001` (porta do backend)
4. Reinicie o servidor backend após a alteração:
   ```bash
   npm run dev:backend
   ```

### Configuração Correta

O arquivo `.env.example` contém a configuração correta. Se você encontrar este erro:

1. Compare seu `.env` com `.env.example`
2. Copie a configuração correta:
   ```bash
   cp .env.example .env
   ```
3. Ajuste as credenciais do banco de dados conforme necessário
4. Reinicie os servidores

### Arquitetura
- **Frontend (Vite)**: Porta 3000
- **Backend (Express)**: Porta 3001
- **CORS**: Deve aceitar requisições de `http://localhost:3000`

### Data de Resolução
10/10/2025

---

## Erro de Timeout no Login: "timeout of 10000ms exceeded"

### Sintomas
- Login demora muito tempo e falha com timeout
- Console mostra: `timeout of 10000ms exceeded`
- Erro: `Network Error: XMLHttpRequest`

### Causa
O problema geralmente é causado por **frontend não estar rodando** ou parado. Quando o frontend não está ativo, as requisições não são processadas e o timeout ocorre.

### Solução

1. **Verificar se o frontend está rodando**:
   ```bash
   lsof -i :3000
   ```
   Se não retornar nada, o frontend não está rodando.

2. **Iniciar o frontend**:
   ```bash
   cd frontend
   npm run dev
   ```
   Ou usar o comando completo que roda ambos:
   ```bash
   npm run dev
   ```

3. **Verificar se ambos servidores estão ativos**:
   - Backend: http://localhost:3001
   - Frontend: http://localhost:3000

### Melhorias Implementadas
- **Timeout aumentado**: De 10s para 30s em `frontend/src/services/api.ts`
- Isso ajuda em casos de latência do banco de dados externo (Neon PostgreSQL)

### Performance Esperada
- Backend responde login em ~0.3 segundos
- Se demorar mais de 10 segundos, verifique se o frontend está rodando

### Data de Resolução
10/10/2025
