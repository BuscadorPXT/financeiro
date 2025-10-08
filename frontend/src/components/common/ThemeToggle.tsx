import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
      aria-label={`Mudar para tema ${theme === 'light' ? 'escuro' : 'claro'}`}
      title={`Mudar para tema ${theme === 'light' ? 'escuro' : 'claro'}`}
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5 text-[var(--text-primary)]" />
      ) : (
        <Sun className="w-5 h-5 text-[var(--text-primary)]" />
      )}
    </button>
  );
};

export default ThemeToggle;
