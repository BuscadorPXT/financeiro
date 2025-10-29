/**
 * Agenda DTOs
 *
 * Define os Data Transfer Objects para a entidade Agenda
 */

import { StatusAgenda } from '@prisma/client';

export interface CreateAgendaDTO {
  usuarioId: string;
  dataVenc: Date;
  ciclo: number;
  status?: StatusAgenda;
}

export interface UpdateAgendaDTO {
  dataVenc?: Date;
  status?: StatusAgenda;
  ciclo?: number;
}

export interface AgendaResponseDTO {
  id: string;
  usuarioId: string;
  dataVenc: Date;
  diasParaVencer: number;
  status: StatusAgenda;
  ciclo: number;
  renovou: boolean;
  cancelou: boolean;
  createdAt: Date;
  updatedAt: Date;
  usuario?: {
    id: string;
    emailLogin: string;
    nomeCompleto: string;
    telefone: string | null;
    statusFinal: string;
  };
}

export interface AgendaStatsDTO {
  totalAtivos: number;
  vencidos: number;
  vencemHoje: number;
  vencemProximos7Dias: number;
  vencemMesAtual: number;
  renovados: number;
  cancelados: number;
}
