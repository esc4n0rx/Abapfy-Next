// components/programs/CreateProgramFlow.tsx
'use client';

import { SetStateAction, useState } from 'react';
import { ProgramTypeSelector } from './ProgramTypeSelector';
import { ProgramContext } from './ProgramContext';
import { ProgramSpecUpload } from './ProgramSpecUpload';
import { GenerationProgress } from './GenerationProgress';
import { ProgramViewer } from './ProgramViewer';
import { Field } from '@/components/ui/Field';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ChevronLeft, Sparkles, Upload, FileText } from 'lucide-react';
import { PROGRAM_TYPES } from '@/lib/prompts/programs';
import { ProgramGenerationResult } from '@/types/programs';
import { useProviders } from '@/hooks/useProviders';
import { GuardBlockModal } from '@/components/security/GuardBlockModal';

type FlowStep = 
  | 'method' 
  | 'select' 
  | 'upload' 
  | 'context' 
  | 'configure' 
  | 'generating' 
  | 'result';

interface CreateProgramFlowProps {
  onClose: () => void;
  onProgramCreated: (programData: any) => void;
  initialType?: string;
}

export function CreateProgramFlow({ onClose, onProgramCreated, initialType }: CreateProgramFlowProps) {
  const { providers } = useProviders();
  const [currentStep, setCurrentStep] = useState<FlowStep>('method');
  const [creationMethod, setCreationMethod] = useState<'manual' | 'upload'>('manual');
  const [selectedType, setSelectedType] = useState(initialType || '');
  const [programName, setProgramName] = useState('');
  const [description, setDescription] = useState('');
  const [specification, setSpecification] = useState('');
  const [programContext, setProgramContext] = useState<{
    tables?: string[];
    businessRules?: string[];
    modules?: string[];
    parameters?: Record<string, any>;
    customLogic?: string;
  }>({});
  
  // User preferences
  const [useModernSyntax, setUseModernSyntax] = useState(true);
  const [includeErrorHandling, setIncludeErrorHandling] = useState(true);
  const [includeDocumentation, setIncludeDocumentation] = useState(true);
  const [includePerformanceOptimizations, setIncludePerformanceOptimizations] = useState(true);
  const [providerPreference, setProviderPreference] = useState('');

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState<ProgramGenerationResult | null>(null);
  const [isGuardModalOpen, setIsGuardModalOpen] = useState(false);
  const [guardMessage, setGuardMessage] = useState('');

  const selectedProgramType = PROGRAM_TYPES.find(t => t.id === selectedType);
  const availableProviders = providers.filter(p => p.isEnabled && p.apiKey);

  const handleGenerate = async () => {
    if (!selectedType || !programName || !description) return;

    setCurrentStep('generating');
    setIsGenerating(true);

    try {
      const response = await fetch('/api/programs/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: programName,
          programType: selectedType,
          description,
          programContext,
          specification: specification || undefined,
          userPreferences: {
            useModernSyntax,
            includeErrorHandling,
            includeDocumentation,
            includePerformanceOptimizations,
          },
          providerPreference: providerPreference || undefined,
        }),
      });

      const result: ProgramGenerationResult = await response.json();

      if (!response.ok && (response.status === 403 || result.guardRejected)) {
        setGuardMessage(result.error || 'Solicitação bloqueada pelo guardião do sistema.');
        setIsGuardModalOpen(true);
        setCurrentStep('configure');
        return;
      }

      if (result.success) {
        setGenerationResult(result);
        setCurrentStep('result');
      } else {
        alert(`Erro na geração: ${result.error}`);
        setCurrentStep('configure');
      }
    } catch (error: any) {
      alert(`Erro na geração: ${error.message}`);
      setCurrentStep('configure');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveProgram = async (isPublic: boolean = false) => {
    if (!generationResult || !generationResult.code) return;

    try {
      const response = await fetch('/api/programs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: programName,
          type: selectedType,
          description,
          code: generationResult.code,
          programContext,
          specification: specification || undefined,
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
        const savedProgram = await response.json();
        onProgramCreated(savedProgram);
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
      case 'method':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Como deseja criar o programa?
              </h3>
              <p className="text-sm text-gray-600">
                Escolha o método de criação mais adequado para seu caso
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div 
                className={`
                  p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md
                  ${creationMethod === 'upload' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                  }
                `}
                onClick={() => setCreationMethod('upload')}
              >
                <div className="text-center">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-blue-500" />
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Upload de Especificação
                  </h4>
                  <p className="text-sm text-gray-600">
                    Carregue um arquivo .txt com a especificação completa do programa
                  </p>
                </div>
              </div>

              <div 
                className={`
                  p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md
                  ${creationMethod === 'manual' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                  }
                `}
                onClick={() => setCreationMethod('manual')}
              >
                <div className="text-center">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-green-500" />
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Criação Manual
                  </h4>
                  <p className="text-sm text-gray-600">
                    Monte o contexto passo a passo definindo tabelas, regras e módulos
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => {
                if (creationMethod === 'upload') {
                  setCurrentStep('upload');
                } else {
                  setCurrentStep('select');
                }
              }}>
                Continuar
              </Button>
            </div>
          </div>
        );

      case 'upload':
        return (
          <ProgramSpecUpload
            onSpecificationLoaded={(specification: string, extractedData: { 
              name?: string; 
              description?: string; 
              type?: string; 
              context?: { 
                tables?: string[]; 
                businessRules?: string[]; 
                modules?: string[]; 
                parameters?: Record<string, any>; 
                customLogic?: string; 
              }; 
            }) => {
              setSpecification(specification);
              if (extractedData.name) setProgramName(extractedData.name);
              if (extractedData.description) setDescription(extractedData.description);
              if (extractedData.type) setSelectedType(extractedData.type);
              if (extractedData.context) setProgramContext(extractedData.context);
              setCurrentStep('configure');
            }}
            onBack={() => setCurrentStep('method')}
          />
        );

      case 'select':
        return (
          <ProgramTypeSelector
            selectedType={selectedType}
            onTypeSelect={setSelectedType}
            onNext={() => setCurrentStep('context')}
            onBack={() => setCurrentStep('method')}
          />
        );

      case 'context':
        return (
          <ProgramContext
            programName={programName}
            description={description}
            programContext={programContext}
            onProgramNameChange={setProgramName}
            onDescriptionChange={setDescription}
            onContextChange={setProgramContext}
            onNext={() => setCurrentStep('configure')}
            onBack={() => setCurrentStep('select')}
          />
        );

      case 'configure':
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentStep(creationMethod === 'upload' ? 'upload' : 'context')}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Configurações Finais
                </h3>
                <p className="text-sm text-gray-600">
                  Ajuste as preferências de geração do programa
                </p>
              </div>
            </div>

            {/* Program Summary */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Resumo do Programa</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Nome:</span>
                  <span className="ml-2">{programName}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Tipo:</span>
                  <span className="ml-2">{selectedProgramType?.name}</span>
                </div>
                <div className="col-span-2">
                  <span className="font-medium text-gray-700">Descrição:</span>
                  <span className="ml-2">{description}</span>
                </div>
              </div>
              
              {programContext.tables && programContext.tables.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-300">
                  <span className="font-medium text-gray-700">Tabelas:</span>
                  <div className="text-black flex flex-wrap gap-1 mt-1">
                    {programContext.tables.map((table, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {table}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
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
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Generation Preferences */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-4">Preferências de Geração</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="modern-syntax" className="font-medium">
                      Sintaxe Moderna ABAP 7.5+
                    </Label>
                    <p className="text-sm text-gray-600">
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
                    <Label htmlFor="error-handling" className="font-medium">
                      Tratamento de Exceções
                    </Label>
                    <p className="text-sm text-gray-600">
                      Incluir TRY...CATCH e validações robustas
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
                    <Label htmlFor="documentation" className="font-medium">
                      Documentação Completa
                    </Label>
                    <p className="text-sm text-gray-600">
                      Comentários e documentação interna
                    </p>
                  </div>
                  <Switch
                    id="documentation"
                    checked={includeDocumentation}
                    onCheckedChange={setIncludeDocumentation}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="performance" className="font-medium">
                      Otimizações de Performance
                    </Label>
                    <p className="text-sm text-gray-600">
                      SELECTs otimizados e processamento eficiente
                    </p>
                  </div>
                  <Switch
                    id="performance"
                    checked={includePerformanceOptimizations}
                    onCheckedChange={setIncludePerformanceOptimizations}
                  />
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <div className="flex justify-end space-x-3">
              <Button 
                variant="secondary"
                onClick={() => setCurrentStep(creationMethod === 'upload' ? 'upload' : 'context')}
              >
                Voltar
              </Button>
              <Button 
                onClick={handleGenerate}
                disabled={!programName || !description || !selectedType}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Gerar Programa
              </Button>
            </div>
          </div>
        );

      case 'generating':
        return (
          <GenerationProgress
            programName={programName}
            programType={selectedProgramType?.name || ''}
            isGenerating={isGenerating}
          />
        );

      case 'result':
        return generationResult && (
          <ProgramViewer
            program={{
              name: programName,
              type: selectedType,
              description,
              code: generationResult.code ?? '',
              metadata: {
                provider: generationResult.provider ?? '',
                model: generationResult.model ?? '',
                tokensUsed: generationResult.tokensUsed ?? 0,
                generatedAt: new Date().toISOString(),
              }
            }}
            onSave={handleSaveProgram}
            onClose={onClose}
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div className="max-w-4xl mx-auto">
        {renderStepContent()}
      </div>

      <GuardBlockModal
        isOpen={isGuardModalOpen}
        onClose={() => setIsGuardModalOpen(false)}
        message={guardMessage}
      />
    </>
  );
}