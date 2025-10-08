import { useCallback } from 'react';
import { exportarCSV, exportarXLSX } from '../utils/exportUtils';

export const useExport = () => {
  const exportToCSV = useCallback((data: any[], filename: string) => {
    exportarCSV(data, filename);
  }, []);

  const exportToXLSX = useCallback((data: any[], options: { filename: string }) => {
    exportarXLSX(data, options.filename);
  }, []);

  return {
    exportToCSV,
    exportToXLSX
  };
};
