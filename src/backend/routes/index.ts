import { Router } from 'express';
import authRoutes from './auth.routes';
import listaRoutes from './lista.routes';
import usuarioRoutes from './usuario.routes';
import pagamentoRoutes from './pagamento.routes';
import despesaRoutes from './despesa.routes';
import agendaRoutes from './agenda.routes';
import churnRoutes from './churn.routes';
import comissaoRoutes from './comissao.routes';
import prospeccaoRoutes from './prospeccao.routes';
import relatorioRoutes from './relatorio.routes';
import adminRoutes from './admin.routes';
import adminUsersRoutes from './adminUsers.routes';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// Test route (pública)
router.get('/', (_req, res) => {
  res.json({
    message: 'API FINANCASBUSCADOR - Sistema de Controle Financeiro',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api',
      auth: '/api/auth',
      admin: '/api/admin',
      adminUsers: '/api/admin-users',
      listas: '/api/listas',
      usuarios: '/api/usuarios',
      pagamentos: '/api/pagamentos',
      despesas: '/api/despesas',
      agenda: '/api/agenda',
      churn: '/api/churn',
      comissoes: '/api/comissoes',
      prospeccao: '/api/prospeccao',
      relatorios: '/api/relatorios',
    },
  });
});

// Rotas de autenticação (públicas)
router.use('/auth', authRoutes);

// Rotas admin (protegidas por senha custom - importação de dados)
router.use('/admin', adminRoutes);

// Rotas de gerenciamento de usuários do sistema (protegidas por auth + role admin)
router.use('/admin-users', adminUsersRoutes);

// TODAS as outras rotas protegidas por autenticação
router.use('/listas', authenticate, listaRoutes);
router.use('/usuarios', authenticate, usuarioRoutes);
router.use('/pagamentos', authenticate, pagamentoRoutes);
router.use('/despesas', authenticate, despesaRoutes);
router.use('/agenda', authenticate, agendaRoutes);
router.use('/churn', authenticate, churnRoutes);
router.use('/comissoes', authenticate, comissaoRoutes);
router.use('/prospeccao', authenticate, prospeccaoRoutes);
router.use('/relatorios', authenticate, relatorioRoutes);

export default router;
