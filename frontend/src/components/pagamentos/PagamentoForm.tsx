import React, { useState, useEffect } from 'react';
import type { Pagamento, CreatePagamentoDTO, UpdatePagamentoDTO } from '../../services/pagamentoService';
import { useUsuariosLegacy as useUsuarios } from '../../hooks/useUsuarios';
import { useListas } from '../../hooks/useListas';
import Modal from '../common/Modal';
import FormInput from '../common/FormInput';
import Select from '../common/Select';
import SearchableSelect from '../common/SearchableSelect';
import Button from '../common/Button';
import DatePicker from '../common/DatePicker';
import Checkbox from '../common/Checkbox';
import { validate } from '../../utils/validators';

interface PagamentoFormProps {
  pagamento: Pagamento | null;
  onClose: () => void;
  onSave: (data: CreatePagamentoDTO | UpdatePagamentoDTO) => Promise<void>;
}

const PagamentoForm: React.FC<PagamentoFormProps> = ({ pagamento, onClose, onSave }) => {
  const { usuarios } = useUsuarios();
  const { listas: metodos } = useListas('METODO');
  const { listas: contas } = useListas('CONTA');

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state
  const [formData, setFormData] = useState({
    usuarioId: '',
    dataPagto: new Date().toISOString().split('T')[0],
    valor: '',
    metodo: '' as 'PIX' | 'CREDITO' | 'DINHEIRO' | '',
    conta: '',
    regraTipo: 'RECORRENTE' as 'PRIMEIRO' | 'RECORRENTE',
    regraValor: '',
    elegivelComissao: true,
    observacao: '',
  });

  useEffect(() => {
    if (pagamento) {
      setFormData({
        usuarioId: pagamento.usuarioId,
        dataPagto: pagamento.dataPagto,
        valor: String(pagamento.valor),
        metodo: pagamento.metodo,
        conta: pagamento.conta,
        regraTipo: pagamento.regraTipo,
        regraValor: String(pagamento.regraValor),
        elegivelComissao: pagamento.elegivelComissao,
        observacao: pagamento.observacao || '',
      });
    }
  }, [pagamento]);

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

    // Usuário
    if (!formData.usuarioId || formData.usuarioId === '') {
      newErrors.usuarioId = 'Selecione um usuário';
    }

    // Data
    const dataError = validate(formData.dataPagto, ['required', 'dateValid']);
    if (dataError) newErrors.dataPagto = dataError;

    // Valor
    const valorError = validate(formData.valor, ['required', 'positiveNumber']);
    if (valorError) newErrors.valor = valorError;

    // Método
    if (!formData.metodo) newErrors.metodo = 'Campo obrigatório';

    // Conta
    if (!formData.conta) newErrors.conta = 'Campo obrigatório';

    // Regra valor
    const regraValorError = validate(formData.regraValor, ['required', 'numeric']);
    if (regraValorError) newErrors.regraValor = regraValorError;

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
      const dataToSave: CreatePagamentoDTO | UpdatePagamentoDTO = {
        usuarioId: formData.usuarioId,
        dataPagto: formData.dataPagto,
        valor: parseFloat(formData.valor),
        metodo: formData.metodo as 'PIX' | 'CREDITO' | 'DINHEIRO',
        conta: formData.conta,
        regraTipo: formData.regraTipo,
        regraValor: parseFloat(formData.regraValor),
        elegivelComissao: formData.elegivelComissao,
        observacao: formData.observacao || undefined,
      };

      await onSave(dataToSave);
    } catch (error) {
      console.error('Erro ao salvar pagamento:', error);
      alert('Erro ao salvar pagamento. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={pagamento ? 'Editar Pagamento' : 'Novo Pagamento'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <SearchableSelect
          label="Usuário"
          value={formData.usuarioId}
          onChange={(value) => handleChange('usuarioId', value || '')}
          options={usuarios.map((u) => ({
            value: u.id,
            label: u.nomeCompleto,
            subtitle: u.emailLogin,
          }))}
          placeholder="Selecione um usuário..."
          searchPlaceholder="Buscar por nome ou email..."
          required
          error={errors.usuarioId}
        />

        <div className="grid grid-cols-2 gap-4">
          <DatePicker
            label="Data do Pagamento"
            value={formData.dataPagto}
            onChange={(value) => handleChange('dataPagto', value)}
            required
            error={errors.dataPagto}
          />

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
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Método de Pagamento"
            value={formData.metodo}
            onChange={(value) => handleChange('metodo', value)}
            options={[
              { value: '', label: 'Selecione...' },
              ...metodos.map((m) => ({ value: m.valor, label: m.valor })),
            ]}
            required
            error={errors.metodo}
          />

          <Select
            label="Conta"
            value={formData.conta}
            onChange={(value) => handleChange('conta', value)}
            options={[
              { value: '', label: 'Selecione...' },
              ...contas.map((c) => ({ value: c.valor, label: c.valor })),
            ]}
            required
            error={errors.conta}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Tipo de Regra"
            value={formData.regraTipo}
            onChange={(value) => handleChange('regraTipo', value)}
            options={[
              { value: 'PRIMEIRO', label: 'Primeiro Pagamento' },
              { value: 'RECORRENTE', label: 'Pagamento Recorrente' },
            ]}
            required
          />

          <FormInput
            label="Valor da Comissão"
            type="number"
            step="0.01"
            value={formData.regraValor}
            onChange={(e) => handleChange('regraValor', e.target.value)}
            required
            error={errors.regraValor}
            placeholder="0.00"
          />
        </div>

        <Checkbox
          label="Elegível para comissão"
          checked={formData.elegivelComissao}
          onChange={(checked) => handleChange('elegivelComissao', checked)}
        />

        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Observações</label>
          <textarea
            value={formData.observacao}
            onChange={(e) => handleChange('observacao', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-[var(--border-color)] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Observações sobre o pagamento..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : pagamento ? 'Atualizar' : 'Criar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default PagamentoForm;
