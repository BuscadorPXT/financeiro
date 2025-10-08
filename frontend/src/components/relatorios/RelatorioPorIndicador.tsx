import React, { useMemo } from 'react';
import type { Usuario } from '../../services/usuarioService';
import type { Comissao } from '../../services/comissaoService';

interface RelatorioPorIndicadorProps {
  usuarios: Usuario[];
  comissoes: Comissao[];
  filtroMes: string;
  filtroAno: string;
}

interface IndicadorData {
  indicador: string;
  baseAtiva: number;
  totalComissoes: number;
  comissoesPrimeiro: number;
  comissoesRecorrente: number;
}

const RelatorioPorIndicador: React.FC<RelatorioPorIndicadorProps> = ({
  usuarios,
  comissoes,
  filtroMes,
  filtroAno,
}) => {
  const dadosPorIndicador = useMemo(() => {
    const grouped: Record<string, IndicadorData> = {};

    // Agrupar usuários ativos por indicador
    usuarios
      .filter((u) => u.statusFinal === 'ATIVO' && u.indicador)
      .forEach((u) => {
        if (!grouped[u.indicador!]) {
          grouped[u.indicador!] = {
            indicador: u.indicador!,
            baseAtiva: 0,
            totalComissoes: 0,
            comissoesPrimeiro: 0,
            comissoesRecorrente: 0,
          };
        }
        grouped[u.indicador!].baseAtiva += 1;
      });

    // Agrupar comissões por indicador (com filtros)
    comissoes
      .filter((c) => {
        // mes_ref está no formato "YYYY-MM"
        const [ano, mes] = c.mes_ref.split('-');
        const matchMes = filtroMes === '' || mes === filtroMes.padStart(2, '0');
        const matchAno = filtroAno === '' || ano === filtroAno;
        return matchMes && matchAno;
      })
      .forEach((c) => {
        if (!grouped[c.indicador]) {
          grouped[c.indicador] = {
            indicador: c.indicador,
            baseAtiva: 0,
            totalComissoes: 0,
            comissoesPrimeiro: 0,
            comissoesRecorrente: 0,
          };
        }

        grouped[c.indicador].totalComissoes += c.valor;

        if (c.regra_tipo === 'PRIMEIRO') {
          grouped[c.indicador].comissoesPrimeiro += c.valor;
        } else {
          grouped[c.indicador].comissoesRecorrente += c.valor;
        }
      });

    return Object.values(grouped).sort((a, b) => b.totalComissoes - a.totalComissoes);
  }, [usuarios, comissoes, filtroMes, filtroAno]);

  const totais = useMemo(() => {
    return {
      baseAtiva: dadosPorIndicador.reduce((sum, i) => sum + i.baseAtiva, 0),
      totalComissoes: dadosPorIndicador.reduce((sum, i) => sum + i.totalComissoes, 0),
      comissoesPrimeiro: dadosPorIndicador.reduce(
        (sum, i) => sum + i.comissoesPrimeiro,
        0
      ),
      comissoesRecorrente: dadosPorIndicador.reduce(
        (sum, i) => sum + i.comissoesRecorrente,
        0
      ),
    };
  }, [dadosPorIndicador]);

  return (
    <div>
      {dadosPorIndicador.length === 0 ? (
        <div className="text-center py-8 text-[var(--text-secondary)]">
          Nenhum dado encontrado para o período selecionado
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[var(--bg-secondary)]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Indicador
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Base Ativa
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Comissões Primeiro
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Comissões Recorrente
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Total Comissões
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Média por Ativo
                </th>
              </tr>
            </thead>
            <tbody className="bg-[var(--bg-primary)] divide-y divide-gray-200">
              {dadosPorIndicador.map((item) => (
                <tr key={item.indicador} className="hover:bg-[var(--bg-secondary)]">
                  <td className="px-4 py-3 text-sm font-medium text-[var(--text-primary)]">
                    {item.indicador}
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--text-primary)] text-center font-semibold">
                    {item.baseAtiva}
                  </td>
                  <td className="px-4 py-3 text-sm text-blue-600 text-right font-medium">
                    R$ {item.comissoesPrimeiro.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-purple-600 text-right font-medium">
                    R$ {item.comissoesRecorrente.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-green-600 text-right font-bold">
                    R$ {item.totalComissoes.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--text-secondary)] text-center">
                    {item.baseAtiva > 0
                      ? `R$ ${(item.totalComissoes / item.baseAtiva).toFixed(2)}`
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-[var(--bg-tertiary)]">
              <tr>
                <td className="px-4 py-3 text-sm font-bold text-[var(--text-primary)]">
                  TOTAL GERAL
                </td>
                <td className="px-4 py-3 text-sm font-bold text-[var(--text-primary)] text-center">
                  {totais.baseAtiva}
                </td>
                <td className="px-4 py-3 text-sm font-bold text-blue-600 text-right">
                  R$ {totais.comissoesPrimeiro.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm font-bold text-purple-600 text-right">
                  R$ {totais.comissoesRecorrente.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm font-bold text-green-600 text-right">
                  R$ {totais.totalComissoes.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm font-bold text-[var(--text-primary)] text-center">
                  {totais.baseAtiva > 0
                    ? `R$ ${(totais.totalComissoes / totais.baseAtiva).toFixed(2)}`
                    : '-'}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
};

export default RelatorioPorIndicador;
