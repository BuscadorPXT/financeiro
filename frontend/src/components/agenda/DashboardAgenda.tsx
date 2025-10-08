import React, { useMemo } from 'react';
import type { Agenda } from '../../services/agendaService';
import Card from '../common/Card';

interface DashboardAgendaProps {
  agenda: Agenda[];
}

const DashboardAgenda: React.FC<DashboardAgendaProps> = ({ agenda }) => {
  // Cálculos de resumo
  const stats = useMemo(() => {
    const total = agenda.length;

    // Vencidos
    const vencidos = agenda.filter((a) => a.diasParaVencer < 0 && !a.renovou && !a.cancelou);

    // Vence hoje
    const hoje = agenda.filter((a) => a.diasParaVencer === 0 && !a.renovou && !a.cancelou);

    // Próximos 7 dias
    const proximos7 = agenda.filter(
      (a) => a.diasParaVencer > 0 && a.diasParaVencer <= 7 && !a.renovou && !a.cancelou
    );

    // Mês atual (30 dias)
    const mes = agenda.filter(
      (a) => a.diasParaVencer > 0 && a.diasParaVencer <= 30 && !a.renovou && !a.cancelou
    );

    // Renovados
    const renovados = agenda.filter((a) => a.renovou);

    // Cancelados
    const cancelados = agenda.filter((a) => a.cancelou);

    // Pendentes (não renovados e não cancelados)
    const pendentes = agenda.filter((a) => !a.renovou && !a.cancelou && a.status === 'ATIVO');

    // Taxa de renovação
    const processados = renovados.length + cancelados.length;
    const taxaRenovacao = processados > 0 ? (renovados.length / processados) * 100 : 0;

    return {
      total,
      vencidos: vencidos.length,
      hoje: hoje.length,
      proximos7: proximos7.length,
      mes: mes.length,
      renovados: renovados.length,
      cancelados: cancelados.length,
      pendentes: pendentes.length,
      taxaRenovacao,
    };
  }, [agenda]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total */}
      <Card>
        <div className="flex flex-col">
          <span className="text-sm text-[var(--text-secondary)] mb-1">Total na Agenda</span>
          <span className="text-2xl font-bold text-blue-600">{stats.total}</span>
          <span className="text-xs text-gray-400 mt-1">Todos os itens</span>
        </div>
      </Card>

      {/* Vencidos */}
      <Card className="border-l-4 border-red-500">
        <div className="flex flex-col">
          <span className="text-sm text-[var(--text-secondary)] mb-1">🔴 Vencidos</span>
          <span className="text-2xl font-bold text-red-600">{stats.vencidos}</span>
          <span className="text-xs text-red-400 mt-1">Atrasados</span>
        </div>
      </Card>

      {/* Hoje */}
      <Card className="border-l-4 border-orange-500">
        <div className="flex flex-col">
          <span className="text-sm text-[var(--text-secondary)] mb-1">🟠 Vence Hoje</span>
          <span className="text-2xl font-bold text-orange-600">{stats.hoje}</span>
          <span className="text-xs text-orange-400 mt-1">Atenção urgente</span>
        </div>
      </Card>

      {/* Próximos 7 Dias */}
      <Card className="border-l-4 border-yellow-500">
        <div className="flex flex-col">
          <span className="text-sm text-[var(--text-secondary)] mb-1">🟡 Próximos 7 Dias</span>
          <span className="text-2xl font-bold text-yellow-600">{stats.proximos7}</span>
          <span className="text-xs text-yellow-500 mt-1">Atenção</span>
        </div>
      </Card>

      {/* Mês Atual */}
      <Card>
        <div className="flex flex-col">
          <span className="text-sm text-[var(--text-secondary)] mb-1">🟢 Mês Atual (30 dias)</span>
          <span className="text-2xl font-bold text-green-600">{stats.mes}</span>
          <span className="text-xs text-green-400 mt-1">No prazo</span>
        </div>
      </Card>

      {/* Renovados */}
      <Card>
        <div className="flex flex-col">
          <span className="text-sm text-[var(--text-secondary)] mb-1">✅ Renovados</span>
          <span className="text-2xl font-bold text-green-600">{stats.renovados}</span>
          <span className="text-xs text-gray-400 mt-1">Confirmados</span>
        </div>
      </Card>

      {/* Cancelados */}
      <Card>
        <div className="flex flex-col">
          <span className="text-sm text-[var(--text-secondary)] mb-1">❌ Cancelados</span>
          <span className="text-2xl font-bold text-red-600">{stats.cancelados}</span>
          <span className="text-xs text-gray-400 mt-1">Churn registrado</span>
        </div>
      </Card>

      {/* Taxa de Renovação */}
      <Card>
        <div className="flex flex-col">
          <span className="text-sm text-[var(--text-secondary)] mb-1">📊 Taxa de Renovação</span>
          <span className="text-2xl font-bold text-purple-600">
            {stats.taxaRenovacao.toFixed(1)}%
          </span>
          <span className="text-xs text-gray-400 mt-1">
            {stats.renovados} de {stats.renovados + stats.cancelados}
          </span>
        </div>
      </Card>
    </div>
  );
};

export default DashboardAgenda;
