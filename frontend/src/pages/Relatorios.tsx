import React, { useState, useMemo } from 'react';
import { usePagamentos } from '../hooks/usePagamentos';
import { useDespesas } from '../hooks/useDespesas';
import { useUsuarios } from '../hooks/useUsuarios';
import { useChurn } from '../hooks/useChurn';
import { useAgenda } from '../hooks/useAgenda';
import { useComissoes } from '../hooks/useComissoes';
import FilterBar from '../components/common/FilterBar';
import ExportButton from '../components/common/ExportButton';
import LoadingSpinner from '../components/common/LoadingSpinner';
import DashboardCards from '../components/relatorios/DashboardCards';
import RelatorioPorMes from '../components/relatorios/RelatorioPorMes';
import RelatorioPorIndicador from '../components/relatorios/RelatorioPorIndicador';
import RelatorioIdadeTitulos from '../components/relatorios/RelatorioIdadeTitulos';
import { useExport } from '../hooks/useExport';

type TabType = 'porMes' | 'porIndicador' | 'idadeTitulos';

const RelatoriosPage: React.FC = () => {
  const { pagamentos, loading: loadingPagamentos } = usePagamentos();
  const { despesas, loading: loadingDespesas } = useDespesas();
  const { usuarios, loading: loadingUsuarios } = useUsuarios();
  const { churns, loading: loadingChurn } = useChurn();
  const { agenda, loading: loadingAgenda } = useAgenda();
  const { comissoes, loading: loadingComissoes } = useComissoes();
  const { exportToCSV, exportToXLSX } = useExport();

  // Estados de UI
  const [activeTab, setActiveTab] = useState<TabType>('porMes');

  // Estados de filtros
  const [filtroMes, setFiltroMes] = useState<string>('');
  const [filtroAno, setFiltroAno] = useState<string>(new Date().getFullYear().toString());

  const loading =
    loadingPagamentos ||
    loadingDespesas ||
    loadingUsuarios ||
    loadingChurn ||
    loadingAgenda ||
    loadingComissoes;

  // Anos disponíveis
  const anosDisponiveis = useMemo(() => {
    const anos = new Set<string>();

    pagamentos.forEach((p) => {
      const ano = new Date(p.dataPagto).getFullYear().toString();
      anos.add(ano);
    });

    despesas.forEach((d) => {
      if (d.competenciaAno) {
        anos.add(d.competenciaAno.toString());
      }
    });

    return Array.from(anos).sort((a, b) => b.localeCompare(a));
  }, [pagamentos, despesas]);

  // Handlers
  const handleClearFilters = () => {
    setFiltroMes('');
    setFiltroAno(new Date().getFullYear().toString());
  };

  const handleExport = async (format: 'csv' | 'xlsx') => {
    // Exportar resumo executivo
    const hoje = new Date();
    const mesAtual = hoje.getMonth() + 1;
    const anoAtual = hoje.getFullYear();

    const receitaMes = pagamentos
      .filter((p) => {
        const data = new Date(p.dataPagto);
        return data.getMonth() + 1 === mesAtual && data.getFullYear() === anoAtual;
      })
      .reduce((sum, p) => sum + p.valor, 0);

    const despesaMes = despesas
      .filter((d) => {
        return d.competenciaMes === mesAtual && d.competenciaAno === anoAtual;
      })
      .reduce((sum, d) => sum + d.valor, 0);

    const dataToExport = [
      {
        Período: `${mesAtual}/${anoAtual}`,
        Receitas: receitaMes.toFixed(2),
        Despesas: despesaMes.toFixed(2),
        Resultado: (receitaMes - despesaMes).toFixed(2),
        'Usuários Ativos': usuarios.filter((u) => u.statusFinal === 'ATIVO').length,
        'Total Comissões': comissoes.reduce((sum, c) => sum + c.valor, 0).toFixed(2),
      },
    ];

    if (format === 'csv') {
      exportToCSV(dataToExport, 'relatorio-executivo');
    } else {
      await exportToXLSX(dataToExport, { filename: 'relatorio-executivo' });
    }
  };

  if (loading && pagamentos.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Relatórios e KPIs</h1>
        <div className="flex gap-3">
          <ExportButton onExport={handleExport} />
        </div>
      </div>

      {/* Dashboard de KPIs */}
      <DashboardCards
        pagamentos={pagamentos}
        despesas={despesas}
        usuarios={usuarios}
        churn={churns}
      />

      <FilterBar onClear={handleClearFilters}>
        <div className="flex gap-2">
          <select
            value={filtroMes}
            onChange={(e) => setFiltroMes(e.target.value)}
            className="px-3 py-2 border border-[var(--border-color)] rounded-md text-sm"
          >
            <option value="">Todos os meses</option>
            <option value="1">Janeiro</option>
            <option value="2">Fevereiro</option>
            <option value="3">Março</option>
            <option value="4">Abril</option>
            <option value="5">Maio</option>
            <option value="6">Junho</option>
            <option value="7">Julho</option>
            <option value="8">Agosto</option>
            <option value="9">Setembro</option>
            <option value="10">Outubro</option>
            <option value="11">Novembro</option>
            <option value="12">Dezembro</option>
          </select>

          <select
            value={filtroAno}
            onChange={(e) => setFiltroAno(e.target.value)}
            className="px-3 py-2 border border-[var(--border-color)] rounded-md text-sm"
          >
            <option value="">Todos os anos</option>
            {anosDisponiveis.map((ano) => (
              <option key={ano} value={ano}>
                {ano}
              </option>
            ))}
          </select>
        </div>
      </FilterBar>

      {/* Abas */}
      <div className="bg-[var(--bg-primary)] rounded-lg shadow">
        <div className="border-b border-[var(--border-color)]">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('porMes')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'porMes'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-[var(--border-color)]'
              }`}
            >
              📊 Por Mês
            </button>
            <button
              onClick={() => setActiveTab('porIndicador')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'porIndicador'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-[var(--border-color)]'
              }`}
            >
              👥 Por Indicador
            </button>
            <button
              onClick={() => setActiveTab('idadeTitulos')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'idadeTitulos'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-[var(--border-color)]'
              }`}
            >
              📅 Idade de Títulos
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'porMes' && (
            <RelatorioPorMes
              pagamentos={pagamentos}
              despesas={despesas}
              usuarios={usuarios}
              churn={churns}
              filtroAno={filtroAno}
            />
          )}
          {activeTab === 'porIndicador' && (
            <RelatorioPorIndicador
              usuarios={usuarios}
              comissoes={comissoes}
              filtroMes={filtroMes}
              filtroAno={filtroAno}
            />
          )}
          {activeTab === 'idadeTitulos' && <RelatorioIdadeTitulos agenda={agenda} />}
        </div>
      </div>
    </div>
  );
};

export default RelatoriosPage;
