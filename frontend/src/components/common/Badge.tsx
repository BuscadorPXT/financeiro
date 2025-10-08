import { ReactNode } from 'react';
import clsx from 'clsx';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'danger' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  icon?: ReactNode;
  className?: string;
}

const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  icon,
  className = '',
}: BadgeProps) => {
  const baseClasses = clsx(
    'inline-flex items-center gap-1.5',
    'font-medium rounded-full',
    'transition-colors duration-200'
  );

  const variantClasses = {
    default: 'badge-default border',
    primary: 'badge-primary border',
    success: 'badge-success border',
    danger: 'badge-danger border',
    warning: 'badge-warning border',
    info: 'badge-info border',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  const dotColors = {
    default: 'bg-gray-500',
    primary: 'bg-blue-500',
    success: 'bg-green-500',
    danger: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-cyan-500',
  };

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <span
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {dot && (
        <span
          className={clsx(
            'w-1.5 h-1.5 rounded-full',
            dotColors[variant]
          )}
        />
      )}
      {icon && <span className={iconSizeClasses[size]}>{icon}</span>}
      {children}
    </span>
  );
};

export default Badge;
