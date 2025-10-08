import fs from 'fs';
import path from 'path';
import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

interface DespesaCSV {
  mes: string;
  data: string;
  categoria: string;
  descricao: string;
  conta: string;
  indicador: string;
  valor: string;
  status: string;
  k_pagamento: string;
  pos: string;
}

function parseCSV(filePath: string): DespesaCSV[] {
  const content = fs.readFileSync(filePath, 'latin1'); // Usando latin1 para caracteres especiais
  const lines = content.split('\n');
  const despesas: DespesaCSV[] = [];

  // Pula o cabeçalho (linha 1)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(';');
    if (parts.length < 8) continue; // Precisa ter pelo menos os campos principais

    const mes = parts[0]?.trim() || '';
    const data = parts[1]?.trim() || '';
    const categoria = parts[2]?.trim() || '';
    const descricao = parts[3]?.trim() || '';
    const conta = parts[4]?.trim() || '';
    const indicador = parts[5]?.trim() || '';
    const valor = parts[6]?.trim() || '';
    const status = parts[7]?.trim() || '';
    const k_pagamento = parts[8]?.trim() || '';
    const pos = parts[9]?.trim() || '';

    // Ignora linhas vazias
    if (!mes || !data || !categoria || !valor) continue;

    despesas.push({
      mes,
      data,
      categoria,
      descricao,
      conta,
      indicador,
      valor,
      status,
      k_pagamento,
      pos,
    });
  }

  return despesas;
}

function parseValor(valorStr: string): number {
  // Remove "R$", espaços, pontos de milhar e converte vírgula para ponto
  const cleaned = valorStr
    .replace(/R\$/g, '')
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(/,/g, '.');
  return parseFloat(cleaned) || 0;
}

function parseData(dataStr: string): { mes: number; ano: number } {
  // Formato esperado: DD/MM/YYYY
  const parts = dataStr.split('/');
  if (parts.length !== 3) {
    throw new Error(`Data inválida: ${dataStr}`);
  }

  const mes = parseInt(parts[1], 10);
  const ano = parseInt(parts[2], 10);

  return { mes, ano };
}

function mapStatus(statusStr: string): 'PAGO' | 'PENDENTE' {
  const statusUpper = statusStr.toUpperCase();
  if (statusUpper === 'PAGO') return 'PAGO';
  return 'PENDENTE'; // Emitido e outros vão para PENDENTE
}

async function importDespesas() {
  console.log('🔍 Iniciando importação de despesas...\n');

  const csvPath = path.resolve(__dirname, '../../controle usuarios(DESPESAS) (1).csv');

  if (!fs.existsSync(csvPath)) {
    console.error(`❌ Arquivo não encontrado: ${csvPath}`);
    process.exit(1);
  }

  console.log(`📄 Lendo arquivo: ${csvPath}\n`);
  const despesasCSV = parseCSV(csvPath);
  console.log(`📊 Total de registros encontrados: ${despesasCSV.length}\n`);

  let importados = 0;
  let erros = 0;

  // Limpa tabela de despesas antes de importar
  console.log('🗑️  Limpando tabela de despesas...');
  await prisma.despesa.deleteMany({});
  console.log('✅ Tabela limpa\n');

  console.log('💾 Importando despesas...\n');

  for (const despesaCSV of despesasCSV) {
    try {
      const { mes, ano } = parseData(despesaCSV.data);
      const valor = parseValor(despesaCSV.valor);
      const status = mapStatus(despesaCSV.status);

      await prisma.despesa.create({
        data: {
          categoria: despesaCSV.categoria,
          descricao: despesaCSV.descricao || despesaCSV.categoria,
          conta: despesaCSV.conta || null,
          indicador: despesaCSV.indicador || null,
          valor,
          status,
          competenciaMes: mes,
          competenciaAno: ano,
        },
      });

      importados++;
      console.log(`✅ [${importados}] ${despesaCSV.data} - ${despesaCSV.categoria} - R$ ${valor.toFixed(2)}`);
    } catch (error) {
      erros++;
      console.error(`❌ Erro ao importar despesa:`, despesaCSV, error);
    }
  }

  console.log('\n📊 Resumo da importação:');
  console.log(`✅ Importados: ${importados}`);
  console.log(`❌ Erros: ${erros}`);
  console.log(`📈 Total: ${despesasCSV.length}`);

  await prisma.$disconnect();
}

importDespesas()
  .catch((error) => {
    console.error('❌ Erro na importação:', error);
    process.exit(1);
  });
