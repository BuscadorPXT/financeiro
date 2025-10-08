import React, { useState } from 'react';
import Modal from '../common/Modal';
import FileUpload from '../common/FileUpload';
import ImportPreview from '../common/ImportPreview';
import type { CampoMapeamento } from '../common/ImportPreview';
import Button from '../common/Button';
import { lerArquivo } from '../../utils/exportUtils';
import { importarUsuarios } from '../../services/usuarioService';

interface ImportarUsuariosModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const camposUsuario: CampoMapeamento[] = [
  { key: 'emailLogin', label: 'Email', required: true, type: 'text' },
  { key: 'nomeCompleto', label: 'Nome Completo', required: false, type: 'text' },
  { key: 'telefone', label: 'Telefone', required: false, type: 'text' },
  { key: 'indicador', label: 'Indicador', required: false, type: 'text' },
  { key: 'obs', label: 'Observações', required: false, type: 'text' },
];

const ImportarUsuariosModal: React.FC<ImportarUsuariosModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const [dadosImportacao, setDadosImportacao] = useState<any[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    try {
      setErro(null);
      const dados = await lerArquivo(file);

      if (dados.length === 0) {
        setErro('O arquivo está vazio');
        return;
      }

      setDadosImportacao(dados);
    } catch (error: any) {
      setErro(error.message || 'Erro ao ler arquivo');
    }
  };

  const handleConfirmImport = async (dados: any[], mapeamento: Record<string, string>) => {
    try {
      // Debug: mostra mapeamento e primeira linha de dados
      console.log('🔍 Mapeamento:', mapeamento);
      console.log('🔍 Colunas do arquivo:', dados.length > 0 ? Object.keys(dados[0]) : []);
      console.log('🔍 Primeira linha:', dados[0]);

      // Converte dados do arquivo para formato do backend usando o mapeamento
      const usuariosParaImportar = dados.map((linha) => {
        const usuario: any = {};
        Object.entries(mapeamento).forEach(([campoBanco, colunaArquivo]) => {
          if (colunaArquivo) {
            usuario[campoBanco] = linha[colunaArquivo];
          }
        });
        return usuario;
      });

      console.log('📤 Enviando para o backend:', usuariosParaImportar.slice(0, 2));

      // Verifica se há registros sem email
      const semEmail = usuariosParaImportar.filter(u => !u.emailLogin);
      if (semEmail.length > 0) {
        console.warn('⚠️ Encontrados', semEmail.length, 'registros sem email:', semEmail.slice(0, 5));
      }

      const result = await importarUsuarios(usuariosParaImportar);

      // Monta mensagem com detalhes
      let mensagem = `Importação concluída!\n\n` +
        `✓ ${result.success} usuários importados\n` +
        `- ${result.skipped} usuários ignorados (duplicados)\n` +
        `✗ ${result.errors} erros`;

      // Adiciona detalhes dos erros se houver
      if (result.errors > 0 && result.details) {
        const errosDetalhados = result.details
          .filter((d: any) => d.status === 'error')
          .slice(0, 10) // Mostra no máximo 10 erros
          .map((d: any) => `  • ${d.email}: ${d.message}`)
          .join('\n');

        mensagem += `\n\nDetalhes dos erros (primeiros 10):\n${errosDetalhados}`;

        if (result.errors > 10) {
          mensagem += `\n\n... e mais ${result.errors - 10} erros`;
        }
      }

      alert(mensagem);

      if (result.success > 0) {
        onSuccess();
      }

      onClose();
    } catch (error: any) {
      alert('Erro ao importar usuários: ' + (error.message || 'Erro desconhecido'));
    }
  };

  return (
    <>
      {!dadosImportacao ? (
        <Modal isOpen={true} onClose={onClose} title="Importar Usuários" size="md">
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Instruções</h3>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>O arquivo deve conter uma coluna com o email (obrigatório)</li>
                <li>Usuários duplicados (mesmo email) serão ignorados</li>
                <li>Formatos aceitos: CSV ou XLSX</li>
                <li>Use a primeira linha como cabeçalho</li>
              </ul>
            </div>

            {erro && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-800">{erro}</p>
              </div>
            )}

            <FileUpload onFileSelect={handleFileSelect} />

            <div className="flex justify-end pt-4 border-t">
              <Button variant="secondary" onClick={onClose}>
                Cancelar
              </Button>
            </div>
          </div>
        </Modal>
      ) : (
        <ImportPreview
          data={dadosImportacao}
          campos={camposUsuario}
          onConfirm={handleConfirmImport}
          onCancel={() => setDadosImportacao(null)}
          title="Preview de Importação de Usuários"
        />
      )}
    </>
  );
};

export default ImportarUsuariosModal;
