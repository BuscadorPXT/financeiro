import { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const Button = ({
  variant = 'primary',
  size = 'md',
  children,
  loading = false,
  disabled,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  ...props
}: ButtonProps) => {
  const baseClasses = clsx(
    'inline-flex items-center justify-center gap-2',
    'font-medium rounded-lg',
    'transition-all duration-200',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'relative overflow-hidden',
    fullWidth && 'w-full'
  );

  const variantClasses = {
    primary: clsx(
      'bg-blue-600 hover:bg-blue-700 text-white',
      'focus:ring-blue-500',
      'shadow-sm hover:shadow-md'
    ),
    secondary: clsx(
      'bg-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)]/80 text-[var(--text-primary)]',
      'focus:ring-blue-500',
      'shadow-sm hover:shadow-md',
      'border border-[var(--border-color)]'
    ),
    danger: clsx(
      'bg-red-600 hover:bg-red-700 text-white',
      'focus:ring-red-500',
      'shadow-sm hover:shadow-md'
    ),
    success: clsx(
      'bg-green-600 hover:bg-green-700 text-white',
      'focus:ring-green-500',
      'shadow-sm hover:shadow-md'
    ),
    outline: clsx(
      'border-2 border-blue-600 text-blue-600',
      'hover:bg-blue-600/10',
      'focus:ring-blue-500'
    ),
    ghost: clsx(
      'text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]',
      'focus:ring-blue-500'
    ),
    link: clsx(
      'text-blue-600 hover:text-blue-700',
      'hover:underline',
      'focus:ring-blue-500'
    ),
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <motion.button
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || loading}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className={clsx('animate-spin', iconSizeClasses[size])} />
          <span>{children}</span>
        </>
      ) : (
        <>
          {leftIcon && <span className={iconSizeClasses[size]}>{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className={iconSizeClasses[size]}>{rightIcon}</span>}
        </>
      )}
    </motion.button>
  );
};

export default Button;
