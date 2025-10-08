import React, { useState } from 'react';
import type { Usuario } from '../../services/usuarioService';
import StatusBadge from '../common/StatusBadge';
import Button from '../common/Button';
import { formatDate } from '../../utils/formatters';
import { usePagination } from '../../hooks/usePagination';

interface UsuariosTableProps {
  usuarios: Usuario[];
  onEdit: (usuario: Usuario) => void;
  onDelete: (usuario: Usuario) => void;
  onPagamentoRapido: (usuario: Usuario) => void;
  onVerHistorico: (usuario: Usuario) => void;
  onToggleAgenda: (usuario: Usuario) => void;
}

const UsuariosTable: React.FC<UsuariosTableProps> = ({
  usuarios,
  onEdit,
  onDelete,
  onPagamentoRapido,
  onVerHistorico,
  onToggleAgenda,
}) => {
  const [sortKey, setSortKey] = useState<keyof Usuario>('nomeCompleto');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

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
    goToPage,
    nextPage,
    previousPage,
    itemsPerPage,
    changeItemsPerPage,
  } = usePagination(sortedUsuarios, 20);

  const handleSort = (key: keyof Usuario) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case 'ATIVO':
        return 'success';
      case 'EM_ATRASO':
        return 'warning';
      case 'INATIVO':
        return 'error';
      default:
        return 'default';
    }
  };

  const getDiasParaVencerColor = (dias?: number): string => {
    if (dias === undefined || dias === null) return 'text-[var(--text-secondary)]';
    if (dias < 0) return 'text-red-600 font-bold';
    if (dias === 0) return 'text-orange-600 font-bold';
    if (dias <= 7) return 'text-yellow-600 font-semibold';
    return 'text-green-600';
  };

  return (
    <div>
      <div className="overflow-x-auto" style={{ maxHeight: 'calc(100vh - 350px)' }}>
        <table className="min-w-full divide-y divide-gray-200" style={{ minWidth: '1800px' }}>
          <thead className="bg-[var(--bg-secondary)] sticky top-0 z-10">
            <tr>
              <th
                onClick={() => handleSort('emailLogin')}
                className="px-4 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider cursor-pointer hover:bg-[var(--bg-tertiary)]"
                style={{ minWidth: '220px' }}
              >
                Email {sortKey === 'emailLogin' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                onClick={() => handleSort('nomeCompleto')}
                className="px-4 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider cursor-pointer hover:bg-[var(--bg-tertiary)]"
                style={{ minWidth: '200px' }}
              >
                Nome {sortKey === 'nomeCompleto' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider"
                style={{ minWidth: '140px' }}>
                Telefone
              </th>
              <th className="px-4 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider"
                style={{ minWidth: '150px' }}>
                Indicador
              </th>
              <th
                onClick={() => handleSort('statusFinal')}
                className="px-4 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider cursor-pointer hover:bg-[var(--bg-tertiary)]"
                style={{ minWidth: '120px' }}
              >
                Status {sortKey === 'statusFinal' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider"
                style={{ minWidth: '140px' }}>
                Método
              </th>
              <th className="px-4 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider"
                style={{ minWidth: '140px' }}>
                Conta
              </th>
              <th
                onClick={() => handleSort('ciclo')}
                className="px-4 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider cursor-pointer hover:bg-[var(--bg-tertiary)]"
                style={{ minWidth: '80px' }}
              >
                Ciclo {sortKey === 'ciclo' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider"
                style={{ minWidth: '130px' }}>
                Vencimento
              </th>
              <th
                onClick={() => handleSort('diasParaVencer')}
                className="px-4 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider cursor-pointer hover:bg-[var(--bg-tertiary)]"
                style={{ minWidth: '140px' }}
              >
                Dias p/ Vencer {sortKey === 'diasParaVencer' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-4 text-center text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider"
                style={{ minWidth: '90px' }}>
                Agenda
              </th>
              <th className="px-4 py-4 text-right text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider"
                style={{ minWidth: '250px' }}>
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-[var(--bg-primary)] divide-y divide-gray-200">
            {paginatedData.map((usuario) => (
              <tr key={usuario.id} className="hover:bg-[var(--bg-secondary)]">
                <td className="px-4 py-5 text-sm text-[var(--text-primary)] whitespace-normal break-words">{usuario.emailLogin}</td>
                <td className="px-4 py-5 text-sm text-[var(--text-primary)] whitespace-normal break-words">{usuario.nomeCompleto}</td>
                <td className="px-4 py-5 text-sm text-[var(--text-secondary)] whitespace-nowrap">{usuario.telefone || '-'}</td>
                <td className="px-4 py-5 text-sm text-[var(--text-secondary)] whitespace-normal break-words">{usuario.indicador || '-'}</td>
                <td className="px-4 py-5 text-sm">
                  <StatusBadge
                    status={usuario.statusFinal}
                    variant={getStatusColor(usuario.statusFinal)}
                  />
                </td>
                <td className="px-4 py-5 text-sm text-[var(--text-secondary)] whitespace-nowrap">{usuario.metodo || '-'}</td>
                <td className="px-4 py-5 text-sm text-[var(--text-secondary)] whitespace-nowrap">{usuario.conta || '-'}</td>
                <td className="px-4 py-5 text-sm text-[var(--text-primary)] text-center font-semibold">
                  {usuario.ciclo}
                </td>
                <td className="px-4 py-5 text-sm text-[var(--text-secondary)] whitespace-nowrap">
                  {usuario.dataVenc ? formatDate(usuario.dataVenc) : '-'}
                </td>
                <td className={`px-4 py-5 text-sm whitespace-nowrap ${getDiasParaVencerColor(usuario.diasParaVencer)}`}>
                  {usuario.diasParaVencer !== null && usuario.diasParaVencer !== undefined
                    ? `${usuario.diasParaVencer} dias`
                    : '-'}
                </td>
                <td className="px-4 py-5 text-center">
                  <input
                    type="checkbox"
                    checked={usuario.flagAgenda}
                    onChange={() => onToggleAgenda(usuario)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </td>
                <td className="px-4 py-5 text-right text-sm">
                  <div className="flex gap-2 justify-end items-center whitespace-nowrap">
                    <Button size="sm" variant="secondary" onClick={() => onPagamentoRapido(usuario)}>
                      💰 Pagar
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => onVerHistorico(usuario)}>
                      📋
                    </Button>
                    <Button size="sm" onClick={() => onEdit(usuario)}>
                      ✏️
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => onDelete(usuario)}>
                      🗑️
                    </Button>
                  </div>
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

export default UsuariosTable;
