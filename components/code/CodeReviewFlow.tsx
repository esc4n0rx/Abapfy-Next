// components/code/CodeReviewFlow.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/alert';
import { ChevronLeft, FileSearch, Loader2 } from 'lucide-react';
import { CodeUploader } from './CodeUploader';
import { AnalysisResults } from './AnalysisResults';
import { CodeAnalysisRequest, CodeAnalysisResult } from '@/types/codeAnalysis';
import { useProviders } from '@/hooks/useProviders';
import { ProviderType } from '@/types/providers';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface CodeReviewFlowProps {
  onBack: () => void;
}

export function CodeReviewFlow({ onBack }: CodeReviewFlowProps) {
  const [step, setStep] = useState<'upload' | 'analysis' | 'results'>('upload');
  const [code, setCode] = useState('');
  const [filename, setFilename] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<CodeAnalysisResult | null>(null);
  const { providers } = useProviders();
  const [providerPreference, setProviderPreference] = useState<ProviderType>('groq');
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
    analysisType: 'review',
    providerPreference, // Adicionar
  };

    try {
      const response = await fetch('/api/code/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(request)
      });

      if (response.ok) {
        const result = await response.json();
        setResults(result.analysis);
        setStep('results');
      } else {
        throw new Error('Erro na análise');
      }
    } catch (error) {
      console.error('Erro:', error);
      // TODO: Handle error properly
    } finally {
      setIsAnalyzing(false);
    }
  };

  const canAnalyze = code.trim().length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-xl font-semibold flex items-center space-x-2">
              <FileSearch className="w-5 h-5 text-blue-500" />
              <span>Code Review</span>
            </h2>
            <p className="text-sm text-gray-600">
              Análise completa da qualidade do seu código ABAP
            </p>
          </div>
        </div>
        
        {/* Progress Indicator */}
        <div className="flex items-center space-x-2 text-xs">
          <div className={`w-2 h-2 rounded-full ${step === 'upload' ? 'bg-blue-500' : 'bg-gray-300'}`} />
          <div className={`w-2 h-2 rounded-full ${step === 'analysis' || step === 'results' ? 'bg-blue-500' : 'bg-gray-300'}`} />
        </div>
      </div>

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
            <h3 className="text-lg font-medium mb-2">Carregue seu código</h3>
            <p className="text-sm text-gray-600 mb-4">
              Cole ou faça upload do código ABAP para análise de qualidade.
            </p>
          </div>

          <Alert variant="default">
            <FileSearch className="w-4 h-4" />
            Nossa IA analisará seu código em múltiplos aspectos: qualidade, performance, 
            segurança, padrões SAP e oportunidades de modernização.
          </Alert>
          
          <CodeUploader onCodeLoaded={handleCodeLoaded} />
          
          <div className="flex justify-end">
            <Button 
              onClick={handleAnalyze}
              disabled={!canAnalyze}
            >
              Iniciar Code Review
            </Button>
          </div>
        </div>
      )}

      {/* Analysis Step */}
      {step === 'analysis' && (
        <div className="space-y-6">
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
            <h3 className="text-lg font-medium mb-2">Analisando qualidade do código...</h3>
            <p className="text-sm text-gray-600 mb-4">
              Avaliando padrões, performance, segurança e manutenibilidade
            </p>
            <div className="text-xs text-gray-500 space-y-1">
              <div>✓ Verificando sintaxe e estrutura</div>
              <div>✓ Analisando performance e otimizações</div>
              <div>✓ Avaliando segurança e validações</div>
              <div>✓ Verificando aderência aos padrões SAP</div>
            </div>
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
          }}
        />
      )}
    </div>
  );
}