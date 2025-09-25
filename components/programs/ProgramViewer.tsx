// components/programs/ProgramViewer.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Download, Save, Eye, EyeOff } from 'lucide-react';

interface ProgramViewerProps {
  program: {
    name: string;
    type: string;
    description: string;
    code: string;
    metadata: {
      provider: string;
      model: string;
      tokensUsed: number;
      generatedAt: string;
    };
  };
  onSave: (isPublic: boolean) => void;
  onClose: () => void;
}

export function ProgramViewer({ program, onSave, onClose }: ProgramViewerProps) {
  const [isPublic, setIsPublic] = useState(false);
  const [showMetadata, setShowMetadata] = useState(true);

  const handleDownload = () => {
    const blob = new Blob([program.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${program.name}.abap`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'groq': return '⚡';
      case 'arcee': return '💎';
      default: return '🤖';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Programa Gerado com Sucesso!
          </h3>
          <p className="text-gray-600 mt-1">
            Seu programa ABAP está pronto para uso
          </p>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setShowMetadata(!showMetadata)}
        >
          {showMetadata ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </Button>
      </div>

      {/* Program Info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <span className="font-medium text-gray-700">Nome:</span>
            <span className="ml-2">{program.name}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Tipo:</span>
            <span className="ml-2">{program.type}</span>
          </div>
        </div>
        <div>
          <span className="font-medium text-gray-700">Descrição:</span>
          <p className="text-gray-600 mt-1">{program.description}</p>
        </div>
      </div>

      {/* Metadata */}
      {showMetadata && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-3">Metadados da Geração</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-blue-800">Provider:</span>
              <span className="ml-2 text-blue-700">
                {getProviderIcon(program.metadata.provider)} {program.metadata.provider}
              </span>
            </div>
            <div>
              <span className="font-medium text-blue-800">Modelo:</span>
              <span className="ml-2 text-blue-700">{program.metadata.model}</span>
            </div>
            <div>
              <span className="font-medium text-blue-800">Tokens:</span>
              <span className="ml-2 text-blue-700">
                {program.metadata.tokensUsed?.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="font-medium text-blue-800">Gerado em:</span>
              <span className="ml-2 text-blue-700">
                {formatDate(program.metadata.generatedAt)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Code Display */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900">Código ABAP Gerado</h4>
          <Button 
            variant="secondary" 
            size="sm"
            onClick={handleDownload}
          >
            <Download className="w-4 h-4 mr-2" />
            Download .abap
          </Button>
        </div>
        
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono whitespace-pre-wrap max-h-96 min-h-64">
          {program.code}
        </pre>
      </div>

      {/* Public Toggle */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">Visibilidade do Programa</h4>
            <p className="text-sm text-gray-600">
              Programas públicos podem ser vistos por outros usuários da plataforma
            </p>
          </div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:border-blue-500 focus:ring-blue-500"
            />
            <span className="text-sm font-medium">
              {isPublic ? 'Público' : 'Privado'}
            </span>
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="secondary" onClick={onClose}>
          Fechar sem Salvar
        </Button>
        <div className="flex space-x-3">
          <Button 
            variant="secondary"
            onClick={handleDownload}
          >
            <Download className="w-4 h-4 mr-2" />
            Apenas Download
          </Button>
          <Button onClick={() => onSave(isPublic)}>
            <Save className="w-4 h-4 mr-2" />
            Salvar Programa
          </Button>
        </div>
      </div>
    </div>
  );
}