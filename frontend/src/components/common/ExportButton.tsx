import React, { useState } from 'react';

interface ExportButtonProps {
  onExport: (format: 'csv' | 'xlsx') => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  formats?: ('csv' | 'xlsx')[];
}

const ExportButton: React.FC<ExportButtonProps> = ({
  onExport,
  disabled = false,
  loading = false,
  className = '',
  formats = ['csv', 'xlsx'],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: 'csv' | 'xlsx') => {
    setIsExporting(true);
    setIsOpen(false);
    try {
      await onExport(format);
    } finally {
      setIsExporting(false);
    }
  };

  const isDisabled = disabled || loading || isExporting;

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isDisabled}
        className={`
          flex items-center gap-2 px-4 py-2 text-sm font-medium
          bg-green-600 text-white rounded-md
          hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors
        `}
      >
        {isExporting ? (
          <>
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Exportando...</span>
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Exportar</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </button>

      {isOpen && !isDisabled && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-[var(--bg-primary)] rounded-md shadow-lg z-20 border border-[var(--border-color)]">
            {formats.includes('csv') && (
              <button
                onClick={() => handleExport('csv')}
                className="block w-full text-left px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] first:rounded-t-md"
              >
                Exportar como CSV
              </button>
            )}
            {formats.includes('xlsx') && (
              <button
                onClick={() => handleExport('xlsx')}
                className="block w-full text-left px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] last:rounded-b-md"
              >
                Exportar como XLSX
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ExportButton;
