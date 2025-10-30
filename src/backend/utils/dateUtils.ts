import { BUSINESS_RULES } from '../../shared/constants';

/**
 * Calcula a data de vencimento baseada na data de pagamento e ciclo
 */
export function calcularDataVencimento(
  dataPagto: Date,
  cicloDias: number = BUSINESS_RULES.DEFAULT_CICLO_DIAS
): Date {
  const dataVenc = new Date(dataPagto);
  dataVenc.setDate(dataVenc.getDate() + cicloDias);
  return dataVenc;
}

/**
 * Calcula quantos dias faltam para o vencimento
 * Usa apenas a parte da data (ignora timezone) para evitar problemas de cálculo
 * CORREÇÃO: Usa Math.floor() para garantir consistência e evitar arredondamentos incorretos
 */
export function calcularDiasParaVencer(dataVenc: Date): number {
  // Cria data de hoje usando apenas ano, mês e dia (ignora timezone)
  const hoje = new Date();
  const hojeLocal = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

  // Cria data de vencimento usando apenas ano, mês e dia (ignora timezone)
  const vencimento = new Date(dataVenc);
  const vencimentoLocal = new Date(vencimento.getFullYear(), vencimento.getMonth(), vencimento.getDate());

  // Calcula diferença em dias usando Math.floor para garantir consistência
  // Floor: 0.9 dias = 0 dias (mais conservador para dias restantes)
  // Ceil seria usado para dias de atraso
  const diffTime = vencimentoLocal.getTime() - hojeLocal.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Verifica se vence hoje
 */
export function venceHoje(dataVenc: Date): boolean {
  const dias = calcularDiasParaVencer(dataVenc);
  return dias === 0;
}

/**
 * Verifica se vence nos próximos 7 dias
 */
export function venceProximos7Dias(dataVenc: Date): boolean {
  const dias = calcularDiasParaVencer(dataVenc);
  return dias > 0 && dias <= BUSINESS_RULES.DIAS_ALERTA_VENCIMENTO;
}

/**
 * Verifica se está em atraso
 */
export function emAtraso(dataVenc: Date): boolean {
  const dias = calcularDiasParaVencer(dataVenc);
  return dias < 0;
}

/**
 * Obtém o mês/ano de uma data no formato "MM/YYYY"
 */
export function getMesPagto(date: Date): string {
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const ano = date.getFullYear();
  return `${mes}/${ano}`;
}

/**
 * Obtém a competência (mês e ano) de uma data
 */
export function getCompetencia(date: Date): { mes: number; ano: number } {
  return {
    mes: date.getMonth() + 1,
    ano: date.getFullYear(),
  };
}
