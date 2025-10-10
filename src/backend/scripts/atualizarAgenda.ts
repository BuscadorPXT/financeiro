import agendaService from '../services/agendaService';
import prisma from '../../database/client';

/**
 * Script para atualizar os diasParaVencer de todos os itens da agenda
 * Execute com: npx ts-node src/backend/scripts/atualizarAgenda.ts
 */
async function main() {
  console.log('🔄 Iniciando atualização da agenda...');

  try {
    const atualizados = await agendaService.atualizarDiasParaVencer();
    console.log(`✅ ${atualizados} registros atualizados com sucesso!`);
  } catch (error) {
    console.error('❌ Erro ao atualizar agenda:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
