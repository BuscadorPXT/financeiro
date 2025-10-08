import React, { useMemo } from 'react';
import type { Comissao } from '../../services/comissaoService';

interface ComissoesPorIndicadorProps {
  comissoes: Comissao[];
}

interface IndicadorStats {
  indicador: string;
  total: number;
  quantidade: number;
  primeiro: number;
  recorrente: number;
}

const ComissoesPorIndicador: React.FC<ComissoesPorIndicadorProps> = ({
  comissoes,
}) => {
  const indicadoresData = useMemo(() => {
    const grouped: Record<string, IndicadorStats> = {};

    comissoes.forEach((c) => {
      if (!grouped[c.indicador]) {
        grouped[c.indicador] = {
          indicador: c.indicador,
          total: 0,
          quantidade: 0,
          primeiro: 0,
          recorrente: 0,
        };
      }

      grouped[c.indicador].total += Number(c.valor);
      grouped[c.indicador].quantidade += 1;

      if (c.regraTipo === 'PRIMEIRO') {
        grouped[c.indicador].primeiro += Number(c.valor);
      } else {
        grouped[c.indicador].recorrente += Number(c.valor);
      }
    });

    return Object.values(grouped).sort((a, b) => b.total - a.total);
  }, [comissoes]);

  const totalGeral = useMemo(() => {
    return indicadoresData.reduce((sum, i) => sum + i.total, 0);
  }, [indicadoresData]);

  return (
    <div>
      {indicadoresData.length === 0 ? (
        <div className="text-center py-8 text-[var(--text-secondary)]">
          Nenhuma comissão encontrada
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[var(--bg-secondary)]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Indicador
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Quantidade
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Primeiro
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Recorrente
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Total
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  % do Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-[var(--bg-primary)] divide-y divide-gray-200">
              {indicadoresData.map((item) => (
                <tr key={item.indicador} className="hover:bg-[var(--bg-secondary)]">
                  <td className="px-4 py-3 text-sm font-medium text-[var(--text-primary)]">
                    {item.indicador}
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--text-secondary)] text-right">
                    {item.quantidade}
                  </td>
                  <td className="px-4 py-3 text-sm text-blue-600 text-right font-medium">
                    R$ {(item.primeiro || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-purple-600 text-right font-medium">
                    R$ {(item.recorrente || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-green-600 text-right font-bold">
                    R$ {(item.total || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--text-secondary)] text-right">
                    {totalGeral > 0
                      ? ((item.total / totalGeral) * 100).toFixed(1)
                      : '0.0'}
                    %
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-[var(--bg-tertiary)]">
              <tr>
                <td className="px-4 py-3 text-sm font-bold text-[var(--text-primary)]">
                  TOTAL GERAL
                </td>
                <td className="px-4 py-3 text-sm font-bold text-[var(--text-primary)] text-right">
                  {comissoes.length}
                </td>
                <td className="px-4 py-3 text-sm font-bold text-blue-600 text-right">
                  R${' '}
                  {comissoes
                    .filter((c) => c.regraTipo === 'PRIMEIRO')
                    .reduce((sum, c) => sum + Number(c.valor), 0)
                    .toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm font-bold text-purple-600 text-right">
                  R${' '}
                  {comissoes
                    .filter((c) => c.regraTipo === 'RECORRENTE')
                    .reduce((sum, c) => sum + Number(c.valor), 0)
                    .toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm font-bold text-green-600 text-right">
                  R$ {totalGeral.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm font-bold text-[var(--text-primary)] text-right">
                  100%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
};

export default ComissoesPorIndicador;
