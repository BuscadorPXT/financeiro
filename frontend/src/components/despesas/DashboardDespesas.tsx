import React, { useMemo } from 'react';
import type { Despesa } from '../../services/despesaService';
import Card from '../common/Card';
import { formatCurrency } from '../../utils/formatters';

interface DashboardDespesasProps {
  despesas: Despesa[];
}

const DashboardDespesas: React.FC<DashboardDespesasProps> = ({ despesas }) => {
  // Cálculos de resumo
  const stats = useMemo(() => {
    const totalGeral = despesas.reduce((sum, d) => sum + Number(d.valor), 0);

    // Mês atual
    const mesAtual = new Date().getMonth() + 1;
    const anoAtual = new Date().getFullYear();
    const despesasMesAtual = despesas.filter(
      (d) => d.competenciaMes === mesAtual && d.competenciaAno === anoAtual
    );
    const totalMesAtual = despesasMesAtual.reduce((sum, d) => sum + Number(d.valor), 0);

    // Por status
    const pagas = despesas.filter((d) => d.status === 'PAGO');
    const pendentes = despesas.filter((d) => d.status === 'PENDENTE');
    const totalPago = pagas.reduce((sum, d) => sum + Number(d.valor), 0);
    const totalPendente = pendentes.reduce((sum, d) => sum + Number(d.valor), 0);

    // Por categoria
    const porCategoria: Record<string, number> = {};
    despesas.forEach((d) => {
      porCategoria[d.categoria] = (porCategoria[d.categoria] || 0) + Number(d.valor);
    });

    // Top 5 categorias
    const top5Categorias = Object.entries(porCategoria)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    // Por mês (últimos 3 meses)
    const porMes: Record<string, number> = {};
    despesas.forEach((d) => {
      const key = `${d.competenciaMes}/${d.competenciaAno}`;
      porMes[key] = (porMes[key] || 0) + Number(d.valor);
    });

    // Média mensal
    const mesesUnicos = [...new Set(despesas.map((d) => `${d.competenciaMes}/${d.competenciaAno}`))];
    const mediaMensal = mesesUnicos.length > 0 ? totalGeral / mesesUnicos.length : 0;

    return {
      totalGeral,
      totalMesAtual,
      qtdMesAtual: despesasMesAtual.length,
      totalPago,
      totalPendente,
      qtdPagas: pagas.length,
      qtdPendentes: pendentes.length,
      porCategoria: top5Categorias,
      mediaMensal,
    };
  }, [despesas]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Geral */}
      <Card>
        <div className="flex flex-col">
          <span className="text-sm text-[var(--text-secondary)] mb-1">Total Geral</span>
          <span className="text-2xl font-bold text-red-600">
            {formatCurrency(stats.totalGeral)}
          </span>
          <span className="text-xs text-gray-400 mt-1">{despesas.length} despesas</span>
        </div>
      </Card>

      {/* Mês Atual */}
      <Card>
        <div className="flex flex-col">
          <span className="text-sm text-[var(--text-secondary)] mb-1">Mês Atual</span>
          <span className="text-2xl font-bold text-orange-600">
            {formatCurrency(stats.totalMesAtual)}
          </span>
          <span className="text-xs text-gray-400 mt-1">{stats.qtdMesAtual} despesas</span>
        </div>
      </Card>

      {/* Pagas */}
      <Card>
        <div className="flex flex-col">
          <span className="text-sm text-[var(--text-secondary)] mb-1">Pagas</span>
          <span className="text-2xl font-bold text-green-600">
            {formatCurrency(stats.totalPago)}
          </span>
          <span className="text-xs text-gray-400 mt-1">{stats.qtdPagas} quitadas</span>
        </div>
      </Card>

      {/* Pendentes */}
      <Card>
        <div className="flex flex-col">
          <span className="text-sm text-[var(--text-secondary)] mb-1">Pendentes</span>
          <span className="text-2xl font-bold text-yellow-600">
            {formatCurrency(stats.totalPendente)}
          </span>
          <span className="text-xs text-gray-400 mt-1">{stats.qtdPendentes} a pagar</span>
        </div>
      </Card>

      {/* Top Categorias */}
      <Card className="md:col-span-2">
        <div className="flex flex-col">
          <span className="text-sm text-[var(--text-secondary)] mb-2">Top 5 Categorias</span>
          <div className="space-y-2">
            {stats.porCategoria.map(([categoria, valor], index) => (
              <div key={categoria} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400 w-4">{index + 1}</span>
                  <span className="text-sm text-[var(--text-primary)]">{categoria}</span>
                </div>
                <span className="text-sm font-semibold text-red-600">
                  {formatCurrency(valor)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Média Mensal */}
      <Card>
        <div className="flex flex-col">
          <span className="text-sm text-[var(--text-secondary)] mb-1">Média Mensal</span>
          <span className="text-2xl font-bold text-purple-600">
            {formatCurrency(stats.mediaMensal)}
          </span>
          <span className="text-xs text-gray-400 mt-1">Por mês</span>
        </div>
      </Card>

      {/* Percentual Pago */}
      <Card>
        <div className="flex flex-col">
          <span className="text-sm text-[var(--text-secondary)] mb-1">Percentual Pago</span>
          <span className="text-2xl font-bold text-teal-600">
            {stats.totalGeral > 0
              ? `${((stats.totalPago / stats.totalGeral) * 100).toFixed(1)}%`
              : '0%'}
          </span>
          <span className="text-xs text-gray-400 mt-1">
            {stats.qtdPagas} de {despesas.length}
          </span>
        </div>
      </Card>
    </div>
  );
};

export default DashboardDespesas;
