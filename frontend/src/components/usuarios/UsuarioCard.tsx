import React, { useState } from 'react';
import type { Usuario } from '../../services/usuarioService';
import StatusBadge from '../common/StatusBadge';
import Button from '../common/Button';
import { formatDate } from '../../utils/formatters';

interface UsuarioCardProps {
  usuario: Usuario;
  onEdit: (usuario: Usuario) => void;
  onDelete: (usuario: Usuario) => void;
  onPagamentoRapido: (usuario: Usuario) => void;
  onVerHistorico: (usuario: Usuario) => void;
  onToggleAgenda: (usuario: Usuario) => void;
}

const UsuarioCard: React.FC<UsuarioCardProps> = ({
  usuario,
  onEdit,
  onDelete,
  onPagamentoRapido,
  onVerHistorico,
  onToggleAgenda,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

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
    if (dias === undefined || dias === null) return 'text-gray-500';
    if (dias < 0) return 'text-red-600 font-bold';
    if (dias === 0) return 'text-orange-600 font-bold';
    if (dias <= 7) return 'text-yellow-600 font-semibold';
    return 'text-green-600';
  };

  const getDiasParaVencerText = (dias?: number): string => {
    if (dias === undefined || dias === null) return '-';
    if (dias < 0) return `${Math.abs(dias)} dias atraso`;
    if (dias === 0) return 'Vence hoje';
    return `${dias} dias`;
  };

  return (
    <div className="bg-[var(--bg-primary)] rounded-lg shadow-md border border-[var(--border-color)] overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
      {/* Card Header - Sempre visível */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] truncate">
              {usuario.nomeCompleto}
            </h3>
            <p className="text-sm text-[var(--text-secondary)] truncate">{usuario.emailLogin}</p>
          </div>
          <div className="ml-3 flex-shrink-0">
            <StatusBadge
              status={usuario.statusFinal}
              variant={getStatusColor(usuario.statusFinal)}
            />
          </div>
        </div>

        {/* Informações Principais - Modo Compacto */}
        <div className="grid grid-cols-3 gap-3 mb-3 text-sm">
          <div>
            <span className="text-[var(--text-secondary)] block text-xs">Ciclo</span>
            <span className="font-semibold text-[var(--text-primary)]">{usuario.ciclo}</span>
          </div>
          <div>
            <span className="text-[var(--text-secondary)] block text-xs">Vencimento</span>
            <span className={`font-semibold ${getDiasParaVencerColor(usuario.diasParaVencer)}`}>
              {getDiasParaVencerText(usuario.diasParaVencer)}
            </span>
          </div>
          <div>
            <span className="text-[var(--text-secondary)] block text-xs">Indicador</span>
            <span className="font-semibold text-[var(--text-primary)] truncate block">
              {usuario.indicador || '-'}
            </span>
          </div>
        </div>

        {/* Detalhes Expandidos - Condicional */}
        {isExpanded && (
          <div className="border-t border-[var(--border-color)] pt-3 mt-3 space-y-2 text-sm fade-in">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[var(--text-secondary)]">Telefone:</span>
                <span className="ml-2 text-[var(--text-primary)]">{usuario.telefone || '-'}</span>
              </div>
              <div>
                <span className="text-[var(--text-secondary)]">Método:</span>
                <span className="ml-2 text-[var(--text-primary)]">{usuario.metodo || '-'}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[var(--text-secondary)]">Conta:</span>
                <span className="ml-2 text-[var(--text-primary)]">{usuario.conta || '-'}</span>
              </div>
              <div>
                <span className="text-[var(--text-secondary)]">Data Venc:</span>
                <span className="ml-2 text-[var(--text-primary)]">
                  {usuario.dataVenc ? formatDate(usuario.dataVenc) : '-'}
                </span>
              </div>
            </div>
            <div className="flex items-center pt-1">
              <input
                type="checkbox"
                checked={usuario.flagAgenda}
                onChange={() => onToggleAgenda(usuario)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 mr-2"
              />
              <span className="text-[var(--text-primary)]">Incluir na Agenda</span>
            </div>
          </div>
        )}

        {/* Ações */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onPagamentoRapido(usuario)}
            className="flex-1 min-w-[100px]"
          >
            💰 Pagar
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onVerHistorico(usuario)}
            title="Ver Histórico"
          >
            📋
          </Button>
          <Button
            size="sm"
            onClick={() => onEdit(usuario)}
            title="Editar"
          >
            ✏️
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => onDelete(usuario)}
            title="Excluir"
          >
            🗑️
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-auto"
          >
            {isExpanded ? '⬆️ Menos' : '⬇️ Mais'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UsuarioCard;
