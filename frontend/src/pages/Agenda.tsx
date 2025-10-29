import React, { useState, useMemo } from 'react';
import { useAgenda } from '../hooks/useAgenda';
import { useUsuariosLegacy as useUsuarios } from '../hooks/useUsuarios';
import type { Agenda as AgendaType } from '../services/agendaService';
import FilterBar from '../components/common/FilterBar';
import Button from '../components/common/Button';
import SearchInput from '../components/common/SearchInput';
import ExportButton from '../components/common/ExportButton';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/common/Alert';
import AgendaTable from '../components/agenda/AgendaTable';
import AgendaCardList from '../components/agenda/AgendaCardList';
import DashboardAgenda from '../components/agenda/DashboardAgenda';
import RenovacaoModal from '../components/agenda/RenovacaoModal';
import { useExport } from '../hooks/useExport';

const AgendaPage: React.FC = () => {
  const { agenda, loading, error, fetchAll, marcarCancelou } = useAgenda();
  const { usuarios, fetchAll: fetchUsuarios } = useUsuarios();
  const { exportToCSV, exportToXLSX } = useExport();

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroRapido, setFiltroRapido] = useState<string>('todos');

  // Estados de visualização
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [sortKey, setSortKey] = useState<keyof AgendaType>('diasParaVencer');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Estado do modal de renovação
  const [renovacaoModal, setRenovacaoModal] = useState<{ isOpen: boolean; item: AgendaType | null }>({
    isOpen: false,
    item: null,
  });

  // Filtrar agenda
  const filteredAgenda = useMemo(() => {
    let filtered = agenda.filter((item) => {
      const usuario = usuarios.find((u) => u.id === item.usuarioId) || item.usuario;

      // Busca por texto
      const matchSearch =
        searchTerm === '' ||
        usuario?.emailLogin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usuario?.nomeCompleto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usuario?.telefone?.toLowerCase().includes(searchTerm.toLowerCase());

      // Ocultar itens renovados/cancelados por padrão (exceto se filtro específico)
      if (filtroRapido !== 'renovados' && item.renovou) return false;
      if (filtroRapido !== 'cancelados' && item.cancelou) return false;

      return matchSearch;
    });

    // Aplicar filtro rápido
    if (filtroRapido === 'vencidos') {
      filtered = filtered.filter((item) => item.diasParaVencer < 0);
    } else if (filtroRapido === 'hoje') {
      filtered = filtered.filter((item) => item.diasParaVencer === 0);
    } else if (filtroRapido === 'proximos7') {
      filtered = filtered.filter((item) => item.diasParaVencer > 0 && item.diasParaVencer <= 7);
    } else if (filtroRapido === 'mes') {
      filtered = filtered.filter((item) => item.diasParaVencer > 0 && item.diasParaVencer <= 30);
    } else if (filtroRapido === 'renovados') {
      filtered = filtered.filter((item) => item.renovou);
    } else if (filtroRapido === 'cancelados') {
      filtered = filtered.filter((item) => item.cancelou);
    }

    return filtered;
  }, [agenda, usuarios, searchTerm, filtroRapido]);

  // Handlers
  const handleClearFilters = () => {
    setSearchTerm('');
    setFiltroRapido('todos');
  };

  const handleSort = (key: keyof AgendaType) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const handleRenovar = (item: AgendaType) => {
    setRenovacaoModal({ isOpen: true, item });
  };

  const handleRenovacaoSuccess = () => {
    setRenovacaoModal({ isOpen: false, item: null });
    fetchAll();
    fetchUsuarios();
  };

  const handleRenovacaoClose = () => {
    setRenovacaoModal({ isOpen: false, item: null });
  };

  const handleCancelar = async (item: AgendaType) => {
    if (confirm('Confirma o cancelamento deste usuário? Isso irá registrar um churn.')) {
      await marcarCancelou(item.id);
      fetchAll();
      fetchUsuarios();
    }
  };

  const handleExport = async (format: 'csv' | 'xlsx') => {
    const dataToExport = filteredAgenda.map((item) => {
      const usuario = usuarios.find((u) => u.id === item.usuarioId) || item.usuario;
      return {
        Email: usuario?.emailLogin || '',
        Nome: usuario?.nomeCompleto || '',
        Telefone: usuario?.telefone || '',
        'Data Vencimento': item.dataVenc,
        'Dias para Vencer': item.diasParaVencer,
        Status: item.status,
        Ciclo: item.ciclo,
        Renovou: item.renovou ? 'Sim' : 'Não',
        Cancelou: item.cancelou ? 'Sim' : 'Não',
      };
    });

    if (format === 'csv') {
      exportToCSV(dataToExport, 'agenda');
    } else {
      await exportToXLSX(dataToExport, { filename: 'agenda' });
    }
  };

  if (loading && agenda.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Agenda de Renovações</h1>
        <div className="flex gap-3">
          <Button
            size="sm"
            variant={viewMode === 'cards' ? 'primary' : 'secondary'}
            onClick={() => setViewMode('cards')}
            title="Visualização em Cards"
          >
            ⊞ Cards
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'table' ? 'primary' : 'secondary'}
            onClick={() => setViewMode('table')}
            title="Visualização em Tabela"
          >
            ☰ Tabela
          </Button>
          <ExportButton onExport={handleExport} />
        </div>
      </div>

      {error && <Alert type="error" className="mb-4">{error}</Alert>}

      {/* Dashboard de Resumo */}
      <DashboardAgenda agenda={agenda} />

      <FilterBar onClear={handleClearFilters}>
        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por email, nome ou telefone..."
        />

        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            variant={filtroRapido === 'todos' ? 'primary' : 'secondary'}
            onClick={() => setFiltroRapido('todos')}
          >
            Todos
          </Button>
          <Button
            size="sm"
            variant={filtroRapido === 'vencidos' ? 'primary' : 'secondary'}
            onClick={() => setFiltroRapido('vencidos')}
          >
            🔴 Vencidos
          </Button>
          <Button
            size="sm"
            variant={filtroRapido === 'hoje' ? 'primary' : 'secondary'}
            onClick={() => setFiltroRapido('hoje')}
          >
            🟠 Hoje
          </Button>
          <Button
            size="sm"
            variant={filtroRapido === 'proximos7' ? 'primary' : 'secondary'}
            onClick={() => setFiltroRapido('proximos7')}
          >
            🟡 Próximos 7 Dias
          </Button>
          <Button
            size="sm"
            variant={filtroRapido === 'mes' ? 'primary' : 'secondary'}
            onClick={() => setFiltroRapido('mes')}
          >
            🟢 Mês Atual
          </Button>
          <Button
            size="sm"
            variant={filtroRapido === 'renovados' ? 'primary' : 'secondary'}
            onClick={() => setFiltroRapido('renovados')}
          >
            ✅ Renovados
          </Button>
          <Button
            size="sm"
            variant={filtroRapido === 'cancelados' ? 'primary' : 'secondary'}
            onClick={() => setFiltroRapido('cancelados')}
          >
            ❌ Cancelados
          </Button>
        </div>
      </FilterBar>

      <div className="bg-[var(--bg-primary)] rounded-lg shadow">
        <div className="p-4 border-b border-[var(--border-color)]">
          <p className="text-sm text-gray-600">
            {filteredAgenda.length} item{filteredAgenda.length !== 1 ? 's' : ''} encontrado
            {filteredAgenda.length !== 1 ? 's' : ''}
          </p>
        </div>

        {viewMode === 'cards' ? (
          <AgendaCardList
            agenda={filteredAgenda}
            usuarios={usuarios}
            onRenovar={handleRenovar}
            onCancelar={handleCancelar}
            sortKey={sortKey}
            sortOrder={sortOrder}
            onSort={handleSort}
          />
        ) : (
          <AgendaTable
            agenda={filteredAgenda}
            usuarios={usuarios}
            onRenovar={handleRenovar}
            onCancelar={handleCancelar}
          />
        )}
      </div>

      {/* Modal de Renovação */}
      {renovacaoModal.isOpen && renovacaoModal.item && (
        <RenovacaoModal
          item={renovacaoModal.item}
          usuario={usuarios.find((u) => u.id === renovacaoModal.item?.usuarioId)}
          onClose={handleRenovacaoClose}
          onSuccess={handleRenovacaoSuccess}
        />
      )}
    </div>
  );
};

export default AgendaPage;
