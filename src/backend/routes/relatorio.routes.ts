import { Router } from 'express';
import relatorioController from '../controllers/relatorioController';
import { reportsLimiter } from '../middleware/rateLimiter';

const router = Router();

// Aplicar rate limiting em todas as rotas de relatórios
// Limite: 30 requisições por 15 minutos por IP
// (queries pesadas que consomem recursos do banco)
router.use(reportsLimiter);

// GET /api/relatorios/dashboard - Dashboard principal
router.get('/dashboard', relatorioController.getDashboard);

// GET /api/relatorios/financeiro - Relatório financeiro
router.get('/financeiro', relatorioController.getRelatorioFinanceiro);

// GET /api/relatorios/usuarios - Relatório de usuários
router.get('/usuarios', relatorioController.getRelatorioUsuarios);

// GET /api/relatorios/desempenho-mensal - Desempenho mensal
router.get('/desempenho-mensal', relatorioController.getDesempenhoMensal);

// GET /api/relatorios/agenda - Relatório de agenda
router.get('/agenda', relatorioController.getRelatorioAgenda);

export default router;
