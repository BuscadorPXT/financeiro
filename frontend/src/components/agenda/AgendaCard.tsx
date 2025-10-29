import React from 'react';
import type { Agenda } from '../../services/agendaService';
import type { Usuario } from '../../services/usuarioService';
import Button from '../common/Button';
import { formatDate } from '../../utils/formatters';

interface AgendaCardProps {
  item: Agenda;
  usuario?: Usuario;
  onRenovar: (item: Agenda) => void;
  onCancelar: (item: Agenda) => void;
}

const AgendaCard: React.FC<AgendaCardProps> = ({
  item,
  usuario,
  onRenovar,
  onCancelar,
}) => {
  const getDiasColor = (dias: number): string => {
    if (dias < 0) return 'text-red-600 font-bold';
    if (dias === 0) return 'text-orange-600 font-bold';
    if (dias <= 7) return 'text-yellow-600 font-semibold';
    return 'text-green-600';
  };

  const getDiasText = (dias: number): string => {
    if (dias < 0) return `${Math.abs(dias)} dias atraso`;
    if (dias === 0) return 'Vence hoje';
    return `${dias} dias`;
  };

  const getCardBorderColor = (): string => {
    if (item.cancelou) return 'border-gray-400';
    if (item.renovou) return 'border-green-500';
    if (item.status === 'INATIVO') return 'border-gray-300';
    if (item.diasParaVencer < 0) return 'border-red-500';
    if (item.diasParaVencer === 0) return 'border-orange-500';
    if (item.diasParaVencer <= 7) return 'border-yellow-500';
    return 'border-[var(--border-color)]';
  };

  const getStatusBadge = () => {
    if (item.cancelou) return <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">Cancelado</span>;
    if (item.renovou) return <span className="text-xs bg-green-200 text-green-700 px-2 py-1 rounded">Renovado</span>;
    if (item.status === 'INATIVO') return <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">Inativo</span>;
    return null;
  };

  return (
    <div className={`bg-[var(--bg-primary)] rounded-lg shadow-md border-2 ${getCardBorderColor()} overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5`}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] truncate">
              {usuario?.nomeCompleto || '-'}
            </h3>
            <p className="text-sm text-[var(--text-secondary)] truncate">
              {usuario?.emailLogin || '-'}
            </p>
          </div>
          <div className="ml-3 flex-shrink-0">
            {getStatusBadge()}
          </div>
        </div>

        {/* Informações Principais */}
        <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
          <div>
            <span className="text-[var(--text-secondary)] block text-xs">Data Vencimento</span>
            <span className="font-semibold text-[var(--text-primary)]">
              {formatDate(item.dataVenc)}
            </span>
          </div>
          <div>
            <span className="text-[var(--text-secondary)] block text-xs">Dias p/ Vencer</span>
            <span className={`font-semibold ${getDiasColor(item.diasParaVencer)}`}>
              {getDiasText(item.diasParaVencer)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div>
            <span className="text-[var(--text-secondary)] block text-xs">Ciclo</span>
            <span className="font-semibold text-[var(--text-primary)]">
              {usuario?.ciclo || '-'}
            </span>
          </div>
          <div>
            <span className="text-[var(--text-secondary)] block text-xs">Status</span>
            <span className="font-semibold text-[var(--text-primary)]">
              {item.status}
            </span>
          </div>
        </div>

        {/* Ações */}
        {!item.renovou && !item.cancelou && item.status !== 'INATIVO' && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="primary"
              onClick={() => onRenovar(item)}
              className="flex-1"
            >
              ✓ Renovar
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => onCancelar(item)}
              className="flex-1"
            >
              ✗ Cancelar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgendaCard;
