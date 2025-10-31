import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { globalLimiter } from './middleware/rateLimiter';
import { requestLogger } from './middleware/requestLogger';
import logger from './config/logger';
import routes from './routes';

// Load environment variables
dotenv.config();

const app: Express = express();

// CORS configuration (ANTES do helmet para evitar conflitos)
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://financeiro-i31u.vercel.app',
  process.env.CORS_ORIGIN,
].filter(Boolean);

logger.info('CORS configurado com origens permitidas:', { allowedOrigins });

app.use(
  cors({
    origin: (origin, callback) => {
      // Permite requests sem origin (mobile apps, curl, etc)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn('CORS bloqueado para origem:', { origin });
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400, // 24 horas - cache de preflight requests
  })
);

// Security middleware (DEPOIS do CORS)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false, // Desabilita CSP que pode conflitar com SPA
  })
);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging (Winston)
app.use(requestLogger);

// Log application startup
logger.info('Financeiro API iniciado', {
  environment: process.env.NODE_ENV || 'development',
  nodeVersion: process.version,
});

// Health check endpoint (sem rate limiting)
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
  });
});

// Keepalive endpoint para prevenir cold starts do Render
// Frontend pode fazer ping a cada 10 minutos
app.get('/keepalive', (_req, res) => {
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    message: 'Server is warm',
  });
});

// CORS test endpoint para debug
app.options('*', cors()); // Habilita preflight para todas as rotas
app.get('/cors-test', (_req, res) => {
  res.json({
    status: 'CORS is working',
    timestamp: new Date().toISOString(),
    allowedOrigins,
  });
});

// Rate limiting global para todas as rotas /api/*
// Limite: 100 requisições por 15 minutos por IP
app.use('/api', globalLimiter);

// API routes
app.use('/api', routes);

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
