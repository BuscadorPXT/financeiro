import fs from 'fs';
import path from 'path';
import { PrismaClient, StatusFinal, MetodoPagamento, ContaFinanceira, RegraTipo } from '../generated/prisma';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

interface CSVRow {
  EMAIL_LOGIN: string;
  NOME_COMPLETO: string;
  TELEFONE: string;
  INDICADOR: string;
  DATA_PAGTO: string;
  'M�S_PAGTO': string; // Encoding issue
  DIAS_ACESSO: string;
  DATA_VENC: string;
  STATUS: string;
  STATUS_FINAL: string;
  DIAS_PARA_VENCER: string;
  VENCE_HOJE: string;
  PROX_7_DIAS: string;
  EM_ATRASO: string;
  'M�TODO': string; // Encoding issue
  CONTA: string;
  VALOR: string;
  OBS: string;
  CICLO: string;
  TOTAL_CICLOS_USUARIO: string;
  E_ULTIMO: string;
  FLAG_AGENDA: string;
  K_AGENDA: string;
  FLAG_SEMANA: string;
  ROW_ID: string;
  MES_REF: string;
  ENTROU: string;
  RENOVOU: string;
  ATIVO_ATUAL: string;
  CHURN: string;
  K_CHURN: string;
  REGRA_TIPO: string;
  REGRA_VALOR: string;
  'ELEGIVEL_COMISS�O': string; // Encoding issue
  'COMISS�O_VALOR': string; // Encoding issue
  ENTROU_ELIG: string;
  RENOVOU_ELEGIVEL: string;
  ATIVO_MES_FLAG: string;
  CHURN_MES_FLAG: string;
  K_COMISSAO: string;
  'teste a': string;
  'teste b': string;
}

// Funções auxiliares de conversão
function parseDate(dateStr: string): Date | null {
  if (!dateStr || dateStr.trim() === '') return null;

  // Formato: DD/MM/YYYY
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;

  const day = parseInt(parts[0]);
  const month = parseInt(parts[1]) - 1; // JS months are 0-indexed
  const year = parseInt(parts[2]);

  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;

  return new Date(year, month, day);
}

function parseValor(valorStr: string): number {
  if (!valorStr || valorStr.trim() === '' || valorStr === 'R$ -') return 0;

  // Remove "R$", espaços, e converte vírgula para ponto
  const cleanValue = valorStr
    .replace('R$', '')
    .replace(/\s/g, '')
    .replace('.', '')
    .replace(',', '.');

  const valor = parseFloat(cleanValue);
  return isNaN(valor) ? 0 : valor;
}

function parseBoolean(value: string): boolean {
  if (!value || value.trim() === '') return false;
  return value === '1' || value.toLowerCase() === 'true' || value.toLowerCase() === 'verdadeiro';
}

function parseMetodoPagamento(metodo: string): MetodoPagamento | null {
  const upper = metodo?.toUpperCase().trim();

  if (upper === 'PIX') return MetodoPagamento.PIX;
  if (upper === 'CRÉDITO' || upper === 'CREDITO') return MetodoPagamento.CREDITO;
  if (upper === 'DIN' || upper === 'DINHEIRO') return MetodoPagamento.DINHEIRO;

  return null;
}

function parseContaFinanceira(conta: string): ContaFinanceira | null {
  const upper = conta?.toUpperCase().trim();

  if (upper === 'PXT') return ContaFinanceira.PXT;
  if (upper === 'EAGLE') return ContaFinanceira.EAGLE;

  return null;
}

function parseStatusFinal(status: string): StatusFinal {
  const normalized = status?.toLowerCase().trim();

  if (normalized === 'ativo') return StatusFinal.ATIVO;
  if (normalized === 'em atraso' || normalized === 'em_atraso') return StatusFinal.EM_ATRASO;
  if (normalized === 'histórico' || normalized === 'historico') return StatusFinal.HISTORICO;

  return StatusFinal.INATIVO;
}

function parseRegraTipo(regra: string): RegraTipo | null {
  const upper = regra?.toUpperCase().trim();

  if (upper === 'PRIMEIRO') return RegraTipo.PRIMEIRO;
  if (upper === 'RECORRENTE') return RegraTipo.RECORRENTE;

  return null;
}

