import winston from 'winston';
import path from 'path';

const { combine, timestamp, errors, json, printf, colorize, simple } = winston.format;

/**
 * Níveis de log customizados
 */
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

/**
 * Cores para cada nível (apenas para console)
 */
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

winston.addColors(colors);

/**
 * Formato para logs em desenvolvimento (human-readable)
 */
const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'HH:mm:ss' }),
  printf((info) => {
    const { timestamp, level, message, ...meta } = info;
    let metaStr = '';
    if (Object.keys(meta).length > 0) {
      metaStr = `\n${JSON.stringify(meta, null, 2)}`;
    }
    return `${timestamp} [${level}]: ${message}${metaStr}`;
  })
);

/**
 * Formato para logs em produção (JSON estruturado)
 */
const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

/**
 * Determina o nível de log baseado no ambiente
 */
function getLogLevel(): string {
  const env = process.env.NODE_ENV || 'development';

  if (env === 'development') {
    return process.env.LOG_LEVEL || 'debug';
  }

  if (env === 'test') {
    return 'error'; // Silencia logs durante testes
  }

  return 'info'; // Produção
}

/**
 * Cria diretório de logs se não existir
 */
const logsDir = path.join(process.cwd(), 'logs');

/**
 * Logger principal
 */
const logger = winston.createLogger({
  level: getLogLevel(),
  levels,
  format: process.env.NODE_ENV === 'production' ? prodFormat : devFormat,
  defaultMeta: {
    service: 'financeiro-api',
    environment: process.env.NODE_ENV || 'development',
  },
  transports: [
    // Console (sempre ativo exceto em test)
    new winston.transports.Console({
      silent: process.env.NODE_ENV === 'test',
    }),
  ],
});

// Em produção, adiciona transports de arquivo
if (process.env.NODE_ENV === 'production') {
  logger.add(
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );

  logger.add(
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 10,
    })
  );
}

/**
 * Stream para integração com Morgan (HTTP logs)
 */
export const stream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

/**
 * Helper para log de erros com contexto
 */
export function logError(error: Error, context?: Record<string, any>) {
  logger.error(error.message, {
    stack: error.stack,
    ...context,
  });
}

/**
 * Helper para log de requisições HTTP
 */
export function logRequest(
  method: string,
  url: string,
  statusCode: number,
  responseTime: number,
  userId?: string
) {
  logger.http('HTTP Request', {
    method,
    url,
    statusCode,
    responseTime: `${responseTime}ms`,
    userId,
  });
}

export default logger;
