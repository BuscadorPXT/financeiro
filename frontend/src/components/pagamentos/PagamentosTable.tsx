import React, { useState } from 'react';
import type { Pagamento } from '../../services/pagamentoService';
import type { Usuario } from '../../services/usuarioService';
import Button from '../common/Button';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { usePagination } from '../../hooks/usePagination';

interface PagamentosTableProps {
  pagamentos: Pagamento[];
  usuarios: Usuario[];
  onEdit: (pagamento: Pagamento) => void;
  onDelete: (pagamento: Pagamento) => void;
}

const PagamentosTable: React.FC<PagamentosTableProps> = ({
  pagamentos,
  usuarios,
  onEdit,
  onDelete,
}) => {
  const [sortKey, setSortKey] = useState<keyof Pagamento>('dataPagto');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Ordenação
  const sortedPagamentos = React.useMemo(() => {
    const sorted = [...pagamentos].sort((a, b) => {
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
  }, [pagamentos, sortKey, sortOrder]);

  // Paginação
  const {
    paginatedData,
    currentPage,
    totalPages,
    nextPage,
    previousPage,
    itemsPerPage,
    changeItemsPerPage,
  } = usePagination(sortedPagamentos, 20);

  const handleSort = (key: keyof Pagamento) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const getUsuario = (usuarioId: string) => {
    return usuarios.find((u) => u.id === usuarioId);
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[var(--bg-secondary)]">
            <tr>
              <th
                onClick={() => handleSort('dataPagto')}
                className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider cursor-pointer hover:bg-[var(--bg-tertiary)]"
              >
                Data {sortKey === 'dataPagto' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                onClick={() => handleSort('mesPagto')}
                className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider cursor-pointer hover:bg-[var(--bg-tertiary)]"
              >
                Mês {sortKey === 'mesPagto' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                Usuário
              </th>
              <th
                onClick={() => handleSort('valor')}
                className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider cursor-pointer hover:bg-[var(--bg-tertiary)]"
              >
                Valor {sortKey === 'valor' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                Método
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                Conta
              </th>
              <th
                onClick={() => handleSort('regraTipo')}
                className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider cursor-pointer hover:bg-[var(--bg-tertiary)]"
              >
                Tipo {sortKey === 'regraTipo' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                Comissão
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                Observação
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-[var(--bg-primary)] divide-y divide-gray-200">
            {paginatedData.map((pagamento) => {
              const usuario = getUsuario(pagamento.usuarioId);
              return (
                <tr key={pagamento.id} className="hover:bg-[var(--bg-secondary)]">
                  <td className="px-4 py-3 text-sm text-[var(--text-primary)]">
                    {formatDate(pagamento.dataPagto)}
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">{pagamento.mesPagto}</td>
                  <td className="px-4 py-3 text-sm">
                    <div>
                      <p className="text-[var(--text-primary)] font-medium">{usuario?.nomeCompleto || '-'}</p>
                      <p className="text-[var(--text-secondary)] text-xs">{usuario?.emailLogin || '-'}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-green-600">
                    {formatCurrency(pagamento.valor)}
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">{pagamento.metodo}</td>
                  <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">{pagamento.conta}</td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        pagamento.regraTipo === 'PRIMEIRO'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {pagamento.regraTipo}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--text-primary)]">
                    {pagamento.elegivelComissao ? (
                      <span className="text-green-600 font-medium">
                        {formatCurrency(pagamento.comissaoValor)}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--text-secondary)] max-w-xs truncate">
                    {pagamento.observacao || '-'}
                  </td>
                  <td className="px-4 py-3 text-right text-sm space-x-2">
                    <Button size="sm" onClick={() => onEdit(pagamento)}>
                      ✏️
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => onDelete(pagamento)}>
                      🗑️
                    </Button>
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

export default PagamentosTable;
