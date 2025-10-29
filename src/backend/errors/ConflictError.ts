import { AppError } from './AppError';

/**
 * Erro de conflito/duplicação
 *
 * Usado quando há tentativa de criar um recurso que já existe
 * (ex: email duplicado, registro único).
 * Status HTTP: 409 Conflict
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Registro duplicado') {
    super(message, 409, true, 'CONFLICT');
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}
