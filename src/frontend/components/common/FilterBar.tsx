import React, { ReactNode } from 'react';

interface FilterBarProps {
  children: ReactNode;
  onClear?: () => void;
  showClearButton?: boolean;
  className?: string;
}

const FilterBar: React.FC<FilterBarProps> = ({
  children,
  onClear,
  showClearButton = true,
  className = '',
}) => {
  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 ${className}`}>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap flex-1">
          {children}
        </div>
        {showClearButton && onClear && (
          <button
            onClick={onClear}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Limpar Filtros
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
