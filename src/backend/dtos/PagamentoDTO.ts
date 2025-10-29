/**
 * Pagamento DTOs
 *
 * Define os Data Transfer Objects para a entidade Pagamento
 */

import { RegraTipo, MetodoPagamento } from '@prisma/client';

export interface CreatePagamentoDTO {
  usuarioId: string;
  dataPagto: Date;
  valor: number;
  metodo: MetodoPagamento;
  conta: string;
  regraTipo: RegraTipo;
  regraValor?: number;
  elegivelComissao?: boolean;
  observacao?: string;
}

export interface UpdatePagamentoDTO {
  dataPagto?: Date;
  valor?: number;
  metodo?: MetodoPagamento;
  conta?: string;
  observacao?: string;
}

export interface PagamentoResponseDTO {
  id: string;
  usuarioId: string;
  dataPagto: Date;
  mesPagto: string;
  valor: number;
  metodo: MetodoPagamento;
  conta: string;
  regraTipo: RegraTipo;
  regraValor: number | null;
  elegivelComissao: boolean;
  comissaoValor: number | null;
  observacao: string | null;
  createdAt: Date;
  updatedAt: Date;
  usuario?: {
    id: string;
    emailLogin: string;
    nomeCompleto: string;
    statusFinal: string;
  };
}

export interface PagamentoStatsDTO {
  totalPagamentos: number;
  totalReceita: number;
  receitaMes: number;
  primeirasAdesoes: number;
  renovacoes: number;
  valorMedioPagamento: number;
  pagamentosElegiveis: number;
  totalComissoes: number;
}
