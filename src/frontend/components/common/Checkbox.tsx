import React from 'react';

interface CheckboxProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  error?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onChange,
  disabled = false,
  error,
  className = '',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const labelSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className={`flex items-center gap-2 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className={`
            ${sizeClasses[size]}
            border-2 border-gray-300 rounded
            text-blue-600 focus:ring-2 focus:ring-blue-500
            disabled:cursor-not-allowed
            cursor-pointer
            transition-colors
          `}
        />
        {label && (
          <span className={`${labelSizeClasses[size]} text-gray-700 select-none`}>
            {label}
          </span>
        )}
      </label>
      {error && (
        <span className="text-xs text-red-500 ml-7">{error}</span>
      )}
    </div>
  );
};

export default Checkbox;
