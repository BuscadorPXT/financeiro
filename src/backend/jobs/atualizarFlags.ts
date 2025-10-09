/**
 * Job para atualizar flags de vencimento dos usuários
 * Deve ser executado diariamente via cron
 *
 * Exemplo de cron (todos os dias às 00:05):
 * 5 0 * * * node dist/backend/jobs/atualizarFlags.js
 */

import prisma from '../../database/client';
import { StatusFinal } from '@prisma/client';
import {
  calcularDiasParaVencer,
  venceHoje,
  venceProximos7Dias,
  emAtraso,
} from '../utils/dateUtils';
import agendaService from '../services/agendaService';

async function atualizarFlagsUsuarios() {
  console.log('[JOB] Iniciando atualização de flags dos usuários...');

  try {
    // Busca todos os usuários ativos ou em atraso que têm data de vencimento
    const usuarios = await prisma.usuario.findMany({
      where: {
        dataVenc: { not: null },
        statusFinal: {
          in: [StatusFinal.ATIVO, StatusFinal.EM_ATRASO],
        },
      },
    });

    console.log(`[JOB] Encontrados ${usuarios.length} usuários para atualizar`);

    let atualizados = 0;
    let erros = 0;

    for (const usuario of usuarios) {
      try {
        if (!usuario.dataVenc) continue;

        const diasParaVencer = calcularDiasParaVencer(usuario.dataVenc);
        const flags = {
          diasParaVencer,
          venceHoje: venceHoje(usuario.dataVenc),
          prox7Dias: venceProximos7Dias(usuario.dataVenc),
          emAtraso: emAtraso(usuario.dataVenc),
        };

        // Atualiza status automático baseado nos dias
        let statusFinal = usuario.statusFinal;
        if (flags.emAtraso) {
          statusFinal = StatusFinal.EM_ATRASO;
        } else if (diasParaVencer >= 1) {
          statusFinal = StatusFinal.ATIVO;
        }

        // Atualiza apenas se houver mudança
        const mudou =
          usuario.diasParaVencer !== diasParaVencer ||
          usuario.venceHoje !== flags.venceHoje ||
          usuario.prox7Dias !== flags.prox7Dias ||
          usuario.emAtraso !== flags.emAtraso ||
          usuario.statusFinal !== statusFinal;

        if (mudou) {
          await prisma.usuario.update({
            where: { id: usuario.id },
            data: {
              ...flags,
              statusFinal,
            },
          });

          atualizados++;
        }
      } catch (error) {
        console.error(`[JOB] Erro ao atualizar usuário ${usuario.id}:`, error);
        erros++;
      }
    }

    console.log(`[JOB] Atualização concluída:`);
    console.log(`  - ${atualizados} usuários atualizados`);
    console.log(`  - ${usuarios.length - atualizados} sem alterações`);
    if (erros > 0) {
      console.log(`  - ${erros} erros encontrados`);
    }

    return { total: usuarios.length, atualizados, erros };
  } catch (error) {
    console.error('[JOB] Erro ao executar job:', error);
    throw error;
  }
}

async function atualizarFlagsAgenda() {
  console.log('[JOB] Iniciando atualização de flags da agenda...');

  try {
    const itensAtivos = await prisma.agenda.findMany({
      where: {
        status: 'ATIVO',
        renovou: false,
        cancelou: false,
      },
    });

    console.log(`[JOB] Encontrados ${itensAtivos.length} itens da agenda para atualizar`);

    let atualizados = 0;

    for (const item of itensAtivos) {
      try {
        const diasParaVencer = calcularDiasParaVencer(item.dataVenc);

        if (diasParaVencer !== item.diasParaVencer) {
          await prisma.agenda.update({
            where: { id: item.id },
            data: { diasParaVencer },
          });

          atualizados++;
        }
      } catch (error) {
        console.error(`[JOB] Erro ao atualizar item da agenda ${item.id}:`, error);
      }
    }

    console.log(`[JOB] ${atualizados} itens da agenda atualizados`);

    return { total: itensAtivos.length, atualizados };
  } catch (error) {
    console.error('[JOB] Erro ao atualizar agenda:', error);
    throw error;
  }
}

async function sincronizarAgenda() {
  console.log('[JOB] Iniciando sincronização da agenda...');

  try {
    const resultado = await agendaService.sincronizarAgenda();

    console.log(`[JOB] Sincronização concluída:`);
    console.log(`  - ${resultado.adicionados} usuários adicionados à agenda`);
    console.log(`  - ${resultado.atualizados} itens atualizados`);

    return resultado;
  } catch (error) {
    console.error('[JOB] Erro ao sincronizar agenda:', error);
    throw error;
  }
}

// Função principal do job
async function executarJob() {
  const inicio = Date.now();
  console.log(`[JOB] ========================================`);
  console.log(`[JOB] Job iniciado em: ${new Date().toISOString()}`);
  console.log(`[JOB] ========================================`);

  try {
    // Atualiza usuários
    const resultUsuarios = await atualizarFlagsUsuarios();

    // Atualiza agenda
    const resultAgenda = await atualizarFlagsAgenda();

    // Sincroniza agenda (adiciona novos usuários e atualiza existentes)
    const resultSincronizacao = await sincronizarAgenda();

    const duracao = Date.now() - inicio;
    console.log(`[JOB] ========================================`);
    console.log(`[JOB] Job concluído com sucesso!`);
    console.log(`[JOB] Duração: ${duracao}ms`);
    console.log(`[JOB] ========================================`);

    return {
      sucesso: true,
      usuarios: resultUsuarios,
      agenda: resultAgenda,
      sincronizacao: resultSincronizacao,
      duracao,
    };
  } catch (error) {
    console.error('[JOB] Erro crítico no job:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Se executado diretamente
if (require.main === module) {
  executarJob()
    .then(() => {
      console.log('[JOB] Processo finalizado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('[JOB] Processo finalizado com erro:', error);
      process.exit(1);
    });
}

export { executarJob, atualizarFlagsUsuarios, atualizarFlagsAgenda, sincronizarAgenda };
