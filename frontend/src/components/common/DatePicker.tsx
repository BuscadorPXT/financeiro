import React from 'react';

interface DatePickerProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  min?: string;
  max?: string;
  className?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
  required = false,
  error,
  min,
  max,
  className = '',
}) => {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-[var(--text-primary)]">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        min={min}
        max={max}
        className={`
          px-3 py-2 border rounded-md shadow-sm
          bg-[var(--bg-primary)] text-[var(--text-primary)]
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-[var(--bg-secondary)] disabled:cursor-not-allowed
          ${error ? 'border-red-500' : 'border-[var(--border-color)]'}
          transition-colors
        `}
      />
      {error && (
        <span className="text-xs text-red-500">{error}</span>
      )}
    </div>
  );
};

export default DatePicker;
