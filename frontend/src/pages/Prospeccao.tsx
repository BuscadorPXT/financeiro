import React, { useState, useMemo } from 'react';
import { useProspeccao } from '../hooks/useProspeccao';
import { useListas } from '../hooks/useListas';
import type { Prospeccao as ProspeccaoType } from '../services/prospeccaoService';
import FilterBar from '../components/common/FilterBar';
import Button from '../components/common/Button';
import SearchInput from '../components/common/SearchInput';
import ExportButton from '../components/common/ExportButton';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/common/Alert';
import ProspeccaoTable from '../components/prospeccao/ProspeccaoTable';
import ProspeccaoForm from '../components/prospeccao/ProspeccaoForm';
import ConversaoModal from '../components/prospeccao/ConversaoModal';
import { useExport } from '../hooks/useExport';

const ProspeccaoPage: React.FC = () => {
  const { prospeccoes, loading, error, fetchAll, create, update, remove, converter } = useProspeccao();
  const { listas } = useListas();
  const { exportToCSV, exportToXLSX } = useExport();

  // Estados de UI
  const [showForm, setShowForm] = useState(false);
  const [editingProspeccao, setEditingProspeccao] = useState<ProspeccaoType | null>(null);
  const [showConversaoModal, setShowConversaoModal] = useState(false);
  const [convertingProspeccao, setConvertingProspeccao] = useState<ProspeccaoType | null>(null);

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroConversao, setFiltroConversao] = useState<string>('todos'); // todos, convertidos, pendentes
  const [filtroOrigem, setFiltroOrigem] = useState<string>('');
  const [filtroIndicador, setFiltroIndicador] = useState<string>('');

  // Listas auxiliares
  const indicadores = useMemo(
    () => listas.filter((l) => l.tipo === 'INDICADOR').map((l) => l.valor),
    [listas]
  );

  // Filtrar prospecção
  const filteredProspeccao = useMemo(() => {
    return prospeccoes.filter((p) => {
      // Busca por texto
      const matchSearch =
        searchTerm === '' ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.telefone?.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro de conversão
      const matchConversao =
        filtroConversao === 'todos' ||
        (filtroConversao === 'convertidos' && p.convertido) ||
        (filtroConversao === 'pendentes' && !p.convertido);

      // Filtro de origem
      const matchOrigem = filtroOrigem === '' || p.origem === filtroOrigem;

      // Filtro de indicador
      const matchIndicador = filtroIndicador === '' || p.indicador === filtroIndicador;

      return matchSearch && matchConversao && matchOrigem && matchIndicador;
    });
  }, [prospeccoes, searchTerm, filtroConversao, filtroOrigem, filtroIndicador]);

  // Estatísticas
  const stats = useMemo(() => {
    const total = prospeccoes.length;
    const convertidos = prospeccoes.filter((p) => p.convertido).length;
    const pendentes = prospeccoes.filter((p) => !p.convertido).length;
    const taxaConversao = total > 0 ? (convertidos / total) * 100 : 0;

    return { total, convertidos, pendentes, taxaConversao };
  }, [prospeccoes]);

  // Origens únicas
  const origensUnicas = useMemo(() => {
    const origens = prospeccoes
      .map((p) => p.origem)
      .filter((o): o is string => !!o);
    return Array.from(new Set(origens));
  }, [prospeccoes]);

  // Handlers
  const handleClearFilters = () => {
    setSearchTerm('');
    setFiltroConversao('todos');
    setFiltroOrigem('');
    setFiltroIndicador('');
  };

  const handleCreate = () => {
    setEditingProspeccao(null);
    setShowForm(true);
  };

  const handleEdit = (p: ProspeccaoType) => {
    setEditingProspeccao(p);
    setShowForm(true);
  };

  const handleDelete = async (p: ProspeccaoType) => {
    if (confirm(`Tem certeza que deseja excluir o lead "${p.nome}"?`)) {
      await remove(p.id);
      fetchAll();
    }
  };

  const handleSave = async (data: any) => {
    if (editingProspeccao) {
      await update(editingProspeccao.id, data);
    } else {
      await create(data);
    }
    setShowForm(false);
    setEditingProspeccao(null);
    fetchAll();
  };

  const handleConverter = (p: ProspeccaoType) => {
    setConvertingProspeccao(p);
    setShowConversaoModal(true);
  };

  const handleConfirmConversao = async (usuarioId: number) => {
    if (convertingProspeccao) {
      await converter(convertingProspeccao.id, { usuario_id: usuarioId });
      setShowConversaoModal(false);
      setConvertingProspeccao(null);
      fetchAll();
    }
  };

  const handleExport = async (format: 'csv' | 'xlsx') => {
    const dataToExport = filteredProspeccao.map((p) => ({
      Email: p.email,
      Nome: p.nome,
      Telefone: p.telefone || '',
      Origem: p.origem || '',
      Indicador: p.indicador || '',
      Convertido: p.convertido ? 'Sim' : 'Não',
      'Criado em': new Date(p.created_at).toLocaleDateString('pt-BR'),
    }));

    if (format === 'csv') {
      exportToCSV(dataToExport, 'prospeccao');
    } else {
      await exportToXLSX(dataToExport, { filename: 'prospeccao' });
    }
  };

  if (loading && prospeccoes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Prospecção de Leads</h1>
        <div className="flex gap-3">
          <Button onClick={handleCreate}>+ Novo Lead</Button>
          <ExportButton onExport={handleExport} />
        </div>
      </div>

      {error && <Alert type="error" message={error} className="mb-4" />}

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[var(--bg-primary)] p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Total de Leads</p>
          <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
        </div>
        <div className="bg-[var(--bg-primary)] p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Convertidos</p>
          <p className="text-2xl font-bold text-green-600">{stats.convertidos}</p>
        </div>
        <div className="bg-[var(--bg-primary)] p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Pendentes</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pendentes}</p>
        </div>
        <div className="bg-[var(--bg-primary)] p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Taxa de Conversão</p>
          <p className="text-2xl font-bold text-purple-600">
            {stats.taxaConversao.toFixed(1)}%
          </p>
        </div>
      </div>

      <FilterBar onClear={handleClearFilters}>
        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por email, nome ou telefone..."
        />

        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            variant={filtroConversao === 'todos' ? 'primary' : 'secondary'}
            onClick={() => setFiltroConversao('todos')}
          >
            Todos
          </Button>
          <Button
            size="sm"
            variant={filtroConversao === 'pendentes' ? 'primary' : 'secondary'}
            onClick={() => setFiltroConversao('pendentes')}
          >
            Pendentes
          </Button>
          <Button
            size="sm"
            variant={filtroConversao === 'convertidos' ? 'primary' : 'secondary'}
            onClick={() => setFiltroConversao('convertidos')}
          >
            Convertidos
          </Button>
        </div>

        <div className="flex gap-2">
          <select
            value={filtroOrigem}
            onChange={(e) => setFiltroOrigem(e.target.value)}
            className="px-3 py-2 border border-[var(--border-color)] rounded-md text-sm"
          >
            <option value="">Todas as origens</option>
            {origensUnicas.map((origem) => (
              <option key={origem} value={origem}>
                {origem}
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
            {filteredProspeccao.length} lead{filteredProspeccao.length !== 1 ? 's' : ''}{' '}
            encontrado{filteredProspeccao.length !== 1 ? 's' : ''}
          </p>
        </div>

        <ProspeccaoTable
          prospeccao={filteredProspeccao}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onConverter={handleConverter}
        />
      </div>

      {/* Modal de Formulário */}
      {showForm && (
        <ProspeccaoForm
          prospeccao={editingProspeccao}
          indicadores={indicadores}
          onSave={handleSave}
          onClose={() => {
            setShowForm(false);
            setEditingProspeccao(null);
          }}
        />
      )}

      {/* Modal de Conversão */}
      {showConversaoModal && convertingProspeccao && (
        <ConversaoModal
          prospeccao={convertingProspeccao}
          onConfirm={handleConfirmConversao}
          onClose={() => {
            setShowConversaoModal(false);
            setConvertingProspeccao(null);
          }}
        />
      )}
    </div>
  );
};

export default ProspeccaoPage;
