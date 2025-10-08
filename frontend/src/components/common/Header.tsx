import { useAuth } from '../../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-[var(--bg-primary)] shadow-sm border-b border-[var(--border-color)] px-6 py-4 transition-colors">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          Sistema de Controle Financeiro
        </h1>

        <div className="flex items-center space-x-4">
          <span className="text-sm text-[var(--text-secondary)]">
            {new Date().toLocaleDateString('pt-BR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>

          {/* Informações do usuário e botão de logout */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-secondary)] rounded-md">
            <span className="text-sm text-[var(--text-primary)] font-medium">
              {user?.nome}
            </span>
            <button
              onClick={logout}
              className="text-sm text-[var(--text-secondary)] hover:text-red-600 dark:hover:text-red-400 transition-colors"
              title="Sair do sistema"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
