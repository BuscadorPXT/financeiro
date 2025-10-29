/**
 * Usuario DTOs
 *
 * Define os Data Transfer Objects para a entidade Usuario
 */

import { StatusFinal } from '@prisma/client';

export interface CreateUsuarioDTO {
  emailLogin: string;
  nomeCompleto: string;
  telefone?: string;
  indicador?: string;
  ciclo?: number;
  statusFinal?: StatusFinal;
}

export interface UpdateUsuarioDTO {
  emailLogin?: string;
  nomeCompleto?: string;
  telefone?: string;
  indicador?: string;
  ciclo?: number;
  statusFinal?: StatusFinal;
  dataPagto?: Date;
  dataVenc?: Date;
  churn?: boolean;
  ativoAtual?: boolean;
}

export interface UsuarioResponseDTO {
  id: string;
  emailLogin: string;
  nomeCompleto: string;
  telefone: string | null;
  indicador: string | null;
  statusFinal: StatusFinal;
  ciclo: number;
  totalCiclosUsuario: number;
  entrou: boolean;
  renovou: boolean;
  ativoAtual: boolean;
  churn: boolean;
  dataPagto: Date | null;
  mesPagto: string | null;
  dataVenc: Date | null;
  diasParaVencer: number | null;
  venceHoje: boolean;
  prox7Dias: boolean;
  emAtraso: boolean;
  metodo: string | null;
  conta: string | null;
  regraTipo: string | null;
  regraValor: number | null;
  elegivelComissao: boolean;
  comissaoValor: number | null;
  flagAgenda: boolean;
  mesRef: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UsuarioListItemDTO {
  id: string;
  emailLogin: string;
  nomeCompleto: string;
  telefone: string | null;
  statusFinal: StatusFinal;
  ciclo: number;
  ativoAtual: boolean;
  churn: boolean;
  diasParaVencer: number | null;
  dataVenc: Date | null;
}
