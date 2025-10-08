import React, { useState } from 'react';
import { Usuario } from '../../services/usuarioService';
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
  const [sortKey, setSortKey] = useState<keyof Usuario>('nome_completo');
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
      case 'Ativo':
        return 'success';
      case 'Em_Atraso':
        return 'warning';
      case 'Inativo':
        return 'error';
      default:
        return 'default';
    }
  };

  const getDiasParaVencerColor = (dias?: number): string => {
    if (dias === undefined || dias === null) return 'text-gray-500';
    if (dias < 0) return 'text-red-600 font-bold';
    if (dias === 0) return 'text-orange-600 font-bold';
    if (dias <= 7) return 'text-yellow-600 font-semibold';
    return 'text-green-600';
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                onClick={() => handleSort('email_login')}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Email {sortKey === 'email_login' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                onClick={() => handleSort('nome_completo')}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Nome {sortKey === 'nome_completo' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Telefone
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Indicador
              </th>
              <th
                onClick={() => handleSort('status_final')}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Status {sortKey === 'status_final' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Método
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Conta
              </th>
              <th
                onClick={() => handleSort('ciclo')}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Ciclo {sortKey === 'ciclo' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vencimento
              </th>
              <th
                onClick={() => handleSort('dias_para_vencer')}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Dias p/ Vencer {sortKey === 'dias_para_vencer' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Agenda
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((usuario) => (
              <tr key={usuario.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">{usuario.email_login}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{usuario.nome_completo}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{usuario.telefone || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{usuario.indicador || '-'}</td>
                <td className="px-4 py-3 text-sm">
                  <StatusBadge
                    status={usuario.status_final}
                    variant={getStatusColor(usuario.status_final)}
                  />
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{usuario.metodo || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{usuario.conta || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-900 text-center font-semibold">
                  {usuario.ciclo}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {usuario.data_venc ? formatDate(usuario.data_venc) : '-'}
                </td>
                <td className={`px-4 py-3 text-sm ${getDiasParaVencerColor(usuario.dias_para_vencer)}`}>
                  {usuario.dias_para_vencer !== null && usuario.dias_para_vencer !== undefined
                    ? `${usuario.dias_para_vencer} dias`
                    : '-'}
                </td>
                <td className="px-4 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={usuario.flag_agenda}
                    onChange={() => onToggleAgenda(usuario)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </td>
                <td className="px-4 py-3 text-right text-sm space-x-2">
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Itens por página:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => changeItemsPerPage(Number(e.target.value))}
              className="px-2 py-1 border border-gray-300 rounded-md text-sm"
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
            <span className="text-sm text-gray-700">
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
