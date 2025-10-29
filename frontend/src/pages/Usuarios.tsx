import React, { useState, useMemo } from 'react';
import { useUsuariosLegacy as useUsuarios } from '../hooks/useUsuarios';
import type { Usuario, CreateUsuarioDTO, UpdateUsuarioDTO } from '../services/usuarioService';
import FilterBar from '../components/common/FilterBar';
import Select from '../components/common/Select';
import Button from '../components/common/Button';
import SearchInput from '../components/common/SearchInput';
import ExportButton from '../components/common/ExportButton';
import Alert from '../components/common/Alert';
import UsuariosTable from '../components/usuarios/UsuariosTable';
import UsuarioForm from '../components/usuarios/UsuarioForm';
import PagamentoRapidoModal from '../components/usuarios/PagamentoRapidoModal';
import UsuarioHistoricoModal from '../components/usuarios/UsuarioHistoricoModal';
import ImportarUsuariosModal from '../components/usuarios/ImportarUsuariosModal';
import { useExport } from '../hooks/useExport';
import { TableSkeleton } from '../components/skeletons';
import { toastCRUD, showAPIError } from '../utils/toast';

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
  const [showImport, setShowImport] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);

  // Filtrar usuários
  const filteredUsuarios = useMemo(() => {
    return usuarios.filter((usuario) => {
      // Busca por texto
      const matchSearch =
        searchTerm === '' ||
        usuario.emailLogin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usuario.nomeCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usuario.telefone?.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtros
      const matchStatus = statusFilter === '' || usuario.statusFinal === statusFilter;
      const matchIndicador = indicadorFilter === '' || usuario.indicador === indicadorFilter;
      const matchMetodo = metodoFilter === '' || usuario.metodo === metodoFilter;
      const matchConta = contaFilter === '' || usuario.conta === contaFilter;
      const matchVenceHoje = !venceHojeFilter || usuario.venceHoje;
      const matchProx7Dias = !prox7DiasFilter || usuario.prox7Dias;
      const matchEmAtraso = !emAtrasoFilter || usuario.emAtraso;

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
      Email: u.emailLogin,
      Nome: u.nomeCompleto,
      Telefone: u.telefone || '',
      Indicador: u.indicador || '',
      Status: u.statusFinal,
      Método: u.metodo || '',
      Conta: u.conta || '',
      Ciclo: u.ciclo,
      'Data Vencimento': u.dataVenc || '',
      'Dias para Vencer': u.diasParaVencer || '',
      'Ativo Atual': u.ativoAtual ? 'Sim' : 'Não',
    }));

    if (format === 'csv') {
      exportToCSV(dataToExport, 'usuarios');
    } else {
      await exportToXLSX(dataToExport, { filename: 'usuarios' });
    }
  };

  if (loading && usuarios.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Usuários</h1>
        </div>
        <TableSkeleton rows={10} columns={12} />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Usuários</h1>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setShowImport(true)}>
            📥 Importar
          </Button>
          <ExportButton onExport={handleExport} />
          <Button onClick={handleNovoUsuario}>+ Novo Usuário</Button>
        </div>
      </div>

      {error && <Alert type="error" className="mb-4">{error}</Alert>}

      <FilterBar onClear={handleClearFilters}>
        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por email, nome ou telefone..."
        />

        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: '', label: 'Todos Status' },
            { value: 'ATIVO', label: 'Ativo' },
            { value: 'EM_ATRASO', label: 'Em Atraso' },
            { value: 'INATIVO', label: 'Inativo' },
            { value: 'HISTORICO', label: 'Histórico' },
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

      <div className="bg-[var(--bg-primary)] rounded-lg shadow">
        <div className="p-4 border-b border-[var(--border-color)]">
          <p className="text-sm text-gray-600">
            {filteredUsuarios.length} usuário{filteredUsuarios.length !== 1 ? 's' : ''} encontrado{filteredUsuarios.length !== 1 ? 's' : ''}
          </p>
        </div>

        <UsuariosTable
          usuarios={filteredUsuarios}
          onEdit={handleEditUsuario}
          onDelete={async (usuario) => {
            if (confirm(`Deseja realmente excluir o usuário ${usuario.nomeCompleto}?`)) {
              try {
                await remove(usuario.id);
                toastCRUD.delete('Usuário');
                fetchAll();
              } catch (error) {
                showAPIError(error);
              }
            }
          }}
          onPagamentoRapido={handlePagamentoRapido}
          onVerHistorico={handleVerHistorico}
          onToggleAgenda={async (usuario) => {
            try {
              await update(usuario.id, { flagAgenda: !usuario.flagAgenda });
              fetchAll();
            } catch (error) {
              showAPIError(error);
            }
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
            try {
              if (selectedUsuario) {
                await update(selectedUsuario.id, data as UpdateUsuarioDTO);
                toastCRUD.update('Usuário');
              } else {
                await create(data as CreateUsuarioDTO);
                toastCRUD.create('Usuário');
              }
              setShowForm(false);
              setSelectedUsuario(null);
              fetchAll();
            } catch (error) {
              showAPIError(error);
            }
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

      {showImport && (
        <ImportarUsuariosModal
          onClose={() => setShowImport(false)}
          onSuccess={() => {
            setShowImport(false);
            fetchAll();
          }}
        />
      )}
    </div>
  );
};

export default UsuariosPage;
