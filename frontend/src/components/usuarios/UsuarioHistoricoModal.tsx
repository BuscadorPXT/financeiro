import React, { useEffect, useState } from 'react';
import type { Usuario } from '../../services/usuarioService';
import type { Pagamento } from '../../services/pagamentoService';
import pagamentoService from '../../services/pagamentoService';
import Modal from '../common/Modal';
import LoadingSpinner from '../common/LoadingSpinner';
import { formatDate, formatCurrency } from '../../utils/formatters';
import StatusBadge from '../common/StatusBadge';

interface UsuarioHistoricoModalProps {
  usuario: Usuario;
  onClose: () => void;
}

const UsuarioHistoricoModal: React.FC<UsuarioHistoricoModalProps> = ({
  usuario,
  onClose,
}) => {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPagamentos = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await pagamentoService.getByUsuario(usuario.id);
        setPagamentos(data);
      } catch (err) {
        setError('Erro ao carregar histórico de pagamentos');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPagamentos();
  }, [usuario.id]);

  const totalPago = pagamentos.reduce((sum, p) => sum + p.valor, 0);

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Histórico - ${usuario.nomeCompleto}`}
      size="xl"
    >
      {/* Resumo do Usuário */}
      <div className="mb-6 p-4 bg-[var(--bg-secondary)] rounded-lg grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p className="text-xs text-[var(--text-secondary)] uppercase">Email</p>
          <p className="text-sm font-medium text-[var(--text-primary)]">{usuario.emailLogin}</p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-secondary)] uppercase">Status</p>
          <StatusBadge
            status={usuario.statusFinal}
            variant={
              usuario.statusFinal === 'ATIVO'
                ? 'success'
                : usuario.statusFinal === 'EM_ATRASO'
                ? 'warning'
                : usuario.statusFinal === 'INATIVO'
                ? 'danger'
                : 'default'
            }
          />
        </div>
        <div>
          <p className="text-xs text-[var(--text-secondary)] uppercase">Ciclo Atual</p>
          <p className="text-sm font-medium text-[var(--text-primary)]">{usuario.ciclo}</p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-secondary)] uppercase">Total de Ciclos</p>
          <p className="text-sm font-medium text-[var(--text-primary)]">{usuario.totalCiclosUsuario}</p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-secondary)] uppercase">Indicador</p>
          <p className="text-sm font-medium text-[var(--text-primary)]">{usuario.indicador || '-'}</p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-secondary)] uppercase">Vencimento</p>
          <p className="text-sm font-medium text-[var(--text-primary)]">
            {usuario.dataVenc ? formatDate(usuario.dataVenc) : '-'}
          </p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-secondary)] uppercase">Dias p/ Vencer</p>
          <p
            className={`text-sm font-medium ${
              (usuario.diasParaVencer || 0) < 0
                ? 'text-red-600'
                : (usuario.diasParaVencer || 0) <= 7
                ? 'text-yellow-600'
                : 'text-green-600'
            }`}
          >
            {usuario.diasParaVencer !== null ? `${usuario.diasParaVencer} dias` : '-'}
          </p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-secondary)] uppercase">Total Pago</p>
          <p className="text-sm font-bold text-green-600">{formatCurrency(totalPago)}</p>
        </div>
      </div>

      {/* Histórico de Pagamentos */}
      <div>
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
          Histórico de Pagamentos ({pagamentos.length})
        </h3>

        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">{error}</div>
        ) : pagamentos.length === 0 ? (
          <div className="text-center py-8 text-[var(--text-secondary)]">
            Nenhum pagamento registrado ainda
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[var(--bg-secondary)]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">
                    Data
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">
                    Valor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">
                    Método
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">
                    Conta
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">
                    Comissão
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">
                    Obs
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[var(--bg-primary)] divide-y divide-gray-200">
                {pagamentos.map((pagamento) => (
                  <tr key={pagamento.id} className="hover:bg-[var(--bg-secondary)]">
                    <td className="px-4 py-3 text-sm text-[var(--text-primary)]">
                      {formatDate(pagamento.dataPagto)}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-600">
                      {formatCurrency(pagamento.valor)}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">{pagamento.metodo}</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">{pagamento.conta}</td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          pagamento.regraTipo === 'PRIMEIRO'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {pagamento.regraTipo}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--text-primary)]">
                      {pagamento.elegivelComissao
                        ? formatCurrency(pagamento.comissaoValor)
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
                      {pagamento.observacao || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Observações do Usuário */}
      {usuario.obs && (
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Observações</h4>
          <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap">{usuario.obs}</p>
        </div>
      )}
    </Modal>
  );
};

export default UsuarioHistoricoModal;
