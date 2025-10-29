import { PrismaClient, StatusFinal } from '@prisma/client';
import * as fs from 'fs';
import csvParser from 'csv-parser';
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

interface ResultadoImportacao {
  total: number;
  criados: number;
  atualizados: number;
  erros: number;
  detalhes: {
    email: string;
    acao: 'CRIADO' | 'ATUALIZADO' | 'ERRO';
    mensagem?: string;
  }[];
}

function determinarStatus(
  statusSistema: string,
  statusPagamento: string,
  temPagamentos: string
): StatusFinal {
  // Se tem pagamentos e está ativo em pagamentos
  if (temPagamentos === 'SIM' && statusPagamento === 'Ativo') {
    return StatusFinal.ATIVO;
  }

  // Se está ativo no sistema
  if (statusSistema === 'Ativo') {
    return StatusFinal.ATIVO;
  }

  // Se tem pagamentos mas está inativo
  if (temPagamentos === 'SIM' && statusPagamento === 'Inativo') {
    return StatusFinal.INATIVO;
  }

  // Se tem histórico de pagamentos
  if (statusPagamento === 'Histórico') {
    return StatusFinal.HISTORICO;
  }

  // Default: inativo
  return StatusFinal.INATIVO;
}

function construirObservacoes(usuario: UsuarioCSV): string {
  const partes: string[] = [];

  // Observação original
  if (usuario.obs) {
    partes.push(usuario.obs);
  }

  // Informações do sistema Numbers
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

  // Informações de pagamentos
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

  // Tags
  if (usuario.tags_str) {
    partes.push(`[TAGS] ${usuario.tags_str}`);
  }

  // Alertas
  if (usuario.alertas_str) {
    partes.push(`[ALERTAS] ${usuario.alertas_str}`);
  }

  // Fontes de dados
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

async function importarUsuario(
  usuario: UsuarioCSV,
  resultado: ResultadoImportacao
): Promise<void> {
  try {
    const email = usuario.email.trim().toLowerCase();

    if (!email) {
      resultado.erros++;
      resultado.detalhes.push({
        email: 'VAZIO',
        acao: 'ERRO',
        mensagem: 'Email vazio',
      });
      return;
    }

    const statusFinal = determinarStatus(
      usuario.status_sistema,
      usuario.status_pagamento,
      usuario.tem_pagamentos
    );

    const observacoes = construirObservacoes(usuario);

    // Buscar se usuário já existe
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
      ativoAtual: statusFinal === StatusFinal.ATIVO,
    };

    if (usuarioExistente) {
      // Atualizar usuário existente
      await prisma.usuario.update({
        where: { id: usuarioExistente.id },
        data: dados,
      });

      resultado.atualizados++;
      resultado.detalhes.push({
        email: email,
        acao: 'ATUALIZADO',
      });

      console.log(`✅ ATUALIZADO: ${email} - ${usuario.nome}`);
    } else {
      // Criar novo usuário
      await prisma.usuario.create({
        data: dados,
      });

      resultado.criados++;
      resultado.detalhes.push({
        email: email,
        acao: 'CRIADO',
      });

      console.log(`✨ CRIADO: ${email} - ${usuario.nome}`);
    }

    resultado.total++;
  } catch (error) {
    resultado.erros++;
    resultado.detalhes.push({
      email: usuario.email,
      acao: 'ERRO',
      mensagem: error instanceof Error ? error.message : 'Erro desconhecido',
    });

    console.error(`❌ ERRO em ${usuario.email}:`, error);
  }
}

async function importarTodos() {
  console.log('='.repeat(100));
  console.log('🚀 INICIANDO IMPORTAÇÃO DE USUÁRIOS - BASE CONSOLIDADA');
  console.log('='.repeat(100));

  const resultado: ResultadoImportacao = {
    total: 0,
    criados: 0,
    atualizados: 0,
    erros: 0,
    detalhes: [],
  };

  try {
    // Caminho do arquivo CSV
    const caminhoCSV = path.join(process.cwd(), 'base_consolidada.csv');

    console.log(`\n📖 Lendo arquivo: ${caminhoCSV}`);

    if (!fs.existsSync(caminhoCSV)) {
      throw new Error(`Arquivo não encontrado: ${caminhoCSV}`);
    }

    const usuarios = await lerCSV(caminhoCSV);
    console.log(`✅ ${usuarios.length} usuários lidos do CSV\n`);

    console.log('🔄 Processando usuários...\n');

    // Processar cada usuário
    for (const usuario of usuarios) {
      await importarUsuario(usuario, resultado);
    }

    // Relatório final
    console.log('\n' + '='.repeat(100));
    console.log('📊 RELATÓRIO DE IMPORTAÇÃO');
    console.log('='.repeat(100));
    console.log(`\n✅ Total processado: ${resultado.total}`);
    console.log(`✨ Novos usuários criados: ${resultado.criados}`);
    console.log(`🔄 Usuários atualizados: ${resultado.atualizados}`);
    console.log(`❌ Erros: ${resultado.erros}`);

    if (resultado.erros > 0) {
      console.log('\n⚠️  USUÁRIOS COM ERRO:');
      const erros = resultado.detalhes.filter((d) => d.acao === 'ERRO');
      erros.forEach((erro, i) => {
        console.log(`  ${i + 1}. ${erro.email}: ${erro.mensagem}`);
      });
    }

    // Salvar log detalhado
    const logPath = path.join(process.cwd(), 'log_importacao.json');
    fs.writeFileSync(logPath, JSON.stringify(resultado, null, 2));
    console.log(`\n💾 Log detalhado salvo em: ${logPath}`);

    // Validação final
    console.log('\n' + '='.repeat(100));
    console.log('🔍 VALIDAÇÃO PÓS-IMPORTAÇÃO');
    console.log('='.repeat(100));

    const totalUsuarios = await prisma.usuario.count();
    console.log(`\nTotal de usuários no banco: ${totalUsuarios}`);

    const porStatus = await prisma.usuario.groupBy({
      by: ['statusFinal'],
      _count: true,
    });

    console.log('\nDistribuição por Status:');
    porStatus.forEach((item) => {
      console.log(`  ${item.statusFinal}: ${item._count} usuários`);
    });

    const comIndicador = await prisma.usuario.count({
      where: { indicador: { not: null } },
    });
    const semIndicador = totalUsuarios - comIndicador;

    console.log('\nIndicadores:');
    console.log(`  Com indicador: ${comIndicador}`);
    console.log(`  Sem indicador: ${semIndicador}`);

    console.log('\n' + '='.repeat(100));
    console.log('✅ IMPORTAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('='.repeat(100));
  } catch (error) {
    console.error('\n❌ ERRO FATAL NA IMPORTAÇÃO:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar importação
importarTodos()
  .then(() => {
    console.log('\n✨ Processo finalizado!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Falha na importação:', error);
    process.exit(1);
  });
