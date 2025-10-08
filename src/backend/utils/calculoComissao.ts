import { RegraTipo } from '../../generated/prisma';

/**
 * Calcula o valor da comissão baseado no tipo de regra e valor de referência
 */
export function calcularComissao(
  _valorPagamento: number,
  _regraTipo: RegraTipo,
  regraValor: number
): number {
  // Por simplicidade, assume-se que regraValor é o valor fixo da comissão
  // Pode ser expandido para percentuais no futuro (usando _valorPagamento e _regraTipo)
  return regraValor;
}

/**
 * Verifica se o pagamento é elegível para comissão
 */
export function isElegivelComissao(indicador: string | null): boolean {
  // Pagamentos sem indicador ou indicadores "Direto"/"Orgânico" não geram comissão
  if (!indicador || indicador === 'Direto' || indicador === 'Orgânico') {
    return false;
  }

  return true;
}

/**
 * Obtém a regra de comissão padrão baseada no tipo de pagamento
 */
export function getRegraComissaoPadrao(
  regraTipo: RegraTipo
): { regraValor: number; elegivel: boolean } {
  switch (regraTipo) {
    case RegraTipo.PRIMEIRO:
      return {
        regraValor: 100.0, // R$ 100 para primeira adesão
        elegivel: true,
      };
    case RegraTipo.RECORRENTE:
      return {
        regraValor: 70.0, // R$ 70 para recorrentes
        elegivel: true,
      };
    default:
      return {
        regraValor: 0,
        elegivel: false,
      };
  }
}
