import React, { useState } from 'react';
import type { Comissao } from '../../services/comissaoService';
import Button from '../common/Button';
import { usePagination } from '../../hooks/usePagination';

interface ComissoesExtratoProps {
  comissoes: Comissao[];
}

const ComissoesExtrato: React.FC<ComissoesExtratoProps> = ({ comissoes }) => {
  const [sortKey, setSortKey] = useState<keyof Comissao>('mesRef');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Ordenação
  const sortedComissoes = React.useMemo(() => {
    const sorted = [...comissoes].sort((a, b) => {
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
  }, [comissoes, sortKey, sortOrder]);

  // Paginação
  const {
    paginatedData,
    currentPage,
    totalPages,
    nextPage,
    previousPage,
    itemsPerPage,
    changeItemsPerPage,
  } = usePagination(sortedComissoes, 20);

  const handleSort = (key: keyof Comissao) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const formatMesRef = (mesRef: string): string => {
    // mesRef vem como "DD/MM/YYYY"
    if (!mesRef) return '-';

    const parts = mesRef.split('/');
    if (parts.length !== 3) return mesRef;

    const mes = parts[1];
    const ano = parts[2];

    const meses = [
      'Jan',
      'Fev',
      'Mar',
      'Abr',
      'Mai',
      'Jun',
      'Jul',
      'Ago',
      'Set',
      'Out',
      'Nov',
      'Dez',
    ];
    return `${meses[parseInt(mes) - 1]}/${ano}`;
  };

  const totalGeral = comissoes.reduce((sum, c) => sum + Number(c.valor), 0);

  return (
    <div>
      {comissoes.length === 0 ? (
        <div className="text-center py-8 text-[var(--text-secondary)]">
          Nenhuma comissão encontrada
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[var(--bg-secondary)]">
                <tr>
                  <th
                    onClick={() => handleSort('mesRef')}
                    className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider cursor-pointer hover:bg-[var(--bg-tertiary)]"
                  >
                    Mês Ref {sortKey === 'mesRef' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    onClick={() => handleSort('indicador')}
                    className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider cursor-pointer hover:bg-[var(--bg-tertiary)]"
                  >
                    Indicador {sortKey === 'indicador' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    onClick={() => handleSort('regraTipo')}
                    className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider cursor-pointer hover:bg-[var(--bg-tertiary)]"
                  >
                    Tipo {sortKey === 'regraTipo' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    onClick={() => handleSort('valor')}
                    className="px-4 py-3 text-right text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider cursor-pointer hover:bg-[var(--bg-tertiary)]"
                  >
                    Valor {sortKey === 'valor' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                    ID Pagamento
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[var(--bg-primary)] divide-y divide-gray-200">
                {paginatedData.map((c) => (
                  <tr key={c.id} className="hover:bg-[var(--bg-secondary)]">
                    <td className="px-4 py-3 text-sm text-[var(--text-primary)] font-medium">
                      {formatMesRef(c.mesRef)}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--text-primary)]">
                      {c.indicador}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          c.regraTipo === 'PRIMEIRO'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {c.regraTipo}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-green-600 text-right font-semibold">
                      R$ {Number(c.valor).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--text-secondary)] text-right text-xs truncate" title={c.pagamentoId}>
                      #{c.pagamentoId.substring(0, 8)}...
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-[var(--bg-tertiary)]">
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-3 text-sm font-bold text-[var(--text-primary)]"
                  >
                    TOTAL ({comissoes.length} comissões)
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-green-600 text-right">
                    R$ {totalGeral.toFixed(2)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 bg-[var(--bg-primary)] border-t border-[var(--border-color)] mt-4">
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
        </>
      )}
    </div>
  );
};

export default ComissoesExtrato;
