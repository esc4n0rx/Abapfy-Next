// components/specifications/SpecificationViewer.tsx
'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectSpecificationContext, SpecificationGenerationResult, SpecificationPreferences } from '@/types/specifications';
import { generateSpecificationPdf } from '@/lib/utils/specificationPdf';
import { SpecificationProcessor } from '@/lib/utils/specificationProcessor';
import { Download, Share2, Save, X } from 'lucide-react';

interface SpecificationViewerProps {
  projectName: string;
  projectType?: string;
  summary: string;
  context: ProjectSpecificationContext;
  preferences: SpecificationPreferences;
  result: SpecificationGenerationResult;
  onSave: (isPublic: boolean) => void;
  onClose: () => void;
}

function formatArray(values?: string[]): string[] {
  if (!values || values.length === 0) return [];
  return values.filter(Boolean);
}

export function SpecificationViewer({
  projectName,
  projectType,
  summary,
  context,
  preferences,
  result,
  onSave,
  onClose,
}: SpecificationViewerProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const specificationText = useMemo(
    () => SpecificationProcessor.cleanResponse(result.specification || ''),
    [result.specification]
  );

  const handleDownload = async () => {
    if (!specificationText) return;
    setIsDownloading(true);
    try {
      const pdfBytes = generateSpecificationPdf({
        title: projectName,
        projectType,
        summary,
        specification: specificationText,
        context,
        preferences,
        metadata: {
          provider: result.provider,
          model: result.model,
          tokensUsed: result.tokensUsed,
          generatedAt: new Date().toISOString(),
        },
      });

      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${projectName.replace(/\s+/g, '_')}_especificacao.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Não foi possível gerar o PDF. Tente novamente.');
    } finally {
      setIsDownloading(false);
    }
  };

  const renderTagList = (label: string, values?: string[]) => {
    const items = formatArray(values);
    if (items.length === 0) return null;

    return (
      <Card className="border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-gray-800">{label}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {items.map((item) => (
            <Badge key={`${label}-${item}`} variant="secondary" className="text-xs">
              {item}
            </Badge>
          ))}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between md:space-x-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{projectName}</h2>
          <p className="text-sm text-gray-600 mt-1">{projectType || 'Projeto ABAP'}</p>
          <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-gray-500">
            {result.provider && (
              <Badge variant="outline" className="text-xs">
                Provider: {result.provider}
              </Badge>
            )}
            {result.model && (
              <Badge variant="outline" className="text-xs">
                Modelo: {result.model}
              </Badge>
            )}
            {result.tokensUsed && (
              <Badge variant="outline" className="text-xs">
                {result.tokensUsed.toLocaleString('pt-BR')} tokens
              </Badge>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          <Button variant="secondary" onClick={handleDownload} disabled={isDownloading || !specificationText}>
            <Download className="w-4 h-4 mr-2" />
            {isDownloading ? 'Gerando PDF...' : 'Baixar PDF'}
          </Button>
          <Button variant="outline" onClick={() => onSave(false)} disabled={!specificationText}>
            <Save className="w-4 h-4 mr-2" />
            Salvar (Privado)
          </Button>
          <Button onClick={() => onSave(true)} disabled={!specificationText}>
            <Share2 className="w-4 h-4 mr-2" />
            Salvar e Compartilhar
          </Button>
          <Button variant="ghost" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Fechar
          </Button>
        </div>
      </div>

      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-gray-800">Resumo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderTagList('Objetivos', context.objectives)}
        {renderTagList('Regras de Negócio', context.businessRules)}
        {renderTagList('Tabelas SAP', context.tables)}
        {renderTagList('Fluxos / Processos', context.flows)}
        {renderTagList('Integrações', context.integrations)}
        {renderTagList('Stakeholders', context.stakeholders)}
        {renderTagList('Stack Técnico', context.technicalStack)}
        {renderTagList('Requisitos Não Funcionais', context.nonFunctionalRequirements)}
        {renderTagList('Premissas e Restrições', context.constraints)}
        {renderTagList('Fases de Entrega', context.deliveryPhases)}
        {renderTagList('Critérios de Aceite', context.acceptanceCriteria)}
      </div>

      {(preferences.includeArchitecture || preferences.includeDataDictionary || preferences.includeImplementationRoadmap || preferences.includeTestPlan) && (
        <Card className="border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-800">Preferências de Documentação</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {preferences.includeArchitecture && (
              <Badge variant="secondary" className="text-xs">
                Arquitetura detalhada
              </Badge>
            )}
            {preferences.includeDataDictionary && (
              <Badge variant="secondary" className="text-xs">
                Dicionário de dados
              </Badge>
            )}
            {preferences.includeTestPlan && (
              <Badge variant="secondary" className="text-xs">
                Plano de testes
              </Badge>
            )}
            {preferences.includeImplementationRoadmap && (
              <Badge variant="secondary" className="text-xs">
                Roadmap de implementação
              </Badge>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="border border-indigo-100 bg-indigo-50">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-indigo-900">Especificação Gerada</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-[420px] overflow-y-auto border border-indigo-100 rounded-lg bg-white p-4">
            <pre className="whitespace-pre-wrap break-words text-sm text-gray-800 font-sans leading-relaxed">
              {specificationText}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
