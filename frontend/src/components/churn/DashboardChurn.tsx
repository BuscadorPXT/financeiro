import React, { useMemo } from 'react';
import type { Churn } from '../../services/churnService';
import type { Usuario } from '../../services/usuarioService';
import Card from '../common/Card';

interface DashboardChurnProps {
  churn: Churn[];
  usuarios: Usuario[];
}

const DashboardChurn: React.FC<DashboardChurnProps> = ({ churn, usuarios }) => {
  // Cálculos de resumo
  const stats = useMemo(() => {
    const total = churn.length;

    // Churn do mês atual
    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();

    const churnMes = churn.filter((c) => {
      const dataChurn = new Date(c.dataChurn);
      return (
        dataChurn.getMonth() === mesAtual &&
        dataChurn.getFullYear() === anoAtual &&
        !c.revertido
      );
    });

    // Churn acumulado (não revertidos)
    const churnAcumulado = churn.filter((c) => !c.revertido).length;

    // Churn revertido
    const churnRevertido = churn.filter((c) => c.revertido).length;

    // Taxa de churn do mês (churn / total de usuários ativos no início do mês)
    // Simplificação: usar total de usuários ativos atuais
    const usuariosAtivos = usuarios.filter((u) => u.statusFinal === 'ATIVO').length;
    const taxaChurnMes =
      usuariosAtivos > 0 ? (churnMes.length / usuariosAtivos) * 100 : 0;

    // Taxa de churn geral (churn acumulado / total usuários)
    const totalUsuarios = usuarios.length;
    const taxaChurnGeral =
      totalUsuarios > 0 ? (churnAcumulado / totalUsuarios) * 100 : 0;

    // Top 3 motivos
    const motivosCounts: Record<string, number> = {};
    churn
      .filter((c) => !c.revertido && c.motivo)
      .forEach((c) => {
        const motivo = c.motivo || 'Sem motivo';
        motivosCounts[motivo] = (motivosCounts[motivo] || 0) + 1;
      });

    const topMotivos = Object.entries(motivosCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([motivo, count]) => ({ motivo, count }));

    return {
      total,
      churnMes: churnMes.length,
      churnAcumulado,
      churnRevertido,
      taxaChurnMes,
      taxaChurnGeral,
      topMotivos,
    };
  }, [churn, usuarios]);

  const getMesNome = () => {
    const meses = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ];
    return meses[new Date().getMonth()];
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total de Churns */}
      <Card>
        <div className="flex flex-col">
          <span className="text-sm text-[var(--text-secondary)] mb-1">Total de Churns</span>
          <span className="text-2xl font-bold text-blue-600">{stats.total}</span>
          <span className="text-xs text-gray-400 mt-1">Todos os registros</span>
        </div>
      </Card>

      {/* Churn do Mês */}
      <Card className="border-l-4 border-red-500">
        <div className="flex flex-col">
          <span className="text-sm text-[var(--text-secondary)] mb-1">🔴 Churn do Mês</span>
          <span className="text-2xl font-bold text-red-600">{stats.churnMes}</span>
          <span className="text-xs text-red-400 mt-1">{getMesNome()}</span>
        </div>
      </Card>

      {/* Churn Acumulado */}
      <Card>
        <div className="flex flex-col">
          <span className="text-sm text-[var(--text-secondary)] mb-1">Churn Acumulado</span>
          <span className="text-2xl font-bold text-orange-600">
            {stats.churnAcumulado}
          </span>
          <span className="text-xs text-gray-400 mt-1">Não revertidos</span>
        </div>
      </Card>

      {/* Taxa de Churn do Mês */}
      <Card>
        <div className="flex flex-col">
          <span className="text-sm text-[var(--text-secondary)] mb-1">Taxa de Churn (Mês)</span>
          <span className="text-2xl font-bold text-purple-600">
            {stats.taxaChurnMes.toFixed(1)}%
          </span>
          <span className="text-xs text-gray-400 mt-1">
            {stats.churnMes} de {stats.churnMes} ativos
          </span>
        </div>
      </Card>

      {/* Churn Revertido */}
      <Card>
        <div className="flex flex-col">
          <span className="text-sm text-[var(--text-secondary)] mb-1">✅ Revertidos</span>
          <span className="text-2xl font-bold text-green-600">
            {stats.churnRevertido}
          </span>
          <span className="text-xs text-gray-400 mt-1">Reativados</span>
        </div>
      </Card>

      {/* Taxa de Churn Geral */}
      <Card>
        <div className="flex flex-col">
          <span className="text-sm text-[var(--text-secondary)] mb-1">Taxa de Churn (Geral)</span>
          <span className="text-2xl font-bold text-indigo-600">
            {stats.taxaChurnGeral.toFixed(1)}%
          </span>
          <span className="text-xs text-gray-400 mt-1">
            {stats.churnAcumulado} de {usuarios.length} usuários
          </span>
        </div>
      </Card>

      {/* Top 3 Motivos */}
      <Card className="md:col-span-2">
        <div className="flex flex-col">
          <span className="text-sm text-[var(--text-secondary)] mb-2">📊 Top 3 Motivos</span>
          {stats.topMotivos.length > 0 ? (
            <div className="space-y-2">
              {stats.topMotivos.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-sm text-[var(--text-primary)] truncate flex-1">
                    {idx + 1}. {item.motivo}
                  </span>
                  <span className="text-sm font-semibold text-[var(--text-primary)] ml-2">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-sm text-gray-400">Nenhum motivo registrado</span>
          )}
        </div>
      </Card>
    </div>
  );
};

export default DashboardChurn;