async function importarDados() {
  try {
    console.log('🚀 Iniciando importação de dados...\n');

    // Ler arquivo CSV
    const csvPath = path.join(__dirname, '../../controle usuarios(PAGAMENTOS) (2).csv');
    const fileContent = fs.readFileSync(csvPath, 'utf-8');

    // Parse CSV
    const records: CSVRow[] = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      delimiter: ';',
      bom: true,
    });

    console.log(`📊 Total de registros no CSV: ${records.length}`);

    // Debug: mostrar colunas disponíveis
    if (records.length > 0) {
      console.log(`📋 Colunas disponíveis:`, Object.keys(records[0]).slice(0, 20));
    }
    console.log();

    // Agrupar registros por usuário (email)
    const usuariosPorEmail = new Map<string, CSVRow[]>();

    records.forEach(row => {
      const email = row.EMAIL_LOGIN.toLowerCase().trim();
      if (!usuariosPorEmail.has(email)) {
        usuariosPorEmail.set(email, []);
      }
      usuariosPorEmail.get(email)!.push(row);
    });

    console.log(`👥 Total de usuários únicos: ${usuariosPorEmail.size}\n`);

    let usuariosCriados = 0;
    let pagamentosCriados = 0;
    let churnsCriados = 0;
    let agendasCriadas = 0;
    let erros = 0;

    // Processar cada usuário
    for (const [email, registros] of usuariosPorEmail.entries()) {
      try {
        // Ordenar registros por data de pagamento (mais recente primeiro)
        const registrosOrdenados = registros.sort((a, b) => {
          const dateA = parseDate(a.DATA_PAGTO);
          const dateB = parseDate(b.DATA_PAGTO);
          if (!dateA || !dateB) return 0;
          return dateB.getTime() - dateA.getTime();
        });

        // Usar dados do registro mais recente para o usuário
        const ultimoRegistro = registrosOrdenados[0];

        // Criar ou atualizar usuário
        const usuario = await prisma.usuario.upsert({
          where: { emailLogin: email },
          update: {
            nomeCompleto: ultimoRegistro.NOME_COMPLETO,
            telefone: ultimoRegistro.TELEFONE || null,
            indicador: ultimoRegistro.INDICADOR || null,
            statusFinal: parseStatusFinal(ultimoRegistro.STATUS_FINAL),
            metodo: parseMetodoPagamento(ultimoRegistro['M�TODO']), // Fixed encoding
            conta: parseContaFinanceira(ultimoRegistro.CONTA),
            ciclo: parseInt(ultimoRegistro.CICLO) || 0,
            totalCiclosUsuario: parseInt(ultimoRegistro.TOTAL_CICLOS_USUARIO) || 0,
            dataPagto: parseDate(ultimoRegistro.DATA_PAGTO),
            mesPagto: ultimoRegistro['M�S_PAGTO'] || null, // Fixed encoding
            diasAcesso: parseInt(ultimoRegistro.DIAS_ACESSO) || null,
            dataVenc: parseDate(ultimoRegistro.DATA_VENC),
            diasParaVencer: parseInt(ultimoRegistro.DIAS_PARA_VENCER) || null,
            venceHoje: parseBoolean(ultimoRegistro.VENCE_HOJE),
            prox7Dias: parseBoolean(ultimoRegistro.PROX_7_DIAS),
            emAtraso: parseBoolean(ultimoRegistro.EM_ATRASO),
            obs: ultimoRegistro.OBS || null,
            flagAgenda: parseBoolean(ultimoRegistro.FLAG_AGENDA),
            mesRef: ultimoRegistro.MES_REF || null,
            entrou: parseBoolean(ultimoRegistro.ENTROU),
            renovou: parseBoolean(ultimoRegistro.RENOVOU),
            ativoAtual: parseBoolean(ultimoRegistro.ATIVO_ATUAL),
            churn: parseBoolean(ultimoRegistro.CHURN),
            regraTipo: parseRegraTipo(ultimoRegistro.REGRA_TIPO),
            regraValor: parseValor(ultimoRegistro.REGRA_VALOR),
            elegivelComissao: parseBoolean(ultimoRegistro['ELEGIVEL_COMISS�O']), // Fixed encoding
            comissaoValor: parseValor(ultimoRegistro['COMISS�O_VALOR']) || null, // Fixed encoding
          },
          create: {
            emailLogin: email,
            nomeCompleto: ultimoRegistro.NOME_COMPLETO,
            telefone: ultimoRegistro.TELEFONE || null,
            indicador: ultimoRegistro.INDICADOR || null,
            statusFinal: parseStatusFinal(ultimoRegistro.STATUS_FINAL),
            metodo: parseMetodoPagamento(ultimoRegistro['M�TODO']), // Fixed encoding
            conta: parseContaFinanceira(ultimoRegistro.CONTA),
            ciclo: parseInt(ultimoRegistro.CICLO) || 0,
            totalCiclosUsuario: parseInt(ultimoRegistro.TOTAL_CICLOS_USUARIO) || 0,
            dataPagto: parseDate(ultimoRegistro.DATA_PAGTO),
            mesPagto: ultimoRegistro['M�S_PAGTO'] || null, // Fixed encoding
            diasAcesso: parseInt(ultimoRegistro.DIAS_ACESSO) || null,
            dataVenc: parseDate(ultimoRegistro.DATA_VENC),
            diasParaVencer: parseInt(ultimoRegistro.DIAS_PARA_VENCER) || null,
            venceHoje: parseBoolean(ultimoRegistro.VENCE_HOJE),
            prox7Dias: parseBoolean(ultimoRegistro.PROX_7_DIAS),
            emAtraso: parseBoolean(ultimoRegistro.EM_ATRASO),
            obs: ultimoRegistro.OBS || null,
            flagAgenda: parseBoolean(ultimoRegistro.FLAG_AGENDA),
            mesRef: ultimoRegistro.MES_REF || null,
            entrou: parseBoolean(ultimoRegistro.ENTROU),
            renovou: parseBoolean(ultimoRegistro.RENOVOU),
            ativoAtual: parseBoolean(ultimoRegistro.ATIVO_ATUAL),
            churn: parseBoolean(ultimoRegistro.CHURN),
            regraTipo: parseRegraTipo(ultimoRegistro.REGRA_TIPO),
            regraValor: parseValor(ultimoRegistro.REGRA_VALOR),
            elegivelComissao: parseBoolean(ultimoRegistro['ELEGIVEL_COMISS�O']), // Fixed encoding
            comissaoValor: parseValor(ultimoRegistro['COMISS�O_VALOR']) || null, // Fixed encoding
          },
        });

        usuariosCriados++;

        // Criar pagamentos para cada registro do usuário
        for (const registro of registrosOrdenados) {
          const valor = parseValor(registro.VALOR);
          const metodo = parseMetodoPagamento(registro['M�TODO']); // Fixed encoding
          const conta = parseContaFinanceira(registro.CONTA);
          const dataPagto = parseDate(registro.DATA_PAGTO);
          const ciclo = parseInt(registro.CICLO) || 0;

          // Inferir regra_tipo baseado no ciclo se não estiver preenchido
          let regraTipo = parseRegraTipo(registro.REGRA_TIPO);
          if (!regraTipo && ciclo > 0) {
            regraTipo = ciclo === 1 ? RegraTipo.PRIMEIRO : RegraTipo.RECORRENTE;
          }

          // Só criar pagamento se tiver valor, método, conta e data válidos
          if (valor > 0 && metodo && conta && dataPagto && regraTipo) {
            const pagamento = await prisma.pagamento.create({
              data: {
                usuarioId: usuario.id,
                dataPagto,
                mesPagto: registro['M�S_PAGTO'], // Fixed encoding
                valor,
                metodo,
                conta,
                regraTipo,
                regraValor: parseValor(registro.REGRA_VALOR),
                elegivelComissao: parseBoolean(registro['ELEGIVEL_COMISS�O']), // Fixed encoding
                comissaoValor: parseValor(registro['COMISS�O_VALOR']) || null, // Fixed encoding
                observacao: registro.OBS || null,
              },
            });

            pagamentosCriados++;

            // Se elegível para comissão e tem indicador, criar registro de comissão
            if (parseBoolean(registro['ELEGIVEL_COMISS�O']) && registro.INDICADOR && parseValor(registro['COMISS�O_VALOR']) > 0) { // Fixed encoding
              await prisma.comissao.create({
                data: {
                  pagamentoId: pagamento.id,
                  indicador: registro.INDICADOR,
                  regraTipo,
                  valor: parseValor(registro['COMISS�O_VALOR']), // Fixed encoding
                  mesRef: registro.MES_REF,
                },
              });
            }
          }

          // Criar registro de churn se aplicável
          if (parseBoolean(registro.CHURN) && registro.K_CHURN) {
            const dataChurn = parseDate(registro.DATA_VENC) || parseDate(registro.DATA_PAGTO);
            if (dataChurn) {
              await prisma.churn.create({
                data: {
                  usuarioId: usuario.id,
                  dataChurn,
                  motivo: 'Não renovou',
                },
              });
              churnsCriados++;
            }
          }
        }

        // Criar registro na agenda se o último registro tiver flag_agenda
        if (parseBoolean(ultimoRegistro.FLAG_AGENDA) && parseBoolean(ultimoRegistro.E_ULTIMO)) {
          const dataVenc = parseDate(ultimoRegistro.DATA_VENC);
          if (dataVenc) {
            await prisma.agenda.create({
              data: {
                usuarioId: usuario.id,
                dataVenc,
                diasParaVencer: parseInt(ultimoRegistro.DIAS_PARA_VENCER) || 0,
                status: 'ATIVO', // Sempre ATIVO - status do usuário não afeta agenda
                ciclo: parseInt(ultimoRegistro.CICLO) || 0,
              },
            });
            agendasCriadas++;
          }
        }

        console.log(`✅ ${usuario.nomeCompleto} - ${registrosOrdenados.length} pagamento(s)`);

      } catch (error) {
        console.error(`❌ Erro ao processar ${email}:`, error);
        erros++;
      }
    }

    console.log('\n📈 RESUMO DA IMPORTAÇÃO:');
    console.log(`   Usuários criados/atualizados: ${usuariosCriados}`);
    console.log(`   Pagamentos criados: ${pagamentosCriados}`);
    console.log(`   Churns registrados: ${churnsCriados}`);
    console.log(`   Agendas criadas: ${agendasCriadas}`);
    console.log(`   Erros: ${erros}`);
    console.log('\n✨ Importação concluída!\n');

  } catch (error) {
    console.error('❌ Erro fatal na importação:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar importação
importarDados()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
