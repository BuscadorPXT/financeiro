import React, { useState, useMemo } from 'react';
import { useDespesas } from '../hooks/useDespesas';
import type { Despesa } from '../services/despesaService';
import FilterBar from '../components/common/FilterBar';
import Select from '../components/common/Select';
import Button from '../components/common/Button';
import SearchInput from '../components/common/SearchInput';
import ExportButton from '../components/common/ExportButton';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/common/Alert';
import DespesasTable from '../components/despesas/DespesasTable';
import DespesaForm from '../components/despesas/DespesaForm';
import DashboardDespesas from '../components/despesas/DashboardDespesas';
import { useExport } from '../hooks/useExport';
import { useListas } from '../hooks/useListas';

const DespesasPage: React.FC = () => {
  const { despesas, loading, error, fetchAll, create, update, remove, quitar } = useDespesas();
  const { exportToCSV, exportToXLSX } = useExport();
  const { listas: categorias } = useListas('CATEGORIA');

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [mesFilter, setMesFilter] = useState<number>(0);
  const [anoFilter, setAnoFilter] = useState<number>(0);

  // Estados de modais
  const [showForm, setShowForm] = useState(false);
  const [selectedDespesa, setSelectedDespesa] = useState<Despesa | null>(null);

  // Filtrar despesas
  const filteredDespesas = useMemo(() => {
    return despesas.filter((despesa) => {
      // Busca por texto
      const matchSearch =
        searchTerm === '' ||
        despesa.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
        despesa.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        despesa.indicador?.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtros
      const matchCategoria = categoriaFilter === '' || despesa.categoria === categoriaFilter;
      const matchStatus = statusFilter === '' || despesa.status === statusFilter;
      const matchMes = mesFilter === 0 || despesa.competenciaMes === mesFilter;
      const matchAno = anoFilter === 0 || despesa.competenciaAno === anoFilter;

      return matchSearch && matchCategoria && matchStatus && matchMes && matchAno;
    });
  }, [despesas, searchTerm, categoriaFilter, statusFilter, mesFilter, anoFilter]);

  // Obter anos únicos
  const anos = useMemo(() => {
    const unique = [...new Set(despesas.map((d) => d.competenciaAno))].sort().reverse();
    return unique.map((a) => ({ value: String(a), label: String(a) }));
  }, [despesas]);

  // Handlers
  const handleClearFilters = () => {
    setSearchTerm('');
    setCategoriaFilter('');
    setStatusFilter('');
    setMesFilter(0);
    setAnoFilter(0);
  };

  const handleNovaDespesa = () => {
    setSelectedDespesa(null);
    setShowForm(true);
  };

  const handleEditDespesa = (despesa: Despesa) => {
    setSelectedDespesa(despesa);
    setShowForm(true);
  };

  const handleExport = async (format: 'csv' | 'xlsx') => {
    const dataToExport = filteredDespesas.map((d) => ({
      Categoria: d.categoria,
      Descrição: d.descricao,
      Conta: d.conta || '',
      Indicador: d.indicador || '',
      Valor: d.valor,
      Status: d.status,
      'Mês': d.competenciaMes,
      'Ano': d.competenciaAno,
      'Competência': `${d.competenciaMes}/${d.competenciaAno}`,
    }));

    if (format === 'csv') {
      exportToCSV(dataToExport, 'despesas');
    } else {
      await exportToXLSX(dataToExport, { filename: 'despesas' });
    }
  };

  if (loading && despesas.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Despesas</h1>
        <div className="flex gap-3">
          <ExportButton onExport={handleExport} />
          <Button onClick={handleNovaDespesa}>+ Nova Despesa</Button>
        </div>
      </div>

      {error && <Alert type="error" className="mb-4">{error}</Alert>}

      {/* Dashboard de Resumo */}
      <DashboardDespesas despesas={filteredDespesas} />

      <FilterBar onClear={handleClearFilters}>
        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por categoria, descrição ou indicador..."
        />

        <Select
          value={categoriaFilter}
          onChange={setCategoriaFilter}
          options={[
            { value: '', label: 'Todas as Categorias' },
            ...categorias.map((c) => ({ value: c.valor, label: c.valor })),
          ]}
        />

        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: '', label: 'Todos os Status' },
            { value: 'Pago', label: 'Pago' },
            { value: 'Pendente', label: 'Pendente' },
          ]}
        />

        <Select
          value={String(mesFilter)}
          onChange={(value) => setMesFilter(Number(value))}
          options={[
            { value: '0', label: 'Todos os Meses' },
            { value: '1', label: 'Janeiro' },
            { value: '2', label: 'Fevereiro' },
            { value: '3', label: 'Março' },
            { value: '4', label: 'Abril' },
            { value: '5', label: 'Maio' },
            { value: '6', label: 'Junho' },
            { value: '7', label: 'Julho' },
            { value: '8', label: 'Agosto' },
            { value: '9', label: 'Setembro' },
            { value: '10', label: 'Outubro' },
            { value: '11', label: 'Novembro' },
            { value: '12', label: 'Dezembro' },
          ]}
        />

        <Select
          value={String(anoFilter)}
          onChange={(value) => setAnoFilter(Number(value))}
          options={[{ value: '0', label: 'Todos os Anos' }, ...anos]}
        />
      </FilterBar>

      <div className="bg-[var(--bg-primary)] rounded-lg shadow">
        <div className="p-4 border-b border-[var(--border-color)]">
          <p className="text-sm text-gray-600">
            {filteredDespesas.length} despesa{filteredDespesas.length !== 1 ? 's' : ''} encontrada
            {filteredDespesas.length !== 1 ? 's' : ''}
          </p>
        </div>

        <DespesasTable
          despesas={filteredDespesas}
          onEdit={handleEditDespesa}
          onDelete={async (despesa) => {
            if (confirm('Deseja realmente excluir esta despesa?')) {
              await remove(despesa.id);
              fetchAll();
            }
          }}
          onQuitar={async (despesa) => {
            await quitar(despesa.id);
            fetchAll();
          }}
        />
      </div>

      {/* Modal de Formulário */}
      {showForm && (
        <DespesaForm
          despesa={selectedDespesa}
          onClose={() => {
            setShowForm(false);
            setSelectedDespesa(null);
          }}
          onSave={async (data) => {
            if (selectedDespesa) {
              await update(selectedDespesa.id, data);
            } else {
              await create(data);
            }
            setShowForm(false);
            setSelectedDespesa(null);
            fetchAll();
          }}
        />
      )}
    </div>
  );
};

export default DespesasPage;
