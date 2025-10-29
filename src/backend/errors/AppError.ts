/**
 * Classe base para erros da aplicação
 *
 * Todos os erros operacionais devem estender esta classe.
 * Erros operacionais são erros esperados que podem acontecer durante
 * a operação normal do sistema (ex: usuário não encontrado, validação falhou).
 *
 * Erros não-operacionais são bugs de programação (ex: null reference).
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    code?: string
  ) {
    super(message);

    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;

    // Mantém o stack trace correto
    Error.captureStackTrace(this, this.constructor);

    // Define o nome da classe para facilitar debug
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
