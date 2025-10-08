# Análise Completa do Fluxo de Despesas

**Data da Análise:** 06/10/2025
**Problema Reportado:** Impossibilidade de editar despesas no frontend
**Status:** ✅ CORRIGIDO

---

## 🔍 Problema Identificado

### Descrição do Bug
Ao tentar editar uma despesa existente no frontend, a operação falhava silenciosamente ou retornava erro.

### Causa Raiz
**Incompatibilidade de Tipos de ID:**
- **Backend/Banco de Dados:** Usa UUID (String) como ID primário
- **Frontend:** Estava tipado como `number` em todas as interfaces e funções

```prisma
// Schema Prisma (CORRETO)
model Despesa {
  id String @id @default(uuid())
  // ...
}
```

```typescript
// Frontend (INCORRETO - antes da correção)
export interface Despesa {
  id: number;  // ❌ ERRO: Deveria ser string
  // ...
}
```

### Impacto
- ✅ **Criação de despesas:** Funcionava (não usa ID)
- ✅ **Listagem:** Funcionava (apenas exibe)
- ❌ **Edição:** FALHAVA (precisa passar ID correto)
- ❌ **Exclusão:** FALHAVA (precisa passar ID correto)
- ❌ **Quitar:** FALHAVA (precisa passar ID correto)

---

## 🔧 Correções Aplicadas

### 1. Interface Despesa (`despesaService.ts`)

**Antes:**
```typescript
export interface Despesa {
  id: number;
  // ...
}
```

**Depois:**
```typescript
export interface Despesa {
  id: string;  // ✅ Corrigido para UUID
  // ...
}
```

### 2. Métodos do Service (`despesaService.ts`)

**Antes:**
```typescript
getById: async (id: number): Promise<Despesa>
update: async (id: number, data: UpdateDespesaDTO): Promise<Despesa>
delete: async (id: number): Promise<void>
quitar: async (id: number): Promise<Despesa>
```

**Depois:**
```typescript
getById: async (id: string): Promise<Despesa>
update: async (id: string, data: UpdateDespesaDTO): Promise<Despesa>
delete: async (id: string): Promise<void>
quitar: async (id: string): Promise<Despesa>
```

### 3. Hook useDespesas (`useDespesas.ts`)

**Antes:**
```typescript
const update = useCallback(async (id: number, data: UpdateDespesaDTO) => {
  // ...
}, []);
```

**Depois:**
```typescript
const update = useCallback(async (id: string, data: UpdateDespesaDTO) => {
  // ...
}, []);
```

### 4. Rota de Quitar (Bonus Fix)

**Antes:**
```typescript
quitar: async (id: string): Promise<Despesa> => {
  const response = await api.patch(`/despesas/${id}/quitar`);
  // ...
}
```

**Depois:**
```typescript
quitar: async (id: string): Promise<Despesa> => {
  const response = await api.patch(`/despesas/${id}/pagar`);  // ✅ Rota correta
  // ...
}
```

---

## 📋 Arquivos Modificados

1. ✅ `frontend/src/services/despesaService.ts`
   - Interface Despesa: `id: number` → `id: string`
   - Métodos: Todos os parâmetros `id` alterados para `string`
   - Rota quitar corrigida: `/quitar` → `/pagar`

2. ✅ `frontend/src/hooks/useDespesas.ts`
   - Funções `update`, `remove`, `quitar`: Parâmetro `id` alterado para `string`

3. ✅ `frontend/src/components/despesas/DashboardDespesas.tsx`
   - Conversões de valor para `Number()` (correção anterior)

---

## 🏗️ Arquitetura do Fluxo de Despesas

