import { AppError } from './AppError';

/**
 * Erro de recurso não encontrado
 *
 * Usado quando um recurso solicitado não existe no sistema.
 * Status HTTP: 404 Not Found
 */
export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id
      ? `${resource} com ID ${id} não encontrado`
      : `${resource} não encontrado`;

    super(message, 404, true, 'NOT_FOUND');
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}
