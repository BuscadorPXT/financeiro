/**
 * Despesa DTOs
 *
 * Define os Data Transfer Objects para a entidade Despesa
 */

import { StatusDespesa } from '@prisma/client';

export interface CreateDespesaDTO {
  categoria: string;
  descricao: string;
  valor: number;
  conta?: string;
  indicador?: string;
  status?: StatusDespesa;
  competenciaMes: number;
  competenciaAno: number;
}

export interface UpdateDespesaDTO {
  categoria?: string;
  descricao?: string;
  valor?: number;
  conta?: string;
  indicador?: string;
  status?: StatusDespesa;
  competenciaMes?: number;
  competenciaAno?: number;
}

export interface DespesaResponseDTO {
  id: string;
  categoria: string;
  descricao: string;
  valor: number;
  conta: string | null;
  indicador: string | null;
  status: StatusDespesa;
  competenciaMes: number;
  competenciaAno: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DespesaStatsDTO {
  totalDespesas: number;
  valorTotal: number;
  valorPago: number;
  valorPendente: number;
  despesasPagas: number;
  despesasPendentes: number;
}

export interface DespesaPorCategoriaDTO {
  categoria: string;
  totalDespesas: number;
  valorTotal: number;
  valorPago: number;
  valorPendente: number;
}

export interface DespesaPorMesDTO {
  competencia: string;
  mes: number;
  ano: number;
  totalDespesas: number;
  valorTotal: number;
  valorPago: number;
  valorPendente: number;
  categorias: number;
}
