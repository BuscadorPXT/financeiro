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

/**
 * DTO para atualização de usuário
 *
 * NOTA: statusFinal não está incluso pois é calculado automaticamente.
 * Use o endpoint PUT /api/usuarios/:id/atualizar-flags para recalcular o status.
 *
 * O status é calculado baseado em:
 * - emAtraso (dataVenc passada) → EM_ATRASO
 * - diasParaVencer >= 1 → ATIVO
 * - Sem dataVenc → INATIVO
 */
export interface UpdateUsuarioDTO {
  emailLogin?: string;
  nomeCompleto?: string;
  telefone?: string;
  indicador?: string;
  ciclo?: number;
  dataPagto?: Date;
  dataVenc?: Date;
  churn?: boolean;
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
  churn: boolean;
  diasParaVencer: number | null;
  dataVenc: Date | null;
}
