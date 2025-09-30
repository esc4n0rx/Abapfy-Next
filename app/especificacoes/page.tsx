// app/especificacoes/page.tsx
'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Toolbar } from '@/components/layout/Toolbar';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/Modal';
import { Sparkles, Zap, Plus } from 'lucide-react';
import { useProviders } from '@/hooks/useProviders';
import { CreateSpecificationFlow } from '@/components/specifications/CreateSpecificationFlow';
import { RecentSpecifications } from '@/components/specifications/RecentSpecifications';

const QUICK_ACTIONS = [
  {
    id: 'relatorio-alv',
    title: 'Relatório ALV Gerencial',
    description: 'Especificação de relatórios complexos com filtros e exportações.',
    icon: '📊',
    color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
  },
  {
    id: 'integracao-idoc',
    title: 'Integração IDoc',
    description: 'Documentação completa para integrações SAP ↔️ sistemas externos.',
    icon: '🔄',
    color: 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100',
  },
  {
    id: 'workflow-fiori',
    title: 'Workflow com Fiori',
    description: 'Workflow de aprovação com interface responsiva e notificações.',
    icon: '🧩',
    color: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
  },
  {
    id: 'livre',
    title: 'Documento Personalizado',
    description: 'Crie a especificação do zero com contexto completo.',
    icon: '🧠',
    color: 'bg-amber-50 border-amber-200 hover:bg-amber-100',
  },
];

export default function EspecificacoesPage() {
  const { providers } = useProviders();
  const [showModal, setShowModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);

  const availableProviders = providers.filter(provider => provider.isEnabled && provider.apiKey);
  const hasActiveProvider = availableProviders.length > 0;

  const handleQuickAction = (templateId: string) => {
    if (!hasActiveProvider) return;
    setSelectedTemplate(templateId === 'livre' ? undefined : templateId);
    setShowModal(true);
  };

  const handleSpecificationCreated = () => {
    setRefreshKey(prev => prev + 1);
    setShowModal(false);
  };

  const toolbarActions = (
    <Button onClick={() => { setSelectedTemplate(undefined); setShowModal(true); }} disabled={!hasActiveProvider}>
      <Plus className="w-4 h-4 mr-2" />
      Nova Especificação
    </Button>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Toolbar
        title="Gerador de Especificações"
        breadcrumb={[{ label: 'Home', href: '/dashboard' }, { label: 'Especificações' }]}
        actions={toolbarActions}
      />

      <div className="container mx-auto px-6 py-8 space-y-8">
        {!hasActiveProvider ? (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <Zap className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-amber-900">Configure um Provider de IA</h3>
                  <p className="text-sm text-amber-700">
                    Para gerar especificações completas, configure pelo menos um provider de IA nas configurações.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-emerald-200 bg-emerald-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-emerald-900">IA pronta para gerar documentos</h3>
                    <p className="text-sm text-emerald-700">
                      {availableProviders.length} provider{availableProviders.length > 1 ? 's' : ''} disponível{availableProviders.length > 1 ? 's' : ''}.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableProviders.map(provider => (
                    <Badge key={provider.type} variant="default" className="bg-emerald-100 text-emerald-800">
                      {provider.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Criação Rápida</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {QUICK_ACTIONS.map(action => (
              <Card
                key={action.id}
                className={`cursor-pointer border-2 transition-all duration-200 hover:shadow-md ${action.color} ${!hasActiveProvider ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => handleQuickAction(action.id)}
              >
                <CardContent className="p-6 text-center space-y-3">
                  <div className="text-3xl">{action.icon}</div>
                  <h3 className="font-semibold text-gray-900">{action.title}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Especificações Recentes</h2>
            <Button variant="secondary" size="sm" onClick={() => { setSelectedTemplate(undefined); setShowModal(true); }} disabled={!hasActiveProvider}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Nova
            </Button>
          </div>
          <RecentSpecifications refreshKey={refreshKey} />
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setSelectedTemplate(undefined); }}
        title="Nova Especificação"
        size="3xl"
      >
        <CreateSpecificationFlow
          onClose={() => { setShowModal(false); setSelectedTemplate(undefined); }}
          onSpecificationCreated={handleSpecificationCreated}
          initialTemplate={selectedTemplate}
        />
      </Modal>
    </div>
  );
}
