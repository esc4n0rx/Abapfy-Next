// components/code/AnalysisResults.tsx
'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, AlertCircle, Info, Bug, FileSearch, RefreshCw, Copy, Download } from 'lucide-react';
import { CodeAnalysisResult } from '@/types/codeAnalysis';

interface AnalysisResultsProps {
  results: CodeAnalysisResult;
  onNewAnalysis: () => void;
}

export function AnalysisResults({ results, onNewAnalysis }: AnalysisResultsProps) {
  const { analysisType, results: analysisResults } = results;
  
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info': return <Info className="w-4 h-4 text-blue-500" />;
      default: return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'border-red-200 bg-red-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'info': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-gray-500';
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score?: number) => {
    if (!score) return 'N/A';
    if (score >= 90) return 'Excelente';
    if (score >= 80) return 'Bom';
    if (score >= 70) return 'Regular';
    if (score >= 60) return 'Ruim';
    return 'Crítico';
  };

  const issuesByCategory = analysisResults.issues.reduce((acc, issue) => {
    if (!acc[issue.category]) acc[issue.category] = [];
    acc[issue.category].push(issue);
    return acc;
  }, {} as Record<string, typeof analysisResults.issues>);

  const handleCopyResults = () => {
    const text = `
${analysisType === 'debug' ? 'RESULTADO DO DEBUG' : 'RESULTADO DO CODE REVIEW'}
${analysisType === 'review' ? `Pontuação: ${analysisResults.score}/100 (${getScoreLabel(analysisResults.score)})` : ''}

RESUMO:
${analysisResults.summary}

PROBLEMAS ENCONTRADOS:
${analysisResults.issues.map(issue => 
  `- ${issue.severity.toUpperCase()}: ${issue.message}${issue.line ? ` (Linha ${issue.line})` : ''}`
).join('\n')}

SUGESTÕES:
${analysisResults.suggestions.map(suggestion => `- ${suggestion}`).join('\n')}

${analysisResults.debugSolutions ? `
SOLUÇÕES PROPOSTAS:
${analysisResults.debugSolutions.map(solution => 
  `${solution.title}:
  ${solution.description}
  Passos: ${solution.steps.join(', ')}`
).join('\n\n')}` : ''}
    `.trim();
    
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {analysisType === 'debug' ? (
            <Bug className="w-6 h-6 text-red-500" />
          ) : (
            <FileSearch className="w-6 h-6 text-blue-500" />
          )}
          <div>
            <h2 className="text-xl font-semibold">
              {analysisType === 'debug' ? 'Resultado do Debug' : 'Resultado do Code Review'}
            </h2>
            <p className="text-sm text-gray-600">
              Análise concluída em {new Date(results.createdAt).toLocaleString('pt-BR')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleCopyResults}>
            <Copy className="w-4 h-4 mr-1" />
            Copiar
          </Button>
          <Button variant="outline" size="sm" onClick={onNewAnalysis}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Nova Análise
          </Button>
        </div>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Resumo da Análise</span>
            {analysisResults.score !== undefined && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Pontuação:</span>
                <Badge variant="outline" className={getScoreColor(analysisResults.score)}>
                  {analysisResults.score}/100 - {getScoreLabel(analysisResults.score)}
                </Badge>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">{analysisResults.summary}</p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {analysisResults.issues.length}
              </div>
              <div className="text-xs text-gray-600">Problemas</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {analysisResults.issues.filter(i => i.severity === 'error').length}
              </div>
              <div className="text-xs text-gray-600">Erros</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {analysisResults.issues.filter(i => i.severity === 'warning').length}
              </div>
              <div className="text-xs text-gray-600">Avisos</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {analysisResults.suggestions.length}
              </div>
              <div className="text-xs text-gray-600">Sugestões</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Debug Solutions (only for debug analysis) */}
      {analysisType === 'debug' && analysisResults.debugSolutions && analysisResults.debugSolutions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Soluções Propostas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysisResults.debugSolutions.map((solution, index) => (
              <div key={solution.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{solution.title}</h4>
                  <div className="flex items-center space-x-2">
                    <Badge variant={solution.priority === 'high' ? 'destructive' : solution.priority === 'medium' ? 'default' : 'secondary'}>
                      {solution.priority === 'high' ? 'Alta' : solution.priority === 'medium' ? 'Média' : 'Baixa'}
                    </Badge>
                    <Badge variant="outline">
                      {solution.confidence}% confiança
                    </Badge>
                  </div>
                </div>
                
                <p className="text-sm text-gray-700 mb-3">{solution.description}</p>
                
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-gray-900">Passos:</h5>
                  <ol className="list-decimal list-inside space-y-1">
                    {solution.steps.map((step, stepIndex) => (
                      <li key={stepIndex} className="text-sm text-gray-700">{step}</li>
                    ))}
                  </ol>
                </div>
                
                {solution.codeExample && (
                  <div className="mt-3">
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Exemplo de código:</h5>
                    <pre className="text-xs bg-gray-100 p-3 rounded border overflow-x-auto">
                      <code>{solution.codeExample}</code>
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Issues by Category */}
      {Object.keys(issuesByCategory).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Problemas Identificados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(issuesByCategory).map(([category, issues]) => (
              <div key={category}>
                <h4 className="font-medium text-gray-900 mb-3">{category}</h4>
                <div className="space-y-2">
                  {issues.map((issue, index) => (
                    <div key={issue.id} className={`border rounded-lg p-3 ${getSeverityColor(issue.severity)}`}>
                      <div className="flex items-start space-x-3">
                        {getSeverityIcon(issue.severity)}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium text-gray-900">
                              {issue.message}
                            </p>
                            {issue.line && (
                              <Badge variant="outline" className="text-xs">
                                Linha {issue.line}
                              </Badge>
                            )}
                          </div>
                          
                          {issue.description && (
                            <p className="text-xs text-gray-600 mb-2">{issue.description}</p>
                          )}
                          
                          {issue.suggestion && (
                            <div className="bg-white/50 border border-white/80 rounded p-2 mt-2">
                              <p className="text-xs text-gray-800">
                                <strong>Sugestão:</strong> {issue.suggestion}
                              </p>
                            </div>
                          )}
                          
                          {issue.codeSnippet && (
                            <pre className="text-xs bg-white/50 p-2 rounded border mt-2 overflow-x-auto">
                              <code>{issue.codeSnippet}</code>
                            </pre>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* General Suggestions */}
      {analysisResults.suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sugestões Gerais</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysisResults.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{suggestion}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div>
              Processado por {results.metadata.provider} • {results.metadata.model}
            </div>
            <div>
              {results.metadata.tokensUsed} tokens • {results.metadata.processingTime}ms
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}