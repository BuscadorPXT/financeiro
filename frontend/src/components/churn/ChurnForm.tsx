import React, { useState } from 'react';
import type { Usuario } from '../../services/usuarioService';
import Modal from '../common/Modal';
import Button from '../common/Button';
import DatePicker from '../common/DatePicker';

interface ChurnFormProps {
  usuarios: Usuario[];
  onSave: (data: any) => void;
  onClose: () => void;
}

const ChurnForm: React.FC<ChurnFormProps> = ({ usuarios, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    usuarioId: '',
    dataChurn: new Date().toISOString().split('T')[0],
    motivo: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpar erro ao digitar
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.usuarioId) {
      newErrors.usuarioId = 'Usuário é obrigatório';
    }

    if (!formData.dataChurn) {
      newErrors.dataChurn = 'Data do churn é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const dataToSave: any = {
      usuarioId: formData.usuarioId,
      dataChurn: formData.dataChurn,
    };

    if (formData.motivo.trim()) {
      dataToSave.motivo = formData.motivo.trim();
    }

    onSave(dataToSave);
  };

  // Filtrar apenas usuários ativos
  const usuariosAtivos = usuarios.filter((u) => u.statusFinal === 'ATIVO');

  return (
    <Modal isOpen={true} onClose={onClose} title="Registrar Churn">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
            Usuário <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.usuarioId}
            onChange={(e) => handleChange('usuarioId', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.usuarioId ? 'border-red-500' : 'border-[var(--border-color)]'
            }`}
          >
            <option value="">Selecione um usuário</option>
            {usuariosAtivos.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nomeCompleto} ({u.emailLogin})
              </option>
            ))}
          </select>
          {errors.usuarioId && (
            <p className="mt-1 text-sm text-red-500">{errors.usuarioId}</p>
          )}
        </div>

        <DatePicker
          label="Data do Churn"
          value={formData.dataChurn}
          onChange={(value) => handleChange('dataChurn', value)}
          error={errors.dataChurn}
          required
        />

        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
            Motivo
          </label>
          <textarea
            value={formData.motivo}
            onChange={(e) => handleChange('motivo', e.target.value)}
            rows={3}
            placeholder="Descreva o motivo do cancelamento..."
            className="w-full px-3 py-2 border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="bg-yellow-50 p-3 rounded-md">
          <p className="text-sm text-yellow-800">
            ⚠️ Atenção: Ao registrar um churn, o usuário será marcado como inativo.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="danger">
            Registrar Churn
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ChurnForm;
