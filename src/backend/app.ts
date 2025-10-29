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

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
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
