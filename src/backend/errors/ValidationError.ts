import { AppError } from './AppError';

/**
 * Erro de validação de dados
 *
 * Usado quando os dados fornecidos pelo cliente são inválidos.
 * Status HTTP: 400 Bad Request
 */
export class ValidationError extends AppError {
  public readonly errors?: Array<{
    field: string;
    message: string;
  }>;

  constructor(
    message: string = 'Erro de validação',
    errors?: Array<{ field: string; message: string }>
  ) {
    super(message, 400, true, 'VALIDATION_ERROR');
    this.errors = errors;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}
