import { useCallback } from 'react';

export const useExport = () => {
  const exportToCSV = useCallback((data: any[], filename: string) => {
    if (!data || data.length === 0) {
      alert('Nenhum dado para exportar');
      return;
    }

    // Obter headers das chaves do primeiro objeto
    const headers = Object.keys(data[0]);

    // Criar linhas CSV
    const csvContent = [
      headers.join(','), // Header
      ...data.map(row =>
        headers.map(header => {
          const value = row[header];
          // Escapar valores que contém vírgula ou aspas
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value ?? '';
        }).join(',')
      )
    ].join('\n');

    // Criar blob e download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const exportToXLSX = useCallback(async (data: any[], filename: string) => {
    // Implementação futura com biblioteca XLSX
    alert('Exportação XLSX será implementada na Fase 7');
  }, []);

  return {
    exportToCSV,
    exportToXLSX
  };
};
