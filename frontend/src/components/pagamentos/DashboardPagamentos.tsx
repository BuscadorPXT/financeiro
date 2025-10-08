import React, { useMemo } from 'react';
import type { Pagamento } from '../../services/pagamentoService';
import Card from '../common/Card';
import { formatCurrency } from '../../utils/formatters';

interface DashboardPagamentosProps {
  pagamentos: Pagamento[];
}

const DashboardPagamentos: React.FC<DashboardPagamentosProps> = ({ pagamentos }) => {
  // Cálculos de resumo
  const stats = useMemo(() => {
    const totalGeral = pagamentos.reduce((sum, p) => sum + p.valor, 0);

    // Mês atual
    const hoje = new Date();
    const mesAtualNum = hoje.getMonth() + 1;
    const anoAtualNum = hoje.getFullYear();

    const pagamentosMesAtual = pagamentos.filter((p) => {
      const dataPagto = new Date(p.dataPagto);
      return dataPagto.getMonth() + 1 === mesAtualNum && dataPagto.getFullYear() === anoAtualNum;
    });
    const totalMesAtual = pagamentosMesAtual.reduce((sum, p) => sum + p.valor, 0);

    // Por conta
    const porConta: Record<string, number> = {};
    pagamentos.forEach((p) => {
      porConta[p.conta] = (porConta[p.conta] || 0) + p.valor;
    });

    // Por método
    const porMetodo: Record<string, number> = {};
    pagamentos.forEach((p) => {
      porMetodo[p.metodo] = (porMetodo[p.metodo] || 0) + p.valor;
    });

    // Por tipo
    const primeiros = pagamentos.filter((p) => p.regraTipo === 'PRIMEIRO');
    const recorrentes = pagamentos.filter((p) => p.regraTipo === 'RECORRENTE');
    const totalPrimeiros = primeiros.reduce((sum, p) => sum + p.valor, 0);
    const totalRecorrentes = recorrentes.reduce((sum, p) => sum + p.valor, 0);

    // Total de comissões
    const totalComissoes = pagamentos
      .filter((p) => p.elegivelComissao)
      .reduce((sum, p) => sum + p.comissaoValor, 0);

    return {
      totalGeral,
      totalMesAtual,
      qtdMesAtual: pagamentosMesAtual.length,
      porConta,
      porMetodo,
      qtdPrimeiros: primeiros.length,
      qtdRecorrentes: recorrentes.length,
      totalPrimeiros,
      totalRecorrentes,
      totalComissoes,
    };
  }, [pagamentos]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Geral */}
      <Card>
        <div className="flex flex-col">
          <span className="text-sm text-[var(--text-secondary)] mb-1">Total Geral</span>
          <span className="text-2xl font-bold text-green-600">
            {formatCurrency(stats.totalGeral)}
          </span>
          <span className="text-xs text-gray-400 mt-1">{pagamentos.length} pagamentos</span>
        </div>
      </Card>

      {/* Mês Atual */}
      <Card>
        <div className="flex flex-col">
          <span className="text-sm text-[var(--text-secondary)] mb-1">Mês Atual</span>
          <span className="text-2xl font-bold text-blue-600">
            {formatCurrency(stats.totalMesAtual)}
          </span>
          <span className="text-xs text-gray-400 mt-1">{stats.qtdMesAtual} pagamentos</span>
        </div>
      </Card>

      {/* Primeiros Pagamentos */}
      <Card>
        <div className="flex flex-col">
          <span className="text-sm text-[var(--text-secondary)] mb-1">Primeiros Pagamentos</span>
          <span className="text-2xl font-bold text-purple-600">
            {formatCurrency(stats.totalPrimeiros)}
          </span>
          <span className="text-xs text-gray-400 mt-1">{stats.qtdPrimeiros} novos</span>
        </div>
      </Card>

      {/* Recorrentes */}
      <Card>
        <div className="flex flex-col">
          <span className="text-sm text-[var(--text-secondary)] mb-1">Recorrentes</span>
          <span className="text-2xl font-bold text-indigo-600">
            {formatCurrency(stats.totalRecorrentes)}
          </span>
          <span className="text-xs text-gray-400 mt-1">{stats.qtdRecorrentes} renovações</span>
        </div>
      </Card>

      {/* Por Conta */}
      <Card>
        <div className="flex flex-col">
          <span className="text-sm text-[var(--text-secondary)] mb-2">Por Conta</span>
          <div className="space-y-1">
            {Object.entries(stats.porConta)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 3)
              .map(([conta, valor]) => (
                <div key={conta} className="flex justify-between items-center">
                  <span className="text-xs text-[var(--text-secondary)]">{conta}</span>
                  <span className="text-sm font-semibold text-[var(--text-primary)]">
                    {formatCurrency(valor)}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </Card>

      {/* Por Método */}
      <Card>
        <div className="flex flex-col">
          <span className="text-sm text-[var(--text-secondary)] mb-2">Por Método</span>
          <div className="space-y-1">
            {Object.entries(stats.porMetodo)
              .sort(([, a], [, b]) => b - a)
              .map(([metodo, valor]) => (
                <div key={metodo} className="flex justify-between items-center">
                  <span className="text-xs text-[var(--text-secondary)]">{metodo}</span>
                  <span className="text-sm font-semibold text-[var(--text-primary)]">
                    {formatCurrency(valor)}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </Card>

      {/* Total Comissões */}
      <Card>
        <div className="flex flex-col">
          <span className="text-sm text-[var(--text-secondary)] mb-1">Total Comissões</span>
          <span className="text-2xl font-bold text-orange-600">
            {formatCurrency(stats.totalComissoes)}
          </span>
          <span className="text-xs text-gray-400 mt-1">Comissões geradas</span>
        </div>
      </Card>

      {/* Ticket Médio */}
      <Card>
        <div className="flex flex-col">
          <span className="text-sm text-[var(--text-secondary)] mb-1">Ticket Médio</span>
          <span className="text-2xl font-bold text-teal-600">
            {pagamentos.length > 0
              ? formatCurrency(stats.totalGeral / pagamentos.length)
              : formatCurrency(0)}
          </span>
          <span className="text-xs text-gray-400 mt-1">Por pagamento</span>
        </div>
      </Card>
    </div>
  );
};

export default DashboardPagamentos;