### Fluxo Completo: Edição de Despesa

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. FRONTEND - Usuário clica em "Editar" na tabela              │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. DespesasTable.tsx                                            │
│    - Recebe despesa completa (com UUID)                         │
│    - Chama: onEdit(despesa)                                     │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. Despesas.tsx (Página)                                        │
│    - handleEditDespesa(despesa)                                 │
│    - Seta: setSelectedDespesa(despesa)                          │
│    - Abre modal: setShowForm(true)                              │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. DespesaForm.tsx (Modal)                                      │
│    - useEffect carrega dados da despesa no form                 │
│    - Usuário edita campos                                       │
│    - Submit: onSave(dataToSave)                                 │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. Despesas.tsx - onSave callback                               │
│    - if (selectedDespesa):                                      │
│      await update(selectedDespesa.id, data)  ← UUID aqui!       │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. useDespesas Hook                                             │
│    - update(id: string, data)                                   │
│    - Chama: despesaService.update(id, data)                     │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 7. despesaService.ts                                            │
│    - update(id: string, data)                                   │
│    - PUT /api/despesas/${id}                                    │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 8. BACKEND - Express Router                                     │
│    - PUT /api/despesas/:id                                      │
│    - Rota em: src/backend/routes/despesa.routes.ts              │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 9. DespesaController.update()                                   │
│    - Valida dados recebidos                                     │
│    - Chama: despesaService.update(id, updateData)               │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 10. DespesaService.update()                                     │
│     - Valida mês (1-12) e valor (> 0)                           │
│     - Chama Prisma: prisma.despesa.update()                     │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 11. PRISMA ORM                                                  │
│     - Executa UPDATE no PostgreSQL                              │
│     - WHERE id = :uuid                                          │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 12. PostgreSQL (Neon)                                           │
│     - Atualiza registro na tabela despesas                      │
│     - Retorna despesa atualizada                                │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 13. RESPOSTA - Volta pela cadeia                                │
│     - Backend → API Response                                    │
│     - Frontend recebe despesa atualizada                        │
│     - Hook atualiza estado local                                │
│     - UI re-renderiza com novos dados                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Rotas da API Backend

### Endpoints Disponíveis

| Método | Rota | Função | Observações |
|--------|------|--------|-------------|
| GET | `/api/despesas` | Listar todas | Com paginação e filtros |
| GET | `/api/despesas/:id` | Buscar por ID | ID = UUID string |
| POST | `/api/despesas` | Criar nova | Não precisa de ID |
| PUT | `/api/despesas/:id` | Atualizar | ID = UUID string |
| DELETE | `/api/despesas/:id` | Deletar | ID = UUID string |
| PUT | `/api/despesas/:id/pagar` | Marcar como paga | ID = UUID string |
| PUT | `/api/despesas/:id/pendente` | Marcar como pendente | ID = UUID string |
| GET | `/api/despesas/stats` | Estatísticas | Aceita filtros mes/ano |
| GET | `/api/despesas/relatorio/categoria` | Relatório por categoria | - |
| GET | `/api/despesas/relatorio/mensal` | Relatório mensal | - |

### Exemplo de Requisição de Edição

```bash
# Exemplo de UUID real do banco
UUID_EXEMPLO="7269a727-ca50-4f6c-9239-c109321ad345"

# Requisição PUT para editar
curl -X PUT http://localhost:3001/api/despesas/${UUID_EXEMPLO} \
  -H "Content-Type: application/json" \
  -d '{
    "categoria": "DEV v1",
    "descricao": "Desenvolvimento atualizado",
    "valor": 300.00,
    "status": "Pago"
  }'
```

---

## ✅ Validações no Backend

### DespesaController (`despesaController.ts`)

```typescript
// Campos obrigatórios na criação
if (!categoria || !descricao || !valor || !competenciaMes || !competenciaAno) {
  return 400 Bad Request
}
```

### DespesaService (`despesaService.ts`)

```typescript
// Validação de mês
if (competenciaMes < 1 || competenciaMes > 12) {
  throw new AppError('Mês de competência inválido', 400)
}

// Validação de valor
if (valor <= 0) {
  throw new AppError('Valor deve ser maior que zero', 400)
}
```

---

## 🎯 Componentes Frontend

### 1. DespesasTable.tsx
**Responsabilidade:** Exibir lista de despesas com ações

**Funcionalidades:**
- Ordenação por colunas
- Paginação (20, 50, 100 itens)
- Botão "Quitar" para despesas pendentes
- Botão "Editar" (✏️)
- Botão "Deletar" (🗑️)

**Props:**
```typescript
interface DespesasTableProps {
  despesas: Despesa[];
  onEdit: (despesa: Despesa) => void;
  onDelete: (despesa: Despesa) => void;
  onQuitar: (despesa: Despesa) => void;
}
```

### 2. DespesaForm.tsx
**Responsabilidade:** Formulário de criação/edição

