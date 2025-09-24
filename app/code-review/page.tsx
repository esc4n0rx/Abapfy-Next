'use client';

import { useState } from 'react';
import { FileSearch, Code, Wand2, CheckCircle } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Toolbar } from '@/components/layout/Toolbar';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { sampleABAPCode, findingsMock } from '@/lib/abapSamples';

export default function CodeReviewPage() {
  const [code, setCode] = useState(sampleABAPCode);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isFormatting, setIsFormatting] = useState(false);
  const [findings, setFindings] = useState<any[]>([]);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    
    // Simula análise com IA
    setTimeout(() => {
      setFindings(findingsMock);
      setHasAnalyzed(true);
      setIsAnalyzing(false);
    }, 2000);
  };

  const handleFormat = () => {
    setIsFormatting(true);
    
    // Simula formatação
    setTimeout(() => {
      const formatted = code
        .replace(/\bselect \*/gi, 'SELECT *')
        .replace(/\bfrom\b/gi, 'FROM')
        .replace(/\binto\b/gi, 'INTO')
        .replace(/\btable\b/gi, 'TABLE')
        .replace(/\bwhere\b/gi, 'WHERE')
        .replace(/\bdata:/gi, 'DATA:')
        .replace(/\bwrite:/gi, 'WRITE:')
        .replace(/\bstart-of-selection/gi, 'START-OF-SELECTION')
        .replace(/\bendform/gi, 'ENDFORM')
        .replace(/\bperform\b/gi, 'PERFORM')
        .replace(/^(\s*)(.+)$/gm, (match, spaces, content) => {
          // Simples indentação baseada em palavras-chave
          if (content.trim().startsWith('FORM ') || content.trim().startsWith('START-OF-SELECTION')) {
            return content.trim();
          } else if (content.trim().startsWith('ENDFORM') || content.trim().startsWith('END')) {
            return content.trim();
          } else {
            return '  ' + content.trim();
          }
        });
      
      setCode(formatted);
      setIsFormatting(false);
    }, 1000);
  };

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'error': return 'error';
      case 'warning': return 'warning';  
      case 'info': return 'default';
      default: return 'default';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error': return '🚫';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return 'ℹ️';
    }
  };

  const getStatistics = () => {
    const errors = findings.filter(f => f.severity === 'error').length;
    const warnings = findings.filter(f => f.severity === 'warning').length;
    const infos = findings.filter(f => f.severity === 'info').length;
    return { errors, warnings, infos };
  };

  const stats = getStatistics();

  const tabs = [
    {
      id: 'code',
      label: 'Código',
      content: (
        <div className="space-y-6">
          <Textarea
            label="Código ABAP para Análise"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={20}
            className="font-mono"
            placeholder="Cole seu código ABAP aqui para análise..."
          />

          <div className="flex gap-4">
            <Button 
              onClick={handleAnalyze}
              loading={isAnalyzing}
              disabled={!code.trim()}
            >
              <FileSearch className="w-4 h-4 mr-2" />
              Analisar Código
            </Button>
            
            <Button 
              variant="secondary"
              onClick={handleFormat}
              loading={isFormatting}
              disabled={!code.trim()}
            >
              <Code className="w-4 h-4 mr-2" />
              Formatar
            </Button>
          </div>
        </div>
      )
    },
    {
      id: 'results',
      label: `Resultados ${hasAnalyzed ? `(${findings.length})` : ''}`,
      content: (
        <div className="space-y-6">
          {!hasAnalyzed ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
                <FileSearch className="w-8 h-8 text-subtle" />
              </div>
              <p className="text-subtle">Analise o código para ver os resultados aqui</p>
            </div>
          ) : (
            <>
              {/* Estatísticas */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-card border border-border rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-text">{findings.length}</div>
                  <div className="text-sm text-subtle">Total de Issues</div>
                </div>
                <div className="bg-card border border-border rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{stats.errors}</div>
                  <div className="text-sm text-subtle">Erros</div>
                </div>
                <div className="bg-card border border-border rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">{stats.warnings}</div>
                  <div className="text-sm text-subtle">Avisos</div>
                </div>
                <div className="bg-card border border-border rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.infos}</div>
                  <div className="text-sm text-subtle">Informações</div>
                </div>
              </div>

              {/* Lista de Findings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-text">Issues Encontrados</h3>
                
                {findings.length === 0 ? (
                  <Alert type="success">
                    <CheckCircle className="w-5 h-5" />
                    Parabéns! Nenhum problema encontrado no seu código.
                  </Alert>
                ) : (
                  <div className="space-y-3">
                    {findings.map((finding) => (
                      <div key={finding.id} className="bg-card border border-border rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <span className="text-lg">{getSeverityIcon(finding.severity)}</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={getSeverityVariant(finding.severity)}>
                                Linha {finding.line}
                              </Badge>
                              <Badge variant="default">
                                {finding.category}
                              </Badge>
                            </div>
                            
                            <p className="text-text font-medium mb-2">
                              {finding.message}
                            </p>
                            
                            {finding.suggestion && (
                              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                                <p className="text-sm text-blue-800">
                                  <strong>Sugestão:</strong> {finding.suggestion}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )
    }
  ];

  const toolbarActions = (
    <>
      <Button variant="secondary">
        <Wand2 className="w-4 h-4 mr-2" />
        Correção IA
      </Button>
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Toolbar 
        title="Code Review Inteligente"
        breadcrumb={[{label: 'Home', href: '/dashboard'}, {label: 'Code Review'}]}
        actions={toolbarActions}
      />
      
      <div className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <Alert type="info">
            Nossa IA analisa seu código ABAP identificando problemas de performance, segurança, 
            padrões SAP e oportunidades de modernização.
          </Alert>
        </div>
        
        <Tabs tabs={tabs} />
      </div>
    </div>
  );
}