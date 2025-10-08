import type { ReactNode } from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}

const Card = ({
  title,
  subtitle,
  icon,
  children,
  action,
  className = '',
}: CardProps) => {
  return (
    <div className={`bg-[var(--bg-primary)] rounded-lg shadow-sm border border-[var(--border-color)] ${className}`}>
      {/* Header */}
      {(title || icon || action) && (
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            {icon && <div className="text-2xl">{icon}</div>}
            <div>
              {title && <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>}
              {subtitle && <p className="text-sm text-[var(--text-secondary)] mt-1">{subtitle}</p>}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}

      {/* Content */}
      <div className="p-6">{children}</div>
    </div>
  );
};

export default Card;
