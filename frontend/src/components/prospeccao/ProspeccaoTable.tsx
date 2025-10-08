import React, { useState } from 'react';
import type { Prospeccao } from '../../services/prospeccaoService';
import Button from '../common/Button';
import { formatDate } from '../../utils/formatters';
import { usePagination } from '../../hooks/usePagination';

interface ProspeccaoTableProps {
  prospeccao: Prospeccao[];
  onEdit: (prospeccao: Prospeccao) => void;
  onDelete: (prospeccao: Prospeccao) => void;
  onConverter: (prospeccao: Prospeccao) => void;
}

const ProspeccaoTable: React.FC<ProspeccaoTableProps> = ({
  prospeccao,
  onEdit,
  onDelete,
  onConverter,
}) => {
  const [sortKey, setSortKey] = useState<keyof Prospeccao>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Ordenação
  const sortedProspeccao = React.useMemo(() => {
    const sorted = [...prospeccao].sort((a, b) => {
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

      if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
        return sortOrder === 'asc'
          ? (aVal === bVal ? 0 : aVal ? 1 : -1)
          : (aVal === bVal ? 0 : aVal ? -1 : 1);
      }

      return 0;
    });
    return sorted;
  }, [prospeccao, sortKey, sortOrder]);

  // Paginação
  const {
    paginatedData,
    currentPage,
    totalPages,
    nextPage,
    previousPage,
    itemsPerPage,
    changeItemsPerPage,
  } = usePagination(sortedProspeccao, 20);

  const handleSort = (key: keyof Prospeccao) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const getRowColor = (p: Prospeccao): string => {
    if (p.convertido) return 'bg-green-50'; // Verde claro: convertido
    return 'bg-[var(--bg-primary)]'; // Background: pendente
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[var(--border-color)]">
          <thead className="bg-[var(--bg-secondary)]">
            <tr>
              <th
                onClick={() => handleSort('email')}
                className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider cursor-pointer hover:bg-[var(--bg-tertiary)]"
              >
                Email {sortKey === 'email' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                onClick={() => handleSort('nome')}
                className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider cursor-pointer hover:bg-[var(--bg-tertiary)]"
              >
                Nome {sortKey === 'nome' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                Telefone
              </th>
              <th
                onClick={() => handleSort('origem')}
                className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider cursor-pointer hover:bg-[var(--bg-tertiary)]"
              >
                Origem {sortKey === 'origem' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                onClick={() => handleSort('indicador')}
                className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider cursor-pointer hover:bg-[var(--bg-tertiary)]"
              >
                Indicador {sortKey === 'indicador' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                onClick={() => handleSort('convertido')}
                className="px-4 py-3 text-center text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider cursor-pointer hover:bg-[var(--bg-tertiary)]"
              >
                Status {sortKey === 'convertido' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                onClick={() => handleSort('created_at')}
                className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider cursor-pointer hover:bg-[var(--bg-tertiary)]"
              >
                Criado em {sortKey === 'created_at' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)]">
            {paginatedData.map((p) => (
              <tr key={p.id} className={`${getRowColor(p)} hover:opacity-80`}>
                <td className="px-4 py-3 text-sm text-[var(--text-primary)]">{p.email}</td>
                <td className="px-4 py-3 text-sm text-[var(--text-primary)] font-medium">{p.nome}</td>
                <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">{p.telefone || '-'}</td>
                <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">{p.origem || '-'}</td>
                <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">{p.indicador || '-'}</td>
                <td className="px-4 py-3 text-center">
                  {p.convertido ? (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Convertido
                    </span>
                  ) : (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Pendente
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
                  {formatDate(p.created_at)}
                </td>
                <td className="px-4 py-3 text-right text-sm space-x-2">
                  {!p.convertido && (
                    <>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => onConverter(p)}
                      >
                        ➜ Converter
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onEdit(p)}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => onDelete(p)}
                      >
                        Excluir
                      </Button>
                    </>
                  )}
                  {p.convertido && (
                    <span className="text-xs text-green-600 font-semibold">
                      ✓ Lead convertido
                    </span>
                  )}
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

export default ProspeccaoTable;
