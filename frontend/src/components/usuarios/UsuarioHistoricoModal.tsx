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
      title={`Histórico - ${usuario.nome_completo}`}
      size="xl"
    >
      {/* Resumo do Usuário */}
      <div className="mb-6 p-4 bg-[var(--bg-secondary)] rounded-lg grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p className="text-xs text-[var(--text-secondary)] uppercase">Email</p>
          <p className="text-sm font-medium text-[var(--text-primary)]">{usuario.email_login}</p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-secondary)] uppercase">Status</p>
          <StatusBadge
            status={usuario.status_final}
            variant={
              usuario.status_final === 'Ativo'
                ? 'success'
                : usuario.status_final === 'Em_Atraso'
                ? 'warning'
                : usuario.status_final === 'Inativo'
                ? 'error'
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
          <p className="text-sm font-medium text-[var(--text-primary)]">{usuario.total_ciclos_usuario}</p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-secondary)] uppercase">Indicador</p>
          <p className="text-sm font-medium text-[var(--text-primary)]">{usuario.indicador || '-'}</p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-secondary)] uppercase">Vencimento</p>
          <p className="text-sm font-medium text-[var(--text-primary)]">
            {usuario.data_venc ? formatDate(usuario.data_venc) : '-'}
          </p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-secondary)] uppercase">Dias p/ Vencer</p>
          <p
            className={`text-sm font-medium ${
              (usuario.dias_para_vencer || 0) < 0
                ? 'text-red-600'
                : (usuario.dias_para_vencer || 0) <= 7
                ? 'text-yellow-600'
                : 'text-green-600'
            }`}
          >
            {usuario.dias_para_vencer !== null ? `${usuario.dias_para_vencer} dias` : '-'}
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
                      {formatDate(pagamento.data_pagto)}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-600">
                      {formatCurrency(pagamento.valor)}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">{pagamento.metodo}</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">{pagamento.conta}</td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          pagamento.regra_tipo === 'PRIMEIRO'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {pagamento.regra_tipo}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--text-primary)]">
                      {pagamento.elegivel_comissao
                        ? formatCurrency(pagamento.comissao_valor)
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
