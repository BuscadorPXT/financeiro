import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, X, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

export interface SearchableSelectOption {
  value: string | number;
  label: string;
  subtitle?: string;
}

interface SearchableSelectProps {
  label?: string;
  value: string | number;
  onChange: (value: string | number) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  searchPlaceholder?: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = 'Selecione...',
  error,
  helperText,
  required,
  disabled,
  searchPlaceholder = 'Buscar...',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focar input ao abrir
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Filtrar opções baseado na busca
  const filteredOptions = options.filter((option) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      option.label.toLowerCase().includes(searchLower) ||
      option.subtitle?.toLowerCase().includes(searchLower)
    );
  });

  // Obter label da opção selecionada
  const selectedOption = options.find((opt) => opt.value === value);
  const displayValue = selectedOption?.label || placeholder;

  const handleSelect = (optionValue: string | number) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearchTerm('');
  };

  return (
    <div className="w-full" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {/* Trigger Button */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={clsx(
            'w-full px-4 py-2.5 pr-10 rounded-lg text-left',
            'border-2 transition-all duration-200',
            'bg-[var(--bg-primary)]',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            'disabled:opacity-60 disabled:cursor-not-allowed',
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
              : 'border-[var(--border-color)] focus:border-blue-500 focus:ring-blue-500/20',
            value ? 'text-[var(--text-primary)]' : 'text-gray-400'
          )}
        >
          {displayValue}
        </button>

        {/* Icons */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-0.5 hover:bg-gray-200 rounded transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
          <ChevronDown
            className={clsx(
              'w-5 h-5 text-gray-400 transition-transform',
              isOpen && 'rotate-180'
            )}
          />
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-[var(--bg-primary)] border-2 border-[var(--border-color)] rounded-lg shadow-lg max-h-80 overflow-hidden">
            {/* Search Input */}
            <div className="p-2 border-b border-[var(--border-color)]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-9 pr-3 py-2 border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Options List */}
            <div className="overflow-y-auto max-h-64">
              {filteredOptions.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  Nenhum resultado encontrado
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={clsx(
                      'w-full px-4 py-2.5 text-left hover:bg-blue-50 transition-colors',
                      value === option.value && 'bg-blue-100 font-medium'
                    )}
                  >
                    <div className="text-[var(--text-primary)]">{option.label}</div>
                    {option.subtitle && (
                      <div className="text-sm text-gray-500 mt-0.5">{option.subtitle}</div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Error/Helper Text */}
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
};

export default SearchableSelect;
