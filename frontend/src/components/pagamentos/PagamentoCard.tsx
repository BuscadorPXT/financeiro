import React, { useState } from 'react';
import type { Pagamento } from '../../services/pagamentoService';
import type { Usuario } from '../../services/usuarioService';
import Button from '../common/Button';
import { formatDate, formatCurrency } from '../../utils/formatters';

interface PagamentoCardProps {
  pagamento: Pagamento;
  usuario?: Usuario;
  onEdit: (pagamento: Pagamento) => void;
  onDelete: (pagamento: Pagamento) => void;
}

const PagamentoCard: React.FC<PagamentoCardProps> = ({
  pagamento,
  usuario,
  onEdit,
  onDelete,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-[var(--bg-primary)] rounded-lg shadow-md border border-[var(--border-color)] overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                {formatCurrency(pagamento.valor)}
              </h3>
              <span
                className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                  pagamento.regraTipo === 'PRIMEIRO'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
                    : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200'
                }`}
              >
                {pagamento.regraTipo}
              </span>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              {usuario?.nomeCompleto || '-'}
            </p>
            <p className="text-xs text-[var(--text-secondary)] truncate">
              {usuario?.emailLogin || '-'}
            </p>
          </div>
          <div className="ml-3 flex-shrink-0 text-right">
            <div className="text-sm font-medium text-[var(--text-primary)]">
              {formatDate(pagamento.dataPagto)}
            </div>
            <div className="text-xs text-[var(--text-secondary)]">
              {pagamento.mesPagto}
            </div>
          </div>
        </div>

        {/* Informações Principais - Compacto */}
        <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
          <div>
            <span className="text-[var(--text-secondary)] block text-xs">Método</span>
            <span className="font-semibold text-[var(--text-primary)]">
              {pagamento.metodo}
            </span>
          </div>
          <div>
            <span className="text-[var(--text-secondary)] block text-xs">Conta</span>
            <span className="font-semibold text-[var(--text-primary)]">
              {pagamento.conta}
            </span>
          </div>
        </div>

        {/* Detalhes Expandidos */}
        {isExpanded && (
          <div className="border-t border-[var(--border-color)] pt-3 mt-3 space-y-2 text-sm fade-in">
            {pagamento.elegivelComissao && (
              <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
                <span className="text-[var(--text-secondary)] text-xs">Comissão:</span>
                <span className="ml-2 text-green-600 dark:text-green-400 font-semibold">
                  {formatCurrency(pagamento.comissaoValor)}
                </span>
              </div>
            )}
            {pagamento.observacao && (
              <div>
                <span className="text-[var(--text-secondary)] text-xs block mb-1">
                  Observação:
                </span>
                <p className="text-[var(--text-primary)] text-sm">
                  {pagamento.observacao}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Ações */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Button
            size="sm"
            onClick={() => onEdit(pagamento)}
            className="flex-1 min-w-[100px]"
          >
            ✏️ Editar
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => onDelete(pagamento)}
          >
            🗑️
          </Button>
          {(pagamento.elegivelComissao || pagamento.observacao) && (
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

export default PagamentoCard;
