import rateLimit from 'express-rate-limit';

/**
 * Rate limiter global para todas as rotas da API
 *
 * Limites:
 * - 100 requisições por 15 minutos por IP
 * - Útil para prevenir abuso geral da API
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Máximo de 100 requisições por windowMs
  message: {
    status: 'error',
    message: 'Muitas requisições deste IP. Tente novamente em 15 minutos.',
  },
  standardHeaders: true, // Retorna rate limit info nos headers `RateLimit-*`
  legacyHeaders: false, // Desabilita headers `X-RateLimit-*`
  // Skip successful requests to only count failed attempts
  skipSuccessfulRequests: false,
});

/**
 * Rate limiter específico para rotas de autenticação
 *
 * Limites:
 * - 5 tentativas de login por 15 minutos por IP
 * - Proteção contra brute force de senha
 * - Reseta contador após login bem-sucedido
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Máximo de 5 tentativas
  message: {
    status: 'error',
    message:
      'Muitas tentativas de login falhadas. Tente novamente em 15 minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Só conta tentativas falhadas (status !== 200)
  skipSuccessfulRequests: true,
});

/**
 * Rate limiter para operações críticas (delete, import, etc)
 *
 * Limites:
 * - 10 operações por 15 minutos por IP
 * - Previne operações em massa acidentais ou maliciosas
 */
export const criticalOperationsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // Máximo de 10 operações
  message: {
    status: 'error',
    message:
      'Muitas operações críticas em pouco tempo. Aguarde 15 minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

/**
 * Rate limiter para relatórios e queries pesadas
 *
 * Limites:
 * - 30 requisições por 15 minutos por IP
 * - Protege contra queries pesadas que consomem recursos
 */
export const reportsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 30, // Máximo de 30 requisições
  message: {
    status: 'error',
    message:
      'Muitas requisições de relatórios. Aguarde alguns minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});
