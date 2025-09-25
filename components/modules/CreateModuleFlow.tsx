// components/modules/CreateModuleFlow.tsx
'use client';

import { useState } from 'react';
import { ModuleTypeSelector } from './ModuleTypeSelector';
import { GenerationProgress } from './GenerationProgress';
import { ModuleViewer } from './ModuleViewer';
import { Field } from '@/components/ui/Field';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ChevronLeft, Sparkles } from 'lucide-react';
import { MODULE_TYPES } from '@/lib/prompts/abap';
import { ModuleGenerationResult } from '@/types/modules';
import { useProviders } from '@/hooks/useProviders';

type FlowStep = 'select' | 'configure' | 'generating' | 'result';

interface CreateModuleFlowProps {
  onClose: () => void;
  onModuleCreated: (moduleData: any) => void;
}

export function CreateModuleFlow({ onClose, onModuleCreated }: CreateModuleFlowProps) {
  const { providers } = useProviders();
  const [currentStep, setCurrentStep] = useState<FlowStep>('select');
  const [selectedType, setSelectedType] = useState('');
  const [description, setDescription] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [useModernSyntax, setUseModernSyntax] = useState(true);
  const [includeErrorHandling, setIncludeErrorHandling] = useState(true);
  const [includeDocumentation, setIncludeDocumentation] = useState(true);
  const [providerPreference, setProviderPreference] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState<ModuleGenerationResult | null>(null);

  const selectedModuleType = MODULE_TYPES.find(t => t.id === selectedType);
  const availableProviders = providers.filter(p => p.isEnabled && p.apiKey);

  const handleGenerate = async () => {
    if (!description.trim()) {
      alert('Por favor, descreva o módulo que você deseja gerar');
      return;
    }

    setCurrentStep('generating');
    setIsGenerating(true);

    try {
      const response = await fetch('/api/modules/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          moduleType: selectedType,
          description,
          additionalContext,
          userPreferences: {
            useModernSyntax,
            includeErrorHandling,
            includeDocumentation,
          },
          providerPreference,
        }),
      });

      const result = await response.json();
      setGenerationResult(result);
      
      setTimeout(() => {
        setIsGenerating(false);
        setCurrentStep('result');
      }, 1000);

    } catch (error: any) {
      setGenerationResult({
        success: false,
        error: error.message || 'Erro na geração do módulo'
      });
      setIsGenerating(false);
      setCurrentStep('result');
    }
  };

  const handleSaveModule = async (name: string, isPublic: boolean) => {
    if (!generationResult?.success || !generationResult.code) return;

    try {
      const response = await fetch('/api/modules/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name,
          type: selectedType,
          description,
          code: generationResult.code,
          metadata: {
            provider: generationResult.provider,
            model: generationResult.model,
            tokensUsed: generationResult.tokensUsed,
            generatedAt: new Date().toISOString(),
          },
          isPublic,
        }),
      });

      if (response.ok) {
        const savedModule = await response.json();
        onModuleCreated(savedModule);
        onClose();
      } else {
        const error = await response.json();
        alert(`Erro ao salvar: ${error.error}`);
      }
    } catch (error: any) {
      alert(`Erro ao salvar: ${error.message}`);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'select':
        return (
          <ModuleTypeSelector
            selectedType={selectedType}
            onTypeSelect={setSelectedType}
            onNext={() => setCurrentStep('configure')}
          />
        );

      case 'configure':
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentStep('select')}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Configurar {selectedModuleType?.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedModuleType?.description}
                </p>
              </div>
            </div>

            {/* Provider Selection */}
            {availableProviders.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-3">Provider de IA</h4>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={providerPreference === '' ? 'default' : 'secondary'}
                    size="sm"
                    onClick={() => setProviderPreference('')}
                  >
                    Automático
                  </Button>
                  {availableProviders.map(provider => (
                    <Button
                      key={provider.type}
                      variant={providerPreference === provider.type ? 'default' : 'secondary'}
                      size="sm"
                      onClick={() => setProviderPreference(provider.type)}
                    >
                      {provider.name}
                      {provider.defaultModel && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          {provider.defaultModel}
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {availableProviders.length === 0 && (
              <Alert variant="destructive">
                <strong>Nenhum provider configurado!</strong> Configure um provider de IA nas configurações para usar esta funcionalidade.
              </Alert>
            )}

            <Textarea
              label="Descrição do Módulo"
              placeholder={`Descreva detalhadamente o ${selectedModuleType?.name?.toLowerCase()} que você deseja gerar...

Exemplo: "Criar um módulo de função que calcule o desconto de um produto baseado na categoria do cliente e quantidade comprada. Deve receber como parâmetros o código do produto, código do cliente e quantidade, e retornar o valor do desconto em percentual."`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              required
            />

            <Textarea
              label="Contexto Adicional (Opcional)"
              placeholder="Informações adicionais sobre regras de negócio, tabelas específicas, ou requisitos especiais..."
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              rows={4}
            />

            {/* Preferences */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-4">Preferências de Código</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="modern-syntax">Sintaxe Moderna ABAP 7.5+</Label>
                    <p className="text-xs text-gray-600">
                      Usar DATA(...), VALUE, CONV, COND, etc.
                    </p>
                  </div>
                  <Switch
                    id="modern-syntax"
                    checked={useModernSyntax}
                    onCheckedChange={setUseModernSyntax}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="error-handling">Tratamento de Exceções</Label>
                    <p className="text-xs text-gray-600">
                      Incluir TRY...CATCH e validações
                    </p>
                  </div>
                  <Switch
                    id="error-handling"
                    checked={includeErrorHandling}
                    onCheckedChange={setIncludeErrorHandling}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="documentation">Documentação Detalhada</Label>
                    <p className="text-xs text-gray-600">
                      Comentários explicativos em português
                    </p>
                  </div>
                  <Switch
                    id="documentation"
                    checked={includeDocumentation}
                    onCheckedChange={setIncludeDocumentation}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={handleGenerate}
                disabled={!description.trim() || availableProviders.length === 0}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Gerar Código
              </Button>
            </div>
          </div>
        );

      case 'generating':
        return (
          <GenerationProgress
            isGenerating={isGenerating}
            provider={providerPreference || availableProviders[0]?.type}
            model={availableProviders.find(p => p.type === providerPreference)?.defaultModel}
            onComplete={() => {}}
          />
        );

      case 'result':
        return generationResult ? (
          <ModuleViewer
            result={generationResult}
            onSave={handleSaveModule}
            onClose={() => setCurrentStep('select')}
          />
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {renderStepContent()}
    </div>
  );
}