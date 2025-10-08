import React, { useMemo } from 'react';
import type { Pagamento } from '../../services/pagamentoService';
import type { Despesa } from '../../services/despesaService';
import type { Usuario } from '../../services/usuarioService';
import type { Churn } from '../../services/churnService';

interface RelatorioPorMesProps {
  pagamentos: Pagamento[];
  despesas: Despesa[];
  usuarios: Usuario[];
  churn: Churn[];
  filtroAno: string;
}

interface MesData {
  mes: number;
  ano: number;
  mesNome: string;
  receitas: number;
  despesas: number;
  resultado: number;
  adesoes: number;
  renovacoes: number;
  evasoes: number;
}

const RelatorioPorMes: React.FC<RelatorioPorMesProps> = ({
  pagamentos,
  despesas,
  churn,
  filtroAno,
}) => {
  const mesesNomes = [
    'Jan',
    'Fev',
    'Mar',
    'Abr',
    'Mai',
    'Jun',
    'Jul',
    'Ago',
    'Set',
    'Out',
    'Nov',
    'Dez',
  ];

  const dadosPorMes = useMemo(() => {
    const resultado: MesData[] = [];

    // Determinar ano a processar
    const ano = filtroAno ? parseInt(filtroAno) : new Date().getFullYear();

    // Processar cada mês do ano
    for (let mes = 1; mes <= 12; mes++) {
      // Receitas do mês
      const receitasMes = pagamentos
        .filter((p) => {
          const data = new Date(p.dataPagto);
          return data.getMonth() + 1 === mes && data.getFullYear() === ano;
        })
        .reduce((sum, p) => sum + p.valor, 0);

      // Despesas do mês
      const despesasMes = despesas
        .filter((d) => {
          return d.competenciaMes === mes && d.competenciaAno === ano;
        })
        .reduce((sum, d) => sum + d.valor, 0);

      // Adesões (primeiros pagamentos)
      const adesoesMes = pagamentos.filter((p) => {
        const data = new Date(p.dataPagto);
        return (
          data.getMonth() + 1 === mes &&
          data.getFullYear() === ano &&
          p.regraTipo === 'PRIMEIRO'
        );
      }).length;

      // Renovações (pagamentos recorrentes)
      const renovacoesMes = pagamentos.filter((p) => {
        const data = new Date(p.dataPagto);
        return (
          data.getMonth() + 1 === mes &&
          data.getFullYear() === ano &&
          p.regraTipo === 'RECORRENTE'
        );
      }).length;

      // Evasões
      const evasoesMes = churn.filter((c) => {
        const data = new Date(c.data_churn);
        return (
          data.getMonth() + 1 === mes && data.getFullYear() === ano && !c.revertido
        );
      }).length;

      resultado.push({
        mes,
        ano,
        mesNome: mesesNomes[mes - 1],
        receitas: receitasMes,
        despesas: despesasMes,
        resultado: receitasMes - despesasMes,
        adesoes: adesoesMes,
        renovacoes: renovacoesMes,
        evasoes: evasoesMes,
      });
    }

    return resultado;
  }, [pagamentos, despesas, churn, filtroAno, mesesNomes]);

  // Totais anuais
  const totais = useMemo(() => {
    return {
      receitas: dadosPorMes.reduce((sum, m) => sum + m.receitas, 0),
      despesas: dadosPorMes.reduce((sum, m) => sum + m.despesas, 0),
      resultado: dadosPorMes.reduce((sum, m) => sum + m.resultado, 0),
      adesoes: dadosPorMes.reduce((sum, m) => sum + m.adesoes, 0),
      renovacoes: dadosPorMes.reduce((sum, m) => sum + m.renovacoes, 0),
      evasoes: dadosPorMes.reduce((sum, m) => sum + m.evasoes, 0),
    };
  }, [dadosPorMes]);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-[var(--bg-secondary)]">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Mês
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Receitas
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Despesas
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Resultado
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Adesões
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Renovações
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Evasões
            </th>
          </tr>
        </thead>
        <tbody className="bg-[var(--bg-primary)] divide-y divide-gray-200">
          {dadosPorMes.map((mes) => (
            <tr key={mes.mes} className="hover:bg-[var(--bg-secondary)]">
              <td className="px-4 py-3 text-sm font-medium text-[var(--text-primary)]">
                {mes.mesNome}/{mes.ano}
              </td>
              <td className="px-4 py-3 text-sm text-green-600 text-right font-semibold">
                R$ {mes.receitas.toFixed(2)}
              </td>
              <td className="px-4 py-3 text-sm text-red-600 text-right font-semibold">
                R$ {mes.despesas.toFixed(2)}
              </td>
              <td
                className={`px-4 py-3 text-sm text-right font-bold ${
                  mes.resultado >= 0 ? 'text-blue-600' : 'text-orange-600'
                }`}
              >
                R$ {mes.resultado.toFixed(2)}
              </td>
              <td className="px-4 py-3 text-sm text-[var(--text-primary)] text-center">
                {mes.adesoes}
              </td>
              <td className="px-4 py-3 text-sm text-[var(--text-primary)] text-center">
                {mes.renovacoes}
              </td>
              <td className="px-4 py-3 text-sm text-[var(--text-primary)] text-center">
                {mes.evasoes}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-[var(--bg-tertiary)]">
          <tr>
            <td className="px-4 py-3 text-sm font-bold text-[var(--text-primary)]">
              TOTAL {filtroAno || new Date().getFullYear()}
            </td>
            <td className="px-4 py-3 text-sm font-bold text-green-600 text-right">
              R$ {totais.receitas.toFixed(2)}
            </td>
            <td className="px-4 py-3 text-sm font-bold text-red-600 text-right">
              R$ {totais.despesas.toFixed(2)}
            </td>
            <td
              className={`px-4 py-3 text-sm font-bold text-right ${
                totais.resultado >= 0 ? 'text-blue-600' : 'text-orange-600'
              }`}
            >
              R$ {totais.resultado.toFixed(2)}
            </td>
            <td className="px-4 py-3 text-sm font-bold text-[var(--text-primary)] text-center">
              {totais.adesoes}
            </td>
            <td className="px-4 py-3 text-sm font-bold text-[var(--text-primary)] text-center">
              {totais.renovacoes}
            </td>
            <td className="px-4 py-3 text-sm font-bold text-[var(--text-primary)] text-center">
              {totais.evasoes}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default RelatorioPorMes;
