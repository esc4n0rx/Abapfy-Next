// app/modulos/page.tsx
'use client';

import { useState } from 'react';
import { Plus, Sparkles, Code, Zap } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Toolbar } from '@/components/layout/Toolbar';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { CreateModuleFlow } from '@/components/modules/CreateModuleFlow';
import { RecentModules } from '@/components/modules/RecentModules';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useProviders } from '@/hooks/useProviders';

const QUICK_ACTIONS = [
  {
    id: 'function_module',
    title: 'Módulo de Função',
    description: 'Criar um módulo de função reutilizável',
    icon: '⚙️',
    color: 'bg-blue-50 border-blue-200 hover:bg-blue-100'
  },
  {
    id: 'class_method',
    title: 'Método de Classe',
    description: 'Gerar método para classe ABAP',
    icon: '🏗️',
    color: 'bg-green-50 border-green-200 hover:bg-green-100'
  },
  {
    id: 'report',
    title: 'Programa Report',
    description: 'Programa ABAP executável completo',
    icon: '📊',
    color: 'bg-purple-50 border-purple-200 hover:bg-purple-100'
  },
  {
    id: 'cds_view',
    title: 'CDS View',
    description: 'Core Data Services View',
    icon: '👁️',
    color: 'bg-orange-50 border-orange-200 hover:bg-orange-100'
  }
];

export default function ModulosPage() {
  const { providers } = useProviders();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedQuickAction, setSelectedQuickAction] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const availableProviders = providers.filter(p => p.isEnabled && p.apiKey);
  const hasActiveProvider = availableProviders.length > 0;

  const handleQuickAction = (actionId: string) => {
    setSelectedQuickAction(actionId);
    setShowCreateModal(true);
  };

  const handleModuleCreated = () => {
    setRefreshKey(prev => prev + 1);
    setShowCreateModal(false);
  };

  const toolbarActions = (
    <>
      <Button 
        onClick={() => setShowCreateModal(true)}
        disabled={!hasActiveProvider}
      >
        <Plus className="w-4 h-4 mr-2" />
        Criar Módulo
      </Button>
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Toolbar 
        title="Gerador de Módulos ABAP"
        breadcrumb={[{label: 'Home', href: '/dashboard'}, {label: 'Módulos'}]}
        actions={toolbarActions}
      />
      
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* AI Status */}
        {!hasActiveProvider && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <Zap className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-amber-900">
                    Configure um Provider de IA
                  </h3>
                  <p className="text-sm text-amber-700">
                    Para usar o gerador de módulos ABAP, configure pelo menos um provider de IA nas configurações.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {hasActiveProvider && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-900">
                      IA Pronta para Gerar Código
                    </h3>
                    <p className="text-sm text-green-700">
                      {availableProviders.length} provider{availableProviders.length > 1 ? 's' : ''} de IA configurado{availableProviders.length > 1 ? 's' : ''} e disponível{availableProviders.length > 1 ? 'is' : ''}.
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {availableProviders.map(provider => (
                    <Badge key={provider.type} variant="default" className="bg-green-100 text-green-800">
                      {provider.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Criação Rápida</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {QUICK_ACTIONS.map((action) => (
              <Card 
                key={action.id}
                className={`cursor-pointer border-2 transition-all duration-200 hover:shadow-md ${action.color} ${!hasActiveProvider ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => hasActiveProvider && handleQuickAction(action.id)}
              >
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-3">{action.icon}</div>
                  <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Modules */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Módulos Recentes</h2>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => setShowCreateModal(true)}
              disabled={!hasActiveProvider}
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Novo
            </Button>
          </div>
          <RecentModules key={refreshKey} />
        </div>
      </div>

      {/* Create Module Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedQuickAction('');
        }}
        title="Criar Módulo ABAP"
        size="2xl"
      >
        <CreateModuleFlow
          onClose={() => {
            setShowCreateModal(false);
            setSelectedQuickAction('');
          }}
          onModuleCreated={handleModuleCreated}
        />
      </Modal>
    </div>
  );
}