/**
 * Common DTOs
 *
 * Define DTOs comuns usados em múltiplas entidades
 */

export interface PaginationDTO {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponseDTO<T> {
  data: T[];
  pagination: PaginationDTO;
}

export interface ErrorResponseDTO {
  message: string;
  statusCode: number;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface SuccessResponseDTO<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface FilterDTO {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DateRangeFilterDTO {
  dataInicio?: Date;
  dataFim?: Date;
}

export interface MonthYearFilterDTO {
  mes?: number;
  ano?: number;
}
