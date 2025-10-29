import React, { useState } from 'react';
import type { Usuario } from '../../services/usuarioService';
import StatusBadge from '../common/StatusBadge';
import Button from '../common/Button';
import { formatDate } from '../../utils/formatters';
import { usePagination } from '../../hooks/usePagination';
import { ResponsiveTable, type Column } from '../common/ResponsiveTable';

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

  const getStatusColor = (status: string): 'success' | 'warning' | 'danger' | 'default' => {
    switch (status) {
      case 'ATIVO':
        return 'success';
      case 'EM_ATRASO':
        return 'warning';
      case 'INATIVO':
        return 'danger';
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

  // Define columns for ResponsiveTable
  const columns: Column<Usuario>[] = [
    {
      key: 'emailLogin',
      label: 'Email',
      render: (usuario) => <span className="break-words">{usuario.emailLogin}</span>,
    },
    {
      key: 'nomeCompleto',
      label: 'Nome',
      render: (usuario) => <span className="break-words">{usuario.nomeCompleto}</span>,
    },
    {
      key: 'telefone',
      label: 'Telefone',
      render: (usuario) => usuario.telefone || '-',
      hideOnMobile: true,
    },
    {
      key: 'indicador',
      label: 'Indicador',
      render: (usuario) => usuario.indicador || '-',
      hideOnMobile: true,
    },
    {
      key: 'statusFinal',
      label: 'Status',
      render: (usuario) => (
        <StatusBadge
          status={usuario.statusFinal}
          variant={getStatusColor(usuario.statusFinal)}
        />
      ),
    },
    {
      key: 'metodo',
      label: 'Método',
      render: (usuario) => usuario.metodo || '-',
      hideOnMobile: true,
    },
    {
      key: 'conta',
      label: 'Conta',
      render: (usuario) => usuario.conta || '-',
      hideOnMobile: true,
    },
    {
      key: 'ciclo',
      label: 'Ciclo',
      render: (usuario) => <span className="font-semibold">{usuario.ciclo}</span>,
    },
    {
      key: 'dataVenc',
      label: 'Vencimento',
      render: (usuario) => (usuario.dataVenc ? formatDate(usuario.dataVenc) : '-'),
      hideOnMobile: true,
    },
    {
      key: 'diasParaVencer',
      label: 'Dias p/ Vencer',
      render: (usuario) => (
        <span className={getDiasParaVencerColor(usuario.diasParaVencer)}>
          {usuario.diasParaVencer !== null && usuario.diasParaVencer !== undefined
            ? `${usuario.diasParaVencer} dias`
            : '-'}
        </span>
      ),
    },
    {
      key: 'flagAgenda',
      label: 'Agenda',
      render: (usuario) => (
        <input
          type="checkbox"
          checked={usuario.flagAgenda}
          onChange={() => onToggleAgenda(usuario)}
          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
        />
      ),
      hideOnMobile: true,
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (usuario) => (
        <div className="flex gap-2 justify-end items-center flex-wrap">
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
      ),
    },
  ];

  return (
    <div>
      {/* Sorting Controls */}
      <div className="bg-[var(--bg-secondary)] px-4 py-3 border-b border-[var(--border-color)] flex gap-2 flex-wrap">
        <span className="text-sm text-[var(--text-secondary)] font-medium">Ordenar por:</span>
        <button
          onClick={() => handleSort('nomeCompleto')}
          className="text-sm text-blue-600 hover:underline"
        >
          Nome {sortKey === 'nomeCompleto' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
        <button
          onClick={() => handleSort('emailLogin')}
          className="text-sm text-blue-600 hover:underline"
        >
          Email {sortKey === 'emailLogin' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
        <button
          onClick={() => handleSort('statusFinal')}
          className="text-sm text-blue-600 hover:underline"
        >
          Status {sortKey === 'statusFinal' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
        <button
          onClick={() => handleSort('ciclo')}
          className="text-sm text-blue-600 hover:underline"
        >
          Ciclo {sortKey === 'ciclo' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
        <button
          onClick={() => handleSort('diasParaVencer')}
          className="text-sm text-blue-600 hover:underline"
        >
          Dias p/ Vencer {sortKey === 'diasParaVencer' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
      </div>

      <ResponsiveTable
        data={paginatedData}
        columns={columns}
        keyExtractor={(usuario) => usuario.id.toString()}
        emptyMessage="Nenhum usuário encontrado"
      />

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
