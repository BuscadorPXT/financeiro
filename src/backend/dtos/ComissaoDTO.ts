/**
 * Comissao DTOs
 *
 * Define os Data Transfer Objects para a entidade Comissao
 */

import { RegraTipo } from '@prisma/client';

export interface CreateComissaoDTO {
  pagamentoId: string;
  indicador: string;
  regraTipo: RegraTipo;
  valor: number;
  mesRef: string;
}

export interface UpdateComissaoDTO {
  indicador?: string;
  valor?: number;
  mesRef?: string;
}

export interface ComissaoResponseDTO {
  id: string;
  pagamentoId: string;
  indicador: string;
  regraTipo: RegraTipo;
  valor: number;
  mesRef: string;
  createdAt: Date;
  updatedAt: Date;
  pagamento?: {
    id: string;
    dataPagto: Date;
    valor: number;
    metodo: string;
    usuarioId: string;
    usuario?: {
      id: string;
      emailLogin: string;
      nomeCompleto: string;
    };
  };
}

export interface ComissaoStatsDTO {
  totalComissoes: number;
  valorTotal: number;
  primeirasAdesoes: number;
  valorPrimeiras: number;
  recorrentes: number;
  valorRecorrentes: number;
  totalIndicadores: number;
}

export interface ComissaoPorIndicadorDTO {
  indicador: string;
  totalComissoes: number;
  valorTotal: number;
  primeirasAdesoes: number;
  valorPrimeiras: number;
  recorrentes: number;
  valorRecorrentes: number;
}

export interface ComissaoPorMesDTO {
  mes: string;
  totalComissoes: number;
  valorTotal: number;
  primeirasAdesoes: number;
  valorPrimeiras: number;
  recorrentes: number;
  valorRecorrentes: number;
  indicadores: number;
}

export interface ComissaoExtratoDTO {
  id: string;
  mes: string;
  regraTipo: RegraTipo;
  valor: number;
  dataPagto: Date;
  usuario: {
    emailLogin: string;
    nomeCompleto: string;
  };
}
