import React from 'react';
import type { Agenda } from '../../services/agendaService';
import type { Usuario } from '../../services/usuarioService';
import AgendaCard from './AgendaCard';
import Button from '../common/Button';
import { usePagination } from '../../hooks/usePagination';

interface AgendaCardListProps {
  agenda: Agenda[];
  usuarios: Usuario[];
  onRenovar: (item: Agenda) => void;
  onCancelar: (item: Agenda) => void;
  sortKey: keyof Agenda;
  sortOrder: 'asc' | 'desc';
  onSort: (key: keyof Agenda) => void;
}

const AgendaCardList: React.FC<AgendaCardListProps> = ({
  agenda,
  usuarios,
  onRenovar,
  onCancelar,
  sortKey,
  sortOrder,
  onSort,
}) => {
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

  const getUsuario = (usuarioId: string) => {
    return usuarios.find((u) => u.id === usuarioId);
  };

  return (
    <div>
      {/* Sorting Controls */}
      <div className="bg-[var(--bg-secondary)] px-4 py-3 border-b border-[var(--border-color)] flex gap-2 flex-wrap rounded-t-lg">
        <span className="text-sm text-[var(--text-secondary)] font-medium">Ordenar por:</span>
        <button
          onClick={() => onSort('diasParaVencer')}
          className="text-sm text-blue-600 hover:underline font-medium"
        >
          Dias p/ Vencer {sortKey === 'diasParaVencer' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
        <button
          onClick={() => onSort('dataVenc')}
          className="text-sm text-blue-600 hover:underline font-medium"
        >
          Data {sortKey === 'dataVenc' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
        <button
          onClick={() => onSort('status')}
          className="text-sm text-blue-600 hover:underline font-medium"
        >
          Status {sortKey === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
      </div>

      {/* Cards Grid */}
      {paginatedData.length === 0 ? (
        <div className="text-center py-12 bg-[var(--bg-primary)] rounded-b-lg shadow">
          <p className="text-[var(--text-secondary)] text-lg">Nenhum item na agenda</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4 p-4 bg-[var(--bg-secondary)] rounded-b-lg">
          {paginatedData.map((item) => (
            <AgendaCard
              key={item.id}
              item={item}
              usuario={getUsuario(item.usuarioId)}
              onRenovar={onRenovar}
              onCancelar={onCancelar}
            />
          ))}
        </div>
      )}

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-[var(--bg-primary)] border-t border-[var(--border-color)] rounded-b-lg">
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--text-primary)]">Itens por página:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => changeItemsPerPage(Number(e.target.value))}
              className="px-2 py-1 border border-[var(--border-color)] rounded-md text-sm bg-[var(--bg-primary)] text-[var(--text-primary)]"
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

export default AgendaCardList;
