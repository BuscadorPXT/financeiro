import React, { useRef, useState } from 'react';

interface ImportButtonProps {
  onFileSelect: (file: File) => void | Promise<void>;
  accept?: string;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  maxSizeMB?: number;
}

const ImportButton: React.FC<ImportButtonProps> = ({
  onFileSelect,
  accept = '.csv,.xlsx,.xls',
  disabled = false,
  loading = false,
  className = '',
  maxSizeMB = 10,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    setError(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tamanho do arquivo
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      setError(`Arquivo muito grande. Tamanho máximo: ${maxSizeMB}MB`);
      event.target.value = '';
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      await onFileSelect(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar arquivo');
    } finally {
      setIsProcessing(false);
      event.target.value = '';
    }
  };

  const isDisabled = disabled || loading || isProcessing;

  return (
    <div className={`inline-block ${className}`}>
      <button
        onClick={handleClick}
        disabled={isDisabled}
        className={`
          flex items-center gap-2 px-4 py-2 text-sm font-medium
          bg-blue-600 text-white rounded-md
          hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors
        `}
      >
        {isProcessing ? (
          <>
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Processando...</span>
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span>Importar</span>
          </>
        )}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />

      {error && (
        <p className="mt-2 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
};

export default ImportButton;
