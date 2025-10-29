# 🛠️ Tech Stack - Tecnologias Utilizadas

> Stack completa de tecnologias, bibliotecas e ferramentas do projeto

---

## 📚 Índice por Categoria

- [Backend](#backend)
- [Frontend](#frontend)
- [Database](#database)
- [Development Tools](#development-tools)
- [Testing](#testing)
- [Deployment](#deployment)
- [Monitoring](#monitoring-futuro)

---

## 🔧 Backend

### Core

| Tecnologia | Versão | Descrição | Por quê? |
|-----------|--------|-----------|----------|
| **Node.js** | 18+ | Runtime JavaScript | Ecossistema maduro, performance |
| **TypeScript** | 5.9.3 | JavaScript tipado | Type-safety, autocomplete, refactoring |
| **Express.js** | 5.1.0 | Framework web | Minimalista, flexível, amplamente usado |

### Database & ORM

| Tecnologia | Versão | Descrição | Por quê? |
|-----------|--------|-----------|----------|
| **Prisma** | 6.16.3 | ORM moderno | Type-safe, migrations, Prisma Studio |
| **@prisma/client** | 6.16.3 | Cliente gerado | Queries type-safe |
| **PostgreSQL** | 14+ | Database relacional | ACID, robusto, escalável |

### Authentication & Security

| Tecnologia | Versão | Descrição | Por quê? |
|-----------|--------|-----------|----------|
| **jsonwebtoken** | 9.0.2 | JWT tokens | Stateless auth |
| **bcryptjs** | 2.4.3 | Hash de senhas | Segurança de senhas |
| **helmet** | 8.0.0 | Headers de segurança | Proteção contra vulnerabilidades comuns |
| **cors** | 2.8.5 | CORS middleware | Cross-origin resource sharing |

### Validation

| Tecnologia | Versão | Descrição | Por quê? |
|-----------|--------|-----------|----------|
| **express-validator** | 7.2.0 | Validação de inputs | Validação robusta e integrada |

### Utilities

| Tecnologia | Versão | Descrição | Por quê? |
|-----------|--------|-----------|----------|
| **dotenv** | 16.4.7 | Variáveis de ambiente | Configuração segura |
| **date-fns** | 4.1.0 | Manipulação de datas | Leve, funcional, tree-shakeable |

### Development

| Tecnologia | Versão | Descrição | Por quê? |
|-----------|--------|-----------|----------|
| **ts-node-dev** | 2.0.0 | Hot reload TypeScript | Dev experience rápido |
| **concurrently** | 9.1.2 | Rodar múltiplos comandos | Dev backend + frontend juntos |

**Total Backend Dependencies:** ~20 packages

---

## 🎨 Frontend

### Core

| Tecnologia | Versão | Descrição | Por quê? |
|-----------|--------|-----------|----------|
| **React** | 19.1.1 | UI Library | Ecossistema maduro, component-based |
| **TypeScript** | 5.9.3 | JavaScript tipado | Type-safety end-to-end |
| **Vite** | 7.1.7 | Build tool | Extremamente rápido, HMR instantâneo |

### Routing & State

| Tecnologia | Versão | Descrição | Por quê? |
|-----------|--------|-----------|----------|
| **react-router-dom** | 7.9.3 | Roteamento | Padrão de mercado |
| **React Context API** | - | State management | Nativo, suficiente para o projeto |

### HTTP & API

| Tecnologia | Versão | Descrição | Por quê? |
|-----------|--------|-----------|----------|
| **axios** | 1.12.2 | HTTP client | Interceptors, timeout, cancelamento |

### UI & Styling

| Tecnologia | Versão | Descrição | Por quê? |
|-----------|--------|-----------|----------|
| **Tailwind CSS** | 3.4.18 | Utility-first CSS | Rápido, consistente, responsive |
| **lucide-react** | 0.544.0 | Ícones | 1000+ ícones, tree-shakeable |
| **framer-motion** | 12.23.22 | Animações | Animações fluidas e declarativas |

### Charts & Visualization

| Tecnologia | Versão | Descrição | Por quê? |
|-----------|--------|-----------|----------|
| **recharts** | 3.2.1 | Gráficos React | Componentes, responsivo, composable |

### Forms & Validation

| Tecnologia | Versão | Descrição | Por quê? |
|-----------|--------|-----------|----------|
| **react-hook-form** | 7.54.2 | Formulários | Performance, validação, DX |

### Notifications & Feedback

| Tecnologia | Versão | Descrição | Por quê? |
|-----------|--------|-----------|----------|
| **react-hot-toast** | 2.6.0 | Notificações | Leve, customizável, acessível |

### Date Handling

| Tecnologia | Versão | Descrição | Por quê? |
|-----------|--------|-----------|----------|
| **date-fns** | 4.1.0 | Datas | Funcional, tree-shakeable |

### Data Export

| Tecnologia | Versão | Descrição | Por quê? |
|-----------|--------|-----------|----------|
| **xlsx** | 0.18.5 | Excel files | Import/export .xlsx |
| **papaparse** | 5.5.3 | CSV parser | Parse e stringify CSV |

### Development

| Tecnologia | Versão | Descrição | Por quê? |
|-----------|--------|-----------|----------|
| **@vitejs/plugin-react** | 5.0.0 | React plugin Vite | Fast refresh |
| **autoprefixer** | 10.4.21 | CSS prefixing | Compatibilidade browsers |
| **postcss** | 8.4.50 | CSS processing | Pipeline CSS |

**Total Frontend Dependencies:** ~30 packages

---

## 🗄️ Database

### PostgreSQL

| Feature | Descrição |
|---------|-----------|
| **Versão** | 14+ |
| **ACID** | Transações completas |
| **JSON Support** | Campos JSON nativos (usado em Auditoria) |
| **Índices** | B-tree, Hash, GiST |
| **Full-text Search** | Busca textual nativa |
| **Triggers** | Automações (futuro) |

### Prisma ORM Features

```typescript
// ✅ Type-safe queries
const usuarios = await prisma.usuario.findMany({
  where: { statusFinal: 'ATIVO' },
  include: { pagamentos: true },
});

// ✅ Transactions
await prisma.$transaction(async (tx) => {
  await tx.pagamento.create({ ... });
  await tx.usuario.update({ ... });
  await tx.comissao.create({ ... });
});

// ✅ Raw queries (quando necessário)
await prisma.$queryRaw`
  SELECT * FROM "Usuario"
  WHERE "diasParaVencer" < 0
`;

// ✅ Aggregations
const stats = await prisma.pagamento.aggregate({
  _sum: { valor: true },
  _count: true,
});
```

---

## 🧪 Testing

### Backend Testing

| Tecnologia | Versão | Descrição | Por quê? |
|-----------|--------|-----------|----------|
| **Jest** | 30.2.0 | Test runner | Padrão de mercado |
| **ts-jest** | 30.2.6 | Jest + TypeScript | Suporte TypeScript |
| **supertest** | 7.1.4 | HTTP testing | Testa rotas Express |
| **@faker-js/faker** | 9.5.3 | Dados fake | Seeds e testes |

**Exemplo:**

```typescript
// pagamentoService.test.ts
import { pagamentoService } from '../pagamentoService';

describe('PagamentoService', () => {
  it('deve criar pagamento PRIMEIRO', async () => {
    const pagamento = await pagamentoService.create({
      usuarioId: 1,
      valor: 100,
      dataPagto: new Date(),
    });

    expect(pagamento.regraTipo).toBe('PRIMEIRO');
    expect(pagamento.elegivelComissao).toBe(true);
  });
});
```

### Frontend Testing

| Tecnologia | Versão | Descrição | Por quê? |
|-----------|--------|-----------|----------|
| **Vitest** | 3.2.4 | Test runner Vite | Extremamente rápido |
| **@testing-library/react** | 16.2.0 | React testing | Testa como usuário usa |
| **@testing-library/jest-dom** | 6.6.3 | Matchers custom | Assertions UI |
| **jsdom** | 25.0.1 | DOM simulation | Simula browser |

**Exemplo:**

```typescript
// Button.test.tsx
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('deve renderizar corretamente', () => {
    render(<Button>Clique</Button>);
    expect(screen.getByText('Clique')).toBeInTheDocument();
  });
});
```

---

## 🚀 Deployment

### Backend

| Plataforma | Uso | Por quê? |
|------------|-----|----------|
| **Railway.app** | Backend + Database | Free tier, PostgreSQL incluído |
| **Vercel** | Backend alternativo | Serverless, fácil deploy |
| **Heroku** | Alternativa | Histórico, confiável |

### Frontend

| Plataforma | Uso | Por quê? |
|------------|-----|----------|
| **Vercel** | Frontend | Otimizado para React/Vite |
| **Netlify** | Alternativa | CI/CD automático |

### Database

| Plataforma | Uso | Por quê? |
|------------|-----|----------|
| **Railway.app** | PostgreSQL | Incluído no plano Railway |
| **Supabase** | PostgreSQL | Free tier generoso |
| **Neon** | PostgreSQL | Serverless PostgreSQL |

---

## 🛠️ Development Tools

### Linting & Formatting

| Ferramenta | Config | Descrição |
|-----------|--------|-----------|
| **ESLint** | `.eslintrc.json` | Linting JavaScript/TypeScript |
| **Prettier** | `.prettierrc` | Formatação de código |
| **TypeScript** | `tsconfig.json` | Type checking |

**ESLint Rules Principais:**

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "no-unused-vars": "error"
  }
}
```

### Git Hooks

| Ferramenta | Uso | Descrição |
|-----------|-----|-----------|
| **husky** | Pre-commit | Roda testes antes do commit |
| **lint-staged** | Pre-commit | Lint apenas arquivos staged |

### IDE

| IDE | Extensions Recomendadas |
|-----|------------------------|
| **VSCode** | - ESLint<br>- Prettier<br>- Prisma<br>- Tailwind CSS IntelliSense<br>- Error Lens |

**VSCode Settings:**

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

---

## 📊 Monitoring (Futuro)

### Error Tracking

| Ferramenta | Uso | Status |
|-----------|-----|--------|
| **Sentry** | Error tracking | 🔜 Futuro |
| **LogRocket** | Session replay | 🔜 Futuro |

### Performance

| Ferramenta | Uso | Status |
|-----------|-----|--------|
| **Lighthouse** | Performance audit | ✅ Manual |
| **Web Vitals** | Core metrics | 🔜 Futuro |

### Analytics

| Ferramenta | Uso | Status |
|-----------|-----|--------|
| **Google Analytics** | Usage tracking | 🔜 Futuro |
| **Mixpanel** | Event tracking | 🔜 Futuro |

---

## 📦 Package Managers

**NPM** (padrão)
- Usado em todo o projeto
- `package-lock.json` versionado
- Scripts npm bem definidos

**Alternativas:**
- **PNPM** - Mais rápido, economiza espaço
- **Yarn** - Cache global, workspaces

---

## 🔒 Security Tools

### Dependency Scanning

```bash
# Audit de dependências
npm audit

# Fix automático
npm audit fix

# Análise detalhada
npx snyk test
```

### Environment Variables

```bash
# Backend
DATABASE_URL=postgresql://...
JWT_SECRET=...
CORS_ORIGIN=...

# Frontend
VITE_API_URL=...
```

---

## 📈 Performance

### Backend Performance

| Técnica | Implementação | Status |
|---------|---------------|--------|
| **Connection Pooling** | Prisma | ✅ Ativo |
| **Pagination** | Limit/Offset | ✅ Ativo |
| **Query Optimization** | Prisma | ✅ Ativo |
| **Caching** | Redis | 🔜 Futuro |
| **Compression** | gzip | ✅ Ativo |

### Frontend Performance

| Técnica | Implementação | Status |
|---------|---------------|--------|
| **Code Splitting** | Vite | ✅ Ativo |
| **Lazy Loading** | React.lazy | 🔜 Futuro |
| **Tree Shaking** | Vite | ✅ Ativo |
| **Bundle Optimization** | Vite | ✅ Ativo |
| **Image Optimization** | - | 🔜 Futuro |

---

## 🎯 Por Que Esta Stack?

### Decisões Principais

#### 1. **TypeScript em Toda a Stack**
- ✅ Type-safety end-to-end
- ✅ Autocomplete e refactoring
- ✅ Menos bugs em produção
- ✅ Documentação via tipos

#### 2. **Prisma ORM**
- ✅ Migrations automáticas
- ✅ Type-safe queries
- ✅ Prisma Studio (visualização)
- ✅ Excelente DX

#### 3. **React + Vite**
- ✅ HMR instantâneo
- ✅ Build rápido
- ✅ Ecossistema maduro
- ✅ Performance excelente

#### 4. **Tailwind CSS**
- ✅ Desenvolvimento rápido
- ✅ Consistência visual
- ✅ Responsive by default
- ✅ Bundle pequeno (purge)

#### 5. **PostgreSQL**
- ✅ ACID completo
- ✅ Robusto e confiável
- ✅ JSON support
- ✅ Free tier em várias plataformas

---

## 🔄 Migrações Futuras

### Possíveis Upgrades

| Tecnologia | Motivo | Prioridade |
|-----------|--------|-----------|
| **Redis** | Cache de queries | 🟡 Média |
| **GraphQL** | Queries flexíveis | 🟢 Baixa |
| **WebSockets** | Real-time updates | 🟡 Média |
| **Docker** | Containerização | 🔴 Alta |
| **Kubernetes** | Orquestração | 🟢 Baixa |
| **Microservices** | Escalabilidade | 🟢 Baixa |

---

## 📚 Recursos de Aprendizado

### Documentação Oficial

- **Node.js:** https://nodejs.org/docs
- **TypeScript:** https://www.typescriptlang.org/docs
- **Express:** https://expressjs.com/
- **Prisma:** https://www.prisma.io/docs
- **React:** https://react.dev/
- **Vite:** https://vitejs.dev/
- **Tailwind:** https://tailwindcss.com/docs

### Tutoriais Recomendados

- **TypeScript Handbook:** https://www.typescriptlang.org/docs/handbook/intro.html
- **Prisma Quickstart:** https://www.prisma.io/docs/getting-started
- **React Tutorial:** https://react.dev/learn
- **Tailwind Tutorial:** https://tailwindcss.com/docs/installation

---

## 🎯 Próximos Passos

1. **Explorar Backend** → [../01-BACKEND/overview.md](../01-BACKEND/overview.md)
2. **Explorar Frontend** → [../02-FRONTEND/overview.md](../02-FRONTEND/overview.md)
3. **Explorar Database** → [../03-DATABASE/overview.md](../03-DATABASE/overview.md)

---

**Última atualização:** 2025-10-29
