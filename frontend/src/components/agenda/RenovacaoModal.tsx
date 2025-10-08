import React, { useState } from 'react';
import type { Agenda } from '../../services/agendaService';
import type { Usuario } from '../../services/usuarioService';
import { useListas } from '../../hooks/useListas';
import Modal from '../common/Modal';
import FormInput from '../common/FormInput';
import Select from '../common/Select';
import Button from '../common/Button';
import DatePicker from '../common/DatePicker';
import { validate } from '../../utils/validators';
import agendaService from '../../services/agendaService';

interface RenovacaoModalProps {
  item: Agenda;
  usuario?: Usuario;
  onClose: () => void;
  onSuccess: () => void;
}

const RenovacaoModal: React.FC<RenovacaoModalProps> = ({
  item,
  usuario,
  onClose,
  onSuccess,
}) => {
  const { listas: metodos } = useListas('METODO');
  const { listas: contas } = useListas('CONTA');

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Valores padrão do último pagamento do usuário
  const [formData, setFormData] = useState({
    dataPagto: new Date().toISOString().split('T')[0],
    valor: '',
    metodo: (usuario?.metodo || '') as 'PIX' | 'CREDITO' | 'DINHEIRO',
    conta: usuario?.conta || '',
    regraValor: usuario?.regraValor ? String(usuario.regraValor) : '',
    observacao: `Renovação - Ciclo ${item.ciclo + 1}`,
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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

    const dataError = validate(formData.dataPagto, ['required', 'dateValid']);
    if (dataError) newErrors.dataPagto = dataError;

    const valorError = validate(formData.valor, ['required', 'positiveNumber']);
    if (valorError) newErrors.valor = valorError;

    if (!formData.metodo) newErrors.metodo = 'Campo obrigatório';
    if (!formData.conta) newErrors.conta = 'Campo obrigatório';

    if (formData.regraValor) {
      const regraValorError = validate(formData.regraValor, ['numeric']);
      if (regraValorError) newErrors.regraValor = regraValorError;
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
      const renovacaoData = {
        dataPagto: formData.dataPagto,
        valor: parseFloat(formData.valor),
        metodo: formData.metodo,
        conta: formData.conta,
        regraValor: formData.regraValor ? parseFloat(formData.regraValor) : undefined,
        observacao: formData.observacao || undefined,
      };

      await agendaService.marcarRenovou(item.id, renovacaoData);
      alert('Renovação registrada com sucesso!');
      onSuccess();
    } catch (error: any) {
      console.error('Erro ao registrar renovação:', error);
      const message = error?.response?.data?.message || error?.message || 'Erro ao registrar renovação';
      alert(`Erro: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const usuarioNome = usuario?.nomeCompleto || 'Usuário';
  const usuarioEmail = usuario?.emailLogin || '';

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Renovar Assinatura - ${usuarioNome}`}
      size="lg"
    >
      <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
        <p className="text-sm text-gray-700">
          <strong>Email:</strong> {usuarioEmail}
        </p>
        <p className="text-sm text-gray-700">
          <strong>Ciclo Atual:</strong> {item.ciclo} → <strong className="text-green-600">{item.ciclo + 1}</strong>
        </p>
        <p className="text-sm text-gray-700">
          <strong>Vencimento:</strong> {new Date(item.dataVenc).toLocaleDateString('pt-BR')}
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

        <FormInput
          label="Valor da Comissão (opcional)"
          type="number"
          step="0.01"
          value={formData.regraValor}
          onChange={(e) => handleChange('regraValor', e.target.value)}
          error={errors.regraValor}
          placeholder="0.00"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Observações
          </label>
          <textarea
            value={formData.observacao}
            onChange={(e) => handleChange('observacao', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Observações sobre a renovação..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Processando...' : '✓ Confirmar Renovação'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default RenovacaoModal;
