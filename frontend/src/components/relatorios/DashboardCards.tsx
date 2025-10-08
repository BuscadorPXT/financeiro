import React, { useMemo } from 'react';
import type { Pagamento } from '../../services/pagamentoService';
import type { Despesa } from '../../services/despesaService';
import type { Usuario } from '../../services/usuarioService';
import type { Churn } from '../../services/churnService';
import Card from '../common/Card';

interface DashboardCardsProps {
  pagamentos: Pagamento[];
  despesas: Despesa[];
  usuarios: Usuario[];
  churn: Churn[];
}

const DashboardCards: React.FC<DashboardCardsProps> = ({
  pagamentos,
  despesas,
  usuarios,
  churn,
}) => {
  const stats = useMemo(() => {
    const hoje = new Date();
    const mesAtual = hoje.getMonth() + 1;
    const anoAtual = hoje.getFullYear();

    // Receita do mês
    const receitaMes = pagamentos
      .filter((p) => {
        const data = new Date(p.dataPagto);
        return data.getMonth() + 1 === mesAtual && data.getFullYear() === anoAtual;
      })
      .reduce((sum, p) => sum + p.valor, 0);

    // Despesa do mês
    const despesaMes = despesas
      .filter((d) => {
        return d.competenciaMes === mesAtual && d.competenciaAno === anoAtual;
      })
      .reduce((sum, d) => sum + d.valor, 0);

    // Resultado
    const resultado = receitaMes - despesaMes;

    // Adesões do mês (primeiros pagamentos)
    const adesoesMes = pagamentos.filter((p) => {
      const data = new Date(p.dataPagto);
      return (
        data.getMonth() + 1 === mesAtual &&
        data.getFullYear() === anoAtual &&
        p.regraTipo === 'PRIMEIRO'
      );
    });

    const adesoesQtd = adesoesMes.length;
    const adesoesValor = adesoesMes.reduce((sum, p) => sum + p.valor, 0);

    // Renovações do mês (pagamentos recorrentes)
    const renovacoesMes = pagamentos.filter((p) => {
      const data = new Date(p.dataPagto);
      return (
        data.getMonth() + 1 === mesAtual &&
        data.getFullYear() === anoAtual &&
        p.regraTipo === 'RECORRENTE'
      );
    });

    const renovacoesQtd = renovacoesMes.length;
    const renovacoesValor = renovacoesMes.reduce((sum, p) => sum + p.valor, 0);

    // Usuários ativos
    const ativos = usuarios.filter((u) => u.statusFinal === 'ATIVO').length;

    // Evasões do mês
    const evasoesMes = churn.filter((c) => {
      const data = new Date(c.data_churn);
      return (
        data.getMonth() + 1 === mesAtual &&
        data.getFullYear() === anoAtual &&
        !c.revertido
      );
    }).length;

    return {
      receitaMes,
      despesaMes,
      resultado,
      adesoesQtd,
      adesoesValor,
      renovacoesQtd,
      renovacoesValor,
      ativos,
      evasoesMes,
    };
  }, [pagamentos, despesas, usuarios, churn]);

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
      {/* Receita do Mês */}
      <Card className="border-l-4 border-green-500">
        <div className="flex flex-col">
          <span className="text-sm text-[var(--text-secondary)] mb-1">💰 Receita do Mês</span>
          <span className="text-2xl font-bold text-green-600">
            R$ {stats.receitaMes.toFixed(2)}
          </span>
          <span className="text-xs text-gray-400 mt-1">{getMesNome()}</span>
        </div>
      </Card>

      {/* Despesa do Mês */}
      <Card className="border-l-4 border-red-500">
        <div className="flex flex-col">
          <span className="text-sm text-[var(--text-secondary)] mb-1">💸 Despesa do Mês</span>
          <span className="text-2xl font-bold text-red-600">
            R$ {stats.despesaMes.toFixed(2)}
          </span>
          <span className="text-xs text-gray-400 mt-1">{getMesNome()}</span>
        </div>
      </Card>

      {/* Resultado */}
      <Card
        className={`border-l-4 ${
          stats.resultado >= 0 ? 'border-blue-500' : 'border-orange-500'
        }`}
      >
        <div className="flex flex-col">
          <span className="text-sm text-[var(--text-secondary)] mb-1">📊 Resultado</span>
          <span
            className={`text-2xl font-bold ${
              stats.resultado >= 0 ? 'text-blue-600' : 'text-orange-600'
            }`}
          >
            R$ {stats.resultado.toFixed(2)}
          </span>
          <span className="text-xs text-gray-400 mt-1">
            {stats.resultado >= 0 ? 'Lucro' : 'Prejuízo'}
          </span>
        </div>
      </Card>

      {/* Adesões */}
      <Card>
        <div className="flex flex-col">
          <span className="text-sm text-[var(--text-secondary)] mb-1">✨ Adesões</span>
          <span className="text-2xl font-bold text-purple-600">
            {stats.adesoesQtd}
          </span>
          <span className="text-xs text-gray-400 mt-1">
            R$ {stats.adesoesValor.toFixed(2)}
          </span>
        </div>
      </Card>

      {/* Renovações */}
      <Card>
        <div className="flex flex-col">
          <span className="text-sm text-[var(--text-secondary)] mb-1">🔄 Renovações</span>
          <span className="text-2xl font-bold text-indigo-600">
            {stats.renovacoesQtd}
          </span>
          <span className="text-xs text-gray-400 mt-1">
            R$ {stats.renovacoesValor.toFixed(2)}
          </span>
        </div>
      </Card>

      {/* Usuários Ativos */}
      <Card>
        <div className="flex flex-col">
          <span className="text-sm text-[var(--text-secondary)] mb-1">👥 Usuários Ativos</span>
          <span className="text-2xl font-bold text-cyan-600">{stats.ativos}</span>
          <span className="text-xs text-gray-400 mt-1">Base ativa</span>
        </div>
      </Card>

      {/* Evasões */}
      <Card>
        <div className="flex flex-col">
          <span className="text-sm text-[var(--text-secondary)] mb-1">❌ Evasões</span>
          <span className="text-2xl font-bold text-pink-600">{stats.evasoesMes}</span>
          <span className="text-xs text-gray-400 mt-1">{getMesNome()}</span>
        </div>
      </Card>
    </div>
  );
};

export default DashboardCards;
