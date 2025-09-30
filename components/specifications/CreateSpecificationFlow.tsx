// components/specifications/CreateSpecificationFlow.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { SpecificationContextForm } from './SpecificationContextForm';
import { GenerationProgress } from './GenerationProgress';
import { SpecificationViewer } from './SpecificationViewer';
import { GuardBlockModal } from '@/components/security/GuardBlockModal';
import { useProviders } from '@/hooks/useProviders';
import { ProjectSpecificationContext, SpecificationGenerationResult, SpecificationPreferences } from '@/types/specifications';
import { Sparkles, ChevronLeft } from 'lucide-react';

interface TemplateConfig {
  id: string;
  title: string;
  description: string;
  icon: string;
  projectType?: string;
  summary?: string;
  projectNameHint?: string;
  defaults?: ProjectSpecificationContext;
}

type FlowStep = 'template' | 'context' | 'configure' | 'generating' | 'result';

interface CreateSpecificationFlowProps {
  onClose: () => void;
  onSpecificationCreated: (specification: any) => void;
  initialTemplate?: string;
}

const SPECIFICATION_TEMPLATES: TemplateConfig[] = [
  {
    id: 'relatorio-alv',
    title: 'Relatório Gerencial ALV',
    description: 'Documentação completa para relatórios complexos com filtros, validações e exportações.',
    icon: '📊',
    projectType: 'Relatório ABAP / ALV',
    summary: 'Criação de um relatório ALV para acompanhar indicadores de vendas com filtros por período, filial e status de pedido.',
    projectNameHint: 'ZREL_VENDAS_KPI',
    defaults: {
      objectives: [
        'Disponibilizar indicadores de vendas consolidados diariamente',
        'Permitir exportação para Excel e PDF',
      ],
      tables: ['VBAK', 'VBAP', 'KNA1', 'VBFA'],
      businessRules: [
        'Considerar apenas pedidos faturados',
        'Permitir filtros por região de vendas e equipe',
      ],
      flows: ['Seleção de dados -> Processamento -> Exibição ALV -> Exportação'],
      integrations: ['Geração de arquivo para BI corporativo'],
      stakeholders: ['Gestão Comercial', 'Controladoria'],
      nonFunctionalRequirements: ['Tempo de resposta inferior a 5 segundos', 'Disponibilidade 24x7'],
      deliveryPhases: ['Blueprint', 'Desenvolvimento', 'Homologação', 'Go-live'],
    },
  },
  {
    id: 'integracao-idoc',
    title: 'Integração IDoc',
    description: 'Especificação funcional e técnica para integrações via IDoc entre sistemas SAP e terceiros.',
    icon: '🔄',
    projectType: 'Integração SAP via IDoc',
    summary: 'Integração entre SAP SD e plataforma externa para recebimento de pedidos com validações automáticas.',
    projectNameHint: 'ZINT_PEDIDOS_IDOC',
    defaults: {
      objectives: [
        'Processar pedidos vindos do canal e-commerce',
        'Garantir consistência e rastreabilidade das mensagens',
      ],
      tables: ['VBAK', 'VBAP', 'EDIDC', 'EDIDS'],
      businessRules: [
        'Rejeitar pedidos sem cliente cadastrado',
        'Validar estoque antes de criar pedido de venda',
      ],
      flows: [
        'Recepção IDoc -> Validações -> Criação pedido -> Retorno status',
        'Tratamento de erros -> Reprocessamento manual',
      ],
      integrations: ['E-commerce externo via IDoc ORDERS05'],
      stakeholders: ['E-commerce', 'Suporte SD', 'Basis'],
      technicalStack: ['IDoc ORDERS05', 'BAPI_SALESORDER_CREATEFROMDAT2'],
      constraints: ['Sem modificações em tabelas padrão', 'Log de integrações deve ser mantido por 90 dias'],
      deliveryPhases: ['Preparação', 'Desenvolvimento', 'Testes integrados', 'Go-live assistido'],
      acceptanceCriteria: ['Processar 1000 pedidos/hora sem falhas', 'Erros devem ser notificados por e-mail'],
    },
  },
  {
    id: 'workflow-fiori',
    title: 'Workflow + Fiori',
    description: 'Documentação para workflow de aprovação com interface Fiori e notificações automáticas.',
    icon: '🧩',
    projectType: 'Workflow SAP / Fiori',
    summary: 'Implementação de workflow de aprovação para requisições de compra com interface Fiori personalizada.',
    projectNameHint: 'ZWF_APROVACAO_COMPRAS',
    defaults: {
      objectives: [
        'Reduzir tempo médio de aprovação de requisições',
        'Disponibilizar interface mobile responsiva',
      ],
      tables: ['EBAN', 'EBKN', 'CDHDR'],
      businessRules: [
        'Aprovação obrigatória para valores acima de R$ 10.000',
        'Escalonamento automático após 24h sem decisão',
      ],
      flows: ['Solicitação -> Análise automática -> Aprovação Gestor -> Aprovação Diretor'],
      integrations: ['Notificações via SAP Business Workflow', 'Integração com Outlook corporativo'],
      stakeholders: ['Suprimentos', 'Diretoria', 'TI Aplicações'],
      technicalStack: ['SAP Workflow', 'Fiori Elements', 'OData'],
      nonFunctionalRequirements: ['Interface responsiva', 'Tempo de carregamento < 3s'],
      acceptanceCriteria: ['Logs de aprovação completos', 'Disponibilidade superior a 99%'],
    },
  },
];

