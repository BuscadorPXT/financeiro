/**
 * Churn DTOs
 *
 * Define os Data Transfer Objects para a entidade Churn
 */

export interface CreateChurnDTO {
  usuarioId: string;
  dataChurn: Date;
  motivo?: string;
}

export interface UpdateChurnDTO {
  dataChurn?: Date;
  motivo?: string;
}

export interface ChurnResponseDTO {
  id: string;
  usuarioId: string;
  dataChurn: Date;
  motivo: string | null;
  revertido: boolean;
  createdAt: Date;
  updatedAt: Date;
  usuario?: {
    id: string;
    emailLogin: string;
    nomeCompleto: string;
    telefone: string | null;
    statusFinal: string;
    indicador: string | null;
  };
}

export interface ChurnStatsDTO {
  totalChurns: number;
  churnAtivos: number;
  churnRevertidos: number;
  taxaReversao: number;
  churnPorMotivo: Array<{
    motivo: string;
    total: number;
  }>;
}

export interface ChurnUsuarioDTO {
  id: string;
  emailLogin: string;
  nomeCompleto: string;
  telefone: string | null;
  dataChurn: Date;
  motivo: string | null;
  diasDesdeChurn: number;
}