**Campos:**
- Categoria (Select - da lista auxiliar)
- Descrição (Text)
- Conta (Select - da lista auxiliar)
- Indicador (Select - da lista auxiliar)
- Valor (Number)
- Status (Select: Pago/Pendente)
- Mês de Competência (Select: 1-12)
- Ano de Competência (Number)

**Validações:**
- Categoria: obrigatória
- Descrição: obrigatória
- Valor: obrigatório e > 0
- Mês: obrigatório (1-12)
- Ano: obrigatório

### 3. DashboardDespesas.tsx
**Responsabilidade:** Cards de resumo

**Métricas:**
- Total Geral
- Mês Atual
- Pagas
- Pendentes
- Top 5 Categorias
- Média Mensal
- Percentual Pago

### 4. Despesas.tsx (Página Principal)
**Responsabilidade:** Orquestrar todos os componentes

**Funcionalidades:**
- Gerenciar estado global de despesas
- Filtros (busca, categoria, status, mês, ano)
- Export CSV/XLSX
- Modal de formulário
- Confirmações de exclusão

---

## 🐛 Outros Problemas Encontrados e Corrigidos

### Problema 1: Total Geral Incorreto
**Descrição:** Dashboard mostrava R$ 565,98 ao invés de R$ 68.427,74

**Causa:** Prisma retorna `Decimal` como string, código concatenava ao invés de somar

**Solução:**
```typescript
// Antes
const totalGeral = despesas.reduce((sum, d) => sum + d.valor, 0);

// Depois
const totalGeral = despesas.reduce((sum, d) => sum + Number(d.valor), 0);
```

### Problema 2: Rota de Quitar Incorreta
**Descrição:** Frontend chamava `/quitar`, backend esperava `/pagar`

**Solução:**
```typescript
// Antes
const response = await api.patch(`/despesas/${id}/quitar`);

// Depois
const response = await api.patch(`/despesas/${id}/pagar`);
```

---

## 🧪 Como Testar

### Teste 1: Criar Despesa
```
1. Acessar /despesas
2. Clicar em "+ Nova Despesa"
3. Preencher todos os campos
4. Clicar em "Criar"
5. Verificar se aparece na lista
```

### Teste 2: Editar Despesa
```
1. Acessar /despesas
2. Clicar no ícone ✏️ de uma despesa
3. Modificar campos (ex: valor, descrição)
4. Clicar em "Atualizar"
5. Verificar se mudanças foram salvas
```

### Teste 3: Quitar Despesa
```
1. Filtrar por Status = "Pendente"
2. Clicar em "✓ Quitar" em uma despesa
3. Verificar se status mudou para "Pago"
4. Verificar se soma de pagas aumentou no dashboard
```

### Teste 4: Deletar Despesa
```
1. Clicar no ícone 🗑️ de uma despesa
2. Confirmar exclusão no popup
3. Verificar se despesa foi removida da lista
4. Verificar se totais foram atualizados
```

---

## 📊 Estrutura de Dados

### Exemplo de Despesa no Banco

```sql
SELECT * FROM despesas LIMIT 1;
```

```
id:              "7269a727-ca50-4f6c-9239-c109321ad345"
categoria:       "DEV v1"
descricao:       "DEV v1"
conta:           null
indicador:       null
valor:           251.000000000000000000000000000000
status:          "PAGO"
competencia_mes: 5
competencia_ano: 2025
created_at:      "2025-10-06T12:57:28.255Z"
updated_at:      "2025-10-06T12:57:28.255Z"
```

### Exemplo de Resposta da API

```json
{
  "status": "success",
  "data": {
    "id": "7269a727-ca50-4f6c-9239-c109321ad345",
    "categoria": "DEV v1",
    "descricao": "DEV v1",
    "conta": null,
    "indicador": null,
    "valor": "251.00",
    "status": "Pago",
    "competencia_mes": 5,
    "competencia_ano": 2025,
    "created_at": "2025-10-06T12:57:28.255Z",
    "updated_at": "2025-10-06T12:57:28.255Z"
  }
}
```

**Nota:** Observe que `valor` vem como string na resposta JSON, por isso a normalização é necessária.

---

## ⚠️ Pontos de Atenção

### 1. Tipo de ID
- **SEMPRE** usar `string` para IDs no frontend
- Backend usa UUID gerado automaticamente
- Nunca tentar passar `number` como ID

