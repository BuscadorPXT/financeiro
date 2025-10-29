/**
 * Tipos para paginação padronizada
 */

export interface PaginationQuery {
  page?: string | number;
  limit?: string | number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  status: 'success';
  data: T[];
  pagination: PaginationMeta;
}

/**
 * Helper para criar metadata de paginação
 */
export function createPaginationMeta(
  page: number,
  limit: number,
  total: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

/**
 * Helper para parsear query de paginação
 */
export function parsePaginationQuery(query: PaginationQuery): PaginationParams {
  const page = query.page ? Number(query.page) : 1;
  const limit = query.limit ? Number(query.limit) : 20;

  // Validações
  const validPage = Math.max(1, page);
  const validLimit = Math.min(Math.max(1, limit), 100); // Max 100 items por página

  return {
    page: validPage,
    limit: validLimit,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder || 'desc',
  };
}
