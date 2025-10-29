/**
 * Lista (ListaAuxiliar) DTOs
 *
 * Define os Data Transfer Objects para a entidade ListaAuxiliar
 */

import { TipoLista } from '@prisma/client';

export interface CreateListaDTO {
  tipo: TipoLista;
  valor: string;
  ativo?: boolean;
}

export interface UpdateListaDTO {
  valor?: string;
  ativo?: boolean;
}

export interface ListaResponseDTO {
  id: string;
  tipo: TipoLista;
  valor: string;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListasAgrupadasDTO {
  [key: string]: ListaResponseDTO[];
}
