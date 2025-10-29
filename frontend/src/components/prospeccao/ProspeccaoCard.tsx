import React, { useState } from 'react';
import type { Prospeccao } from '../../services/prospeccaoService';
import Button from '../common/Button';
import { formatDate } from '../../utils/formatters';

interface ProspeccaoCardProps {
  prospeccao: Prospeccao;
  onEdit: (prospeccao: Prospeccao) => void;
  onDelete: (prospeccao: Prospeccao) => void;
  onConverter: (prospeccao: Prospeccao) => void;
}

const ProspeccaoCard: React.FC<ProspeccaoCardProps> = ({
  prospeccao,
  onEdit,
  onDelete,
  onConverter,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`bg-[var(--bg-primary)] rounded-lg shadow-md border-2 ${prospeccao.convertido ? 'border-green-500' : 'border-[var(--border-color)]'} overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5`}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] truncate">
                {prospeccao.nome}
              </h3>
              {prospeccao.convertido && (
                <span className="text-xs bg-green-200 text-green-700 px-2 py-1 rounded">
                  Convertido
                </span>
              )}
            </div>
            <p className="text-sm text-[var(--text-secondary)] truncate">
              {prospeccao.email}
            </p>
          </div>
        </div>

        {/* Informações Principais */}
        <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
          <div>
            <span className="text-[var(--text-secondary)] block text-xs">Telefone</span>
            <span className="font-semibold text-[var(--text-primary)]">
              {prospeccao.telefone || '-'}
            </span>
          </div>
          <div>
            <span className="text-[var(--text-secondary)] block text-xs">Indicador</span>
            <span className="font-semibold text-[var(--text-primary)]">
              {prospeccao.indicador || '-'}
            </span>
          </div>
        </div>

        {/* Detalhes Expandidos */}
        {isExpanded && prospeccao.observacao && (
          <div className="border-t border-[var(--border-color)] pt-3 mt-3 space-y-2 text-sm fade-in">
            <div>
              <span className="text-[var(--text-secondary)] text-xs block mb-1">
                Observação:
              </span>
              <p className="text-[var(--text-primary)] text-sm">
                {prospeccao.observacao}
              </p>
            </div>
            <div>
              <span className="text-[var(--text-secondary)] text-xs">Cadastrado em:</span>
              <span className="ml-2 text-[var(--text-primary)]">
                {formatDate(prospeccao.created_at)}
              </span>
            </div>
          </div>
        )}

        {/* Ações */}
        <div className="flex flex-wrap gap-2 mt-4">
          {!prospeccao.convertido && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => onConverter(prospeccao)}
              className="flex-1 min-w-[120px]"
            >
              ➜ Converter
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => onEdit(prospeccao)}
            className={!prospeccao.convertido ? '' : 'flex-1 min-w-[100px]'}
          >
            ✏️ Editar
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => onDelete(prospeccao)}
          >
            🗑️
          </Button>
          {prospeccao.observacao && (
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

export default ProspeccaoCard;
