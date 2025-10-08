import React, { useState, useMemo } from 'react';
import { useComissoes } from '../hooks/useComissoes';
import { useListas } from '../hooks/useListas';
import FilterBar from '../components/common/FilterBar';
import Button from '../components/common/Button';
import ExportButton from '../components/common/ExportButton';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/common/Alert';
import ComissoesPorIndicador from '../components/comissoes/ComissoesPorIndicador';
import ComissoesPorRegra from '../components/comissoes/ComissoesPorRegra';
import ComissoesExtrato from '../components/comissoes/ComissoesExtrato';
import { useExport } from '../hooks/useExport';

type TabType = 'indicador' | 'regra' | 'extrato';

const ComissoesPage: React.FC = () => {
  const { comissoes, loading, error } = useComissoes();
  const { listas } = useListas();
  const { exportToCSV, exportToXLSX } = useExport();

  // Estados de UI
  const [activeTab, setActiveTab] = useState<TabType>('indicador');

  // Estados de filtros
  const [filtroMes, setFiltroMes] = useState<string>('');
  const [filtroAno, setFiltroAno] = useState<string>('');
  const [filtroIndicador, setFiltroIndicador] = useState<string>('');
  const [filtroRegra, setFiltroRegra] = useState<string>('');

  // Listas auxiliares
  const indicadores = useMemo(
    () => listas.filter((l) => l.tipo === 'INDICADOR').map((l) => l.valor),
    [listas]
  );

  // Filtrar comissões
  const filteredComissoes = useMemo(() => {
    return comissoes.filter((c) => {
      // mesRef está no formato "DD/MM/YYYY"
      if (!c.mesRef) return false;

      const parts = c.mesRef.split('/');
      if (parts.length !== 3) return false;

      const mes = parts[1]; // MM
      const ano = parts[2]; // YYYY

      const matchMes = filtroMes === '' || mes === filtroMes.padStart(2, '0');
      const matchAno = filtroAno === '' || ano === filtroAno;
      const matchIndicador = filtroIndicador === '' || c.indicador === filtroIndicador;
      const matchRegra = filtroRegra === '' || c.regraTipo === filtroRegra;

      return matchMes && matchAno && matchIndicador && matchRegra;
    });
  }, [comissoes, filtroMes, filtroAno, filtroIndicador, filtroRegra]);

  // Anos disponíveis
  const anosDisponiveis = useMemo(() => {
    const anos = comissoes
      .filter((c) => c.mesRef)
      .map((c) => {
        const parts = c.mesRef.split('/');
        return parts.length === 3 ? parts[2] : null;
      })
      .filter((ano): ano is string => ano !== null);

    return Array.from(new Set(anos)).sort((a, b) => b.localeCompare(a));
  }, [comissoes]);

  // Estatísticas
  const stats = useMemo(() => {
    const total = filteredComissoes.reduce((sum, c) => sum + Number(c.valor), 0);
    const totalPrimeiro = filteredComissoes
      .filter((c) => c.regraTipo === 'PRIMEIRO')
      .reduce((sum, c) => sum + Number(c.valor), 0);
    const totalRecorrente = filteredComissoes
      .filter((c) => c.regraTipo === 'RECORRENTE')
      .reduce((sum, c) => sum + Number(c.valor), 0);

    return {
      total,
      totalPrimeiro,
      totalRecorrente,
      quantidade: filteredComissoes.length,
    };
  }, [filteredComissoes]);

  // Handlers
  const handleClearFilters = () => {
    setFiltroMes('');
    setFiltroAno('');
    setFiltroIndicador('');
    setFiltroRegra('');
  };

  const handleExport = async (format: 'csv' | 'xlsx') => {
    const dataToExport = filteredComissoes.map((c) => ({
      Indicador: c.indicador,
      'Tipo de Regra': c.regraTipo,
      Valor: Number(c.valor).toFixed(2),
      'Mês Referência': c.mesRef,
    }));

    if (format === 'csv') {
      exportToCSV(dataToExport, 'comissoes');
    } else {
      await exportToXLSX(dataToExport, { filename: 'comissoes' });
    }
  };

  if (loading && comissoes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Comissões</h1>
        <div className="flex gap-3">
          <ExportButton onExport={handleExport} />
        </div>
      </div>

      {error && <Alert type="error" message={error} className="mb-4" />}

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[var(--bg-primary)] p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Total Geral</p>
          <p className="text-2xl font-bold text-green-600">
            R$ {stats.total.toFixed(2)}
          </p>
          <p className="text-xs text-gray-400 mt-1">{stats.quantidade} comissões</p>
        </div>
        <div className="bg-[var(--bg-primary)] p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Primeiro Pagamento</p>
          <p className="text-2xl font-bold text-blue-600">
            R$ {stats.totalPrimeiro.toFixed(2)}
          </p>
        </div>
        <div className="bg-[var(--bg-primary)] p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Recorrente</p>
          <p className="text-2xl font-bold text-purple-600">
            R$ {stats.totalRecorrente.toFixed(2)}
          </p>
        </div>
        <div className="bg-[var(--bg-primary)] p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Quantidade</p>
          <p className="text-2xl font-bold text-orange-600">{stats.quantidade}</p>
        </div>
      </div>

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

          <select
            value={filtroIndicador}
            onChange={(e) => setFiltroIndicador(e.target.value)}
            className="px-3 py-2 border border-[var(--border-color)] rounded-md text-sm"
          >
            <option value="">Todos os indicadores</option>
            {indicadores.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>

          <select
            value={filtroRegra}
            onChange={(e) => setFiltroRegra(e.target.value)}
            className="px-3 py-2 border border-[var(--border-color)] rounded-md text-sm"
          >
            <option value="">Todos os tipos</option>
            <option value="PRIMEIRO">Primeiro</option>
            <option value="RECORRENTE">Recorrente</option>
          </select>
        </div>
      </FilterBar>

      {/* Abas */}
      <div className="bg-[var(--bg-primary)] rounded-lg shadow">
        <div className="border-b border-[var(--border-color)]">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('indicador')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'indicador'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-[var(--border-color)]'
              }`}
            >
              Por Indicador
            </button>
            <button
              onClick={() => setActiveTab('regra')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'regra'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-[var(--border-color)]'
              }`}
            >
              Por Regra
            </button>
            <button
              onClick={() => setActiveTab('extrato')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'extrato'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-[var(--border-color)]'
              }`}
            >
              Extrato Completo
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'indicador' && (
            <ComissoesPorIndicador comissoes={filteredComissoes} />
          )}
          {activeTab === 'regra' && (
            <ComissoesPorRegra comissoes={filteredComissoes} />
          )}
          {activeTab === 'extrato' && (
            <ComissoesExtrato comissoes={filteredComissoes} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ComissoesPage;
