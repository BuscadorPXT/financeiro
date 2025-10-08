import { forwardRef, useState } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  success?: boolean;
  floatingLabel?: boolean;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    success = false,
    floatingLabel = false,
    className = '',
    ...props
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(!!props.value || !!props.defaultValue);

    const handleFocus = () => setIsFocused(true);
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setHasValue(!!e.target.value);
      props.onBlur?.(e);
    };

    const showFloatingLabel = floatingLabel && (isFocused || hasValue);

    return (
      <div className="w-full">
        <div className="relative">
          {/* Label flutuante ou normal */}
          {label && !floatingLabel && (
            <label className="block text-sm font-semibold text-[var(--text-primary)] mb-1.5">
              {label}
              {props.required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}

          {/* Input container */}
          <div className="relative">
            {/* Left Icon */}
            {leftIcon && (
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">
                {leftIcon}
              </div>
            )}

            {/* Input */}
            <input
              ref={ref}
              className={clsx(
                'w-full px-4 py-2.5 rounded-lg',
                'border-2 transition-all duration-200',
                'bg-[var(--bg-primary)]',
                'text-[var(--text-primary)]',
                'placeholder-[var(--text-tertiary)]',
                'focus:outline-none focus:ring-2 focus:ring-offset-0',
                'disabled:opacity-60 disabled:cursor-not-allowed',
                // Estados de validação
                error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
                success && !error && 'border-green-500 focus:border-green-500 focus:ring-green-500/20',
                !error && !success && 'border-[var(--border-color)] focus:border-blue-500 focus:ring-blue-500/20',
                // Padding para ícones
                leftIcon && 'pl-10',
                (rightIcon || error || success) && 'pr-10',
                // Label flutuante
                floatingLabel && 'pt-6 pb-2',
                className
              )}
              onFocus={handleFocus}
              onBlur={handleBlur}
              {...props}
            />

            {/* Floating Label */}
            {label && floatingLabel && (
              <label
                className={clsx(
                  'absolute left-4 transition-all duration-200 pointer-events-none',
                  'text-[var(--text-secondary)]',
                  showFloatingLabel
                    ? 'top-2 text-xs'
                    : 'top-1/2 -translate-y-1/2 text-base'
                )}
              >
                {label}
                {props.required && <span className="text-red-500 ml-1">*</span>}
              </label>
            )}

            {/* Right Icon ou Ícone de validação */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {error && !rightIcon && (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
              {success && !error && !rightIcon && (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              )}
              {rightIcon && (
                <div className="text-gray-400">{rightIcon}</div>
              )}
            </div>
          </div>
        </div>

        {/* Mensagens de erro/ajuda */}
        {error && (
          <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-[var(--text-secondary)]">{helperText}</p>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';

export default FormInput;
