import { forwardRef } from 'react';
import type { SelectHTMLAttributes } from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
  onChange?: (value: string) => void;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, placeholder, className = '', onChange, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            className={clsx(
              'w-full px-4 py-2.5 pr-10 rounded-lg appearance-none',
              'border-2 transition-all duration-200',
              'bg-[var(--bg-primary)]',
              'text-[var(--text-primary)]',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              'disabled:opacity-60 disabled:cursor-not-allowed',
              'cursor-pointer',
              // Estados de validação
              error
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                : 'border-[var(--border-color)] focus:border-blue-500 focus:ring-blue-500/20',
              className
            )}
            onChange={(e) => onChange?.(e.target.value)}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Ícone Chevron */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <ChevronDown className="w-5 h-5 text-gray-400" />
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

Select.displayName = 'Select';

export default Select;
