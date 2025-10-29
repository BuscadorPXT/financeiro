/**
 * Prospeccao DTOs
 *
 * Define os Data Transfer Objects para a entidade Prospeccao
 */

export interface CreateProspeccaoDTO {
  email: string;
  nome: string;
  telefone?: string;
  origem?: string;
  indicador?: string;
}

export interface UpdateProspeccaoDTO {
  email?: string;
  nome?: string;
  telefone?: string;
  origem?: string;
  indicador?: string;
}

export interface ProspeccaoResponseDTO {
  id: string;
  email: string;
  nome: string;
  telefone: string | null;
  origem: string | null;
  indicador: string | null;
  convertido: boolean;
  usuarioId: string | null;
  createdAt: Date;
  updatedAt: Date;
  usuario?: {
    id: string;
    emailLogin: string;
    nomeCompleto: string;
    statusFinal: string;
    ciclo: number;
    createdAt: Date;
  };
}

export interface ProspeccaoStatsDTO {
  totalProspeccoes: number;
  convertidas: number;
  naoConvertidas: number;
  taxaConversao: number;
  porOrigem: Array<{
    origem: string;
    total: number;
    convertidas: number;
  }>;
  porIndicador: Array<{
    indicador: string;
    total: number;
    convertidas: number;
  }>;
}

export interface ConversaoProspeccaoDTO {
  telefone?: string;
  indicador?: string;
}
