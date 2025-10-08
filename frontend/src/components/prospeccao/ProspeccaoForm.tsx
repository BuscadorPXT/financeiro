import React, { useState, useEffect } from 'react';
import type { Prospeccao } from '../../services/prospeccaoService';
import Modal from '../common/Modal';
import FormInput from '../common/FormInput';
import Button from '../common/Button';
import { validateEmail, validatePhone } from '../../utils/validators';

interface ProspeccaoFormProps {
  prospeccao: Prospeccao | null;
  indicadores: string[];
  onSave: (data: any) => void;
  onClose: () => void;
}

const ProspeccaoForm: React.FC<ProspeccaoFormProps> = ({
  prospeccao,
  indicadores,
  onSave,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    email: '',
    nome: '',
    telefone: '',
    origem: '',
    indicador: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (prospeccao) {
      setFormData({
        email: prospeccao.email || '',
        nome: prospeccao.nome || '',
        telefone: prospeccao.telefone || '',
        origem: prospeccao.origem || '',
        indicador: prospeccao.indicador || '',
      });
    }
  }, [prospeccao]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpar erro ao digitar
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (formData.telefone && !validatePhone(formData.telefone)) {
      newErrors.telefone = 'Telefone inválido (use apenas números, 10 ou 11 dígitos)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    // Remover campos vazios opcionais
    const dataToSave: any = {
      email: formData.email.trim(),
      nome: formData.nome.trim(),
    };

    if (formData.telefone.trim()) {
      dataToSave.telefone = formData.telefone.trim();
    }

    if (formData.origem.trim()) {
      dataToSave.origem = formData.origem.trim();
    }

    if (formData.indicador) {
      dataToSave.indicador = formData.indicador;
    }

    onSave(dataToSave);
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={prospeccao ? 'Editar Lead' : 'Novo Lead'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          error={errors.email}
          required
        />

        <FormInput
          label="Nome Completo"
          type="text"
          value={formData.nome}
          onChange={(e) => handleChange('nome', e.target.value)}
          error={errors.nome}
          required
        />

        <FormInput
          label="Telefone"
          type="tel"
          value={formData.telefone}
          onChange={(e) => handleChange('telefone', e.target.value)}
          error={errors.telefone}
          placeholder="(11) 98765-4321"
        />

        <FormInput
          label="Origem"
          type="text"
          value={formData.origem}
          onChange={(e) => handleChange('origem', e.target.value)}
          placeholder="Ex: Instagram, Facebook, Indicação..."
        />

        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
            Indicador
          </label>
          <select
            value={formData.indicador}
            onChange={(e) => handleChange('indicador', e.target.value)}
            className="w-full px-3 py-2 border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecione um indicador</option>
            {indicadores.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            {prospeccao ? 'Atualizar' : 'Criar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ProspeccaoForm;
