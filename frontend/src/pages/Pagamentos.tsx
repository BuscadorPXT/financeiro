import React, { useState, useMemo } from 'react';
import { usePagamentosLegacy as usePagamentos } from '../hooks/usePagamentos';
import { useUsuariosLegacy as useUsuarios } from '../hooks/useUsuarios';
import type { Pagamento, CreatePagamentoDTO, UpdatePagamentoDTO } from '../services/pagamentoService';
import FilterBar from '../components/common/FilterBar';
import Select from '../components/common/Select';
import Button from '../components/common/Button';
import SearchInput from '../components/common/SearchInput';
import ExportButton from '../components/common/ExportButton';
import Alert from '../components/common/Alert';
import PagamentosTable from '../components/pagamentos/PagamentosTable';
import PagamentoCardList from '../components/pagamentos/PagamentoCardList';
import PagamentoForm from '../components/pagamentos/PagamentoForm';
import DashboardPagamentos from '../components/pagamentos/DashboardPagamentos';
import { useExport } from '../hooks/useExport';
import { useListas } from '../hooks/useListas';
import { TableSkeleton } from '../components/skeletons';
import { toastCRUD, showAPIError } from '../utils/toast';

const PagamentosPage: React.FC = () => {
  const { pagamentos, loading, error, fetchAll, create, update, remove } = usePagamentos();
  const { usuarios } = useUsuarios();
  const { exportToCSV, exportToXLSX } = useExport();
  const { listas: metodos } = useListas('METODO');
  const { listas: contas } = useListas('CONTA');

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [mesFilter, setMesFilter] = useState<string>('');
  const [contaFilter, setContaFilter] = useState<string>('');
  const [metodoFilter, setMetodoFilter] = useState<string>('');
  const [regraFilter, setRegraFilter] = useState<string>('');

  // Estado de visualização
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Estados de ordenação
  const [sortKey, setSortKey] = useState<keyof Pagamento>('dataPagto');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Estados de modais
  const [showForm, setShowForm] = useState(false);
  const [selectedPagamento, setSelectedPagamento] = useState<Pagamento | null>(null);

  // Filtrar pagamentos
  const filteredPagamentos = useMemo(() => {
    return pagamentos.filter((pagamento) => {
      // Busca por texto (pelo usuário associado)
      const usuario = usuarios.find((u) => u.id === pagamento.usuarioId);
      const matchSearch =
        searchTerm === '' ||
        usuario?.emailLogin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usuario?.nomeCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pagamento.observacao?.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtros
      const matchMes = mesFilter === '' || pagamento.mesPagto === mesFilter;
      const matchConta = contaFilter === '' || pagamento.conta === contaFilter;
      const matchMetodo = metodoFilter === '' || pagamento.metodo === metodoFilter;
      const matchRegra = regraFilter === '' || pagamento.regraTipo === regraFilter;

      return matchSearch && matchMes && matchConta && matchMetodo && matchRegra;
    });
  }, [pagamentos, usuarios, searchTerm, mesFilter, contaFilter, metodoFilter, regraFilter]);

  // Obter meses únicos
  const meses = useMemo(() => {
    const unique = [...new Set(pagamentos.map((p) => p.mesPagto))].sort().reverse();
    return unique.map((m) => ({ value: m, label: m }));
  }, [pagamentos]);

  // Handlers
  const handleClearFilters = () => {
    setSearchTerm('');
    setMesFilter('');
    setContaFilter('');
    setMetodoFilter('');
    setRegraFilter('');
  };

  const handleSort = (key: keyof Pagamento) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const handleNovoPagamento = () => {
    setSelectedPagamento(null);
    setShowForm(true);
  };

  const handleEditPagamento = (pagamento: Pagamento) => {
    setSelectedPagamento(pagamento);
    setShowForm(true);
  };

  const handleExport = async (format: 'csv' | 'xlsx') => {
    const dataToExport = filteredPagamentos.map((p) => {
      const usuario = usuarios.find((u) => u.id === p.usuarioId);
      return {
        Data: p.dataPagto,
        Mês: p.mesPagto,
        Usuário: usuario?.nomeCompleto || '',
        Email: usuario?.emailLogin || '',
        Valor: p.valor,
        Método: p.metodo,
        Conta: p.conta,
        Tipo: p.regraTipo,
        'Valor Comissão': p.comissaoValor,
        Observação: p.observacao || '',
      };
    });

    if (format === 'csv') {
      exportToCSV(dataToExport, 'pagamentos');
    } else {
      await exportToXLSX(dataToExport, { filename: 'pagamentos' });
    }
  };

  if (loading && pagamentos.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Pagamentos</h1>
        </div>
        <TableSkeleton rows={10} columns={8} />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Pagamentos</h1>
        <div className="flex gap-3">
          <Button
            variant={viewMode === 'cards' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('cards')}
            title="Visualização em Cards"
          >
            ⊞
          </Button>
          <Button
            variant={viewMode === 'table' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('table')}
            title="Visualização em Tabela"
          >
            ☰
          </Button>
          <ExportButton onExport={handleExport} />
          <Button onClick={handleNovoPagamento}>+ Novo Pagamento</Button>
        </div>
      </div>

      {error && <Alert type="error" className="mb-4">{error}</Alert>}

      {/* Dashboard de Resumo */}
      <DashboardPagamentos pagamentos={filteredPagamentos} />

      <FilterBar onClear={handleClearFilters}>
        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por usuário ou observação..."
        />

        <Select
          value={mesFilter}
          onChange={setMesFilter}
          options={[{ value: '', label: 'Todos os Meses' }, ...meses]}
        />

        <Select
          value={contaFilter}
          onChange={setContaFilter}
          options={[
            { value: '', label: 'Todas as Contas' },
            ...contas.map((c) => ({ value: c.valor, label: c.valor })),
          ]}
        />

        <Select
          value={metodoFilter}
          onChange={setMetodoFilter}
          options={[
            { value: '', label: 'Todos os Métodos' },
            ...metodos.map((m) => ({ value: m.valor, label: m.valor })),
          ]}
        />

        <Select
          value={regraFilter}
          onChange={setRegraFilter}
          options={[
            { value: '', label: 'Todos os Tipos' },
            { value: 'PRIMEIRO', label: 'Primeiro Pagamento' },
            { value: 'RECORRENTE', label: 'Recorrente' },
          ]}
        />
      </FilterBar>

      <div className="bg-[var(--bg-primary)] rounded-lg shadow">
        <div className="p-4 border-b border-[var(--border-color)]">
          <p className="text-sm text-gray-600">
            {filteredPagamentos.length} pagamento{filteredPagamentos.length !== 1 ? 's' : ''} encontrado
            {filteredPagamentos.length !== 1 ? 's' : ''}
          </p>
        </div>

        {viewMode === 'cards' ? (
          <PagamentoCardList
            pagamentos={filteredPagamentos}
            usuarios={usuarios}
            onEdit={handleEditPagamento}
            onDelete={async (pagamento) => {
              if (confirm('Deseja realmente excluir este pagamento?')) {
                try {
                  await remove(pagamento.id);
                  toastCRUD.delete('Pagamento');
                  fetchAll();
                } catch (error) {
                  showAPIError(error);
                }
              }
            }}
            sortKey={sortKey}
            sortOrder={sortOrder}
            onSort={handleSort}
          />
        ) : (
          <PagamentosTable
            pagamentos={filteredPagamentos}
            usuarios={usuarios}
            onEdit={handleEditPagamento}
            onDelete={async (pagamento) => {
              if (confirm('Deseja realmente excluir este pagamento?')) {
                try {
                  await remove(pagamento.id);
                  toastCRUD.delete('Pagamento');
                  fetchAll();
                } catch (error) {
                  showAPIError(error);
                }
              }
            }}
          />
        )}
      </div>

      {/* Modal de Formulário */}
      {showForm && (
        <PagamentoForm
          pagamento={selectedPagamento}
          onClose={() => {
            setShowForm(false);
            setSelectedPagamento(null);
          }}
          onSave={async (data) => {
            try {
              if (selectedPagamento) {
                await update(selectedPagamento.id, data as UpdatePagamentoDTO);
                toastCRUD.update('Pagamento');
              } else {
                await create(data as CreatePagamentoDTO);
                toastCRUD.create('Pagamento');
              }
              setShowForm(false);
              setSelectedPagamento(null);
              fetchAll();
            } catch (error) {
              showAPIError(error);
            }
          }}
        />
      )}
    </div>
  );
};

export default PagamentosPage;
