import React, { useState, useMemo } from 'react';
import { useUsuarios } from '../hooks/useUsuarios';
import { Usuario } from '../services/usuarioService';
import FilterBar from '../components/common/FilterBar';
import Select from '../components/common/Select';
import Button from '../components/common/Button';
import SearchInput from '../components/common/SearchInput';
import ExportButton from '../components/common/ExportButton';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/common/Alert';
import UsuariosTable from '../components/usuarios/UsuariosTable';
import UsuarioForm from '../components/usuarios/UsuarioForm';
import PagamentoRapidoModal from '../components/usuarios/PagamentoRapidoModal';
import UsuarioHistoricoModal from '../components/usuarios/UsuarioHistoricoModal';
import { useExport } from '../hooks/useExport';

const UsuariosPage: React.FC = () => {
  const { usuarios, loading, error, fetchAll, create, update, remove } = useUsuarios();
  const { exportToCSV, exportToXLSX } = useExport();

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [indicadorFilter, setIndicadorFilter] = useState<string>('');
  const [metodoFilter, setMetodoFilter] = useState<string>('');
  const [contaFilter, setContaFilter] = useState<string>('');
  const [venceHojeFilter, setVenceHojeFilter] = useState(false);
  const [prox7DiasFilter, setProx7DiasFilter] = useState(false);
  const [emAtrasoFilter, setEmAtrasoFilter] = useState(false);

  // Estados de modais
  const [showForm, setShowForm] = useState(false);
  const [showPagamentoRapido, setShowPagamentoRapido] = useState(false);
  const [showHistorico, setShowHistorico] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);

  // Filtrar usuários
  const filteredUsuarios = useMemo(() => {
    return usuarios.filter((usuario) => {
      // Busca por texto
      const matchSearch =
        searchTerm === '' ||
        usuario.email_login.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usuario.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usuario.telefone?.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtros
      const matchStatus = statusFilter === '' || usuario.status_final === statusFilter;
      const matchIndicador = indicadorFilter === '' || usuario.indicador === indicadorFilter;
      const matchMetodo = metodoFilter === '' || usuario.metodo === metodoFilter;
      const matchConta = contaFilter === '' || usuario.conta === contaFilter;
      const matchVenceHoje = !venceHojeFilter || usuario.vence_hoje;
      const matchProx7Dias = !prox7DiasFilter || usuario.prox_7_dias;
      const matchEmAtraso = !emAtrasoFilter || usuario.em_atraso;

      return (
        matchSearch &&
        matchStatus &&
        matchIndicador &&
        matchMetodo &&
        matchConta &&
        matchVenceHoje &&
        matchProx7Dias &&
        matchEmAtraso
      );
    });
  }, [usuarios, searchTerm, statusFilter, indicadorFilter, metodoFilter, contaFilter, venceHojeFilter, prox7DiasFilter, emAtrasoFilter]);

  // Opções únicas para filtros
  const indicadores = useMemo(() => {
    const unique = [...new Set(usuarios.map((u) => u.indicador).filter(Boolean))];
    return unique.map((i) => ({ value: i!, label: i! }));
  }, [usuarios]);

  const metodos = useMemo(() => {
    const unique = [...new Set(usuarios.map((u) => u.metodo).filter(Boolean))];
    return unique.map((m) => ({ value: m!, label: m! }));
  }, [usuarios]);

  const contas = useMemo(() => {
    const unique = [...new Set(usuarios.map((u) => u.conta).filter(Boolean))];
    return unique.map((c) => ({ value: c!, label: c! }));
  }, [usuarios]);

  // Handlers
  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setIndicadorFilter('');
    setMetodoFilter('');
    setContaFilter('');
    setVenceHojeFilter(false);
    setProx7DiasFilter(false);
    setEmAtrasoFilter(false);
  };

  const handleNovoUsuario = () => {
    setSelectedUsuario(null);
    setShowForm(true);
  };

  const handleEditUsuario = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setShowForm(true);
  };

  const handlePagamentoRapido = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setShowPagamentoRapido(true);
  };

  const handleVerHistorico = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setShowHistorico(true);
  };

  const handleExport = async (format: 'csv' | 'xlsx') => {
    const dataToExport = filteredUsuarios.map((u) => ({
      Email: u.email_login,
      Nome: u.nome_completo,
      Telefone: u.telefone || '',
      Indicador: u.indicador || '',
      Status: u.status_final,
      Método: u.metodo || '',
      Conta: u.conta || '',
      Ciclo: u.ciclo,
      'Data Vencimento': u.data_venc || '',
      'Dias para Vencer': u.dias_para_vencer || '',
      'Ativo Atual': u.ativo_atual ? 'Sim' : 'Não',
    }));

    if (format === 'csv') {
      exportToCSV(dataToExport, 'usuarios');
    } else {
      await exportToXLSX(dataToExport, { filename: 'usuarios' });
    }
  };

  if (loading && usuarios.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Usuários</h1>
        <div className="flex gap-3">
          <ExportButton onExport={handleExport} />
          <Button onClick={handleNovoUsuario}>+ Novo Usuário</Button>
        </div>
      </div>

      {error && <Alert type="error" message={error} className="mb-4" />}

      <FilterBar onClear={handleClearFilters}>
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Buscar por email, nome ou telefone..."
        />

        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: '', label: 'Todos Status' },
            { value: 'Ativo', label: 'Ativo' },
            { value: 'Em_Atraso', label: 'Em Atraso' },
            { value: 'Inativo', label: 'Inativo' },
            { value: 'Historico', label: 'Histórico' },
          ]}
        />

        <Select
          value={indicadorFilter}
          onChange={setIndicadorFilter}
          options={[{ value: '', label: 'Todos Indicadores' }, ...indicadores]}
        />

        <Select
          value={metodoFilter}
          onChange={setMetodoFilter}
          options={[{ value: '', label: 'Todos Métodos' }, ...metodos]}
        />

        <Select
          value={contaFilter}
          onChange={setContaFilter}
          options={[{ value: '', label: 'Todas Contas' }, ...contas]}
        />

        <div className="flex gap-2">
          <Button
            variant={venceHojeFilter ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setVenceHojeFilter(!venceHojeFilter)}
          >
            Vence Hoje
          </Button>
          <Button
            variant={prox7DiasFilter ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setProx7DiasFilter(!prox7DiasFilter)}
          >
            Próximos 7 Dias
          </Button>
          <Button
            variant={emAtrasoFilter ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setEmAtrasoFilter(!emAtrasoFilter)}
          >
            Em Atraso
          </Button>
        </div>
      </FilterBar>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <p className="text-sm text-gray-600">
            {filteredUsuarios.length} usuário{filteredUsuarios.length !== 1 ? 's' : ''} encontrado{filteredUsuarios.length !== 1 ? 's' : ''}
          </p>
        </div>

        <UsuariosTable
          usuarios={filteredUsuarios}
          onEdit={handleEditUsuario}
          onDelete={async (usuario) => {
            if (confirm(`Deseja realmente excluir o usuário ${usuario.nome_completo}?`)) {
              await remove(usuario.id);
              fetchAll();
            }
          }}
          onPagamentoRapido={handlePagamentoRapido}
          onVerHistorico={handleVerHistorico}
          onToggleAgenda={async (usuario) => {
            await update(usuario.id, { flag_agenda: !usuario.flag_agenda });
            fetchAll();
          }}
        />
      </div>

      {/* Modais */}
      {showForm && (
        <UsuarioForm
          usuario={selectedUsuario}
          onClose={() => {
            setShowForm(false);
            setSelectedUsuario(null);
          }}
          onSave={async (data) => {
            if (selectedUsuario) {
              await update(selectedUsuario.id, data);
            } else {
              await create(data);
            }
            setShowForm(false);
            setSelectedUsuario(null);
            fetchAll();
          }}
        />
      )}

      {showPagamentoRapido && selectedUsuario && (
        <PagamentoRapidoModal
          usuario={selectedUsuario}
          onClose={() => {
            setShowPagamentoRapido(false);
            setSelectedUsuario(null);
          }}
          onSuccess={() => {
            setShowPagamentoRapido(false);
            setSelectedUsuario(null);
            fetchAll();
          }}
        />
      )}

      {showHistorico && selectedUsuario && (
        <UsuarioHistoricoModal
          usuario={selectedUsuario}
          onClose={() => {
            setShowHistorico(false);
            setSelectedUsuario(null);
          }}
        />
      )}
    </div>
  );
};

export default UsuariosPage;
