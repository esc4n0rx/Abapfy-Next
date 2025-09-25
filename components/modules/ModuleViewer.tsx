// components/modules/ModuleViewer.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Download, Save, Share, Eye, EyeOff, Code, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/Textarea';
import { Alert } from '@/components/ui/alert';
import { ModuleGenerationResult } from '@/types/modules';

interface ModuleViewerProps {
  result: ModuleGenerationResult;
  onSave?: (name: string, isPublic: boolean) => void;
  onClose?: () => void;
}

export function ModuleViewer({ result, onSave, onClose }: ModuleViewerProps) {
  const [showMetadata, setShowMetadata] = useState(false);
  const [moduleName, setModuleName] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleCopyCode = async () => {
    if (result.code) {
      await navigator.clipboard.writeText(result.code);
      // TODO: Add toast notification
    }
  };

  const handleDownload = () => {
    if (result.code) {
      const blob = new Blob([result.code], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${moduleName || 'abap_module'}.abap`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleSave = async () => {
    if (!moduleName.trim()) {
      alert('Por favor, insira um nome para o módulo');
      return;
    }

    setIsSaving(true);
    try {
      await onSave?.(moduleName, isPublic);
    } finally {
      setIsSaving(false);
    }
  };

  if (!result.success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <Alert variant="destructive">
          <strong>Erro na Geração:</strong> {result.error}
        </Alert>
        
        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Voltar
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header with metadata */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Code className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-green-900">
                Código Gerado com Sucesso!
              </h3>
              <p className="text-sm text-green-700">
                Seu módulo ABAP foi criado e está pronto para uso.
              </p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMetadata(!showMetadata)}
          >
            {showMetadata ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap gap-2">
          {result.provider && (
            <Badge variant="default">
              {result.provider === 'groq' ? '⚡ Groq' : '💎 Arcee'}
            </Badge>
          )}
          {result.model && (
            <Badge variant="outline">
              {result.model}
            </Badge>
          )}
          {result.tokensUsed && (
            <Badge variant="secondary">
              {result.tokensUsed.toLocaleString()} tokens
            </Badge>
          )}
          {result.estimatedCost && result.estimatedCost > 0 && (
            <Badge variant="default">
              ~${(result.estimatedCost / 100).toFixed(4)}
            </Badge>
          )}
        </div>

        {showMetadata && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 pt-4 border-t border-green-200"
          >
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-green-800">Provider:</span>
                <span className="ml-2 text-green-700">{result.provider}</span>
              </div>
              <div>
                <span className="font-medium text-green-800">Modelo:</span>
                <span className="ml-2 text-green-700">{result.model}</span>
              </div>
              <div>
                <span className="font-medium text-green-800">Tokens:</span>
                <span className="ml-2 text-green-700">{result.tokensUsed}</span>
              </div>
              <div>
                <span className="font-medium text-green-800">Custo:</span>
                <span className="ml-2 text-green-700">
                  {result.estimatedCost ? `$${(result.estimatedCost / 100).toFixed(4)}` : 'Gratuito'}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Save Module Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Salvar Módulo</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Módulo
            </label>
            <input
              type="text"
              value={moduleName}
              onChange={(e) => setModuleName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Z_MY_FUNCTION_MODULE"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Público</span>
            </label>
          </div>
        </div>
      </div>

      {/* Code Display */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">Código ABAP</h4>
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" onClick={handleCopyCode}>
                <Copy className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono whitespace-pre-wrap">
            {result.code}
          </pre>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="secondary" onClick={onClose}>
          Gerar Outro
        </Button>
        
        <div className="flex space-x-3">
          <Button variant="secondary">
            <Share className="w-4 h-4 mr-2" />
            Compartilhar
          </Button>
          <Button onClick={handleSave} loading={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            Salvar Módulo
          </Button>
        </div>
      </div>
    </motion.div>
  );
}