import React, { useEffect, useState } from 'react';
import { Usuario } from '../../services/usuarioService';
import { Pagamento } from '../../services/pagamentoService';
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
      <div className="mb-6 p-4 bg-gray-50 rounded-lg grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p className="text-xs text-gray-500 uppercase">Email</p>
          <p className="text-sm font-medium text-gray-900">{usuario.email_login}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase">Status</p>
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
          <p className="text-xs text-gray-500 uppercase">Ciclo Atual</p>
          <p className="text-sm font-medium text-gray-900">{usuario.ciclo}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase">Total de Ciclos</p>
          <p className="text-sm font-medium text-gray-900">{usuario.total_ciclos_usuario}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase">Indicador</p>
          <p className="text-sm font-medium text-gray-900">{usuario.indicador || '-'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase">Vencimento</p>
          <p className="text-sm font-medium text-gray-900">
            {usuario.data_venc ? formatDate(usuario.data_venc) : '-'}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase">Dias p/ Vencer</p>
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
          <p className="text-xs text-gray-500 uppercase">Total Pago</p>
          <p className="text-sm font-bold text-green-600">{formatCurrency(totalPago)}</p>
        </div>
      </div>

      {/* Histórico de Pagamentos */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Histórico de Pagamentos ({pagamentos.length})
        </h3>

        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">{error}</div>
        ) : pagamentos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nenhum pagamento registrado ainda
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Data
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Valor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Método
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Conta
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Comissão
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Obs
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pagamentos.map((pagamento) => (
                  <tr key={pagamento.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {formatDate(pagamento.data_pagto)}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-600">
                      {formatCurrency(pagamento.valor)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{pagamento.metodo}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{pagamento.conta}</td>
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
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {pagamento.elegivel_comissao
                        ? formatCurrency(pagamento.comissao_valor)
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
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
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Observações</h4>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{usuario.obs}</p>
        </div>
      )}
    </Modal>
  );
};

export default UsuarioHistoricoModal;
