import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface SystemUser {
  id: string;
  login: string;
  nome: string;
  email?: string;
  role: 'ADMIN' | 'USER';
  aprovado: boolean;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

const AdminUsers = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    loadUsers();
  }, [isAdmin, navigate, filter]);

  const loadUsers = async () => {
    setIsLoading(true);
    setError('');

    try {
      const params: any = {};
      if (filter === 'pending') {
        params.aprovado = 'false';
      } else if (filter === 'approved') {
        params.aprovado = 'true';
      }

      const response = await api.get('/admin-users/usuarios', { params });
      setUsers(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar usuários');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAprovar = async (userId: string) => {
    try {
      await api.post(`/admin-users/usuarios/${userId}/aprovar`);
      await loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao aprovar usuário');
    }
  };

  const handleRejeitar = async (userId: string) => {
    if (!confirm('Tem certeza que deseja rejeitar este usuário? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      await api.delete(`/admin-users/usuarios/${userId}/rejeitar`);
      await loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao rejeitar usuário');
    }
  };

  const handleToggleRole = async (userId: string, currentRole: 'ADMIN' | 'USER') => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';

    if (!confirm(`Alterar role de ${currentRole} para ${newRole}?`)) {
      return;
    }

    try {
      await api.put(`/admin-users/usuarios/${userId}/role`, { role: newRole });
      await loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao alterar role');
    }
  };

  const handleToggleAtivo = async (userId: string) => {
    try {
      await api.put(`/admin-users/usuarios/${userId}/toggle-ativo`);
      await loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao ativar/desativar usuário');
    }
  };

  const pendingCount = users.filter(u => !u.aprovado).length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Gerenciamento de Usuários do Sistema
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gerencie usuários, aprovações e permissões de acesso ao sistema
        </p>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-md ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Todos ({users.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-md relative ${
            filter === 'pending'
              ? 'bg-orange-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Pendentes ({pendingCount})
          {pendingCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-4 py-2 rounded-md ${
            filter === 'approved'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Aprovados
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Tabela de usuários */}
      {!isLoading && users.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Nenhum usuário encontrado
        </div>
      )}

      {!isLoading && users.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Criado em
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.nome}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          @{user.login}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {user.email || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => user.aprovado && handleToggleRole(user.id, user.role)}
                        disabled={!user.aprovado}
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        } ${user.aprovado ? 'cursor-pointer hover:opacity-80' : 'cursor-not-allowed opacity-50'}`}
                      >
                        {user.role}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.aprovado
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                          }`}
                        >
                          {user.aprovado ? 'Aprovado' : 'Pendente'}
                        </span>
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.ativo
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}
                        >
                          {user.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex gap-2 justify-end">
                        {!user.aprovado && (
                          <>
                            <button
                              onClick={() => handleAprovar(user.id)}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            >
                              Aprovar
                            </button>
                            <button
                              onClick={() => handleRejeitar(user.id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              Rejeitar
                            </button>
                          </>
                        )}
                        {user.aprovado && (
                          <button
                            onClick={() => handleToggleAtivo(user.id)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            {user.ativo ? 'Desativar' : 'Ativar'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
