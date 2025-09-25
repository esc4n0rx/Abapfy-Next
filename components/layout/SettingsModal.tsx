'use client';

import { Modal } from '@/components/ui/Modal';
import { Tabs } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { ProvidersTab } from '@/components/settings/ProvidersTab';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SystemSettingsTab = () => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-semibold text-gray-900">Ajustes do Sistema</h3>
      <p className="text-sm text-gray-600 mt-1">
        Configurações gerais da aplicação
      </p>
    </div>
    
    <div className="bg-gray-50 rounded-lg p-6">
      <p className="text-center text-gray-600">
        Configurações do sistema em desenvolvimento...
      </p>
    </div>
  </div>
);

const ProfileSettingsTab = () => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-semibold text-gray-900">Ajustes de Perfil</h3>
      <p className="text-sm text-gray-600 mt-1">
        Configurações da sua conta e perfil
      </p>
    </div>
    
    <div className="bg-gray-50 rounded-lg p-6">
      <p className="text-center text-gray-600">
        Configurações de perfil em desenvolvimento...
      </p>
    </div>
  </div>
);

const tabs = [
  { 
    id: 'providers', 
    label: 'Provedores de IA', 
    content: <ProvidersTab /> 
  },
  { 
    id: 'system', 
    label: 'Sistema', 
    content: <SystemSettingsTab /> 
  },
  { 
    id: 'profile', 
    label: 'Perfil', 
    content: <ProfileSettingsTab /> 
  },
];

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configurações"
      size="xl"
      footer={
        <Button onClick={onClose}>Fechar</Button>
      }
    >
      <Tabs tabs={tabs} defaultTab="providers" />
    </Modal>
  );
}