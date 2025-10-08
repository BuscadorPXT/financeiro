# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a financial control system for managing subscriptions, payments, expenses, commissions, and reports. Built with Node.js/Express backend, React/TypeScript frontend, and PostgreSQL database using Prisma ORM.

## Commands

### Development
- `npm run dev` - Run backend and frontend concurrently (backend: port 3001, frontend: port 3000)
- `npm run dev:backend` - Run backend only with hot reload
- `npm run dev:frontend` - Run frontend only with hot reload

### Database
- `npm run prisma:generate` - Generate Prisma Client after schema changes
- `npm run prisma:migrate` - Apply database migrations
- `npm run prisma:studio` - Open Prisma Studio for database visualization (port 5555)
- `npx ts-node src/database/seeds/index.ts` - Seed database with initial data

### Build & Production
- `npm run build` - Build both backend and frontend for production
- `npm start` - Start production server

### Testing & Quality
- `npm test` - Run test suite
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Jobs
- `npm run job:atualizar-flags` - Run daily job to update expiration flags

## Architecture

### Tech Stack
- **Backend**: Node.js + Express + TypeScript
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **API**: RESTful endpoints at `/api/*`

### Key Data Models

1. **Usuario** - User/subscriber management
   - Tracks payment status, cycles, expiration dates
   - Automatic status calculation (ATIVO/EM_ATRASO/INATIVO)
   - Commission eligibility tracking

2. **Pagamento** - Payment records
   - Links to Usuario via usuarioId
   - Tracks payment type (PRIMEIRO/RECORRENTE)
   - Automatic commission calculation

3. **Agenda** - Renewal scheduling
   - Tracks upcoming expirations
   - Handles renewal/cancellation workflows

4. **Comissao** - Commission tracking
   - Consolidated from payments
   - Grouped by indicator and rule type

5. **Prospeccao** - Lead management
   - Conversion to Usuario when ready
   - Track lead sources and indicators

### Business Rules

1. **Payment Processing**:
   - PRIMEIRO (first payment): Sets user as ENTROU, calculates initial commission
   - RECORRENTE (recurring): Increments cycle, marks as RENOVOU
   - Automatically updates expiration date (payment date + 30 days)

2. **Status Calculations**:
   - ATIVO: dias_para_vencer >= 1
   - EM_ATRASO: dias_para_vencer < 0
   - Automatic flags: vence_hoje, prox_7_dias, em_atraso

3. **Renewal Flow**:
   - Agenda tracks upcoming renewals
   - Marking as renewed creates RECORRENTE payment
   - Marking as canceled creates Churn record

4. **Commission Rules**:
   - Calculated based on payment type and configured rules
   - Consolidated in Comissao table
   - Grouped by indicator for reporting

### API Structure

All API routes follow pattern: `/api/{resource}`

Main endpoints:
- `/api/usuarios` - User CRUD + import/export
- `/api/pagamentos` - Payment records
- `/api/despesas` - Expense tracking
- `/api/agenda` - Renewal management
- `/api/churn` - Churn tracking
- `/api/comissoes` - Commission reports
- `/api/prospeccao` - Lead management
- `/api/listas` - Auxiliary lists (accounts, methods, categories)
- `/api/relatorios` - Reports and KPIs

### Frontend Pages

Located in `frontend/src/pages/`:
- Dashboard - Overview and KPIs
- Usuarios - User management with filters and quick payment
- Pagamentos - Payment entry and history
- Despesas - Expense tracking by category
- Agenda - Renewal tracking with color-coded statuses
- Churn - Churn analysis and reversal
- Comissoes - Commission reports by indicator/rule
- Prospeccao - Lead management and conversion
- Relatorios - Comprehensive reporting with multiple views
- Listas - Auxiliary list management

### Import/Export Features

- **Export**: All pages support CSV/XLSX export with current filters
- **Import**: Bulk import with column mapping and validation
  - Idempotent imports (no duplicates by email)
  - Preview before import
  - Validation feedback

### Daily Jobs

Located in `src/backend/jobs/`:
- `atualizarFlags.ts` - Updates expiration flags for all active users
- Calculates dias_para_vencer and status flags
- Should be run daily via cron or scheduler

## Development Notes

1. **Environment**: Uses `.env` file for configuration (see `.env.example`)
2. **Database URL**: Configured for PostgreSQL, update in `.env`
3. **CORS**: Frontend runs on port 3000, backend on 3001
4. **Hot Reload**: Both frontend and backend support hot reload in dev mode
5. **TypeScript**: Strict mode enabled, path aliases configured
6. **Prisma**: Schema in `prisma/schema.prisma`, client generated to `src/generated/prisma`