// components/programs/ProgramContext.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Plus, X } from 'lucide-react';

interface ProgramContextProps {
  programName: string;
  description: string;
  programContext: {
    tables?: string[];
    businessRules?: string[];
    modules?: string[];
    parameters?: Record<string, any>;
    customLogic?: string;
  };
  onProgramNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
  onContextChange: (context: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export function ProgramContext({
  programName,
  description,
  programContext,
  onProgramNameChange,
  onDescriptionChange,
  onContextChange,
  onNext,
  onBack
}: ProgramContextProps) {
  const [newTable, setNewTable] = useState('');
  const [newRule, setNewRule] = useState('');
  const [newModule, setNewModule] = useState('');
  const [customLogic, setCustomLogic] = useState(programContext.customLogic || '');

  const tables = programContext.tables || [];
  const businessRules = programContext.businessRules || [];
  const modules = programContext.modules || [];

  const handleAddTable = () => {
    if (newTable.trim()) {
      const updatedTables = [...tables, newTable.trim().toUpperCase()];
      onContextChange({
        ...programContext,
        tables: updatedTables
      });
      setNewTable('');
    }
  };

  const handleRemoveTable = (index: number) => {
    const updatedTables = tables.filter((_, i) => i !== index);
    onContextChange({
      ...programContext,
      tables: updatedTables
    });
  };

  const handleAddRule = () => {
    if (newRule.trim()) {
      const updatedRules = [...businessRules, newRule.trim()];
      onContextChange({
        ...programContext,
        businessRules: updatedRules
      });
      setNewRule('');
    }
  };

  const handleRemoveRule = (index: number) => {
    const updatedRules = businessRules.filter((_, i) => i !== index);
    onContextChange({
      ...programContext,
      businessRules: updatedRules
    });
  };

  const handleAddModule = () => {
    if (newModule.trim()) {
      const updatedModules = [...modules, newModule.trim()];
      onContextChange({
        ...programContext,
        modules: updatedModules
      });
      setNewModule('');
    }
  };

  const handleRemoveModule = (index: number) => {
    const updatedModules = modules.filter((_, i) => i !== index);
    onContextChange({
      ...programContext,
      modules: updatedModules
    });
  };

  const handleCustomLogicChange = (value: string) => {
    setCustomLogic(value);
    onContextChange({
      ...programContext,
      customLogic: value
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Contexto do Programa
          </h3>
          <p className="text-sm text-gray-600">
            Defina os detalhes específicos do seu programa ABAP
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field
          label="Nome do Programa"
          value={programName}
          onChange={(e) => onProgramNameChange(e.target.value)}
          placeholder="ZPROGRAM_001"
          description="Nome deve seguir convenções SAP (Z* ou Y*)"
          required
        />
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descrição *
          </label>
          <Textarea
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Descreva o propósito e funcionalidade do programa..."
            rows={3}
            className="w-full"
          />
        </div>
      </div>

      {/* Tables Section */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-4">Tabelas SAP</h4>
        
        <div className="flex space-x-2 mb-4">
          <Field
                      value={newTable}
                      onChange={(e) => setNewTable(e.target.value)}
                      placeholder="Ex: VBAK, VBAP, KNA1..."
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTable()}
                      className="flex-1" label={''}          />
          <Button onClick={handleAddTable} size="sm">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        {tables.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tables.map((table, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="flex items-center space-x-1"
              >
                <span>{table}</span>
                <X 
                  className="w-3 h-3 cursor-pointer hover:text-red-500" 
                  onClick={() => handleRemoveTable(index)}
                />
              </Badge>
            ))}
          </div>
        )}
        
        <p className="text-xs text-gray-500 mt-2">
          Adicione as tabelas SAP que o programa irá utilizar
        </p>
      </div>

      {/* Business Rules Section */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-4">Regras de Negócio</h4>
        
        <div className="flex space-x-2 mb-4">
          <Textarea
            value={newRule}
            onChange={(e) => setNewRule(e.target.value)}
            placeholder="Ex: Validar se cliente está ativo antes de processar pedido"
            rows={2}
            className="flex-1"
          />
          <Button onClick={handleAddRule} size="sm" className="self-start mt-1">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        {businessRules.length > 0 && (
          <div className="space-y-2">
            {businessRules.map((rule, index) => (
              <div 
                key={index} 
                className="flex items-start justify-between bg-white p-3 rounded border"
              >
                <span className="text-sm flex-1">{rule}</span>
                <X 
                  className="w-4 h-4 cursor-pointer hover:text-red-500 ml-2 flex-shrink-0" 
                  onClick={() => handleRemoveRule(index)}
                />
              </div>
            ))}
          </div>
        )}
        
        <p className="text-xs text-gray-500 mt-2">
          Descreva as regras de negócio que o programa deve implementar
        </p>
      </div>

      {/* Modules/Functions Section */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-4">Módulos/Funções a Utilizar</h4>
        
        <div className="flex space-x-2 mb-4">
          <Field
                      value={newModule}
                      onChange={(e) => setNewModule(e.target.value)}
                      placeholder="Ex: CONVERSION_EXIT_ALPHA_INPUT, POPUP_TO_CONFIRM..."
                      onKeyPress={(e) => e.key === 'Enter' && handleAddModule()}
                      className="flex-1" label={''}          />
          <Button onClick={handleAddModule} size="sm">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        {modules.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {modules.map((module, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="flex items-center space-x-1"
              >
                <span>{module}</span>
                <X 
                  className="w-3 h-3 cursor-pointer hover:text-red-500" 
                  onClick={() => handleRemoveModule(index)}
                />
              </Badge>
            ))}
          </div>
        )}
        
        <p className="text-xs text-gray-500 mt-2">
          Funções SAP, BAPIs ou módulos específicos que devem ser utilizados
        </p>
      </div>

      {/* Custom Logic Section */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-4">Lógica Específica</h4>
        <Textarea
          value={customLogic}
          onChange={(e) => handleCustomLogicChange(e.target.value)}
          placeholder="Descreva qualquer lógica específica, algoritmos especiais, validações customizadas ou comportamentos únicos que o programa deve ter..."
          rows={4}
          className="w-full"
        />
        <p className="text-xs text-gray-500 mt-2">
          Adicione detalhes sobre processamentos especiais, cálculos customizados ou qualquer lógica específica
        </p>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="secondary" onClick={onBack}>
          Voltar
        </Button>
        <Button 
          onClick={onNext}
          disabled={!programName.trim() || !description.trim()}
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}