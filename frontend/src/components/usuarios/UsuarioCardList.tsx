import React, { useState } from 'react';
import type { Usuario } from '../../services/usuarioService';
import UsuarioCard from './UsuarioCard';
import Button from '../common/Button';
import { usePagination } from '../../hooks/usePagination';

interface UsuarioCardListProps {
  usuarios: Usuario[];
  onEdit: (usuario: Usuario) => void;
  onDelete: (usuario: Usuario) => void;
  onPagamentoRapido: (usuario: Usuario) => void;
  onVerHistorico: (usuario: Usuario) => void;
  onToggleAgenda: (usuario: Usuario) => void;
  sortKey: keyof Usuario;
  sortOrder: 'asc' | 'desc';
  onSort: (key: keyof Usuario) => void;
}

const UsuarioCardList: React.FC<UsuarioCardListProps> = ({
  usuarios,
  onEdit,
  onDelete,
  onPagamentoRapido,
  onVerHistorico,
  onToggleAgenda,
  sortKey,
  sortOrder,
  onSort,
}) => {
  // Ordenação
  const sortedUsuarios = React.useMemo(() => {
    const sorted = [...usuarios].sort((a, b) => {
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
  }, [usuarios, sortKey, sortOrder]);

  // Paginação
  const {
    paginatedData,
    currentPage,
    totalPages,
    nextPage,
    previousPage,
    itemsPerPage,
    changeItemsPerPage,
  } = usePagination(sortedUsuarios, 20);

  return (
    <div>
      {/* Sorting Controls */}
      <div className="bg-[var(--bg-secondary)] px-4 py-3 border-b border-[var(--border-color)] flex gap-2 flex-wrap rounded-t-lg">
        <span className="text-sm text-[var(--text-secondary)] font-medium">Ordenar por:</span>
        <button
          onClick={() => onSort('nomeCompleto')}
          className="text-sm text-blue-600 hover:underline font-medium"
        >
          Nome {sortKey === 'nomeCompleto' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
        <button
          onClick={() => onSort('emailLogin')}
          className="text-sm text-blue-600 hover:underline font-medium"
        >
          Email {sortKey === 'emailLogin' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
        <button
          onClick={() => onSort('statusFinal')}
          className="text-sm text-blue-600 hover:underline font-medium"
        >
          Status {sortKey === 'statusFinal' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
        <button
          onClick={() => onSort('ciclo')}
          className="text-sm text-blue-600 hover:underline font-medium"
        >
          Ciclo {sortKey === 'ciclo' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
        <button
          onClick={() => onSort('diasParaVencer')}
          className="text-sm text-blue-600 hover:underline font-medium"
        >
          Dias p/ Vencer {sortKey === 'diasParaVencer' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
      </div>

      {/* Cards Grid */}
      {paginatedData.length === 0 ? (
        <div className="text-center py-12 bg-[var(--bg-primary)] rounded-b-lg shadow">
          <p className="text-[var(--text-secondary)] text-lg">Nenhum usuário encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4 p-4 bg-[var(--bg-secondary)] rounded-b-lg">
          {paginatedData.map((usuario) => (
            <UsuarioCard
              key={usuario.id}
              usuario={usuario}
              onEdit={onEdit}
              onDelete={onDelete}
              onPagamentoRapido={onPagamentoRapido}
              onVerHistorico={onVerHistorico}
              onToggleAgenda={onToggleAgenda}
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

export default UsuarioCardList;
