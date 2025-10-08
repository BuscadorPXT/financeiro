import React, { useState } from 'react';
import { Usuario } from '../../services/usuarioService';
import { CreatePagamentoDTO } from '../../services/pagamentoService';
import { usePagamentos } from '../../hooks/usePagamentos';
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
    data_pagto: new Date().toISOString().split('T')[0],
    valor: '',
    metodo: (usuario.metodo || '') as 'PIX' | 'CREDITO' | 'DINHEIRO',
    conta: usuario.conta || '',
    regra_tipo: (usuario.ciclo === 0 ? 'PRIMEIRO' : 'RECORRENTE') as 'PRIMEIRO' | 'RECORRENTE',
    regra_valor: '',
    elegivel_comissao: true,
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
    const dataError = validate(formData.data_pagto, ['required', 'dateValid']);
    if (dataError) newErrors.data_pagto = dataError;

    // Valor
    const valorError = validate(formData.valor, ['required', 'positiveNumber']);
    if (valorError) newErrors.valor = valorError;

    // Método
    if (!formData.metodo) newErrors.metodo = 'Campo obrigatório';

    // Conta
    if (!formData.conta) newErrors.conta = 'Campo obrigatório';

    // Regra valor
    const regraValorError = validate(formData.regra_valor, ['required', 'numeric']);
    if (regraValorError) newErrors.regra_valor = regraValorError;

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
        usuario_id: usuario.id,
        data_pagto: formData.data_pagto,
        valor: parseFloat(formData.valor),
        metodo: formData.metodo,
        conta: formData.conta,
        regra_tipo: formData.regra_tipo,
        regra_valor: parseFloat(formData.regra_valor),
        elegivel_comissao: formData.elegivel_comissao,
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
      title={`Pagamento Rápido - ${usuario.nome_completo}`}
      size="lg"
    >
      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-gray-700">
          <strong>Email:</strong> {usuario.email_login}
        </p>
        <p className="text-sm text-gray-700">
          <strong>Ciclo Atual:</strong> {usuario.ciclo}
        </p>
        <p className="text-sm text-gray-700">
          <strong>Status:</strong> {usuario.status_final}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <DatePicker
          label="Data do Pagamento"
          value={formData.data_pagto}
          onChange={(value) => handleChange('data_pagto', value)}
          required
          error={errors.data_pagto}
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
          value={formData.regra_tipo}
          onChange={(value) => handleChange('regra_tipo', value)}
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
          value={formData.regra_valor}
          onChange={(e) => handleChange('regra_valor', e.target.value)}
          required
          error={errors.regra_valor}
          placeholder="0.00"
        />

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="elegivel_comissao"
            checked={formData.elegivel_comissao}
            onChange={(e) => handleChange('elegivel_comissao', e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <label htmlFor="elegivel_comissao" className="text-sm text-gray-700">
            Elegível para comissão
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Observações
          </label>
          <textarea
            value={formData.observacao}
            onChange={(e) => handleChange('observacao', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
