import { Router } from 'express';
import relatorioController from '../controllers/relatorioController';
import { reportsLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validationMiddleware';
import {
  periodoQuerySchema,
  relatorioFinanceiroQuerySchema,
  relatorioUsuariosQuerySchema,
  desempenhoMensalQuerySchema,
} from '../schemas/relatorio.schemas';

const router = Router();

// Aplicar rate limiting em todas as rotas de relatórios
// Limite: 30 requisições por 15 minutos por IP
// (queries pesadas que consomem recursos do banco)
router.use(reportsLimiter);

// GET /api/relatorios/dashboard - Dashboard principal
router.get('/dashboard', validate({ query: periodoQuerySchema }), relatorioController.getDashboard);

// GET /api/relatorios/financeiro - Relatório financeiro
router.get('/financeiro', validate({ query: relatorioFinanceiroQuerySchema }), relatorioController.getRelatorioFinanceiro);

// GET /api/relatorios/usuarios - Relatório de usuários
router.get('/usuarios', validate({ query: relatorioUsuariosQuerySchema }), relatorioController.getRelatorioUsuarios);

// GET /api/relatorios/desempenho-mensal - Desempenho mensal
router.get('/desempenho-mensal', validate({ query: desempenhoMensalQuerySchema }), relatorioController.getDesempenhoMensal);

// GET /api/relatorios/agenda - Relatório de agenda
router.get('/agenda', validate({ query: periodoQuerySchema }), relatorioController.getRelatorioAgenda);

export default router;
