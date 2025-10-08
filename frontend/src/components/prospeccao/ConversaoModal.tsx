import React, { useState, useEffect } from 'react';
import type { Prospeccao } from '../../services/prospeccaoService';
import { useUsuarios } from '../../hooks/useUsuarios';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Alert from '../common/Alert';

interface ConversaoModalProps {
  prospeccao: Prospeccao;
  onConfirm: (usuarioId: string) => void;
  onClose: () => void;
}

const ConversaoModal: React.FC<ConversaoModalProps> = ({
  prospeccao,
  onConfirm,
  onClose,
}) => {
  const { usuarios, loading } = useUsuarios();
  const [selectedUsuarioId, setSelectedUsuarioId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Pré-selecionar usuário se houver match por email
  useEffect(() => {
    const matchedUsuario = usuarios.find(
      (u) => u.emailLogin.toLowerCase() === prospeccao.email.toLowerCase()
    );
    if (matchedUsuario) {
      setSelectedUsuarioId(matchedUsuario.id);
    }
  }, [usuarios, prospeccao.email]);

  const filteredUsuarios = usuarios.filter(
    (u) =>
      u.emailLogin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.nomeCompleto.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConfirm = () => {
    if (selectedUsuarioId) {
      onConfirm(selectedUsuarioId);
    }
  };

  const selectedUsuario = usuarios.find((u) => u.id === selectedUsuarioId);

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Converter Lead em Usuário"
      size="lg"
    >
      <div className="space-y-4">
        {/* Informações do Lead */}
        <div className="bg-blue-50 p-4 rounded-md">
          <h3 className="font-semibold text-blue-900 mb-2">Lead a ser convertido:</h3>
          <div className="text-sm text-blue-800">
            <p>
              <span className="font-medium">Nome:</span> {prospeccao.nome}
            </p>
            <p>
              <span className="font-medium">Email:</span> {prospeccao.email}
            </p>
            {prospeccao.telefone && (
              <p>
                <span className="font-medium">Telefone:</span> {prospeccao.telefone}
              </p>
            )}
            {prospeccao.origem && (
              <p>
                <span className="font-medium">Origem:</span> {prospeccao.origem}
              </p>
            )}
            {prospeccao.indicador && (
              <p>
                <span className="font-medium">Indicador:</span> {prospeccao.indicador}
              </p>
            )}
          </div>
        </div>

        <Alert type="info">
          Selecione o usuário para associar este lead. Se já existe um usuário com o mesmo email, ele será pré-selecionado.
        </Alert>

        {/* Busca de Usuário */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
            Buscar Usuário
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Digite email ou nome..."
            className="w-full px-3 py-2 border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Lista de Usuários */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            Selecione o Usuário
          </label>
          <div className="border border-[var(--border-color)] rounded-md max-h-64 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-[var(--text-secondary)]">Carregando usuários...</div>
            ) : filteredUsuarios.length === 0 ? (
              <div className="p-4 text-center text-[var(--text-secondary)]">
                Nenhum usuário encontrado
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredUsuarios.map((usuario) => (
                  <div
                    key={usuario.id}
                    onClick={() => setSelectedUsuarioId(usuario.id)}
                    className={`p-3 cursor-pointer hover:bg-[var(--bg-secondary)] ${
                      selectedUsuarioId === usuario.id
                        ? 'bg-blue-50 border-l-4 border-blue-500'
                        : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">
                          {usuario.nomeCompleto}
                        </p>
                        <p className="text-sm text-[var(--text-secondary)]">{usuario.emailLogin}</p>
                        {usuario.telefone && (
                          <p className="text-xs text-[var(--text-secondary)]">{usuario.telefone}</p>
                        )}
                      </div>
                      {selectedUsuarioId === usuario.id && (
                        <div className="text-blue-600">
                          <svg
                            className="w-6 h-6"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Resumo da Seleção */}
        {selectedUsuario && (
          <div className="bg-green-50 p-4 rounded-md">
            <h3 className="font-semibold text-green-900 mb-2">
              ✓ Usuário selecionado:
            </h3>
            <div className="text-sm text-green-800">
              <p>
                <span className="font-medium">Nome:</span> {selectedUsuario.nomeCompleto}
              </p>
              <p>
                <span className="font-medium">Email:</span> {selectedUsuario.emailLogin}
              </p>
            </div>
          </div>
        )}

        {/* Ações */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleConfirm}
            disabled={!selectedUsuarioId}
          >
            Confirmar Conversão
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConversaoModal;
