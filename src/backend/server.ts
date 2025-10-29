import app from './app';
import prisma from '../database/client';
import { executarImportacaoAutomatica } from './services/autoImportService';

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || 'localhost';

const server = app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://${HOST}:${PORT}/health`);
  console.log(`🌐 API endpoints: http://${HOST}:${PORT}/api`);

  // Executar importação automática se necessário
  // A função verifica internamente se já foi importado e se o arquivo existe
  try {
    await executarImportacaoAutomatica();
  } catch (error) {
    console.error('❌ Falha na importação automática:', error);
    console.log('   O servidor continuará funcionando normalmente');
  }
});

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('\n🛑 Shutting down gracefully...');

  server.close(async () => {
    console.log('📡 Server closed');

    try {
      await prisma.$disconnect();
      console.log('🔌 Database connection closed');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown();
});
