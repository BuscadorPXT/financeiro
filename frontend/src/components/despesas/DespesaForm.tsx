import React, { useState, useEffect } from 'react';
import type { Despesa, CreateDespesaDTO, UpdateDespesaDTO } from '../../services/despesaService';
import { useListas } from '../../hooks/useListas';
import Modal from '../common/Modal';
import FormInput from '../common/FormInput';
import Select from '../common/Select';
import Button from '../common/Button';
import { validate } from '../../utils/validators';

interface DespesaFormProps {
  despesa: Despesa | null;
  onClose: () => void;
  onSave: (data: CreateDespesaDTO | UpdateDespesaDTO) => Promise<void>;
}

const DespesaForm: React.FC<DespesaFormProps> = ({ despesa, onClose, onSave }) => {
  const { listas: categorias } = useListas('CATEGORIA');
  const { listas: contas } = useListas('CONTA');
  const { listas: indicadores } = useListas('INDICADOR');

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state
  const [formData, setFormData] = useState({
    categoria: '',
    descricao: '',
    conta: '',
    indicador: '',
    valor: '',
    status: 'PENDENTE' as 'PAGO' | 'PENDENTE',
    competenciaMes: new Date().getMonth() + 1,
    competenciaAno: new Date().getFullYear(),
  });

  useEffect(() => {
    if (despesa) {
      setFormData({
        categoria: despesa.categoria,
        descricao: despesa.descricao,
        conta: despesa.conta || '',
        indicador: despesa.indicador || '',
        valor: String(despesa.valor),
        status: despesa.status,
        competenciaMes: despesa.competenciaMes,
        competenciaAno: despesa.competenciaAno,
      });
    }
  }, [despesa]);

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

    // Categoria
    if (!formData.categoria) newErrors.categoria = 'Campo obrigatório';

    // Descrição
    const descricaoError = validate(formData.descricao, ['required']);
    if (descricaoError) newErrors.descricao = descricaoError;

    // Valor
    const valorError = validate(formData.valor, ['required', 'positiveNumber']);
    if (valorError) newErrors.valor = valorError;

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
      const dataToSave: CreateDespesaDTO | UpdateDespesaDTO = {
        categoria: formData.categoria,
        descricao: formData.descricao,
        conta: formData.conta || undefined,
        indicador: formData.indicador || undefined,
        valor: parseFloat(formData.valor),
        status: formData.status,
        competenciaMes: formData.competenciaMes,
        competenciaAno: formData.competenciaAno,
      };

      await onSave(dataToSave);
    } catch (error) {
      console.error('Erro ao salvar despesa:', error);
      alert('Erro ao salvar despesa. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={despesa ? 'Editar Despesa' : 'Nova Despesa'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Categoria"
          value={formData.categoria}
          onChange={(value) => handleChange('categoria', value)}
          options={[
            { value: '', label: 'Selecione uma categoria...' },
            ...categorias.map((c) => ({ value: c.valor, label: c.valor })),
          ]}
          required
          error={errors.categoria}
        />

        <FormInput
          label="Descrição"
          type="text"
          value={formData.descricao}
          onChange={(e) => handleChange('descricao', e.target.value)}
          required
          error={errors.descricao}
          placeholder="Descrição detalhada da despesa"
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Conta"
            value={formData.conta}
            onChange={(value) => handleChange('conta', value)}
            options={[
              { value: '', label: 'Selecione...' },
              ...contas.map((c) => ({ value: c.valor, label: c.valor })),
            ]}
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
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="Valor"
            type="number"
            step="0.01"
            value={formData.valor}
            onChange={(e) => handleChange('valor', e.target.value)}
            required
            error={errors.valor}
            placeholder="0.00"
          />

          <Select
            label="Status"
            value={formData.status}
            onChange={(value) => handleChange('status', value)}
            options={[
              { value: 'PENDENTE', label: 'Pendente' },
              { value: 'PAGO', label: 'Pago' },
            ]}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Mês de Competência"
            value={String(formData.competenciaMes)}
            onChange={(value) => handleChange('competenciaMes', Number(value))}
            options={[
              { value: '1', label: 'Janeiro' },
              { value: '2', label: 'Fevereiro' },
              { value: '3', label: 'Março' },
              { value: '4', label: 'Abril' },
              { value: '5', label: 'Maio' },
              { value: '6', label: 'Junho' },
              { value: '7', label: 'Julho' },
              { value: '8', label: 'Agosto' },
              { value: '9', label: 'Setembro' },
              { value: '10', label: 'Outubro' },
              { value: '11', label: 'Novembro' },
              { value: '12', label: 'Dezembro' },
            ]}
            required
          />

          <FormInput
            label="Ano de Competência"
            type="number"
            value={String(formData.competenciaAno)}
            onChange={(e) => handleChange('competenciaAno', Number(e.target.value))}
            required
            placeholder="2025"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : despesa ? 'Atualizar' : 'Criar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default DespesaForm;
