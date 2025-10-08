import React, { useState, useMemo } from 'react';
import { useChurn } from '../hooks/useChurn';
import { useUsuarios } from '../hooks/useUsuarios';
import { useListas } from '../hooks/useListas';
import type { Churn as ChurnType } from '../services/churnService';
import FilterBar from '../components/common/FilterBar';
import Button from '../components/common/Button';
import SearchInput from '../components/common/SearchInput';
import ExportButton from '../components/common/ExportButton';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/common/Alert';
import ChurnTable from '../components/churn/ChurnTable';
import ChurnForm from '../components/churn/ChurnForm';
import DashboardChurn from '../components/churn/DashboardChurn';
import { useExport } from '../hooks/useExport';

const ChurnPage: React.FC = () => {
  const { churns, loading, error, fetchAll, create, reverter } = useChurn();
  const { usuarios, fetchAll: fetchUsuarios } = useUsuarios();
  const { listas } = useListas();
  const { exportToCSV, exportToXLSX } = useExport();

  // Estados de UI
  const [showForm, setShowForm] = useState(false);

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroMes, setFiltroMes] = useState<string>('');
  const [filtroAno, setFiltroAno] = useState<string>('');
  const [filtroIndicador, setFiltroIndicador] = useState<string>('');
  const [filtroRevertido, setFiltroRevertido] = useState<string>('todos'); // todos, revertidos, ativos

  // Listas auxiliares
  const indicadores = useMemo(
    () => listas.filter((l) => l.tipo === 'INDICADOR').map((l) => l.valor),
    [listas]
  );

  // Filtrar churn
  const filteredChurn = useMemo(() => {
    return churns.filter((c) => {
      const usuario = c.usuario || usuarios.find((u) => u.id === c.usuarioId);

      // Busca por texto
      const matchSearch =
        searchTerm === '' ||
        usuario?.emailLogin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usuario?.nomeCompleto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.motivo?.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro de mês
      const dataChurn = new Date(c.dataChurn);
      const matchMes =
        filtroMes === '' || (dataChurn.getMonth() + 1).toString() === filtroMes;

      // Filtro de ano
      const matchAno =
        filtroAno === '' || dataChurn.getFullYear().toString() === filtroAno;

      // Filtro de indicador
      const matchIndicador =
        filtroIndicador === '' || usuario?.indicador === filtroIndicador;

      // Filtro de revertido
      const matchRevertido =
        filtroRevertido === 'todos' ||
        (filtroRevertido === 'revertidos' && c.revertido) ||
        (filtroRevertido === 'ativos' && !c.revertido);

      return matchSearch && matchMes && matchAno && matchIndicador && matchRevertido;
    });
  }, [churns, usuarios, searchTerm, filtroMes, filtroAno, filtroIndicador, filtroRevertido]);

  // Anos disponíveis
  const anosDisponiveis = useMemo(() => {
    const anos = churns.map((c) => new Date(c.dataChurn).getFullYear());
    return Array.from(new Set(anos)).sort((a, b) => b - a);
  }, [churns]);

  // Handlers
  const handleClearFilters = () => {
    setSearchTerm('');
    setFiltroMes('');
    setFiltroAno('');
    setFiltroIndicador('');
    setFiltroRevertido('todos');
  };

  const handleCreate = () => {
    setShowForm(true);
  };

  const handleSave = async (data: any) => {
    await create(data);
    setShowForm(false);
    fetchAll();
    fetchUsuarios();
  };

  const handleReverter = async (c: ChurnType) => {
    if (
      confirm(
        'Confirma a reversão deste churn? O usuário será reativado.'
      )
    ) {
      await reverter(c.id);
      fetchAll();
      fetchUsuarios();
    }
  };

  const handleExport = async (format: 'csv' | 'xlsx') => {
    const dataToExport = filteredChurn.map((c) => {
      const usuario = c.usuario || usuarios.find((u) => u.id === c.usuarioId);
      return {
        Email: usuario?.emailLogin || '',
        Nome: usuario?.nomeCompleto || '',
        Indicador: usuario?.indicador || '',
        'Data Churn': new Date(c.dataChurn).toLocaleDateString('pt-BR'),
        Motivo: c.motivo || '',
        Revertido: c.revertido ? 'Sim' : 'Não',
      };
    });

    if (format === 'csv') {
      exportToCSV(dataToExport, 'churn');
    } else {
      await exportToXLSX(dataToExport, { filename: 'churn' });
    }
  };

  if (loading && churns.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Churn / Evasões</h1>
        <div className="flex gap-3">
          <Button onClick={handleCreate}>+ Registrar Churn</Button>
          <ExportButton onExport={handleExport} />
        </div>
      </div>

      {error && <Alert type="error" className="mb-4">{error}</Alert>}

      {/* Dashboard de Resumo */}
      <DashboardChurn churn={churns} usuarios={usuarios} />

      <FilterBar onClear={handleClearFilters}>
        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por email, nome ou motivo..."
        />

        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            variant={filtroRevertido === 'todos' ? 'primary' : 'secondary'}
            onClick={() => setFiltroRevertido('todos')}
          >
            Todos
          </Button>
          <Button
            size="sm"
            variant={filtroRevertido === 'ativos' ? 'primary' : 'secondary'}
            onClick={() => setFiltroRevertido('ativos')}
          >
            Ativos
          </Button>
          <Button
            size="sm"
            variant={filtroRevertido === 'revertidos' ? 'primary' : 'secondary'}
            onClick={() => setFiltroRevertido('revertidos')}
          >
            Revertidos
          </Button>
        </div>

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
        </div>
      </FilterBar>

      <div className="bg-[var(--bg-primary)] rounded-lg shadow">
        <div className="p-4 border-b border-[var(--border-color)]">
          <p className="text-sm text-gray-600">
            {filteredChurn.length} churn{filteredChurn.length !== 1 ? 's' : ''}{' '}
            encontrado{filteredChurn.length !== 1 ? 's' : ''}
          </p>
        </div>

        <ChurnTable
          churn={filteredChurn}
          usuarios={usuarios}
          onReverter={handleReverter}
        />
      </div>

      {/* Modal de Formulário */}
      {showForm && (
        <ChurnForm
          usuarios={usuarios}
          onSave={handleSave}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default ChurnPage;
