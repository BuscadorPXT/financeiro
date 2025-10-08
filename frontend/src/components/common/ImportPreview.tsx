import React, { useState, useMemo } from 'react';
import Modal from './Modal';
import Select from './Select';
import Button from './Button';

export interface CampoMapeamento {
  key: string;
  label: string;
  required?: boolean;
  type?: 'text' | 'number' | 'date' | 'boolean';
}

interface ImportPreviewProps {
  data: any[];
  campos: CampoMapeamento[];
  onConfirm: (dados: any[], mapeamento: Record<string, string>) => void | Promise<void>;
  onCancel: () => void;
  title?: string;
  previewRows?: number;
}

const ImportPreview: React.FC<ImportPreviewProps> = ({
  data,
  campos,
  onConfirm,
  onCancel,
  title = 'Preview de Importação',
  previewRows = 5,
}) => {
  // Colunas disponíveis no arquivo
  const colunasArquivo = useMemo(() => {
    if (data.length === 0) return [];
    return Object.keys(data[0]);
  }, [data]);

  // Estado do mapeamento: { campoDoBanco: colunaDoArquivo }
  const [mapeamento, setMapeamento] = useState<Record<string, string>>(() => {
    // Tenta mapear automaticamente por nome semelhante
    const autoMap: Record<string, string> = {};

    // Mapeamentos alternativos conhecidos
    const aliases: Record<string, string[]> = {
      emailLogin: ['email', 'e-mail', 'email_login', 'emaillogin'],
      nomeCompleto: ['nome', 'nome completo', 'nome_completo', 'nomecompleto'],
      telefone: ['telefone', 'tel', 'celular', 'phone'],
      indicador: ['indicador', 'indicado por', 'indicado_por'],
      obs: ['obs', 'observacao', 'observação', 'observacoes', 'observações', 'notas'],
    };

    campos.forEach((campo) => {
      // Tenta match exato primeiro
      let colunaEncontrada = colunasArquivo.find(
        (col) =>
          col.toLowerCase() === campo.key.toLowerCase() ||
          col.toLowerCase() === campo.label.toLowerCase() ||
          col.toLowerCase().replace(/[_\s-]/g, '') === campo.key.toLowerCase().replace(/[_\s-]/g, '')
      );

      // Se não encontrou, tenta pelos aliases
      if (!colunaEncontrada && aliases[campo.key]) {
        colunaEncontrada = colunasArquivo.find((col) =>
          aliases[campo.key].some(alias =>
            col.toLowerCase().replace(/[_\s-]/g, '') === alias.toLowerCase().replace(/[_\s-]/g, '')
          )
        );
      }

      if (colunaEncontrada) {
        autoMap[campo.key] = colunaEncontrada;
      }
    });
    return autoMap;
  });

  const [isProcessing, setIsProcessing] = useState(false);

  // Verifica se todos os campos obrigatórios estão mapeados
  const camposFaltantes = useMemo(() => {
    return campos.filter((campo) => campo.required && !mapeamento[campo.key]);
  }, [campos, mapeamento]);

  const handleMapeamentoChange = (campoBanco: string, colunaArquivo: string) => {
    setMapeamento((prev) => ({
      ...prev,
      [campoBanco]: colunaArquivo,
    }));
  };

  const handleConfirm = async () => {
    if (camposFaltantes.length > 0) {
      alert('Por favor, mapeie todos os campos obrigatórios marcados com *');
      return;
    }

    setIsProcessing(true);
    try {
      await onConfirm(data, mapeamento);
    } finally {
      setIsProcessing(false);
    }
  };

  // Dados de preview com mapeamento aplicado
  const previewData = useMemo(() => {
    return data.slice(0, previewRows).map((row, idx) => {
      const mapped: any = { _rowIndex: idx };
      Object.entries(mapeamento).forEach(([campoBanco, colunaArquivo]) => {
        mapped[campoBanco] = row[colunaArquivo];
      });
      return mapped;
    });
  }, [data, mapeamento, previewRows]);

  // Conta registros problemáticos (sem campos obrigatórios)
  const registrosProblematicos = useMemo(() => {
    return data.filter((row) => {
      return campos
        .filter(c => c.required)
        .some(campo => {
          const colunaArquivo = mapeamento[campo.key];
          return !colunaArquivo || !row[colunaArquivo];
        });
    }).length;
  }, [data, campos, mapeamento]);

  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      title={title}
      size="xl"
    >
      <div className="space-y-6">
        {/* Informações do arquivo */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Informações do Arquivo</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-700">Total de linhas:</span>{' '}
              <span className="font-semibold">{data.length}</span>
            </div>
            <div>
              <span className="text-blue-700">Colunas encontradas:</span>{' '}
              <span className="font-semibold">{colunasArquivo.length}</span>
            </div>
          </div>
        </div>

        {/* Mapeamento de colunas */}
        <div>
          <h3 className="font-semibold text-[var(--text-primary)] mb-3">
            Mapeamento de Colunas
            <span className="text-sm text-[var(--text-secondary)] ml-2 font-normal">
              (* campos obrigatórios)
            </span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campos.map((campo) => (
              <div key={campo.key} className="flex items-center gap-3">
                <label className="w-40 text-sm font-medium text-[var(--text-primary)]">
                  {campo.label}
                  {campo.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <Select
                  value={mapeamento[campo.key] || ''}
                  onChange={(value) => handleMapeamentoChange(campo.key, value)}
                  options={[
                    { value: '', label: '-- Não mapear --' },
                    ...colunasArquivo.map((col) => ({ value: col, label: col })),
                  ]}
                  className="flex-1"
                />
              </div>
            ))}
          </div>

          {camposFaltantes.length > 0 && (
            <div className="mt-3 text-sm text-red-600">
              <strong>Atenção:</strong> Os seguintes campos obrigatórios não estão mapeados:{' '}
              {camposFaltantes.map((c) => c.label).join(', ')}
            </div>
          )}

          {registrosProblematicos > 0 && camposFaltantes.length === 0 && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-300 rounded-md text-sm text-yellow-800">
              <strong>⚠️ Aviso:</strong> {registrosProblematicos} registro(s) não possuem valores para campos obrigatórios
              e serão rejeitados na importação. Verifique se há linhas vazias no arquivo.
            </div>
          )}
        </div>

        {/* Preview dos dados */}
        <div>
          <h3 className="font-semibold text-[var(--text-primary)] mb-3">
            Preview ({Math.min(previewRows, data.length)} primeiras linhas)
          </h3>
          <div className="overflow-x-auto border border-[var(--border-color)] rounded-md">
            <table className="min-w-full divide-y divide-[var(--border-color)] text-sm">
              <thead className="bg-[var(--bg-secondary)]">
                <tr>
                  {campos
                    .filter((campo) => mapeamento[campo.key])
                    .map((campo) => (
                      <th
                        key={campo.key}
                        className="px-4 py-2 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider"
                      >
                        {campo.label}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody className="bg-[var(--bg-primary)] divide-y divide-[var(--border-color)]">
                {previewData.map((row, idx) => {
                  // Verifica se a linha tem problema (campo obrigatório vazio)
                  const temProblema = campos
                    .filter(c => c.required && mapeamento[c.key])
                    .some(campo => !row[campo.key]);

                  return (
                    <tr
                      key={idx}
                      className={`hover:bg-[var(--bg-secondary)] ${temProblema ? 'bg-red-50' : ''}`}
                    >
                      {campos
                        .filter((campo) => mapeamento[campo.key])
                        .map((campo) => {
                          const valor = row[campo.key];
                          const vazio = valor === null || valor === undefined || valor === '';
                          const obrigatorio = campo.required;

                          return (
                            <td
                              key={campo.key}
                              className={`px-4 py-2 whitespace-nowrap ${
                                vazio && obrigatorio ? 'bg-red-100 text-red-700 font-semibold' : ''
                              }`}
                            >
                              {!vazio ? String(valor) : (obrigatorio ? '⚠️ VAZIO' : '-')}
                            </td>
                          );
                        })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ações */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="secondary" onClick={onCancel} disabled={isProcessing}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={isProcessing || camposFaltantes.length > 0}>
            {isProcessing ? 'Importando...' : `Importar ${data.length} registro(s)`}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ImportPreview;
