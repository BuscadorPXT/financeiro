import { useState, useEffect } from 'react';
import usuarioExcluidoService from '../services/usuarioExcluidoService';
import type { UsuarioExcluido, UsuarioExcluidoStats } from '../services/usuarioExcluidoService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/common/Alert';
import SearchInput from '../components/common/SearchInput';

const UsuariosExcluidos = () => {
  const [usuarios, setUsuarios] = useState<UsuarioExcluido[]>([]);
  const [stats, setStats] = useState<UsuarioExcluidoStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [usuariosData, statsData] = await Promise.all([
        usuarioExcluidoService.getAll(),
        usuarioExcluidoService.getStats(),
      ]);
      setUsuarios(usuariosData);
      setStats(statsData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar histórico de exclusões');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsuarios = usuarios.filter(u =>
    u.emailLogin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.nomeCompleto.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Histórico de Exclusões
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Registro de todos os usuários excluídos do sistema
        </p>
      </div>

      {error && <Alert type="error" className="mb-4">{error}</Alert>}

      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Excluídos</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Último Mês</p>
            <p className="text-2xl font-bold text-orange-600">{stats.ultimoMes}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Pagamentos</p>
            <p className="text-2xl font-bold text-blue-600">{stats.totalPagamentosHistorico}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Valor Total</p>
            <p className="text-2xl font-bold text-green-600">
              R$ {stats.valorTotalHistorico.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      )}

      {/* Busca */}
      <div className="mb-4">
        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por email ou nome..."
        />
      </div>

      {/* Tabela */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {filteredUsuarios.length} registro{filteredUsuarios.length !== 1 ? 's' : ''} encontrado{filteredUsuarios.length !== 1 ? 's' : ''}
          </p>
        </div>

        {filteredUsuarios.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            Nenhum registro encontrado
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Ciclos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Pagamentos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Valor Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Data Exclusão
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Motivo
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsuarios.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {usuario.nomeCompleto}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {usuario.emailLogin}
                        </div>
                        {usuario.telefone && (
                          <div className="text-xs text-gray-400">
                            {usuario.telefone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        usuario.statusFinal === 'ATIVO' ? 'bg-green-100 text-green-800' :
                        usuario.statusFinal === 'EM_ATRASO' ? 'bg-orange-100 text-orange-800' :
                        usuario.statusFinal === 'INATIVO' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {usuario.statusFinal}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {usuario.totalCiclosUsuario}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {usuario.totalPagamentos}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      R$ {Number(usuario.valorTotalPago).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(usuario.dataExclusao).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {usuario.motivoExclusao || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsuariosExcluidos;
