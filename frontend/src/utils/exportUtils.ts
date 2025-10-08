import Papa from 'papaparse';
import * as XLSX from 'xlsx';

/**
 * Formata um valor para exportação
 */
function formatarValor(valor: any): string {
  if (valor === null || valor === undefined) return '';
  if (typeof valor === 'boolean') return valor ? 'Sim' : 'Não';
  if (valor instanceof Date) return valor.toLocaleDateString('pt-BR');
  if (typeof valor === 'object') return JSON.stringify(valor);
  return String(valor);
}

/**
 * Converte dados para formato de tabela com cabeçalhos
 */
function prepararDados<T extends Record<string, any>>(
  dados: T[],
  colunas?: { key: keyof T; label: string }[]
): { headers: string[]; rows: string[][] } {
  if (dados.length === 0) {
    return { headers: [], rows: [] };
  }

  // Se não especificou colunas, usa todas as chaves do primeiro objeto
  const colunasFinais = colunas || Object.keys(dados[0]).map((key) => ({ key, label: key }));

  const headers = colunasFinais.map((col) => col.label);
  const rows = dados.map((item) =>
    colunasFinais.map((col) => formatarValor(item[col.key]))
  );

  return { headers, rows };
}

/**
 * Exporta dados para CSV
 */
export function exportarCSV<T extends Record<string, any>>(
  dados: T[],
  nomeArquivo: string,
  colunas?: { key: keyof T; label: string }[]
): void {
  const { headers, rows } = prepararDados(dados, colunas);

  if (rows.length === 0) {
    alert('Não há dados para exportar');
    return;
  }

  const csv = Papa.unparse({
    fields: headers,
    data: rows,
  });

  // Adiciona BOM para UTF-8 (para Excel reconhecer acentos)
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${nomeArquivo}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exporta dados para XLSX (Excel)
 */
export function exportarXLSX<T extends Record<string, any>>(
  dados: T[],
  nomeArquivo: string,
  colunas?: { key: keyof T; label: string }[]
): void {
  const { headers, rows } = prepararDados(dados, colunas);

  if (rows.length === 0) {
    alert('Não há dados para exportar');
    return;
  }

  // Cria worksheet com headers
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

  // Define largura das colunas
  const colWidths = headers.map((header) => ({
    wch: Math.max(header.length, 15),
  }));
  ws['!cols'] = colWidths;

  // Cria workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Dados');

  // Exporta
  XLSX.writeFile(wb, `${nomeArquivo}.xlsx`);
}

/**
 * Lê arquivo CSV e retorna dados parseados
 */
export function lerCSV<T = any>(arquivo: File): Promise<T[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(arquivo, {
      header: true,
      skipEmptyLines: true,
      encoding: 'UTF-8',
      complete: (results) => {
        resolve(results.data as T[]);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

/**
 * Lê arquivo XLSX e retorna dados parseados
 */
export function lerXLSX<T = any>(arquivo: File): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet) as T[];
        resolve(json);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Erro ao ler arquivo'));
    };

    reader.readAsBinaryString(arquivo);
  });
}

/**
 * Lê arquivo (CSV ou XLSX) baseado na extensão
 */
export async function lerArquivo<T = any>(arquivo: File): Promise<T[]> {
  const extensao = arquivo.name.split('.').pop()?.toLowerCase();

  if (extensao === 'csv') {
    return lerCSV<T>(arquivo);
  } else if (extensao === 'xlsx' || extensao === 'xls') {
    return lerXLSX<T>(arquivo);
  } else {
    throw new Error('Formato de arquivo não suportado. Use CSV ou XLSX.');
  }
}
