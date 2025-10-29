import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

/**
 * Middleware para logar todas as requisições HTTP
 *
 * Captura: método, URL, status, tempo de resposta, user ID
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  // Captura quando a resposta é finalizada
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const { method, originalUrl, ip } = req;
    const { statusCode } = res;

    // Determina nível de log baseado no status code
    const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'http';

    logger.log(level, `${method} ${originalUrl}`, {
      method,
      url: originalUrl,
      statusCode,
      duration: `${duration}ms`,
      ip,
      userAgent: req.headers['user-agent'],
      userId: req.user?.id,
    });
  });

  next();
};

/**
 * Middleware para ignorar logging de rotas específicas
 */
export const skipLogging = (patterns: RegExp[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const shouldSkip = patterns.some((pattern) => pattern.test(req.path));

    if (shouldSkip) {
      // Marca para o requestLogger ignorar
      (req as any).skipLogging = true;
    }

    next();
  };
};
