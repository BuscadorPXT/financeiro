import { useState, useCallback } from 'react';

export interface ImportPreview {
  headers: string[];
  rows: any[][];
  totalRows: number;
}

export const useImport = () => {
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseCSV = useCallback((file: File): Promise<ImportPreview> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n').filter(line => line.trim());

          if (lines.length === 0) {
            throw new Error('Arquivo vazio');
          }

          const headers = lines[0].split(',').map(h => h.trim());
          const rows = lines.slice(1, 11).map(line =>
            line.split(',').map(cell => cell.trim())
          );

          resolve({
            headers,
            rows,
            totalRows: lines.length - 1
          });
        } catch (err) {
          reject(err instanceof Error ? err : new Error('Erro ao processar CSV'));
        }
      };

      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsText(file);
    });
  }, []);

  const loadPreview = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const previewData = await parseCSV(file);
      setPreview(previewData);
      return previewData;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar preview');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [parseCSV]);

  const clearPreview = useCallback(() => {
    setPreview(null);
    setError(null);
  }, []);

  return {
    preview,
    loading,
    error,
    loadPreview,
    clearPreview
  };
};
