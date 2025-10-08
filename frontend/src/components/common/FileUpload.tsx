import React, { useRef, useState } from 'react';

interface FileUploadProps {
  accept?: string;
  onFileSelect: (file: File) => void | Promise<void>;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const FileUpload: React.FC<FileUploadProps> = ({
  accept = '.csv,.xlsx,.xls',
  onFileSelect,
  disabled = false,
  className = '',
  children,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      try {
        await onFileSelect(file);
      } finally {
        setIsProcessing(false);
        if (inputRef.current) {
          inputRef.current.value = '';
        }
      }
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    if (file && !disabled) {
      setIsProcessing(true);
      try {
        await onFileSelect(file);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClick = () => {
    if (!disabled && !isProcessing) {
      inputRef.current?.click();
    }
  };

  return (
    <div
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`
        relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
        transition-colors
        ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-[var(--border-color)] hover:border-[var(--border-color)]/80'}
        ${disabled || isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        disabled={disabled || isProcessing}
        className="hidden"
      />

      {isProcessing ? (
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-sm text-[var(--text-secondary)]">Processando arquivo...</p>
        </div>
      ) : (
        <>
          {children || (
            <div className="flex flex-col items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  Clique para selecionar ou arraste um arquivo
                </p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Formatos aceitos: CSV, XLSX
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FileUpload;
