import React, { useState } from 'react';
import type { Usuario } from '../../services/usuarioService';
import type { CreatePagamentoDTO } from '../../services/pagamentoService';
import { usePagamentosLegacy as usePagamentos } from '../../hooks/usePagamentos';
import { useListas } from '../../hooks/useListas';
import Modal from '../common/Modal';
import FormInput from '../common/FormInput';
import Select from '../common/Select';
import Button from '../common/Button';
import DatePicker from '../common/DatePicker';
import { validate } from '../../utils/validators';

interface PagamentoRapidoModalProps {
  usuario: Usuario;
  onClose: () => void;
  onSuccess: () => void;
}

const PagamentoRapidoModal: React.FC<PagamentoRapidoModalProps> = ({
  usuario,
  onClose,
  onSuccess,
}) => {
  const { create } = usePagamentos();
  const { listas: metodos } = useListas('METODO');
  const { listas: contas } = useListas('CONTA');

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state
  const [formData, setFormData] = useState({
    dataPagto: new Date().toISOString().split('T')[0],
    valor: '',
    metodo: (usuario.metodo || '') as 'PIX' | 'CREDITO' | 'DINHEIRO',
    conta: usuario.conta || '',
    regraTipo: (usuario.ciclo === 0 ? 'PRIMEIRO' : 'RECORRENTE') as 'PRIMEIRO' | 'RECORRENTE',
    regraValor: '',
    elegivelComissao: true,
    observacao: '',
  });

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
      const pagamentoData: CreatePagamentoDTO = {
        usuarioId: usuario.id,
        dataPagto: formData.dataPagto,
        valor: parseFloat(formData.valor),
        metodo: formData.metodo,
        conta: formData.conta,
        regraTipo: formData.regraTipo,
        regraValor: parseFloat(formData.regraValor),
        elegivelComissao: formData.elegivelComissao,
        observacao: formData.observacao || undefined,
      };

      await create(pagamentoData);
      alert('Pagamento registrado com sucesso!');
      onSuccess();
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
      alert('Erro ao registrar pagamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Pagamento Rápido - ${usuario.nomeCompleto}`}
      size="lg"
    >
      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-[var(--text-primary)]">
          <strong>Email:</strong> {usuario.emailLogin}
        </p>
        <p className="text-sm text-[var(--text-primary)]">
          <strong>Ciclo Atual:</strong> {usuario.ciclo}
        </p>
        <p className="text-sm text-[var(--text-primary)]">
          <strong>Status:</strong> {usuario.statusFinal}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="elegivelComissao"
            checked={formData.elegivelComissao}
            onChange={(e) => handleChange('elegivelComissao', e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <label htmlFor="elegivelComissao" className="text-sm text-[var(--text-primary)]">
            Elegível para comissão
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
            Observações
          </label>
          <textarea
            value={formData.observacao}
            onChange={(e) => handleChange('observacao', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-[var(--border-color)] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Observações sobre o pagamento..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrar Pagamento'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default PagamentoRapidoModal;
