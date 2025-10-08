import React, { useState } from 'react';
import type { Despesa } from '../../services/despesaService';
import Button from '../common/Button';
import StatusBadge from '../common/StatusBadge';
import { formatCurrency } from '../../utils/formatters';
import { usePagination } from '../../hooks/usePagination';

interface DespesasTableProps {
  despesas: Despesa[];
  onEdit: (despesa: Despesa) => void;
  onDelete: (despesa: Despesa) => void;
  onQuitar: (despesa: Despesa) => void;
}

const DespesasTable: React.FC<DespesasTableProps> = ({
  despesas,
  onEdit,
  onDelete,
  onQuitar,
}) => {
  const [sortKey, setSortKey] = useState<keyof Despesa>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Ordenação
  const sortedDespesas = React.useMemo(() => {
    const sorted = [...despesas].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });
    return sorted;
  }, [despesas, sortKey, sortOrder]);

  // Paginação
  const {
    paginatedData,
    currentPage,
    totalPages,
    nextPage,
    previousPage,
    itemsPerPage,
    changeItemsPerPage,
  } = usePagination(sortedDespesas, 20);

  const handleSort = (key: keyof Despesa) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const getMesNome = (mes: number): string => {
    const meses = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];
    return meses[mes - 1] || '';
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[var(--bg-secondary)]">
            <tr>
              <th
                onClick={() => handleSort('categoria')}
                className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider cursor-pointer hover:bg-[var(--bg-tertiary)]"
              >
                Categoria {sortKey === 'categoria' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                Descrição
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                Conta
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                Indicador
              </th>
              <th
                onClick={() => handleSort('valor')}
                className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider cursor-pointer hover:bg-[var(--bg-tertiary)]"
              >
                Valor {sortKey === 'valor' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                onClick={() => handleSort('status')}
                className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider cursor-pointer hover:bg-[var(--bg-tertiary)]"
              >
                Status {sortKey === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                onClick={() => handleSort('competenciaMes')}
                className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider cursor-pointer hover:bg-[var(--bg-tertiary)]"
              >
                Competência {sortKey === 'competenciaMes' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-[var(--bg-primary)] divide-y divide-gray-200">
            {paginatedData.map((despesa) => (
              <tr key={despesa.id} className="hover:bg-[var(--bg-secondary)]">
                <td className="px-4 py-3 text-sm font-medium text-[var(--text-primary)]">
                  {despesa.categoria}
                </td>
                <td className="px-4 py-3 text-sm text-[var(--text-secondary)] max-w-xs truncate">
                  {despesa.descricao}
                </td>
                <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">{despesa.conta || '-'}</td>
                <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">{despesa.indicador || '-'}</td>
                <td className="px-4 py-3 text-sm font-semibold text-red-600">
                  {formatCurrency(despesa.valor)}
                </td>
                <td className="px-4 py-3 text-sm">
                  <StatusBadge
                    status={despesa.status}
                    variant={despesa.status === 'PAGO' ? 'success' : 'warning'}
                  />
                </td>
                <td className="px-4 py-3 text-sm text-[var(--text-primary)]">
                  {getMesNome(despesa.competenciaMes)}/{despesa.competenciaAno}
                </td>
                <td className="px-4 py-3 text-right text-sm space-x-2">
                  {despesa.status === 'PENDENTE' && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => onQuitar(despesa)}
                    >
                      ✓ Quitar
                    </Button>
                  )}
                  <Button size="sm" onClick={() => onEdit(despesa)}>
                    ✏️
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => onDelete(despesa)}>
                    🗑️
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-[var(--bg-primary)] border-t border-[var(--border-color)]">
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--text-primary)]">Itens por página:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => changeItemsPerPage(Number(e.target.value))}
              className="px-2 py-1 border border-[var(--border-color)] rounded-md text-sm"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={previousPage}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <span className="text-sm text-[var(--text-primary)]">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              size="sm"
              variant="secondary"
              onClick={nextPage}
              disabled={currentPage === totalPages}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DespesasTable;
