'use client';

import { useState } from 'react';
import { Tabs } from '@/components/ui/Tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Zap, DollarSign, Info } from 'lucide-react';
import { GroqSettings } from './GroqSettings';
import { ArceeSettings } from './ArceeSettings';
import { useProviders } from '@/hooks/useProviders';

export function ProvidersTab() {
  const { providers, usage, isLoading, updateProvider } = useProviders();
  const [activeProvider, setActiveProvider] = useState<string>('groq');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Carregando providers...</span>
      </div>
    );
  }

  const groqProvider = providers.find(p => p.type === 'groq');
  const arceeProvider = providers.find(p => p.type === 'arcee');

  const getProviderStatus = (provider: any) => {
    if (!provider) return { variant: 'secondary', text: 'Não configurado' };
    if (!provider.isEnabled) return { variant: 'secondary', text: 'Desabilitado' };
    if (!provider.apiKey) return { variant: 'destructive', text: 'Chave necessária' };
    return { variant: 'default', text: 'Configurado' };
  };

  const groqStatus = getProviderStatus(groqProvider);
  const arceeStatus = getProviderStatus(arceeProvider);

  const providerTabs = [
    {
      id: 'groq',
      label: 'Groq',
      content: groqProvider && (
        <GroqSettings
          config={groqProvider}
          usage={usage.filter(u => u.provider === 'groq')}
          onUpdate={(config) => updateProvider('groq', config)}
        />
      )
    },
    {
      id: 'arcee',
      label: 'Arcee',
      content: arceeProvider && (
        <ArceeSettings
          config={arceeProvider}
          usage={usage.filter(u => u.provider === 'arcee')}
          onUpdate={(config) => updateProvider('arcee', config)}
        />
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Provedores de IA</h3>
        <p className="text-sm text-gray-600 mt-1">
          Configure os provedores de IA que serão utilizados para análise e geração de código ABAP
        </p>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <h4 className="font-medium text-gray-900">Groq</h4>
            </div>
            <Badge variant={groqStatus.variant as any}>
              {groqStatus.text}
            </Badge>
          </div>
          <p className="text-xs text-gray-600">
            API gratuita • Limites diários • Alta performance
          </p>
          {groqProvider?.isEnabled && (
            <div className="mt-2 text-xs">
              <span className="text-gray-500">
                Modelo padrão: {groqProvider.defaultModel}
              </span>
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              <h4 className="font-medium text-gray-900">Arcee Conductor</h4>
            </div>
            <Badge variant={arceeStatus.variant as any}>
              {arceeStatus.text}
            </Badge>
          </div>
          <p className="text-xs text-gray-600">
            API premium • Cobrança por uso • Auto-otimizado
          </p>
          {arceeProvider?.isEnabled && (
            <div className="mt-2 text-xs">
              <span className="text-gray-500">
                Modelo: auto-seleção
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Important Notice */}
      <Alert className="border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Importante:</strong> Configure pelo menos um provider para usar as funcionalidades 
          de IA do Abapfy. Os providers serão usados para análise de código, geração de programas 
          e outras funcionalidades inteligentes.
        </AlertDescription>
      </Alert>

      {/* Provider Configuration Tabs */}
      <Tabs 
        tabs={providerTabs}
        defaultTab="groq"
      />
    </div>
  );
}