import React, { useState } from 'react';
import type { Agenda } from '../../services/agendaService';
import type { Usuario } from '../../services/usuarioService';
import Button from '../common/Button';
import Checkbox from '../common/Checkbox';
import { formatDate } from '../../utils/formatters';
import { usePagination } from '../../hooks/usePagination';

interface AgendaTableProps {
  agenda: Agenda[];
  usuarios: Usuario[];
  onRenovar: (item: Agenda) => void;
  onCancelar: (item: Agenda) => void;
}

const AgendaTable: React.FC<AgendaTableProps> = ({
  agenda,
  usuarios,
  onRenovar,
  onCancelar,
}) => {
  const [sortKey, setSortKey] = useState<keyof Agenda>('diasParaVencer');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Ordenação
  const sortedAgenda = React.useMemo(() => {
    const sorted = [...agenda].sort((a, b) => {
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
  }, [agenda, sortKey, sortOrder]);

  // Paginação
  const {
    paginatedData,
    currentPage,
    totalPages,
    nextPage,
    previousPage,
    itemsPerPage,
    changeItemsPerPage,
  } = usePagination(sortedAgenda, 20);

  const handleSort = (key: keyof Agenda) => {
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

  // Função para determinar a cor da linha baseada no status
  const getRowColor = (item: Agenda): string => {
    if (item.cancelou) return 'bg-[var(--bg-tertiary)]'; // Cinza: cancelado
    if (item.renovou) return 'bg-green-50'; // Verde: renovado
    if (item.status === 'INATIVO') return 'bg-[var(--bg-tertiary)]'; // Cinza: inativo
    if (item.diasParaVencer < 0) return 'bg-pink-50'; // Rosa: atrasado
    if (item.diasParaVencer === 0) return 'bg-orange-50'; // Laranja: vence hoje
    if (item.diasParaVencer <= 7) return 'bg-yellow-50'; // Amarelo: próximos 7 dias
    return 'bg-[var(--bg-primary)]'; // Branco: normal
  };

  const getDiasColor = (dias: number): string => {
    if (dias < 0) return 'text-red-600 font-bold';
    if (dias === 0) return 'text-orange-600 font-bold';
    if (dias <= 7) return 'text-yellow-600 font-semibold';
    return 'text-green-600';
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
                Telefone
              </th>
              <th
                onClick={() => handleSort('dataVenc')}
                className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider cursor-pointer hover:bg-[var(--bg-tertiary)]"
              >
                Vencimento {sortKey === 'dataVenc' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                onClick={() => handleSort('diasParaVencer')}
                className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider cursor-pointer hover:bg-[var(--bg-tertiary)]"
              >
                Dias p/ Vencer {sortKey === 'diasParaVencer' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                onClick={() => handleSort('status')}
                className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider cursor-pointer hover:bg-[var(--bg-tertiary)]"
              >
                Status {sortKey === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                onClick={() => handleSort('ciclo')}
                className="px-4 py-3 text-center text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider cursor-pointer hover:bg-[var(--bg-tertiary)]"
              >
                Ciclo {sortKey === 'ciclo' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                Renovou
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                Cancelou
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedData.map((item) => {
              const usuario = getUsuario(item.usuarioId) || item.usuario;
              return (
                <tr key={item.id} className={`${getRowColor(item)} hover:opacity-80`}>
                  <td className="px-4 py-3 text-sm text-[var(--text-primary)]">
                    {usuario?.emailLogin || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--text-primary)] font-medium">
                    {usuario?.nomeCompleto || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
                    {usuario?.telefone || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--text-primary)]">
                    {formatDate(item.dataVenc)}
                  </td>
                  <td className={`px-4 py-3 text-sm ${getDiasColor(item.diasParaVencer)}`}>
                    {item.diasParaVencer} dias
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.status === 'ATIVO'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-[var(--bg-tertiary)] text-gray-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--text-primary)] text-center font-semibold">
                    {item.ciclo}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {item.renovou ? (
                      <span className="text-green-600 font-bold text-lg">✓</span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {item.cancelou ? (
                      <span className="text-red-600 font-bold text-lg">✗</span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-sm space-x-2">
                    {!item.renovou && !item.cancelou && (
                      <>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => onRenovar(item)}
                        >
                          ✓ Renovar
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => onCancelar(item)}
                        >
                          ✗ Cancelar
                        </Button>
                      </>
                    )}
                    {item.renovou && (
                      <span className="text-xs text-green-600 font-semibold">Renovado</span>
                    )}
                    {item.cancelou && (
                      <span className="text-xs text-red-600 font-semibold">Cancelado</span>
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

export default AgendaTable;