### 2. Normalização de Valores
- Prisma retorna `Decimal` como `string` no JSON
- Frontend deve converter para `number` antes de calcular
- Use `Number(valor)` ou `parseFloat(valor)`

### 3. Status da Despesa
- Backend usa ENUM: `PAGO`, `PENDENTE`
- Frontend usa: `'Pago'`, `'Pendente'` (capitalizado)
- Conversão automática pelo backend

### 4. Validações
- Mês: deve estar entre 1 e 12
- Ano: deve ser um ano válido (ex: 2025)
- Valor: deve ser maior que 0
- Categoria e descrição: obrigatórias

---

## 🚀 Melhorias Futuras Sugeridas

### 1. Validação de Duplicatas
- Verificar se já existe despesa igual no mesmo mês
- Alertar usuário antes de criar

### 2. Anexos
- Permitir upload de comprovantes
- Armazenar em S3 ou similar

### 3. Aprovação de Despesas
- Workflow de aprovação para valores altos
- Sistema de níveis de aprovação

### 4. Recorrência
- Marcar despesas como recorrentes
- Auto-criar despesas recorrentes todo mês

### 5. Orçamento
- Definir orçamento por categoria
- Alertar quando ultrapassar

### 6. Relatórios Avançados
- Gráficos de tendências
- Comparação mês a mês
- Projeções futuras

---

## 📝 Checklist de Funcionalidades

- [x] Criar despesa
- [x] Listar despesas
- [x] Editar despesa
- [x] Deletar despesa
- [x] Quitar despesa (marcar como paga)
- [x] Filtrar por categoria
- [x] Filtrar por status
- [x] Filtrar por mês/ano
- [x] Busca por texto
- [x] Ordenação por coluna
- [x] Paginação
- [x] Export CSV
- [x] Export XLSX
- [x] Dashboard com resumos
- [x] Top 5 categorias
- [x] Média mensal
- [ ] Import de despesas (pendente)
- [ ] Anexar comprovantes (pendente)
- [ ] Despesas recorrentes (pendente)
- [ ] Aprovação de despesas (pendente)

---

## 🔗 Arquivos Relacionados

### Frontend
- `frontend/src/pages/Despesas.tsx` - Página principal
- `frontend/src/components/despesas/DespesasTable.tsx` - Tabela
- `frontend/src/components/despesas/DespesaForm.tsx` - Formulário
- `frontend/src/components/despesas/DashboardDespesas.tsx` - Dashboard
- `frontend/src/services/despesaService.ts` - Service/API
- `frontend/src/hooks/useDespesas.ts` - Hook React

### Backend
- `src/backend/routes/despesa.routes.ts` - Rotas
- `src/backend/controllers/despesaController.ts` - Controller
- `src/backend/services/despesaService.ts` - Service/Lógica
- `prisma/schema.prisma` - Schema do banco

### Importação
- `src/scripts/importDespesas.ts` - Script de importação CSV

---

**Documento gerado em:** 06/10/2025
**Última atualização:** 06/10/2025 - 15:15
**Status:** ✅ Problemas corrigidos e documentados

---

## 🆕 Problema 3: Coluna Competência Vazia

**Data:** 06/10/2025 - 15:00

### Descrição
A coluna "Competência" na tabela de despesas estava vazia, não exibindo os valores de mês/ano.

### Causa Raiz
**Incompatibilidade de convenção de nomes:**

No Prisma Schema, os campos são definidos em camelCase com mapeamento para snake_case no banco:
```prisma
model Despesa {
  competenciaMes  Int  @map("competencia_mes")
  competenciaAno  Int  @map("competencia_ano")
}
```

Quando o Prisma retorna os dados via API, ele usa **camelCase** (JavaScript/TypeScript convention):
- `competenciaMes`
- `competenciaAno`

Mas o frontend estava esperando **snake_case**:
- `competencia_mes`
- `competencia_ano`

### Correção Aplicada

Padronizamos todo o frontend para usar **camelCase**, alinhado com o Prisma:

#### 1. Interface Despesa
```typescript
// ANTES (❌)
export interface Despesa {
  competencia_mes: number;
  competencia_ano: number;
}

// DEPOIS (✅)
export interface Despesa {
  competenciaMes: number;
  competenciaAno: number;
}
```