export function CreateSpecificationFlow({ onClose, onSpecificationCreated, initialTemplate }: CreateSpecificationFlowProps) {
  const { providers } = useProviders();
  const availableProviders = useMemo(() => providers.filter(p => p.isEnabled && p.apiKey), [providers]);

  const [currentStep, setCurrentStep] = useState<FlowStep>(initialTemplate ? 'context' : 'template');
  const [selectedTemplate, setSelectedTemplate] = useState<string>(initialTemplate || '');
  const [projectName, setProjectName] = useState('');
  const [projectType, setProjectType] = useState('');
  const [summary, setSummary] = useState('');
  const [context, setContext] = useState<ProjectSpecificationContext>({});
  const [preferences, setPreferences] = useState<SpecificationPreferences>({
    includeArchitecture: true,
    includeDataDictionary: true,
    includeImplementationRoadmap: true,
    includeTestPlan: true,
  });
  const [providerPreference, setProviderPreference] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState<SpecificationGenerationResult | null>(null);
  const [isGuardModalOpen, setIsGuardModalOpen] = useState(false);
  const [guardMessage, setGuardMessage] = useState('');

  useEffect(() => {
    if (initialTemplate) {
      applyTemplate(initialTemplate);
    }
  }, [initialTemplate]);

  const applyTemplate = (templateId: string) => {
    const template = SPECIFICATION_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    setProjectType(template.projectType || '');
    if (template.summary) setSummary(template.summary);
    if (template.projectNameHint) setProjectName(template.projectNameHint);
    if (template.defaults) setContext(template.defaults);
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    applyTemplate(templateId);
    setCurrentStep('context');
  };

  const handleGenerate = async () => {
    if (!projectName.trim() || !summary.trim()) {
      alert('Informe nome do projeto e resumo executivo.');
      return;
    }

    if (availableProviders.length === 0) {
      alert('Configure um provider de IA antes de gerar a especificação.');
      return;
    }

    setCurrentStep('generating');
    setIsGenerating(true);

    try {
      const response = await fetch('/api/specifications/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          projectName,
          projectType,
          summary,
          objectives: context.objectives,
          tables: context.tables,
          businessRules: context.businessRules,
          flows: context.flows,
          integrations: context.integrations,
          stakeholders: context.stakeholders,
          technicalStack: context.technicalStack,
          nonFunctionalRequirements: context.nonFunctionalRequirements,
          constraints: context.constraints,
          deliveryPhases: context.deliveryPhases,
          acceptanceCriteria: context.acceptanceCriteria,
          additionalNotes: context.additionalNotes,
          preferences,
          providerPreference: providerPreference || undefined,
        }),
      });

      const result: SpecificationGenerationResult = await response.json();

      if (!response.ok && (response.status === 403 || result.guardRejected)) {
        setGuardMessage(result.error || 'Solicitação bloqueada pelo guardião do sistema.');
        setIsGuardModalOpen(true);
        setCurrentStep('configure');
        return;
      }

      if (!result.success || !result.specification) {
        alert(result.error || 'Não foi possível gerar a especificação.');
        setCurrentStep('configure');
        return;
      }

      setGenerationResult(result);
      setCurrentStep('result');
    } catch (error: any) {
      alert(error.message || 'Erro ao gerar especificação.');
      setCurrentStep('configure');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveSpecification = async (isPublic: boolean) => {
    if (!generationResult?.specification) return;

    try {
      const response = await fetch('/api/specifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          projectName,
          projectType,
          summary,
          specification: generationResult.specification,
          context,
          preferences,
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
        const saved = await response.json();
        onSpecificationCreated(saved.specification);
        onClose();
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao salvar especificação.');
      }
    } catch (error: any) {
      alert(error.message || 'Erro ao salvar especificação.');
    }
  };

  const renderTemplateStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Escolha um modelo de especificação</h3>
        <p className="text-sm text-gray-600">
          Use um template como ponto de partida ou avance sem seleção para criar do zero.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SPECIFICATION_TEMPLATES.map(template => (
          <div
            key={template.id}
            className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
              selectedTemplate === template.id
                ? 'border-indigo-500 bg-indigo-50 shadow-lg'
                : 'border-gray-200 hover:border-indigo-200'
            }`}
            onClick={() => handleTemplateSelect(template.id)}
          >
            <div className="text-3xl mb-3">{template.icon}</div>
            <h4 className="font-semibold text-gray-900 mb-1">{template.title}</h4>
            <p className="text-sm text-gray-600 mb-3">{template.description}</p>
            {template.projectType && (
              <Badge variant="outline" className="text-xs">
                {template.projectType}
              </Badge>
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <Button onClick={() => setCurrentStep('context')}>
          Começar sem template
        </Button>
      </div>
    </div>
  );

  const renderConfigureStep = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => setCurrentStep('context')}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Preferências da documentação</h3>
          <p className="text-sm text-gray-600">Ajuste os detalhes da especificação e escolha o provider de IA.</p>
        </div>
      </div>

      {availableProviders.length > 0 ? (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
          <h4 className="font-semibold text-indigo-900 mb-3">Provider de IA</h4>
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
                  <Badge variant="outline" className="text-xs ml-2">
                    {provider.defaultModel}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </div>
      ) : (
        <Alert variant="destructive">
          Nenhum provider configurado. Configure um provider de IA para gerar especificações.
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-start justify-between space-x-3">
          <div>
            <Label className="font-semibold text-gray-800">Incluir visão de arquitetura</Label>
            <p className="text-xs text-gray-500">Diagramas lógicos, camadas e componentes técnicos.</p>
          </div>
          <Switch
            checked={preferences.includeArchitecture}
            onCheckedChange={(value) => setPreferences(prev => ({ ...prev, includeArchitecture: Boolean(value) }))}
          />
        </div>
        <div className="flex items-start justify-between space-x-3">
          <div>
            <Label className="font-semibold text-gray-800">Dicionário de dados</Label>
            <p className="text-xs text-gray-500">Detalhamento das tabelas, campos e estruturas envolvidas.</p>
          </div>
          <Switch
            checked={preferences.includeDataDictionary}
            onCheckedChange={(value) => setPreferences(prev => ({ ...prev, includeDataDictionary: Boolean(value) }))}
          />
        </div>
        <div className="flex items-start justify-between space-x-3">
          <div>
            <Label className="font-semibold text-gray-800">Plano de testes</Label>
            <p className="text-xs text-gray-500">Cenários de testes, critérios de aceite e validações.</p>
          </div>
          <Switch
            checked={preferences.includeTestPlan}
            onCheckedChange={(value) => setPreferences(prev => ({ ...prev, includeTestPlan: Boolean(value) }))}
          />
        </div>
        <div className="flex items-start justify-between space-x-3">
          <div>
            <Label className="font-semibold text-gray-800">Roadmap de implementação</Label>
            <p className="text-xs text-gray-500">Cronograma macro, fases, entregáveis e responsabilidades.</p>
          </div>
          <Switch
            checked={preferences.includeImplementationRoadmap}
            onCheckedChange={(value) => setPreferences(prev => ({ ...prev, includeImplementationRoadmap: Boolean(value) }))}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleGenerate} disabled={availableProviders.length === 0}>
          <Sparkles className="w-4 h-4 mr-2" />
          Gerar Especificação
        </Button>
      </div>
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 'template':
        return renderTemplateStep();
      case 'context':
        return (
          <SpecificationContextForm
            projectName={projectName}
            projectType={projectType}
            summary={summary}
            context={context}
            onProjectNameChange={setProjectName}
            onProjectTypeChange={setProjectType}
            onSummaryChange={setSummary}
            onContextChange={setContext}
            onNext={() => setCurrentStep('configure')}
            onBack={SPECIFICATION_TEMPLATES.length > 0 ? () => setCurrentStep('template') : undefined}
          />
        );
      case 'configure':
        return renderConfigureStep();
      case 'generating':
        return (
          <GenerationProgress
            isGenerating={isGenerating}
            provider={providerPreference || availableProviders[0]?.type}
            model={availableProviders.find(p => p.type === providerPreference)?.defaultModel}
          />
        );
      case 'result':
        return (
          generationResult && (
            <SpecificationViewer
              projectName={projectName}
              projectType={projectType}
              summary={summary}
              context={context}
              preferences={preferences}
              result={generationResult}
              onSave={handleSaveSpecification}
              onClose={() => setCurrentStep('context')}
            />
          )
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="max-w-5xl mx-auto">
        {renderStep()}
      </div>

      <GuardBlockModal
        isOpen={isGuardModalOpen}
        onClose={() => setIsGuardModalOpen(false)}
        message={guardMessage}
      />
    </>
  );
}
