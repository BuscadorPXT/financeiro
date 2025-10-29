import { Router, Request, Response } from 'express';
import { PrismaClient, StatusFinal } from '@prisma/client';
import csvParser from 'csv-parser';
import * as fs from 'fs';
import * as path from 'path';

const router = Router();
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
      await prisma.usuario.update({
        where: { id: usuarioExistente.id },
        data: dados,
      });

      resultado.atualizados++;
      resultado.detalhes.push({
        email: email,
        acao: 'ATUALIZADO',
      });
    } else {
      await prisma.usuario.create({
        data: dados,
      });

      resultado.criados++;
      resultado.detalhes.push({
        email: email,
        acao: 'CRIADO',
      });
    }

    resultado.total++;
  } catch (error) {
    resultado.erros++;
    resultado.detalhes.push({
      email: usuario.email,
      acao: 'ERRO',
      mensagem: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
}

// Rota protegida por senha simples (via query param)
router.post('/importar-usuarios', async (req: Request, res: Response) => {
  try {
    // Proteção básica com senha via query param ou header
    const senha = req.query.senha || req.headers['x-admin-password'];
    const senhaCorreta = process.env.ADMIN_PASSWORD || 'importar2024';

    if (senha !== senhaCorreta) {
      return res.status(403).json({
        erro: 'Acesso negado. Senha incorreta.',
        dica: 'Use: POST /api/admin/importar-usuarios?senha=SUA_SENHA',
      });
    }

    console.log('🚀 Iniciando importação de usuários via endpoint admin...');

    const resultado: ResultadoImportacao = {
      total: 0,
      criados: 0,
      atualizados: 0,
      erros: 0,
      detalhes: [],
    };

    // Caminho do CSV em produção (diretório raiz do projeto)
    const caminhoCSV = path.join(process.cwd(), 'base_consolidada.csv');

    if (!fs.existsSync(caminhoCSV)) {
      return res.status(404).json({
        erro: 'Arquivo base_consolidada.csv não encontrado',
        caminho: caminhoCSV,
      });
    }

    const usuarios = await lerCSV(caminhoCSV);
    console.log(`✅ ${usuarios.length} usuários lidos do CSV`);

    // Processar cada usuário
    for (const usuario of usuarios) {
      await importarUsuario(usuario, resultado);
    }

    // Validação pós-importação
    const totalUsuarios = await prisma.usuario.count();
    const porStatus = await prisma.usuario.groupBy({
      by: ['statusFinal'],
      _count: true,
    });

    const comIndicador = await prisma.usuario.count({
      where: { indicador: { not: null } },
    });

    return res.json({
      sucesso: true,
      mensagem: 'Importação concluída com sucesso',
      resultado: {
        total: resultado.total,
        criados: resultado.criados,
        atualizados: resultado.atualizados,
        erros: resultado.erros,
      },
      validacao: {
        totalUsuarios,
        distribuicaoPorStatus: porStatus,
        comIndicador,
        semIndicador: totalUsuarios - comIndicador,
      },
      detalhesErros:
        resultado.erros > 0
          ? resultado.detalhes.filter((d) => d.acao === 'ERRO')
          : [],
    });
  } catch (error) {
    console.error('❌ Erro fatal na importação:', error);
    return res.status(500).json({
      erro: 'Erro fatal na importação',
      mensagem: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  } finally {
    await prisma.$disconnect();
  }
});

// Rota para atualizar flags de vencimento
router.post('/atualizar-flags', async (req: Request, res: Response) => {
  try {
    const senha = req.query.senha || req.headers['x-admin-password'];
    const senhaCorreta = process.env.ADMIN_PASSWORD || 'importar2024';

    if (senha !== senhaCorreta) {
      return res.status(403).json({
        erro: 'Acesso negado. Senha incorreta.',
        dica: 'Use: POST /api/admin/atualizar-flags?senha=SUA_SENHA',
      });
    }

    console.log('🔄 Executando atualização de flags via endpoint admin...');

    // Importa e executa o job
    const { executarJob } = await import('../jobs/atualizarFlags');
    const resultado = await executarJob();

    return res.json({
      sucesso: true,
      mensagem: 'Flags atualizadas com sucesso',
      resultado: {
        usuarios: resultado.usuarios,
        agenda: resultado.agenda,
        sincronizacao: resultado.sincronizacao,
        duracao: `${resultado.duracao}ms`,
      },
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar flags:', error);
    return res.status(500).json({
      erro: 'Erro ao atualizar flags',
      mensagem: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
});

// Rota de teste para verificar se o endpoint está acessível
router.get('/status', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    endpoints: {
      importar: 'POST /api/admin/importar-usuarios?senha=SUA_SENHA',
      atualizarFlags: 'POST /api/admin/atualizar-flags?senha=SUA_SENHA',
    },
  });
});

export default router;
