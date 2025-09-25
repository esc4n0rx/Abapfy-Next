// app/programas/page.tsx
'use client';

import { useState } from 'react';
import { Plus, Sparkles, Code, Zap, FileText, Upload } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Toolbar } from '@/components/layout/Toolbar';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { CreateProgramFlow } from '@/components/programs/CreateProgramFlow';
import { RecentPrograms } from '@/components/programs/RecentPrograms';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useProviders } from '@/hooks/useProviders';

const QUICK_ACTIONS = [
  {
    id: 'report',
    title: 'Report Program',
    description: 'Relatório com tela de seleção e ALV',
    icon: '📊',
    color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
    complexity: 'medium'
  },
  {
    id: 'executable_program',
    title: 'Programa Executável',
    description: 'Job ou processamento batch',
    icon: '⚡',
    color: 'bg-green-50 border-green-200 hover:bg-green-100',
    complexity: 'medium'
  },
  {
    id: 'module_pool',
    title: 'Module Pool',
    description: 'Interface com múltiplas telas',
    icon: '🖥️',
    color: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
    complexity: 'high'
  },
  {
    id: 'transaction_program',
    title: 'Programa Transacional',
    description: 'Transação completa com workflow',
    icon: '🔄',
    color: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
    complexity: 'very_high'
  }
];

export default function ProgramasPage() {
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

  const handleProgramCreated = () => {
    setRefreshKey(prev => prev + 1);
    setShowCreateModal(false);
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'very_high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplexityLabel = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'Simples';
      case 'medium': return 'Médio';
      case 'high': return 'Avançado';
      case 'very_high': return 'Expert';
      default: return 'Padrão';
    }
  };

  const toolbarActions = (
    <>
      <Button 
        onClick={() => setShowCreateModal(true)}
        disabled={!hasActiveProvider}
      >
        <Plus className="w-4 h-4 mr-2" />
        Criar Programa
      </Button>
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Toolbar 
        title="Gerador de Programas ABAP"
        breadcrumb={[{label: 'Home', href: '/dashboard'}, {label: 'Programas'}]}
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
                    Para usar o gerador de programas ABAP, configure pelo menos um provider de IA nas configurações.
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
                      IA Pronta para Gerar Programas
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
                  <p className="text-sm text-gray-600 mb-3">{action.description}</p>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getComplexityColor(action.complexity)}`}
                  >
                    {getComplexityLabel(action.complexity)}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Programs */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Programas Recentes</h2>
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
          <RecentPrograms key={refreshKey} />
        </div>
      </div>

      {/* Create Program Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedQuickAction('');
        }}
        title="Criar Programa ABAP"
        size="2xl"
      >
        <CreateProgramFlow
          onClose={() => {
            setShowCreateModal(false);
            setSelectedQuickAction('');
          }}
          onProgramCreated={handleProgramCreated}
          initialType={selectedQuickAction}
        />
      </Modal>
    </div>
  );
}