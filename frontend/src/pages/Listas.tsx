import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Power, Trash2 } from 'lucide-react';
import Table from '../components/common/Table';
import type { Column } from '../components/common/Table';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import FormInput from '../components/common/FormInput';
import Alert from '../components/common/Alert';
import StatusBadge from '../components/common/StatusBadge';
import Badge from '../components/common/Badge';
import listaService from '../services/listaService';
import type { Lista, CreateListaData } from '../services/listaService';
import { formatDate } from '../utils/formatters';

const TIPOS = [
  { value: 'CONTA', label: 'Contas', gradient: 'from-blue-500 to-cyan-500' },
  { value: 'METODO', label: 'Métodos de Pagamento', gradient: 'from-purple-500 to-pink-500' },
  { value: 'CATEGORIA', label: 'Categorias', gradient: 'from-orange-500 to-red-500' },
  { value: 'INDICADOR', label: 'Indicadores', gradient: 'from-green-500 to-emerald-500' },
];

const Listas = () => {
  const [activeTab, setActiveTab] = useState<string>('CONTA');
  const [listas, setListas] = useState<Lista[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingLista, setEditingLista] = useState<Lista | null>(null);
  const [formValue, setFormValue] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Carregar listas
  const loadListas = async () => {
    setLoading(true);
    try {
      const data = await listaService.getByTipo(activeTab);
      setListas(data || []);
    } catch (err) {
      setError('Erro ao carregar listas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadListas();
  }, [activeTab]);

  // Abrir modal para criar/editar
  const handleOpenModal = (lista?: Lista) => {
    setEditingLista(lista || null);
    setFormValue(lista?.valor || '');
    setShowModal(true);
    setError('');
  };

  // Salvar (criar ou editar)
  const handleSave = async () => {
    if (!formValue.trim()) {
      setError('O valor é obrigatório');
      return;
    }

    setLoading(true);
    try {
      if (editingLista) {
        // Editar
        await listaService.update(editingLista.id, { valor: formValue });
        setSuccess('Lista atualizada com sucesso!');
      } else {
        // Criar
        const data: CreateListaData = {
          tipo: activeTab as any,
          valor: formValue,
        };
        await listaService.create(data);
        setSuccess('Lista criada com sucesso!');
      }

      setShowModal(false);
      setFormValue('');
      loadListas();

      // Limpar mensagem de sucesso após 3s
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao salvar lista');
    } finally {
      setLoading(false);
    }
  };

  // Deletar
  const handleDelete = async (lista: Lista) => {
    if (!confirm(`Deseja realmente excluir "${lista.valor}"?`)) {
      return;
    }

    setLoading(true);
    try {
      await listaService.delete(lista.id);
      setSuccess('Lista excluída com sucesso!');
      loadListas();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao excluir lista');
    } finally {
      setLoading(false);
    }
  };

  // Toggle ativo/inativo
  const handleToggleAtivo = async (lista: Lista) => {
    setLoading(true);
    try {
      await listaService.toggleAtivo(lista.id);
      setSuccess(
        `Lista ${lista.ativo ? 'desativada' : 'ativada'} com sucesso!`
      );
      loadListas();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao atualizar status');
    } finally {
      setLoading(false);
    }
  };

  // Colunas da tabela
  const columns: Column<Lista>[] = [
    {
      key: 'valor',
      label: 'Valor',
      sortable: true,
      render: (lista) => (
        <span className="font-medium text-[var(--text-primary)]">
          {lista.valor}
        </span>
      ),
    },
    {
      key: 'ativo',
      label: 'Status',
      render: (lista) => (
        <Badge variant={lista.ativo ? 'success' : 'default'} dot>
          {lista.ativo ? 'Ativo' : 'Inativo'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Criado em',
      render: (lista) => (
        <span className="text-sm text-[var(--text-secondary)]">
          {formatDate(lista.createdAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (lista) => (
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              handleOpenModal(lista);
            }}
            className="p-2 text-blue-600 hover:bg-blue-50  rounded-lg transition-colors"
            title="Editar"
          >
            <Edit2 className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              handleToggleAtivo(lista);
            }}
            className={`p-2 rounded-lg transition-colors ${
              lista.ativo
                ? 'text-yellow-600 hover:bg-yellow-50 '
                : 'text-green-600 hover:bg-green-50 '
            }`}
            title={lista.ativo ? 'Desativar' : 'Ativar'}
          >
            <Power className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(lista);
            }}
            className="p-2 text-red-600 hover:bg-red-50  rounded-lg transition-colors"
            title="Excluir"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>
      ),
    },
  ];

  const currentTipo = TIPOS.find((t) => t.value === activeTab);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br ${currentTipo?.gradient} rounded-full opacity-20 animate-float`}></div>
        <div className={`absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr ${currentTipo?.gradient} rounded-full opacity-15 animate-float`} style={{ animationDelay: '2s' }}></div>
        <div className={`absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-br ${currentTipo?.gradient} rounded-full opacity-10 animate-float`} style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between"
        >
          <div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Listas Auxiliares
            </h2>
            <p className="text-[var(--text-secondary)] mt-2 text-lg">
              Gerencie contas, métodos, categorias e indicadores do sistema
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Button
              onClick={() => handleOpenModal()}
              leftIcon={<Plus className="w-5 h-5" />}
              className="shadow-lg shadow-blue-500/30"
            >
              Adicionar
            </Button>
          </motion.div>
        </motion.div>

        {/* Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Alert type="error" onClose={() => setError('')}>
                {error}
              </Alert>
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Alert type="success" onClose={() => setSuccess('')}>
                {success}
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative glass-effect rounded-2xl p-2 shadow-lg"
        >
          <div className="flex gap-2">
            {TIPOS.map((tipo, index) => (
              <motion.button
                key={tipo.value}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setActiveTab(tipo.value)}
                className={`relative flex-1 px-6 py-3 font-semibold rounded-xl transition-all duration-300 ${
                  activeTab === tipo.value
                    ? 'text-white shadow-lg'
                    : 'text-[var(--text-secondary)] hover:bg-white/50 '
                }`}
              >
                {activeTab === tipo.value && (
                  <motion.div
                    layoutId="activeTab"
                    className={`absolute inset-0 bg-gradient-to-r ${tipo.gradient} rounded-xl`}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tipo.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass-effect rounded-2xl p-6 shadow-xl"
        >
          <Table
            columns={columns}
            data={listas}
            loading={loading}
            emptyMessage={`Nenhuma ${currentTipo?.label.toLowerCase()} cadastrada`}
          />
        </motion.div>
      </div>

      {/* Modal Criar/Editar */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingLista ? 'Editar Lista' : 'Nova Lista'}
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setShowModal(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} loading={loading}>
              Salvar
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <FormInput
            label="Valor"
            value={formValue}
            onChange={(e) => setFormValue(e.target.value)}
            placeholder={`Digite o nome da ${TIPOS.find((t) => t.value === activeTab)?.label.toLowerCase()}`}
            required
            autoFocus
            disabled={loading}
          />
        </div>
      </Modal>
    </div>
  );
};

export default Listas;
