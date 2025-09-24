'use client';

import { Modal } from '@/components/ui/Modal';
import { Tabs } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AiProvidersTab = () => (
  <div>
    <h3 className="text-lg font-semibold">Provedores de IA</h3>
    <p className="text-subtle mt-2">Configure aqui seus provedores de IA.</p>
  </div>
);

const SystemSettingsTab = () => (
  <div>
    <h3 className="text-lg font-semibold">Ajustes do Sistema</h3>
    <p className="text-subtle mt-2">Ajustes gerais do sistema.</p>
  </div>
);

const ProfileSettingsTab = () => (
  <div>
    <h3 className="text-lg font-semibold">Ajustes de Perfil</h3>
    <p className="text-subtle mt-2">Ajustes do seu perfil de usuário.</p>
  </div>
);

const tabs = [
  { id: 'ai', label: 'Providers de IA', content: <AiProvidersTab /> },
  { id: 'system', label: 'Ajustes do Sistema', content: <SystemSettingsTab /> },
  { id: 'profile', label: 'Ajustes de Perfil', content: <ProfileSettingsTab /> },
];

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configurações"
      footer={
        <Button onClick={onClose}>Fechar</Button>
      }
    >
      <Tabs tabs={tabs} />
    </Modal>
  );
}
