// Utilitário para exportação de dados para XLSX
// NOTA: Implementação completa será feita na Fase 7 com biblioteca 'xlsx'

export interface XLSXExportOptions {
  filename: string;
  sheetName?: string;
  headers?: string[];
}

export const xlsxExporter = {
  /**
   * Exporta array de objetos para XLSX
   * Implementação futura com biblioteca 'xlsx' (SheetJS)
   */
  export: async (
    _data: any[],
    _options: XLSXExportOptions
  ): Promise<void> => {
    console.warn('Exportação XLSX será implementada na Fase 7 com a biblioteca xlsx');

    // Por enquanto, mostra alerta
    alert(
      'Exportação XLSX será implementada na Fase 7.\n' +
      'Por favor, utilize a exportação CSV temporariamente.'
    );

    // TODO: Implementar com biblioteca xlsx na Fase 7
    // import * as XLSX from 'xlsx';
    //
    // const worksheet = XLSX.utils.json_to_sheet(data);
    // const workbook = XLSX.utils.book_new();
    // XLSX.utils.book_append_sheet(workbook, worksheet, options.sheetName || 'Dados');
    // XLSX.writeFile(workbook, `${options.filename}.xlsx`);
  },

  /**
   * Prepara dados para exportação XLSX
   */
  prepareData: (data: any[]): any[] => {
    return data.map(item => {
      const prepared: any = {};
      Object.keys(item).forEach(key => {
        const value = item[key];
        // Manter datas como objetos Date
        if (value instanceof Date) {
          prepared[key] = value;
        }
        // Manter números como números
        else if (typeof value === 'number') {
          prepared[key] = value;
        }
        else {
          prepared[key] = value;
        }
      });
      return prepared;
    });
  }
};

export default xlsxExporter;
