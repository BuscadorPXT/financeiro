import React, { useState } from 'react';
import type { Despesa } from '../../services/despesaService';
import Button from '../common/Button';
import StatusBadge from '../common/StatusBadge';
import { formatCurrency } from '../../utils/formatters';

interface DespesaCardProps {
  despesa: Despesa;
  onEdit: (despesa: Despesa) => void;
  onDelete: (despesa: Despesa) => void;
  onQuitar: (despesa: Despesa) => void;
}

const DespesaCard: React.FC<DespesaCardProps> = ({
  despesa,
  onEdit,
  onDelete,
  onQuitar,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getMesNome = (mes: number): string => {
    const meses = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];
    return meses[mes - 1] || '';
  };

  return (
    <div className="bg-[var(--bg-primary)] rounded-lg shadow-md border border-[var(--border-color)] overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">
                {formatCurrency(despesa.valor)}
              </h3>
              <StatusBadge
                status={despesa.status}
                variant={despesa.status === 'PAGO' ? 'success' : 'warning'}
              />
            </div>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              {despesa.categoria}
            </p>
            <p className="text-xs text-[var(--text-secondary)] truncate">
              {despesa.descricao}
            </p>
          </div>
          <div className="ml-3 flex-shrink-0 text-right">
            <div className="text-sm font-medium text-[var(--text-primary)]">
              {getMesNome(despesa.competenciaMes)}/{despesa.competenciaAno}
            </div>
          </div>
        </div>

        {/* Informações Principais - Compacto */}
        <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
          <div>
            <span className="text-[var(--text-secondary)] block text-xs">Conta</span>
            <span className="font-semibold text-[var(--text-primary)]">
              {despesa.conta || '-'}
            </span>
          </div>
          <div>
            <span className="text-[var(--text-secondary)] block text-xs">Indicador</span>
            <span className="font-semibold text-[var(--text-primary)]">
              {despesa.indicador || '-'}
            </span>
          </div>
        </div>

        {/* Detalhes Expandidos */}
        {isExpanded && despesa.descricao && despesa.descricao.length > 50 && (
          <div className="border-t border-[var(--border-color)] pt-3 mt-3 space-y-2 text-sm fade-in">
            <div>
              <span className="text-[var(--text-secondary)] text-xs block mb-1">
                Descrição Completa:
              </span>
              <p className="text-[var(--text-primary)] text-sm">
                {despesa.descricao}
              </p>
            </div>
          </div>
        )}

        {/* Ações */}
        <div className="flex flex-wrap gap-2 mt-4">
          {despesa.status === 'PENDENTE' && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => onQuitar(despesa)}
              className="flex-1 min-w-[100px]"
            >
              ✓ Quitar
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => onEdit(despesa)}
            className={despesa.status === 'PAGO' ? 'flex-1 min-w-[100px]' : ''}
          >
            ✏️ Editar
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => onDelete(despesa)}
          >
            🗑️
          </Button>
          {despesa.descricao && despesa.descricao.length > 50 && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setIsExpanded(!isExpanded)}
              className="ml-auto"
            >
              {isExpanded ? '⬆️ Menos' : '⬇️ Mais'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DespesaCard;
