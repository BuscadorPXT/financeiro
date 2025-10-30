# Sistema de Autenticação e Gerenciamento de Usuários

## Resumo das Alterações

Foi implementado um sistema completo de autenticação com registro de usuários, aprovação por administradores e gerenciamento de permissões.

## Mudanças no Backend

### 1. Schema Prisma (prisma/schema.prisma)
- Adicionado enum `RoleAdmin` com valores `ADMIN` e `USER`
- Tabela `Admin` atualizada com novos campos:
  - `email`: Email do usuário (opcional, único)
  - `role`: Cargo do usuário (ADMIN ou USER)
  - `aprovado`: Indica se o usuário foi aprovado por um admin

### 2. Banco de Dados
- Migração manual executada com sucesso em `prisma/migrations/manual_add_role_aprovado.sql`
- Usuário existente (`buscadorpxt`) foi automaticamente aprovado e promovido a ADMIN

### 3. AuthService (src/backend/services/authService.ts)
**Novos métodos:**
- `register()`: Registra novo usuário (primeiro usuário é automaticamente admin)
- `listUsuarios()`: Lista usuários com filtros de aprovação/ativo
- `aprovarUsuario()`: Aprova usuário pendente
- `rejeitarUsuario()`: Remove usuário pendente
- `alterarRole()`: Altera cargo entre ADMIN e USER
- `toggleAtivo()`: Ativa/desativa usuário

**Alterações:**
- `login()`: Agora verifica se usuário está aprovado
- `verifyToken()`: Retorna role no payload do token

### 4. Novos Controllers

#### AdminController (src/backend/controllers/adminController.ts)
Endpoints para gerenciar usuários do sistema:
- `GET /api/admin-users/usuarios` - Lista usuários
- `POST /api/admin-users/usuarios/:id/aprovar` - Aprova usuário
- `DELETE /api/admin-users/usuarios/:id/rejeitar` - Rejeita usuário
- `PUT /api/admin-users/usuarios/:id/role` - Altera role
- `PUT /api/admin-users/usuarios/:id/toggle-ativo` - Ativa/desativa

#### AuthController atualizado
- `POST /api/auth/register` - Endpoint público de registro

### 5. Middleware (src/backend/middleware/authMiddleware.ts)
- Atualizado para incluir `role` no objeto `req.user`
- Novo middleware `requireAdmin`: Restringe acesso a rotas apenas para admins

### 6. Rotas (src/backend/routes/)
- **adminUsers.routes.ts**: Novas rotas de gerenciamento (protegidas por authenticate + requireAdmin)
- **auth.routes.ts**: Adicionada rota `/register`
- **index.ts**: Registradas novas rotas em `/api/admin-users`

## Mudanças no Frontend

### 1. Página de Login (frontend/src/pages/Login.tsx)
- **Removidas** credenciais hard-coded
- Adicionado link para página de registro

### 2. Nova Página de Registro (frontend/src/pages/Register.tsx)
- Formulário completo com validação
- Campos: nome, email (opcional), login, senha e confirmação
- Mensagem especial para primeiro usuário (admin automático)
- Mensagem de aguardo de aprovação para demais usuários

### 3. AuthContext (frontend/src/contexts/AuthContext.tsx)
- Adicionada propriedade `isAdmin: boolean`
- User agora inclui campos `email`, `role` e `aprovado`

### 4. AuthService Frontend (frontend/src/services/authService.ts)
- Interfaces `User` e `AuthResponse` atualizadas com novos campos

### 5. Nova Página AdminUsers (frontend/src/pages/AdminUsers.tsx)
**Recursos:**
- Lista todos os usuários do sistema
- Filtros: Todos / Pendentes / Aprovados
- Badge com contador de pendentes
- Ações disponíveis:
  - Aprovar/Rejeitar usuários pendentes
  - Alterar role (ADMIN ↔ USER)
  - Ativar/Desativar usuários
- Interface responsiva com Tailwind CSS

### 6. Sidebar (frontend/src/components/common/Sidebar.tsx)
- Adicionado item "Gerenciar Usuários" (ícone Shield)
- Item visível apenas para admins (`adminOnly: true`)

### 7. App.tsx (frontend/src/App.tsx)
- Adicionada rota `/register` (pública)
- Adicionada rota `/admin-users` (protegida)

## Fluxo de Registro e Aprovação

### 1. Primeiro Usuário
```
Usuário acessa /register
  ↓
Preenche formulário
  ↓
Sistema detecta que não há usuários
  ↓
Cria usuário com:
  - aprovado: true
  - role: ADMIN
  ↓
Usuário pode fazer login imediatamente
```

