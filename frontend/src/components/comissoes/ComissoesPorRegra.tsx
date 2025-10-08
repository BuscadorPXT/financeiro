import React, { useMemo } from 'react';
import type { Comissao } from '../../services/comissaoService';

interface ComissoesPorRegraProps {
  comissoes: Comissao[];
}

interface RegraStats {
  regraTipo: 'PRIMEIRO' | 'RECORRENTE';
  total: number;
  quantidade: number;
  indicadores: Record<string, number>;
}

const ComissoesPorRegra: React.FC<ComissoesPorRegraProps> = ({ comissoes }) => {
  const regrasData = useMemo(() => {
    const grouped: Record<string, RegraStats> = {
      PRIMEIRO: {
        regraTipo: 'PRIMEIRO',
        total: 0,
        quantidade: 0,
        indicadores: {},
      },
      RECORRENTE: {
        regraTipo: 'RECORRENTE',
        total: 0,
        quantidade: 0,
        indicadores: {},
      },
    };

    comissoes.forEach((c) => {
      grouped[c.regraTipo].total += Number(c.valor);
      grouped[c.regraTipo].quantidade += 1;

      if (!grouped[c.regraTipo].indicadores[c.indicador]) {
        grouped[c.regraTipo].indicadores[c.indicador] = 0;
      }
      grouped[c.regraTipo].indicadores[c.indicador] += Number(c.valor);
    });

    return Object.values(grouped);
  }, [comissoes]);

  const totalGeral = useMemo(() => {
    return regrasData.reduce((sum, r) => sum + r.total, 0);
  }, [regrasData]);

  return (
    <div className="space-y-6">
      {regrasData.map((regra) => (
        <div key={regra.regraTipo} className="bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)]">
          <div
            className={`px-4 py-3 border-b border-[var(--border-color)] ${
              regra.regraTipo === 'PRIMEIRO' ? 'bg-blue-50' : 'bg-purple-50'
            }`}
          >
            <div className="flex justify-between items-center">
              <h3
                className={`text-lg font-semibold ${
                  regra.regraTipo === 'PRIMEIRO' ? 'text-blue-900' : 'text-purple-900'
                }`}
              >
                {regra.regraTipo === 'PRIMEIRO'
                  ? '💰 Primeiro Pagamento'
                  : '🔄 Recorrente'}
              </h3>
              <div className="text-right">
                <p
                  className={`text-2xl font-bold ${
                    regra.regraTipo === 'PRIMEIRO' ? 'text-blue-600' : 'text-purple-600'
                  }`}
                >
                  R$ {regra.total.toFixed(2)}
                </p>
                <p className="text-sm text-[var(--text-secondary)]">
                  {regra.quantidade} comissões •{' '}
                  {totalGeral > 0 ? ((regra.total / totalGeral) * 100).toFixed(1) : '0.0'}%
                  do total
                </p>
              </div>
            </div>
          </div>

          <div className="p-4">
            {Object.keys(regra.indicadores).length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-[var(--text-primary)] mb-3">
                  Breakdown por Indicador:
                </p>
                {Object.entries(regra.indicadores)
                  .sort(([, a], [, b]) => b - a)
                  .map(([indicador, valor]) => (
                    <div
                      key={indicador}
                      className="flex justify-between items-center py-2 px-3 bg-[var(--bg-secondary)] rounded"
                    >
                      <span className="text-sm text-[var(--text-primary)]">{indicador}</span>
                      <div className="text-right">
                        <span
                          className={`text-sm font-semibold ${
                            regra.regraTipo === 'PRIMEIRO'
                              ? 'text-blue-600'
                              : 'text-purple-600'
                          }`}
                        >
                          R$ {valor.toFixed(2)}
                        </span>
                        <span className="text-xs text-[var(--text-secondary)] ml-2">
                          ({regra.total > 0 ? ((valor / regra.total) * 100).toFixed(1) : '0.0'}
                          %)
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--text-secondary)] text-center py-4">
                Nenhuma comissão registrada
              </p>
            )}
          </div>
        </div>
      ))}

      {/* Resumo Comparativo */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-[var(--border-color)]">
        <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
          📊 Resumo Comparativo
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-[var(--text-secondary)]">Primeiro Pagamento</p>
            <p className="text-lg font-bold text-blue-600">
              {regrasData[0]?.quantidade || 0} comissões
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--text-secondary)]">Recorrente</p>
            <p className="text-lg font-bold text-purple-600">
              {regrasData[1]?.quantidade || 0} comissões
            </p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-[var(--border-color)]">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-[var(--text-primary)]">Total Geral:</span>
            <span className="text-xl font-bold text-green-600">
              R$ {totalGeral.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComissoesPorRegra;
