import { AppError } from './AppError';

/**
 * Erro de autenticação
 *
 * Usado quando o usuário não está autenticado ou o token é inválido.
 * Status HTTP: 401 Unauthorized
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Não autenticado') {
    super(message, 401, true, 'UNAUTHORIZED');
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}