### 2. Demais Usuários
```
Usuário acessa /register
  ↓
Preenche formulário
  ↓
Sistema cria usuário com:
  - aprovado: false
  - role: USER
  ↓
Mensagem: "Aguarde aprovação do administrador"
  ↓
Admin acessa /admin-users
  ↓
Admin visualiza usuário pendente
  ↓
Admin pode:
  - Aprovar → usuário pode fazer login
  - Rejeitar → usuário é removido do sistema
```

### 3. Gerenciamento de Usuários Aprovados
```
Admin acessa /admin-users
  ↓
Visualiza lista de usuários aprovados
  ↓
Pode realizar ações:
  - Alterar role (USER → ADMIN ou ADMIN → USER)
  - Desativar usuário (sem remover do sistema)
  - Reativar usuário desativado
```

## Segurança

### Proteções Implementadas
1. **Endpoints de admin**: Protegidos por middleware `requireAdmin`
2. **Token JWT**: Inclui role do usuário
3. **Validação de aprovação**: Login bloqueado para usuários não aprovados
4. **Rate limiting**: Endpoints de login e registro protegidos
5. **Validações**:
   - Email único (se fornecido)
   - Login único
   - Senha mínima de 6 caracteres

### Prevenção de Abusos
- Usuários pendentes não podem fazer login
- Apenas usuários aprovados têm acesso ao sistema
- Apenas admins podem aprovar/rejeitar usuários
- Apenas admins podem alterar roles

## Endpoints da API

### Públicos
- `POST /api/auth/register` - Registro de novo usuário
- `POST /api/auth/login` - Login

### Protegidos (Auth)
- `GET /api/auth/me` - Dados do usuário autenticado
- `POST /api/auth/logout` - Logout
- `POST /api/auth/change-password` - Alterar senha

### Protegidos (Admin Only)
- `GET /api/admin-users/usuarios` - Listar usuários
- `POST /api/admin-users/usuarios/:id/aprovar` - Aprovar usuário
- `DELETE /api/admin-users/usuarios/:id/rejeitar` - Rejeitar usuário
- `PUT /api/admin-users/usuarios/:id/role` - Alterar role
- `PUT /api/admin-users/usuarios/:id/toggle-ativo` - Ativar/desativar

## Testes Recomendados

1. **Registro do primeiro usuário**
   - Verificar criação com role ADMIN e aprovado=true
   - Verificar login imediato

2. **Registro de segundo usuário**
   - Verificar criação com role USER e aprovado=false
   - Verificar que login é bloqueado até aprovação

3. **Aprovação de usuário**
   - Admin aprovar usuário pendente
   - Verificar que usuário pode fazer login após aprovação

4. **Gerenciamento de roles**
   - Alterar role de USER para ADMIN
   - Verificar que novo admin tem acesso a /admin-users

5. **Desativação de usuário**
   - Desativar usuário aprovado
   - Verificar que login é bloqueado

## Arquivos Criados/Modificados

### Backend
- ✅ `prisma/schema.prisma` - Schema atualizado
- ✅ `prisma/migrations/manual_add_role_aprovado.sql` - Migração manual
- ✅ `src/backend/services/authService.ts` - Métodos de gerenciamento
- ✅ `src/backend/controllers/adminController.ts` - Novo controller
- ✅ `src/backend/controllers/authController.ts` - Endpoint register
- ✅ `src/backend/middleware/authMiddleware.ts` - Middleware requireAdmin
- ✅ `src/backend/routes/adminUsers.routes.ts` - Novas rotas
- ✅ `src/backend/routes/auth.routes.ts` - Rota register
- ✅ `src/backend/routes/index.ts` - Registro de rotas

### Frontend
- ✅ `frontend/src/pages/Login.tsx` - Credenciais removidas
- ✅ `frontend/src/pages/Register.tsx` - Nova página
- ✅ `frontend/src/pages/AdminUsers.tsx` - Nova página
- ✅ `frontend/src/contexts/AuthContext.tsx` - isAdmin adicionado
- ✅ `frontend/src/services/authService.ts` - Interfaces atualizadas
- ✅ `frontend/src/components/common/Sidebar.tsx` - Item admin
- ✅ `frontend/src/App.tsx` - Rotas adicionadas

## Próximos Passos (Opcional)

1. **Email notifications**: Enviar email quando usuário for aprovado
2. **Password recovery**: Implementar recuperação de senha
3. **2FA**: Autenticação de dois fatores
4. **Auditoria**: Log de ações administrativas
5. **Permissões granulares**: Criar mais níveis de acesso além de ADMIN/USER
