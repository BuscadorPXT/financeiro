// Utilitário para exportação de dados para CSV

export interface CSVExportOptions {
  filename: string;
  headers?: string[];
  delimiter?: string;
  includeHeaders?: boolean;
}

export const csvExporter = {
  /**
   * Exporta array de objetos para CSV
   */
  export: (
    data: any[],
    options: CSVExportOptions
  ): void => {
    if (!data || data.length === 0) {
      alert('Nenhum dado para exportar');
      return;
    }

    const {
      filename,
      headers,
      delimiter = ',',
      includeHeaders = true
    } = options;

    // Determinar headers
    const finalHeaders = headers || Object.keys(data[0]);

    // Construir linhas CSV
    const rows: string[] = [];

    // Adicionar header se necessário
    if (includeHeaders) {
      rows.push(finalHeaders.join(delimiter));
    }

    // Adicionar dados
    data.forEach(row => {
      const values = finalHeaders.map(header => {
        const value = row[header];
        return csvExporter.escapeValue(value, delimiter);
      });
      rows.push(values.join(delimiter));
    });

    // Criar conteúdo CSV
    const csvContent = rows.join('\n');

    // Fazer download
    csvExporter.download(csvContent, filename);
  },

  /**
   * Escapa valores que contêm caracteres especiais
   */
  escapeValue: (value: any, delimiter: string): string => {
    if (value === null || value === undefined) {
      return '';
    }

    let stringValue = String(value);

    // Se contém delimitador, aspas ou quebra de linha, envolve em aspas
    if (
      stringValue.includes(delimiter) ||
      stringValue.includes('"') ||
      stringValue.includes('\n')
    ) {
      // Duplica aspas internas
      stringValue = stringValue.replace(/"/g, '""');
      // Envolve em aspas
      stringValue = `"${stringValue}"`;
    }

    return stringValue;
  },

  /**
   * Faz download do arquivo CSV
   */
  download: (content: string, filename: string): void => {
    // Adicionar BOM UTF-8 para correta visualização em Excel
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + content], {
      type: 'text/csv;charset=utf-8;'
    });

    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Liberar URL
    URL.revokeObjectURL(url);
  },

  /**
   * Converte objeto para formato compatível com exportação
   */
  prepareData: (data: any[]): any[] => {
    return data.map(item => {
      const prepared: any = {};
      Object.keys(item).forEach(key => {
        const value = item[key];
        // Formatar datas
        if (value instanceof Date) {
          prepared[key] = value.toISOString().split('T')[0];
        }
        // Formatar valores monetários
        else if (typeof value === 'number' && key.toLowerCase().includes('valor')) {
          prepared[key] = value.toFixed(2).replace('.', ',');
        }
        else {
          prepared[key] = value;
        }
      });
      return prepared;
    });
  }
};

export default csvExporter;
