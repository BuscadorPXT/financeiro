import type { ReactNode } from 'react';

/**
 * Componente de tabela responsiva
 *
 * Em desktop: Renderiza tabela tradicional
 * Em mobile: Renderiza cards empilhados
 */

export interface Column<T> {
  key: string;
  label: string;
  render: (item: T) => ReactNode;
  hideOnMobile?: boolean;
}

interface ResponsiveTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
  className?: string;
}

export function ResponsiveTable<T>({
  data,
  columns,
  keyExtractor,
  emptyMessage = 'Nenhum registro encontrado',
  className = '',
}: ResponsiveTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-500 text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop: Table View */}
      <div className={`hidden md:block overflow-x-auto bg-white rounded-lg shadow ${className}`}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item) => (
              <tr key={keyExtractor(item)} className="hover:bg-gray-50 transition-colors">
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {column.render(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: Card View */}
      <div className="md:hidden space-y-4">
        {data.map((item) => (
          <div
            key={keyExtractor(item)}
            className="bg-white rounded-lg shadow p-4 space-y-3"
          >
            {columns
              .filter((column) => !column.hideOnMobile)
              .map((column) => (
                <div key={column.key} className="flex justify-between items-start">
                  <span className="text-sm font-medium text-gray-500 w-1/3">
                    {column.label}:
                  </span>
                  <span className="text-sm text-gray-900 w-2/3 text-right">
                    {column.render(item)}
                  </span>
                </div>
              ))}
          </div>
        ))}
      </div>
    </>
  );
}
