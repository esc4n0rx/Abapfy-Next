// components/code/DebugFlow.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert } from '@/components/ui/alert';
import { ChevronLeft, ChevronRight, Bug, Loader2 } from 'lucide-react';
import { CodeUploader } from './CodeUploader';
import { AnalysisResults } from './AnalysisResults';
import { CodeAnalysisRequest, CodeAnalysisResult } from '@/types/codeAnalysis';
import { useProviders } from '@/hooks/useProviders';
import { ProviderType } from '@/types/providers';
import { GuardBlockModal } from '@/components/security/GuardBlockModal';

interface DebugFlowProps {
  onBack: () => void;
}

export function DebugFlow({ onBack }: DebugFlowProps) {
  const [step, setStep] = useState<'upload' | 'context' | 'analysis' | 'results'>('upload');
  const [code, setCode] = useState('');
  const [filename, setFilename] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<CodeAnalysisResult | null>(null);
  const [isGuardModalOpen, setIsGuardModalOpen] = useState(false);
  const [guardMessage, setGuardMessage] = useState('');

  const { providers } = useProviders();
  const [providerPreference, setProviderPreference] = useState<ProviderType>('groq');
  
  // Context form data
  const [errorMessage, setErrorMessage] = useState('');
  const [errorType, setErrorType] = useState('');
  const [flowDescription, setFlowDescription] = useState('');
  const [reproducible, setReproducible] = useState<boolean>(true);
  const [environment, setEnvironment] = useState('');

  const availableProviders = providers.filter(p => p.isEnabled && p.apiKey);

  const handleCodeLoaded = (loadedCode: string, loadedFilename?: string) => {
    setCode(loadedCode);
    setFilename(loadedFilename || 'código_colado.abap');
  };

  const handleAnalyze = async () => {
  setIsAnalyzing(true);
  setStep('analysis');

  const request: CodeAnalysisRequest = {
    code,
    analysisType: 'debug',
    providerPreference, // Adicionar esta linha
    debugContext: {
      errorMessage: errorMessage.trim() || undefined,
      errorType: errorType || undefined,
      flowDescription: flowDescription.trim() || undefined,
      reproducible,
      environment: environment || undefined,
    }
  };

  try {
    const response = await fetch('/api/code/debug', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(request)
    });

    const result = await response.json();

    if (!response.ok) {
      if (response.status === 403 || result.guardRejected) {
        setGuardMessage(result.error || 'Solicitação bloqueada pelo guardião do sistema.');
        setIsGuardModalOpen(true);
        setStep('context');
        return;
      }

      throw new Error(result.error || 'Erro na análise');
    }

    setResults(result.analysis);
    setStep('results');
  } catch (error) {
    console.error('Erro:', error);
    // TODO: Handle error properly
  } finally {
    setIsAnalyzing(false);
  }
};

  const canProceedToContext = code.trim().length > 0;
  const canAnalyze = errorMessage.trim().length > 0 || flowDescription.trim().length > 0;

  return (
    <>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-xl font-semibold flex items-center space-x-2">
              <Bug className="w-5 h-5 text-red-500" />
              <span>Debug de Código</span>
            </h2>
            <p className="text-sm text-gray-600">
              Identifique e resolva problemas no seu código ABAP
            </p>
          </div>
        </div>
        
        {/* Progress Indicator */}
        <div className="flex items-center space-x-2 text-xs">
          <div className={`w-2 h-2 rounded-full ${step === 'upload' ? 'bg-blue-500' : 'bg-gray-300'}`} />
          <div className={`w-2 h-2 rounded-full ${step === 'context' ? 'bg-blue-500' : 'bg-gray-300'}`} />
          <div className={`w-2 h-2 rounded-full ${step === 'analysis' || step === 'results' ? 'bg-blue-500' : 'bg-gray-300'}`} />
        </div>
      </div>

      {/* AI Provider Selection */}
    {step !== 'upload' && (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
            <span className="text-sm font-medium text-gray-700">IA:</span>
            <Select value={providerPreference} onValueChange={(value: ProviderType) => setProviderPreference(value)}>
                <SelectTrigger className="w-40 h-8">
                <SelectValue />
                </SelectTrigger>
                <SelectContent>
                {availableProviders.map(provider => (
                    <SelectItem key={provider.type} value={provider.type}>
                    <div className="flex items-center space-x-2">
                        <span>{provider.name}</span>
                        {provider.type === 'groq' && (
                        <span className="text-xs text-green-600 font-medium">Gratuito</span>
                        )}
                    </div>
                    </SelectItem>
                ))}
                </SelectContent>
            </Select>
            </div>
        </div>
        {availableProviders.length === 0 && (
            <p className="text-xs text-amber-600">⚠️ Configure um provedor de IA nas configurações</p>
        )}
        </div>
    </div>
    )}

      {/* Upload Step */}
      {step === 'upload' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">1. Carregue seu código</h3>
            <p className="text-sm text-gray-600 mb-4">
              Cole ou faça upload do código ABAP que está apresentando problemas.
            </p>
          </div>
          
          <CodeUploader onCodeLoaded={handleCodeLoaded} />
          
          <div className="flex justify-end">
            <Button 
              onClick={() => setStep('context')}
              disabled={!canProceedToContext}
            >
              Continuar
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Context Step */}
      {step === 'context' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">2. Contexto do Problema</h3>
            <p className="text-sm text-gray-600 mb-4">
              Forneça informações sobre o erro para uma análise mais precisa.
            </p>
          </div>

          <div className="grid gap-6">
            {/* Error Message */}
            <div className="space-y-2">
              <Label htmlFor="error-message">Mensagem de Erro</Label>
              <Textarea
                id="error-message"
                value={errorMessage}
                onChange={(e) => setErrorMessage(e.target.value)}
                placeholder="Ex: CALL_FUNCTION_PARAMS_MISSING, ITAB_DUPLICATE_KEY, SYSTEM_CORE_DUMPED..."
                rows={3}
              />
              <p className="text-xs text-gray-500">
                Cole a mensagem de erro exata que aparece no sistema
              </p>
            </div>

            {/* Error Type */}
            <div className="space-y-2">
            <Label htmlFor="error-type">Tipo do Erro</Label>
            <Select value={errorType} onValueChange={setErrorType}>
                <SelectTrigger className="bg-white border-gray-300">
                <SelectValue placeholder="Selecione o tipo de erro" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300 shadow-lg">
                <SelectItem value="runtime">Erro de Runtime</SelectItem>
                <SelectItem value="logic">Erro de Lógica</SelectItem>
                <SelectItem value="performance">Problema de Performance</SelectItem>
                <SelectItem value="data">Problema com Dados</SelectItem>
                <SelectItem value="integration">Erro de Integração</SelectItem>
                <SelectItem value="authorization">Problema de Autorização</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
            </Select>
            </div>

            {/* Flow Description */}
            <div className="space-y-2">
              <Label htmlFor="flow-description">Fluxo onde Ocorre</Label>
              <Textarea
                id="flow-description"
                value={flowDescription}
                onChange={(e) => setFlowDescription(e.target.value)}
                placeholder="Descreva o fluxo/ação que causa o erro: Ex: 'Ao executar o report com seleção de data maior que 30 dias' ou 'Durante o processamento do terceiro registro da tabela'"
                rows={3}
              />
            </div>

            {/* Environment */}
            <div className="space-y-2">
            <Label htmlFor="environment">Ambiente</Label>
            <Select value={environment} onValueChange={setEnvironment}>
                <SelectTrigger className="bg-white border-gray-300">
                <SelectValue placeholder="Selecione o ambiente" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300 shadow-lg">
                <SelectItem value="dev">Desenvolvimento</SelectItem>
                <SelectItem value="qas">Qualidade</SelectItem>
                <SelectItem value="prd">Produção</SelectItem>
                <SelectItem value="sandbox">Sandbox</SelectItem>
                </SelectContent>
            </Select>
            </div>
            
            {/* Reproducible */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label htmlFor="reproducible">Erro é Reproduzível?</Label>
                <p className="text-sm text-gray-600">
                  O erro acontece sempre que você executa o mesmo fluxo?
                </p>
              </div>
              <Switch
                id="reproducible"
                checked={reproducible}
                onCheckedChange={setReproducible}
              />
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep('upload')}>
              <ChevronLeft className="w-4 h-4 mr-1" />
              Voltar
            </Button>
            <Button onClick={handleAnalyze} disabled={!canAnalyze}>
              Analisar Código
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Analysis Step */}
      {step === 'analysis' && (
        <div className="space-y-6">
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
            <h3 className="text-lg font-medium mb-2">Analisando seu código...</h3>
            <p className="text-sm text-gray-600">
              Nossa IA está identificando problemas e preparando soluções
            </p>
          </div>
        </div>
      )}

      {/* Results Step */}
      {step === 'results' && results && (
        <AnalysisResults 
          results={results} 
          onNewAnalysis={() => {
            setStep('upload');
            setCode('');
            setFilename('');
            setResults(null);
            setErrorMessage('');
            setErrorType('');
            setFlowDescription('');
            setEnvironment('');
          }}
        />
      )}
      </div>

      <GuardBlockModal
        isOpen={isGuardModalOpen}
        onClose={() => setIsGuardModalOpen(false)}
        message={guardMessage}
      />
    </>
  );
}