import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ListChecks,
  Target,
  Users,
  CreditCard,
  TrendingDown,
  Calendar,
  UserX,
  Banknote,
  BarChart3,
  Archive,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User as UserIcon,
  Shield,
} from 'lucide-react';
import clsx from 'clsx';
import Badge from './Badge';
import Tooltip from './Tooltip';
import { useAuth } from '../../contexts/AuthContext';

interface MenuItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  adminOnly?: boolean;
}

const menuItems: MenuItem[] = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Listas', path: '/listas', icon: ListChecks },
  { name: 'Prospecção', path: '/prospeccao', icon: Target },
  { name: 'Usuários', path: '/usuarios', icon: Users },
  { name: 'Pagamentos', path: '/pagamentos', icon: CreditCard },
  { name: 'Despesas', path: '/despesas', icon: TrendingDown },
  { name: 'Agenda', path: '/agenda', icon: Calendar, badge: 5 },
  { name: 'Churn', path: '/churn', icon: UserX },
  { name: 'Comissões', path: '/comissoes', icon: Banknote },
  { name: 'Relatórios', path: '/relatorios', icon: BarChart3 },
  { name: 'Usuários Excluídos', path: '/usuarios-excluidos', icon: Archive },
  { name: 'Gerenciar Usuários', path: '/admin-users', icon: Shield, adminOnly: true },
];

const Sidebar = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout, isAdmin } = useAuth();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleLogout = () => {
    if (window.confirm('Deseja realmente sair do sistema?')) {
      logout();
    }
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 256 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={clsx(
        'bg-gradient-to-b from-gray-900 to-gray-800',
        'text-white flex flex-col relative',
        'border-r border-gray-700'
      )}
    >
      {/* Logo e Toggle */}
      <div className={clsx(
        'p-6 border-b border-gray-700',
        'flex items-center',
        isCollapsed ? 'justify-center' : 'justify-between'
      )}>
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <img
                src="/logo_branca_buscador_pxt_fundo_transparente.png"
                alt="Buscador"
                className="h-12 w-auto"
              />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <img
                src="/logo_branca_buscador_pxt_fundo_transparente.png"
                alt="Buscador"
                className="h-8 w-auto"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={toggleSidebar}
          className={clsx(
            'p-2 rounded-lg',
            'hover:bg-gray-700/50',
            'transition-colors duration-200',
            isCollapsed && 'mx-auto'
          )}
          aria-label={isCollapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            // Filtrar itens admin-only se não for admin
            if (item.adminOnly && !isAdmin) {
              return null;
            }

            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            const navItem = (
              <Link
                to={item.path}
                className={clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-lg',
                  'transition-all duration-200 relative group',
                  'hover:translate-x-1',
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-gray-300 hover:bg-gray-700/50 hover:text-white',
                  isCollapsed && 'justify-center px-0'
                )}
              >
                {/* Indicador visual do item ativo */}
                {isActive && !isCollapsed && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400 rounded-r"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}

                <Icon className={clsx(
                  'w-5 h-5 transition-transform duration-200',
                  'group-hover:scale-110',
                  isActive && 'text-cyan-300'
                )} />

                <AnimatePresence mode="wait">
                  {!isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center justify-between flex-1"
                    >
                      <span className="font-medium">{item.name}</span>
                      {item.badge && (
                        <Badge variant="danger" size="sm">
                          {item.badge}
                        </Badge>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Badge quando colapsado */}
                {isCollapsed && item.badge && (
                  <div className="absolute -top-1 -right-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  </div>
                )}
              </Link>
            );

            return (
              <li key={item.path}>
                {isCollapsed ? (
                  <Tooltip content={item.name} position="right">
                    {navItem}
                  </Tooltip>
                ) : (
                  navItem
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Section */}
      <div className={clsx(
        'border-t border-gray-700',
        isCollapsed ? 'p-2' : 'p-4'
      )}>
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="space-y-3"
            >
              {/* User Info */}
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-700/30">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                  <UserIcon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.nome || 'Usuário'}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {user?.login || ''}
                  </p>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className={clsx(
                  'w-full flex items-center gap-3 px-4 py-2.5 rounded-lg',
                  'transition-all duration-200',
                  'text-gray-300 hover:bg-red-600/20 hover:text-red-400',
                  'border border-transparent hover:border-red-600/30'
                )}
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sair do Sistema</span>
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              {/* User Avatar (collapsed) */}
              <Tooltip content={user?.nome || 'Usuário'} position="right">
                <div className="w-10 h-10 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-white" />
                </div>
              </Tooltip>

              {/* Logout Button (collapsed) */}
              <Tooltip content="Sair do Sistema" position="right">
                <button
                  onClick={handleLogout}
                  className={clsx(
                    'w-10 h-10 mx-auto flex items-center justify-center rounded-lg',
                    'transition-all duration-200',
                    'text-gray-300 hover:bg-red-600/20 hover:text-red-400',
                    'border border-transparent hover:border-red-600/30'
                  )}
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </Tooltip>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className={clsx(
        'p-4 border-t border-gray-700',
        isCollapsed && 'px-2'
      )}>
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs text-gray-400 text-center"
            >
              © 2025 Sistema Financeiro
            </motion.p>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs text-gray-400 text-center"
            >
              <div className="w-8 h-0.5 bg-gray-700 mx-auto" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
