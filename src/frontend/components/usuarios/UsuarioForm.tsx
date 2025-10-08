import React, { useState, useEffect } from 'react';
import { Usuario, CreateUsuarioDTO, UpdateUsuarioDTO } from '../../services/usuarioService';
import Modal from '../common/Modal';
import FormInput from '../common/FormInput';
import Select from '../common/Select';
import Button from '../common/Button';
import { validators, validate } from '../../utils/validators';
import { useListas } from '../../hooks/useListas';

interface UsuarioFormProps {
  usuario: Usuario | null;
  onClose: () => void;
  onSave: (data: CreateUsuarioDTO | UpdateUsuarioDTO) => Promise<void>;
}

const UsuarioForm: React.FC<UsuarioFormProps> = ({ usuario, onClose, onSave }) => {
  const { listas: indicadores } = useListas('INDICADOR');
  const { listas: metodos } = useListas('METODO');
  const { listas: contas } = useListas('CONTA');

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state
  const [formData, setFormData] = useState({
    email_login: '',
    nome_completo: '',
    telefone: '',
    indicador: '',
    metodo: '' as 'PIX' | 'CREDITO' | 'DINHEIRO' | '',
    conta: '',
    obs: '',
  });

  useEffect(() => {
    if (usuario) {
      setFormData({
        email_login: usuario.email_login,
        nome_completo: usuario.nome_completo,
        telefone: usuario.telefone || '',
        indicador: usuario.indicador || '',
        metodo: (usuario.metodo || '') as any,
        conta: usuario.conta || '',
        obs: usuario.obs || '',
      });
    }
  }, [usuario]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpar erro ao digitar
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Email
    const emailError = validate(formData.email_login, ['required', 'email']);
    if (emailError) newErrors.email_login = emailError;

    // Nome
    const nomeError = validate(formData.nome_completo, ['required']);
    if (nomeError) newErrors.nome_completo = nomeError;

    // Telefone (opcional, mas se preenchido deve ser válido)
    if (formData.telefone) {
      const telefoneError = validate(formData.telefone, ['telefone']);
      if (telefoneError) newErrors.telefone = telefoneError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const dataToSave: CreateUsuarioDTO | UpdateUsuarioDTO = {
        email_login: formData.email_login,
        nome_completo: formData.nome_completo,
        telefone: formData.telefone || undefined,
        indicador: formData.indicador || undefined,
        metodo: formData.metodo || undefined,
        conta: formData.conta || undefined,
        obs: formData.obs || undefined,
      };

      await onSave(dataToSave);
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      alert('Erro ao salvar usuário. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={usuario ? 'Editar Usuário' : 'Novo Usuário'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          label="Email"
          type="email"
          value={formData.email_login}
          onChange={(e) => handleChange('email_login', e.target.value)}
          required
          error={errors.email_login}
          placeholder="exemplo@email.com"
        />

        <FormInput
          label="Nome Completo"
          type="text"
          value={formData.nome_completo}
          onChange={(e) => handleChange('nome_completo', e.target.value)}
          required
          error={errors.nome_completo}
          placeholder="Nome completo do usuário"
        />

        <FormInput
          label="Telefone"
          type="tel"
          value={formData.telefone}
          onChange={(e) => handleChange('telefone', e.target.value)}
          error={errors.telefone}
          placeholder="(11) 99999-9999"
        />

        <Select
          label="Indicador"
          value={formData.indicador}
          onChange={(value) => handleChange('indicador', value)}
          options={[
            { value: '', label: 'Selecione...' },
            ...indicadores.map((i) => ({ value: i.valor, label: i.valor })),
          ]}
        />

        <Select
          label="Método de Pagamento"
          value={formData.metodo}
          onChange={(value) => handleChange('metodo', value)}
          options={[
            { value: '', label: 'Selecione...' },
            ...metodos.map((m) => ({ value: m.valor, label: m.valor })),
          ]}
        />

        <Select
          label="Conta"
          value={formData.conta}
          onChange={(value) => handleChange('conta', value)}
          options={[
            { value: '', label: 'Selecione...' },
            ...contas.map((c) => ({ value: c.valor, label: c.valor })),
          ]}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Observações
          </label>
          <textarea
            value={formData.obs}
            onChange={(e) => handleChange('obs', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Observações sobre o usuário..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : usuario ? 'Atualizar' : 'Criar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default UsuarioForm;
