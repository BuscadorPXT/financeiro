import { AppError } from './AppError';

/**
 * Erro de autorização
 *
 * Usado quando o usuário está autenticado mas não tem permissão
 * para realizar a ação solicitada.
 * Status HTTP: 403 Forbidden
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Permissão negada') {
    super(message, 403, true, 'FORBIDDEN');
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}
