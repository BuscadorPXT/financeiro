import React, { useState } from 'react';
import type { Churn } from '../../services/churnService';
import type { Usuario } from '../../services/usuarioService';
import Button from '../common/Button';
import { formatDate } from '../../utils/formatters';
import { usePagination } from '../../hooks/usePagination';

interface ChurnTableProps {
  churn: Churn[];
  usuarios: Usuario[];
  onReverter: (churn: Churn) => void;
}

const ChurnTable: React.FC<ChurnTableProps> = ({
  churn,
  usuarios,
  onReverter,
}) => {
  const [sortKey, setSortKey] = useState<keyof Churn>('dataChurn');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Ordenação
  const sortedChurn = React.useMemo(() => {
    const sorted = [...churn].sort((a, b) => {
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
  }, [churn, sortKey, sortOrder]);

  // Paginação
  const {
    paginatedData,
    currentPage,
    totalPages,
    nextPage,
    previousPage,
    itemsPerPage,
    changeItemsPerPage,
  } = usePagination(sortedChurn, 20);

  const handleSort = (key: keyof Churn) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const getUsuario = (churnItem: Churn) => {
    // Primeiro tenta usar o usuário aninhado da API
    if (churnItem.usuario) {
      return {
        id: churnItem.usuario.id,
        emailLogin: churnItem.usuario.emailLogin,
        nomeCompleto: churnItem.usuario.nomeCompleto,
        indicador: churnItem.usuario.indicador,
      };
    }
    // Se não houver, busca na lista de usuários
    return usuarios.find((u) => u.id === churnItem.usuarioId);
  };

  const getRowColor = (c: Churn): string => {
    if (c.revertido) return 'bg-green-50'; // Verde claro: revertido
    return 'bg-red-50'; // Vermelho claro: churn ativo
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[var(--bg-secondary)]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                Nome
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                Indicador
              </th>
              <th
                onClick={() => handleSort('dataChurn')}
                className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider cursor-pointer hover:bg-[var(--bg-tertiary)]"
              >
                Data Churn {sortKey === 'dataChurn' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                Motivo
              </th>
              <th
                onClick={() => handleSort('revertido')}
                className="px-4 py-3 text-center text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider cursor-pointer hover:bg-[var(--bg-tertiary)]"
              >
                Status {sortKey === 'revertido' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedData.map((c) => {
              const usuario = getUsuario(c);
              return (
                <tr key={c.id} className={`${getRowColor(c)} hover:opacity-80`}>
                  <td className="px-4 py-3 text-sm text-[var(--text-primary)]">
                    {usuario?.emailLogin || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--text-primary)] font-medium">
                    {usuario?.nomeCompleto || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
                    {usuario?.indicador || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--text-primary)]">
                    {formatDate(c.dataChurn)}
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
                    {c.motivo || '-'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {c.revertido ? (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Revertido
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        Ativo
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    {!c.revertido ? (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => onReverter(c)}
                      >
                        ↺ Reverter
                      </Button>
                    ) : (
                      <span className="text-xs text-green-600 font-semibold">
                        ✓ Revertido
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
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

export default ChurnTable;
