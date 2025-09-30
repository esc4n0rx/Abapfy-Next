// components/specifications/SpecificationContextForm.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Plus, X } from 'lucide-react';
import { ProjectSpecificationContext } from '@/types/specifications';

interface SpecificationContextFormProps {
  projectName: string;
  projectType: string;
  summary: string;
  context: ProjectSpecificationContext;
  onProjectNameChange: (value: string) => void;
  onProjectTypeChange: (value: string) => void;
  onSummaryChange: (value: string) => void;
  onContextChange: (context: ProjectSpecificationContext) => void;
  onNext: () => void;
  onBack?: () => void;
}

const SECTION_CONFIG: Array<{
  key: keyof ProjectSpecificationContext;
  title: string;
  placeholder: string;
  helper?: string;
}> = [
  {
    key: 'objectives',
    title: 'Objetivos do Projeto',
    placeholder: 'Ex: Automatizar a geração de faturas semanais para o módulo FI'
  },
  {
    key: 'businessRules',
    title: 'Regras de Negócio',
    placeholder: 'Ex: Clientes VIP recebem validação extra de crédito'
  },
  {
    key: 'tables',
    title: 'Tabelas SAP Relacionadas',
    placeholder: 'Ex: VBAK, VBAP, KNA1'
  },
  {
    key: 'flows',
    title: 'Fluxos / Processos Envolvidos',
    placeholder: 'Ex: Pedido -> Faturamento -> Contabilização'
  },
  {
    key: 'integrations',
    title: 'Integrações Necessárias',
    placeholder: 'Ex: Integração com Salesforce via IDoc ORDERS05'
  },
  {
    key: 'stakeholders',
    title: 'Stakeholders / Áreas Envolvidas',
    placeholder: 'Ex: Time de Vendas, Controladoria, TI Corporativa'
  },
  {
    key: 'technicalStack',
    title: 'Componentes Técnicos / Stack',
    placeholder: 'Ex: SAP S/4HANA, Fiori Elements, CDS Views'
  },
  {
    key: 'nonFunctionalRequirements',
    title: 'Requisitos Não Funcionais',
    placeholder: 'Ex: Disponibilidade 24x7, tempo de resposta < 2s'
  },
  {
    key: 'constraints',
    title: 'Premissas e Restrições',
    placeholder: 'Ex: Deve reutilizar RFC existente, sem alteração em tabela padrão'
  },
  {
    key: 'deliveryPhases',
    title: 'Fases de Entrega',
    placeholder: 'Ex: Descoberta -> Blueprint -> Construção -> Homologação -> Go-live'
  },
  {
    key: 'acceptanceCriteria',
    title: 'Critérios de Aceite',
    placeholder: 'Ex: Processar 10k registros em até 5 minutos sem erros'
  },
];

export function SpecificationContextForm({
  projectName,
  projectType,
  summary,
  context,
  onProjectNameChange,
  onProjectTypeChange,
  onSummaryChange,
  onContextChange,
  onNext,
  onBack,
}: SpecificationContextFormProps) {
  const [newEntries, setNewEntries] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState(context.additionalNotes || '');

  const handleAddItem = (key: keyof ProjectSpecificationContext) => {
    const value = (newEntries[key as string] || '').trim();
    if (!value) return;

    const current = context[key] || [];
    const updated = Array.from(new Set([...(current as string[]), value]));
    onContextChange({
      ...context,
      [key]: updated,
    });
    setNewEntries(prev => ({ ...prev, [key as string]: '' }));
  };

  const handleRemoveItem = (key: keyof ProjectSpecificationContext, index: number) => {
    const current = context[key] || [];
    const updated = (current as string[]).filter((_, i) => i !== index);
    onContextChange({
      ...context,
      [key]: updated,
    });
  };

  const renderSection = (config: typeof SECTION_CONFIG[number]) => {
    const values = (context[config.key] || []) as string[];
    const inputValue = newEntries[config.key as string] || '';

    return (
      <div key={config.key as string} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <div>
          <h4 className="font-semibold text-gray-900">{config.title}</h4>
          {config.helper && (
            <p className="text-sm text-gray-500 mt-1">{config.helper}</p>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:space-x-2 space-y-2 md:space-y-0">
          <Field
            label=""
            value={inputValue}
            onChange={(e) => setNewEntries(prev => ({ ...prev, [config.key as string]: e.target.value }))}
            placeholder={config.placeholder}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddItem(config.key);
              }
            }}
            className="flex-1"
          />
          <Button size="sm" onClick={() => handleAddItem(config.key)}>
            <Plus className="w-4 h-4 mr-1" />
            Adicionar
          </Button>
        </div>

        {values.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {values.map((value, index) => (
              <Badge
                key={`${config.key}-${index}-${value}`}
                variant="secondary"
                className="flex items-center space-x-1"
              >
                <span>{value}</span>
                <X
                  className="w-3 h-3 cursor-pointer hover:text-red-500"
                  onClick={() => handleRemoveItem(config.key, index)}
                />
              </Badge>
            ))}
          </div>
        )}
      </div>
    );
  };

  const handleNext = () => {
    onContextChange({
      ...context,
      additionalNotes: notes.trim() || undefined,
    });
    onNext();
  };

  const canProceed = projectName.trim() && summary.trim();

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
        )}
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Contexto do Projeto</h3>
          <p className="text-sm text-gray-600">
            Forneça o máximo de detalhes para gerar uma especificação completa e assertiva.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white border border-gray-200 rounded-xl p-4">
        <Field
          label="Nome do Projeto"
          value={projectName}
          onChange={(e) => onProjectNameChange(e.target.value)}
          placeholder="ZPROJ_GERACAO_FATURAS"
          required
        />
        <Field
          label="Tipo ou Área do Projeto"
          value={projectType}
          onChange={(e) => onProjectTypeChange(e.target.value)}
          placeholder="Relatório ALV, Integração IDoc, Workflow, Fiori"
        />
        <div className="md:col-span-2">
          <Textarea
            label="Resumo Executivo"
            value={summary}
            onChange={(e) => onSummaryChange(e.target.value)}
            placeholder="Descreva o objetivo principal, público e resultado esperado deste projeto."
            rows={4}
            required
          />
        </div>
      </div>

      <div className="space-y-4">
        {SECTION_CONFIG.map(renderSection)}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <Textarea
          label="Observações Adicionais (opcional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Premissas, restrições específicas, considerações de segurança ou auditoria..."
          rows={4}
        />
      </div>

      <div className="flex justify-end">
        <Button onClick={handleNext} disabled={!canProceed}>
          Avançar para Preferências
        </Button>
      </div>
    </div>
  );
}
