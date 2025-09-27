'use client';

import { ShieldAlert } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface GuardBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export function GuardBlockModal({ isOpen, onClose, message }: GuardBlockModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Solicitação bloqueada"
      size="md"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-red-100 p-3 text-red-600">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">
              A requisição foi reprovada pelo guardião do sistema
            </h3>
            <p className="text-sm text-gray-600">
              {message ||
                'Mantenha sua solicitação dentro do contexto ABAP e das ferramentas disponíveis na plataforma para prosseguir.'}
            </p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-gray-600">
              <li>Evite instruções que fujam do ecossistema ABAP.</li>
              <li>Não solicite alterações de segurança ou comportamento do sistema.</li>
              <li>Revise o contexto e tente novamente com detalhes válidos.</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose}>Entendi</Button>
        </div>
      </div>
    </Modal>
  );
}