#### 2. Arquivos Atualizados
- ✅ `frontend/src/services/despesaService.ts`
  - Interface Despesa
  - CreateDespesaDTO
  - UpdateDespesaDTO
  - Método getByCompetencia

- ✅ `frontend/src/components/despesas/DespesasTable.tsx`
  - Renderização da coluna: `{getMesNome(despesa.competenciaMes)}/{despesa.competenciaAno}`

- ✅ `frontend/src/components/despesas/DespesaForm.tsx`
  - Estado do formulário
  - useEffect de carregamento
  - handleSubmit
  - Campos do formulário

- ✅ `frontend/src/components/despesas/DashboardDespesas.tsx`
  - Filtro de mês atual
  - Cálculo de média mensal

- ✅ `frontend/src/pages/Despesas.tsx`
  - Filtros por mês/ano
  - Export CSV/XLSX
  - Anos únicos

### Resultado
✅ A coluna "Competência" agora exibe corretamente: "Mai/2025", "Jun/2025", "Jul/2025", etc.

### Lição Aprendida
**Sempre usar camelCase no frontend TypeScript/React quando trabalhando com Prisma**, pois:
- Prisma retorna dados em camelCase por padrão
- O @map é apenas para o banco de dados
- TypeScript/JavaScript usam camelCase como convenção

---

## 🆕 Problema 4: Listagem Mostrando Apenas 10 Registros

**Data:** 06/10/2025 - 15:15

### Descrição
A tabela de despesas mostrava apenas 10 registros, mesmo com 85 despesas importadas no banco de dados.

### Causa Raiz
**Paginação padrão do backend não configurada no frontend:**

O backend tem paginação implementada com limite padrão:
```typescript
// src/backend/services/despesaService.ts
async findAll(pagination?: PaginationParams, filters?: FilterParams) {
  const page = pagination?.page || 1;
  const limit = pagination?.limit || 10;  // ← LIMITE PADRÃO = 10
  const skip = (page - 1) * limit;
  // ...
}
```

O frontend não estava passando parâmetros de paginação:
```typescript
// ANTES (❌)
getAll: async (): Promise<Despesa[]> => {
  const response = await api.get('/despesas');  // Sem params!
  return response.data.data.map(normalizeDespesa);
}
```

### Resultado
- Backend retornava apenas os primeiros 10 registros (página 1)
- Frontend recebia e exibia apenas esses 10
- Usuário não via as outras 75 despesas

### Correção Aplicada

Adicionado parâmetro `limit` na chamada da API:

```typescript
// DEPOIS (✅)
getAll: async (): Promise<Despesa[]> => {
  const response = await api.get('/despesas', {
    params: { limit: 10000 } // Buscar todas as despesas
  });
  return response.data.data.map(normalizeDespesa);
}
```

### Arquivo Modificado
- ✅ `frontend/src/services/despesaService.ts` - Método getAll()

### Paginação no Frontend

O frontend tem **paginação visual** separada da paginação do backend:

```typescript
// DespesasTable.tsx
const { paginatedData, ... } = usePagination(sortedDespesas, 20);
```

Isso significa:
1. **Backend** agora retorna todas as 85 despesas (limit: 10000)
2. **Frontend** recebe todas e armazena em estado
3. **Tabela visual** mostra 20 por vez com controles de navegação
4. **Usuário** pode navegar entre páginas: 1, 2, 3, 4, 5 (total: 85 ÷ 20 = 5 páginas)

### Resultado Final
✅ Usuário consegue ver TODAS as 85 despesas navegando pelas páginas
✅ Filtros funcionam sobre todo o conjunto de dados (não apenas 10)
✅ Dashboard calcula totais corretos (todas as despesas)
✅ Export inclui todas as despesas (não apenas 10)

### Controles de Paginação

A tabela tem controles no rodapé:
- **Itens por página:** 10, 20, 50, 100 (seletor)
- **Navegação:** Botões "Anterior" e "Próxima"
- **Indicador:** "Página X de Y"

### Lição Aprendida
**Sempre verificar se APIs paginadas estão recebendo os parâmetros corretos:**
- Se o backend usa paginação padrão, o frontend DEVE especificar limit
- Para "buscar tudo", use um limit alto (10000) ou implemente endpoint sem paginação
- Separe paginação de backend (performance) de paginação de UI (UX)
