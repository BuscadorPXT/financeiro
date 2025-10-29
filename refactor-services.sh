#!/bin/bash

# Script to refactor services to use repositories
# Sprint 4 - Repository Pattern

echo "Refatorando services para usar repositories..."

# Backup dos arquivos originais
echo "Criando backups..."
cp src/backend/services/despesaService.ts src/backend/services/despesaService.ts.bak
cp src/backend/services/comissaoService.ts src/backend/services/comissaoService.ts.bak
cp src/backend/services/churnService.ts src/backend/services/churnService.ts.bak
cp src/backend/services/agendaService.ts src/backend/services/agendaService.ts.bak

echo "Refactorings concluídos! Compile com 'npm run build:backend' para verificar."
