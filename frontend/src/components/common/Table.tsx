import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Loader2, ChevronUp, ChevronDown } from 'lucide-react';

export interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => ReactNode;
  sortable?: boolean;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  // Paginação
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange?: (page: number) => void;
  // Ordenação
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: string) => void;
}

function Table<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  emptyMessage = 'Nenhum registro encontrado',
  onRowClick,
  pagination,
  onPageChange,
  sortBy,
  sortOrder,
  onSort,
}: TableProps<T>) {
  const handleSort = (key: string) => {
    if (onSort) {
      onSort(key);
    }
  };

  return (
    <div className="w-full">
      <div className="overflow-x-auto rounded-xl">
        <table className="min-w-full divide-y divide-[var(--border-color)]">
          {/* Header */}
          <thead className="bg-[var(--bg-secondary)]">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-4 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider ${
                    column.sortable && onSort ? 'cursor-pointer hover:bg-[var(--bg-tertiary)] transition-colors' : ''
                  }`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && sortBy === column.key && (
                      sortOrder === 'asc' ? (
                        <ChevronUp className="w-4 h-4 text-blue-600" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-blue-600" />
                      )
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="bg-transparent divide-y divide-[var(--border-color)]">
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-[var(--text-secondary)]"
                >
                  <div className="flex items-center justify-center gap-3">
                    <Loader2 className="animate-spin h-6 w-6 text-blue-600" />
                    <span className="text-lg font-medium">Carregando...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-[var(--text-secondary)]"
                >
                  <div className="text-lg font-medium">{emptyMessage}</div>
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`${
                    onRowClick
                      ? 'cursor-pointer hover:bg-[var(--bg-secondary)] transition-colors'
                      : 'hover:bg-[var(--bg-secondary)]/50'
                  }`}
                  onClick={() => onRowClick && onRowClick(item)}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-primary)]"
                    >
                      {column.render ? column.render(item) : item[column.key]}
                    </td>
                  ))}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {pagination && pagination.totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between px-6 py-4 mt-4 glass-effect rounded-xl"
        >
          <div className="text-sm text-[var(--text-primary)] font-medium">
            Mostrando{' '}
            <span className="font-bold text-blue-600">
              {(pagination.page - 1) * pagination.limit + 1}
            </span>{' '}
            até{' '}
            <span className="font-bold text-blue-600">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{' '}
            de <span className="font-bold text-blue-600">{pagination.total}</span> registros
          </div>

          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onPageChange && onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-4 py-2 text-sm font-medium text-[var(--text-primary)] bg-[var(--bg-primary)]/50 border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-primary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </motion.button>

            {/* Números de página */}
            <div className="hidden md:flex gap-1">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  // Mostra primeira, última e páginas próximas à atual
                  return (
                    page === 1 ||
                    page === pagination.totalPages ||
                    (page >= pagination.page - 1 && page <= pagination.page + 1)
                  );
                })
                .map((page, idx, arr) => {
                  // Adiciona reticências se houver gap
                  const prevPage = arr[idx - 1];
                  const showEllipsis = prevPage && page - prevPage > 1;

                  return (
                    <div key={page} className="flex items-center gap-1">
                      {showEllipsis && (
                        <span className="px-2 text-[var(--text-tertiary)]">...</span>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onPageChange && onPageChange(page)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                          pagination.page === page
                            ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30'
                            : 'text-[var(--text-primary)] bg-[var(--bg-primary)]/50 border border-[var(--border-color)] hover:bg-[var(--bg-primary)]'
                        }`}
                      >
                        {page}
                      </motion.button>
                    </div>
                  );
                })}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onPageChange && onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="px-4 py-2 text-sm font-medium text-[var(--text-primary)] bg-[var(--bg-primary)]/50 border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-primary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Próxima
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default Table;
