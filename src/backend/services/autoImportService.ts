import { PrismaClient, StatusFinal } from '@prisma/client';
import csvParser from 'csv-parser';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface UsuarioCSV {
  email: string;
  nome: string;
  telefone: string;
  indicador: string;
  plano: string;
  status_sistema: string;
  empresa: string;
  funcao: string;
  verificado: string;
  tem_pagamentos: string;
  total_pagamentos: string;
  total_ciclos: string;
  ultimo_pagamento: string;
  data_vencimento: string;
  status_pagamento: string;
  data_criacao: string;
  ultima_atividade: string;
  obs: string;
  alertas_str: string;
  tags_str: string;
  fontes_str: string;
}

function determinarStatus(
  statusSistema: string,
  statusPagamento: string,
  temPagamentos: string
): StatusFinal {
  if (temPagamentos === 'SIM' && statusPagamento === 'Ativo') {
    return StatusFinal.ATIVO;
  }
  if (statusSistema === 'Ativo') {
    return StatusFinal.ATIVO;
  }
  if (temPagamentos === 'SIM' && statusPagamento === 'Inativo') {
    return StatusFinal.INATIVO;
  }
  if (statusPagamento === 'Histórico') {
    return StatusFinal.HISTORICO;
  }
  return StatusFinal.INATIVO;
}

function construirObservacoes(usuario: UsuarioCSV): string {
  const partes: string[] = [];

  if (usuario.obs) {
    partes.push(usuario.obs);
  }

  const infoSistema: string[] = [];
  if (usuario.plano) {
    infoSistema.push(`Plano: ${usuario.plano}`);
  }
  if (usuario.empresa && usuario.empresa !== 'N/A') {
    infoSistema.push(`Empresa: ${usuario.empresa}`);
  }
  if (usuario.funcao && usuario.funcao !== 'N/A') {
    infoSistema.push(`Função: ${usuario.funcao}`);
  }
  if (usuario.verificado) {
    infoSistema.push(`Verificado: ${usuario.verificado}`);
  }

  if (infoSistema.length > 0) {
    partes.push(`[SISTEMA] ${infoSistema.join(' | ')}`);
  }

  if (usuario.tem_pagamentos === 'SIM') {
    const infoPagamentos: string[] = [];
    infoPagamentos.push(`Total Pagamentos: ${usuario.total_pagamentos}`);
    infoPagamentos.push(`Ciclos: ${usuario.total_ciclos}`);
    if (usuario.ultimo_pagamento) {
      infoPagamentos.push(`Último: ${usuario.ultimo_pagamento}`);
    }
    if (usuario.data_vencimento) {
      infoPagamentos.push(`Vence: ${usuario.data_vencimento}`);
    }
    partes.push(`[PAGAMENTOS] ${infoPagamentos.join(' | ')}`);
  }

  if (usuario.tags_str) {
    partes.push(`[TAGS] ${usuario.tags_str}`);
  }

  if (usuario.alertas_str) {
    partes.push(`[ALERTAS] ${usuario.alertas_str}`);
  }

  if (usuario.fontes_str) {
    partes.push(`[FONTES] ${usuario.fontes_str}`);
  }

  return partes.join('\n');
}

async function lerCSV(caminhoArquivo: string): Promise<UsuarioCSV[]> {
  return new Promise((resolve, reject) => {
    const usuarios: UsuarioCSV[] = [];

    fs.createReadStream(caminhoArquivo)
      .pipe(csvParser())
      .on('data', (row: any) => {
        usuarios.push(row as UsuarioCSV);
      })
      .on('end', () => {
        resolve(usuarios);
      })
      .on('error', (error: any) => {
        reject(error);
      });
  });
}

/**
 * Verifica se a importação da base consolidada já foi executada
 */
async function verificarSeJaImportou(): Promise<boolean> {
  try {
    // Verifica se existe algum usuário com a tag de importação consolidada
    const usuarioComTag = await prisma.usuario.findFirst({
      where: {
        obs: {
          contains: '[FONTES]',
        },
      },
    });

    return usuarioComTag !== null;
  } catch (error) {
    console.error('❌ Erro ao verificar importação:', error);
    return false;
  }
}

/**
 * Executa a importação automática da base consolidada
 */
export async function executarImportacaoAutomatica(): Promise<void> {
  try {
    console.log('\n' + '='.repeat(80));
    console.log('🔍 VERIFICANDO NECESSIDADE DE IMPORTAÇÃO');
    console.log('='.repeat(80));

    // Verifica se já foi importado
    const jaImportou = await verificarSeJaImportou();

    if (jaImportou) {
      console.log('✅ Base consolidada já foi importada anteriormente');
      console.log('   Pulando importação automática...\n');
      return;
    }

    console.log('📦 Base consolidada não encontrada');
    console.log('🚀 Iniciando importação automática...\n');

    const caminhoCSV = path.join(process.cwd(), 'base_consolidada.csv');

    // Verifica se o arquivo existe
    if (!fs.existsSync(caminhoCSV)) {
      console.log('⚠️  Arquivo base_consolidada.csv não encontrado');
      console.log(`   Caminho esperado: ${caminhoCSV}`);
      console.log('   Importação será pulada\n');
      return;
    }

    console.log(`📖 Lendo arquivo: ${caminhoCSV}`);
    const usuarios = await lerCSV(caminhoCSV);
    console.log(`✅ ${usuarios.length} usuários lidos do CSV\n`);

    let criados = 0;
    let atualizados = 0;
    let erros = 0;

    console.log('🔄 Processando usuários...\n');

    for (const usuario of usuarios) {
      try {
        const email = usuario.email.trim().toLowerCase();

        if (!email) {
          erros++;
          continue;
        }

        const statusFinal = determinarStatus(
          usuario.status_sistema,
          usuario.status_pagamento,
          usuario.tem_pagamentos
        );

        const observacoes = construirObservacoes(usuario);

        const usuarioExistente = await prisma.usuario.findUnique({
          where: { emailLogin: email },
        });

        const dados = {
          emailLogin: email,
          nomeCompleto: usuario.nome || 'Sem nome',
          telefone: usuario.telefone || null,
          indicador: usuario.indicador || null,
          statusFinal: statusFinal,
          obs: observacoes,
          totalCiclosUsuario: parseInt(usuario.total_ciclos || '0'),
        };

        if (usuarioExistente) {
          await prisma.usuario.update({
            where: { id: usuarioExistente.id },
            data: dados,
          });
          atualizados++;
        } else {
          await prisma.usuario.create({
            data: dados,
          });
          criados++;
        }
      } catch (error) {
        erros++;
        console.error(`❌ Erro ao processar ${usuario.email}:`, error);
      }
    }

    // Relatório final
    console.log('\n' + '='.repeat(80));
    console.log('📊 RELATÓRIO DE IMPORTAÇÃO AUTOMÁTICA');
    console.log('='.repeat(80));
    console.log(`✅ Total processado: ${criados + atualizados}`);
    console.log(`✨ Novos usuários criados: ${criados}`);
    console.log(`🔄 Usuários atualizados: ${atualizados}`);
    console.log(`❌ Erros: ${erros}`);

    const totalUsuarios = await prisma.usuario.count();
    console.log(`\n📈 Total de usuários no banco: ${totalUsuarios}`);
    console.log('='.repeat(80) + '\n');
  } catch (error) {
    console.error('\n❌ ERRO NA IMPORTAÇÃO AUTOMÁTICA:', error);
    console.log('   O servidor continuará funcionando normalmente\n');
  }
}
