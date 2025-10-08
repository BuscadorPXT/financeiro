import React, { useMemo } from 'react';
import type { Agenda } from '../../services/agendaService';

interface RelatorioIdadeTitulosProps {
  agenda: Agenda[];
}

const RelatorioIdadeTitulos: React.FC<RelatorioIdadeTitulosProps> = ({ agenda }) => {
  const categorias = useMemo(() => {
    // Filtrar apenas itens não renovados e não cancelados
    const ativos = agenda.filter((a) => !a.renovou && !a.cancelou && a.status === 'ATIVO');

    const vencidos = ativos.filter((a) => a.diasParaVencer < 0);
    const hoje = ativos.filter((a) => a.diasParaVencer === 0);
    const proximos7 = ativos.filter((a) => a.diasParaVencer > 0 && a.diasParaVencer <= 7);
    const proximos30 = ativos.filter((a) => a.diasParaVencer > 7 && a.diasParaVencer <= 30);

    return {
      vencidos: {
        titulo: '🔴 Vencidos',
        quantidade: vencidos.length,
        lista: vencidos,
        cor: 'border-red-500 bg-red-50',
      },
      hoje: {
        titulo: '🟠 Vence Hoje',
        quantidade: hoje.length,
        lista: hoje,
        cor: 'border-orange-500 bg-orange-50',
      },
      proximos7: {
        titulo: '🟡 Próximos 7 Dias',
        quantidade: proximos7.length,
        lista: proximos7,
        cor: 'border-yellow-500 bg-yellow-50',
      },
      proximos30: {
        titulo: '🟢 Próximos 30 Dias',
        quantidade: proximos30.length,
        lista: proximos30,
        cor: 'border-green-500 bg-green-50',
      },
    };
  }, [agenda]);

  const total = useMemo(() => {
    return (
      categorias.vencidos.quantidade +
      categorias.hoje.quantidade +
      categorias.proximos7.quantidade +
      categorias.proximos30.quantidade
    );
  }, [categorias]);

  return (
    <div className="space-y-6">
      {/* Resumo em Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.values(categorias).map((cat, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-lg border-l-4 ${cat.cor}`}
          >
            <h3 className="text-sm font-medium text-[var(--text-primary)] mb-1">{cat.titulo}</h3>
            <p className="text-3xl font-bold text-[var(--text-primary)]">{cat.quantidade}</p>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              {total > 0 ? `${((cat.quantidade / total) * 100).toFixed(1)}% do total` : '0%'}
            </p>
          </div>
        ))}
      </div>

      {/* Tabela Comparativa */}
      <div className="bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)]">
        <div className="px-4 py-3 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
            Distribuição de Títulos por Vencimento
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[var(--bg-secondary)]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Quantidade
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  % do Total
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Situação
                </th>
              </tr>
            </thead>
            <tbody className="bg-[var(--bg-primary)] divide-y divide-gray-200">
              <tr className="bg-red-50">
                <td className="px-4 py-3 text-sm font-medium text-[var(--text-primary)]">
                  🔴 Vencidos (atrasados)
                </td>
                <td className="px-4 py-3 text-sm text-[var(--text-primary)] text-center font-bold">
                  {categorias.vencidos.quantidade}
                </td>
                <td className="px-4 py-3 text-sm text-[var(--text-secondary)] text-center">
                  {total > 0
                    ? `${((categorias.vencidos.quantidade / total) * 100).toFixed(1)}%`
                    : '0%'}
                </td>
                <td className="px-4 py-3 text-sm text-red-600 font-semibold">
                  CRÍTICO - Ação imediata
                </td>
              </tr>

              <tr className="bg-orange-50">
                <td className="px-4 py-3 text-sm font-medium text-[var(--text-primary)]">
                  🟠 Vence Hoje
                </td>
                <td className="px-4 py-3 text-sm text-[var(--text-primary)] text-center font-bold">
                  {categorias.hoje.quantidade}
                </td>
                <td className="px-4 py-3 text-sm text-[var(--text-secondary)] text-center">
                  {total > 0
                    ? `${((categorias.hoje.quantidade / total) * 100).toFixed(1)}%`
                    : '0%'}
                </td>
                <td className="px-4 py-3 text-sm text-orange-600 font-semibold">
                  URGENTE - Contato hoje
                </td>
              </tr>

              <tr className="bg-yellow-50">
                <td className="px-4 py-3 text-sm font-medium text-[var(--text-primary)]">
                  🟡 Próximos 7 Dias
                </td>
                <td className="px-4 py-3 text-sm text-[var(--text-primary)] text-center font-bold">
                  {categorias.proximos7.quantidade}
                </td>
                <td className="px-4 py-3 text-sm text-[var(--text-secondary)] text-center">
                  {total > 0
                    ? `${((categorias.proximos7.quantidade / total) * 100).toFixed(1)}%`
                    : '0%'}
                </td>
                <td className="px-4 py-3 text-sm text-yellow-700 font-semibold">
                  ATENÇÃO - Planejar contato
                </td>
              </tr>

              <tr className="bg-green-50">
                <td className="px-4 py-3 text-sm font-medium text-[var(--text-primary)]">
                  🟢 Próximos 30 Dias
                </td>
                <td className="px-4 py-3 text-sm text-[var(--text-primary)] text-center font-bold">
                  {categorias.proximos30.quantidade}
                </td>
                <td className="px-4 py-3 text-sm text-[var(--text-secondary)] text-center">
                  {total > 0
                    ? `${((categorias.proximos30.quantidade / total) * 100).toFixed(1)}%`
                    : '0%'}
                </td>
                <td className="px-4 py-3 text-sm text-green-700 font-semibold">
                  OK - Acompanhamento normal
                </td>
              </tr>
            </tbody>
            <tfoot className="bg-[var(--bg-tertiary)]">
              <tr>
                <td className="px-4 py-3 text-sm font-bold text-[var(--text-primary)]">TOTAL</td>
                <td className="px-4 py-3 text-sm font-bold text-[var(--text-primary)] text-center">
                  {total}
                </td>
                <td className="px-4 py-3 text-sm font-bold text-[var(--text-primary)] text-center">
                  100%
                </td>
                <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
                  Títulos ativos não processados
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Indicadores de Ação */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-[var(--border-color)]">
        <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
          📋 Prioridades de Ação
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-[var(--bg-primary)] rounded p-3">
            <p className="text-xs text-[var(--text-secondary)]">Ação Imediata Necessária</p>
            <p className="text-2xl font-bold text-red-600">
              {categorias.vencidos.quantidade + categorias.hoje.quantidade}
            </p>
            <p className="text-xs text-[var(--text-secondary)]">Vencidos + Vence Hoje</p>
          </div>
          <div className="bg-[var(--bg-primary)] rounded p-3">
            <p className="text-xs text-[var(--text-secondary)]">Planejamento Próxima Semana</p>
            <p className="text-2xl font-bold text-yellow-600">
              {categorias.proximos7.quantidade}
            </p>
            <p className="text-xs text-[var(--text-secondary)]">Próximos 7 dias</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RelatorioIdadeTitulos;
