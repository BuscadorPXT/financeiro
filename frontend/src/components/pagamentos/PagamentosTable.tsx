import React, { useState } from 'react';
import type { Pagamento } from '../../services/pagamentoService';
import type { Usuario } from '../../services/usuarioService';
import Button from '../common/Button';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { usePagination } from '../../hooks/usePagination';
import { ResponsiveTable, type Column } from '../common/ResponsiveTable';

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

  // Define columns for ResponsiveTable
  const columns: Column<Pagamento>[] = [
    {
      key: 'dataPagto',
      label: 'Data',
      render: (pagamento) => formatDate(pagamento.dataPagto),
    },
    {
      key: 'mesPagto',
      label: 'Mês',
      render: (pagamento) => pagamento.mesPagto,
      hideOnMobile: true,
    },
    {
      key: 'usuario',
      label: 'Usuário',
      render: (pagamento) => {
        const usuario = getUsuario(pagamento.usuarioId);
        return (
          <div>
            <p className="font-medium">{usuario?.nomeCompleto || '-'}</p>
            <p className="text-xs text-gray-500">{usuario?.emailLogin || '-'}</p>
          </div>
        );
      },
    },
    {
      key: 'valor',
      label: 'Valor',
      render: (pagamento) => (
        <span className="font-semibold text-green-600">
          {formatCurrency(pagamento.valor)}
        </span>
      ),
    },
    {
      key: 'metodo',
      label: 'Método',
      render: (pagamento) => pagamento.metodo,
      hideOnMobile: true,
    },
    {
      key: 'conta',
      label: 'Conta',
      render: (pagamento) => pagamento.conta,
      hideOnMobile: true,
    },
    {
      key: 'regraTipo',
      label: 'Tipo',
      render: (pagamento) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            pagamento.regraTipo === 'PRIMEIRO'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-purple-100 text-purple-800'
          }`}
        >
          {pagamento.regraTipo}
        </span>
      ),
    },
    {
      key: 'comissao',
      label: 'Comissão',
      render: (pagamento) =>
        pagamento.elegivelComissao ? (
          <span className="text-green-600 font-medium">
            {formatCurrency(pagamento.comissaoValor)}
          </span>
        ) : (
          <span className="text-gray-400">-</span>
        ),
      hideOnMobile: true,
    },
    {
      key: 'observacao',
      label: 'Observação',
      render: (pagamento) => (
        <span className="truncate max-w-xs block">{pagamento.observacao || '-'}</span>
      ),
      hideOnMobile: true,
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (pagamento) => (
        <div className="flex gap-2 justify-end items-center">
          <Button size="sm" onClick={() => onEdit(pagamento)}>
            ✏️
          </Button>
          <Button size="sm" variant="danger" onClick={() => onDelete(pagamento)}>
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
          onClick={() => handleSort('dataPagto')}
          className="text-sm text-blue-600 hover:underline"
        >
          Data {sortKey === 'dataPagto' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
        <button
          onClick={() => handleSort('mesPagto')}
          className="text-sm text-blue-600 hover:underline"
        >
          Mês {sortKey === 'mesPagto' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
        <button
          onClick={() => handleSort('valor')}
          className="text-sm text-blue-600 hover:underline"
        >
          Valor {sortKey === 'valor' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
        <button
          onClick={() => handleSort('regraTipo')}
          className="text-sm text-blue-600 hover:underline"
        >
          Tipo {sortKey === 'regraTipo' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
      </div>

      <ResponsiveTable
        data={paginatedData}
        columns={columns}
        keyExtractor={(pagamento) => pagamento.id.toString()}
        emptyMessage="Nenhum pagamento encontrado"
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

export default PagamentosTable;
