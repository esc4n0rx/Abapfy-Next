// components/programs/ProgramSpecUpload.tsx
'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/alert';
import { ChevronLeft, Upload, FileText, CheckCircle } from 'lucide-react';

interface ExtractedData {
  name?: string;
  description?: string;
  type?: string;
  context?: {
    tables?: string[];
    businessRules?: string[];
    modules?: string[];
    customLogic?: string;
  };
}

interface ProgramSpecUploadProps {
  onSpecificationLoaded: (specification: string, extractedData: ExtractedData) => void;
  onBack: () => void;
}

export function ProgramSpecUpload({ onSpecificationLoaded, onBack }: ProgramSpecUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [specification, setSpecification] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData>({});

  const extractDataFromSpec = (content: string): ExtractedData => {
    const extracted: ExtractedData = {
      context: {
        tables: [],
        businessRules: [],
        modules: [],
        customLogic: ''
      }
    };

    // Extract program name
    const nameMatch = content.match(/(?:nome|program|programa):\s*([A-Z0-9_]+)/i);
    if (nameMatch) {
      extracted.name = nameMatch[1].toUpperCase();
    }

    // Extract description
    const descMatch = content.match(/(?:descrição|description|objetivo):\s*(.+?)(?:\n|$)/i);
    if (descMatch) {
      extracted.description = descMatch[1].trim();
    }

    // Extract type
    const typeMatch = content.match(/(?:tipo|type):\s*(report|module_pool|function_group|executable|class_pool|interface_pool|transaction)/i);
    if (typeMatch) {
      extracted.type = typeMatch[1].toLowerCase();
    }

    // Extract tables
    const tablesSection = content.match(/(?:tabelas|tables):\s*((?:[A-Z0-9_,\s]+(?:\n|$))+)/i);
    if (tablesSection) {
      const tables = tablesSection[1]
        .split(/[,\n]/)
        .map(t => t.trim().toUpperCase())
        .filter(t => t && t.match(/^[A-Z0-9_]+$/));
      extracted.context!.tables = Array.from(new Set(tables));
    }

    // Extract business rules
    const rulesSection = content.match(/(?:regras|rules|business rules):\s*((?:.+?(?:\n|$))+)/i);
    if (rulesSection) {
      const rules = rulesSection[1]
        .split(/\n/)
        .map(r => r.trim().replace(/^[-*]\s*/, ''))
        .filter(r => r && r.length > 5);
      extracted.context!.businessRules = rules;
    }

    // Extract modules/functions
    const modulesSection = content.match(/(?:módulos|modules|functions|funções):\s*((?:[A-Z0-9_,\s]+(?:\n|$))+)/i);
    if (modulesSection) {
      const modules = modulesSection[1]
        .split(/[,\n]/)
        .map(m => m.trim())
        .filter(m => m && m.match(/^[A-Z0-9_]+$/));
      extracted.context!.modules = Array.from(new Set(modules));
    }

    // Extract custom logic
    const logicSection = content.match(/(?:lógica|logic|processamento|processing):\s*((?:.|\n)*?)(?:(?:\n\s*[A-Z][^:]*:)|$)/i);
    if (logicSection) {
      extracted.context!.customLogic = logicSection[1].trim();
    }

    return extracted;
  };

  const handleFileUpload = useCallback((file: File) => {
    if (!file.name.toLowerCase().endsWith('.txt')) {
      alert('Por favor, selecione apenas arquivos .txt');
      return;
    }

    if (file.size > 1024 * 1024) { // 1MB limit
      alert('Arquivo muito grande. Máximo: 1MB');
      return;
    }

    setUploadedFile(file);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setSpecification(content);
      
      const extracted = extractDataFromSpec(content);
      setExtractedData(extracted);
      setIsProcessing(false);
    };

    reader.onerror = () => {
      alert('Erro ao ler o arquivo');
      setIsProcessing(false);
    };

    reader.readAsText(file, 'UTF-8');
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleContinue = () => {
    if (specification) {
      onSpecificationLoaded(specification, extractedData);
    }
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
            Upload de Especificação
          </h3>
          <p className="text-sm text-gray-600">
            Carregue um arquivo .txt com a especificação completa do programa
          </p>
        </div>
      </div>

      {/* Upload Area */}
      {!uploadedFile && (
        <div
          className={`
            border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
            ${isDragging 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 bg-gray-50 hover:border-gray-400'
            }
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            Arraste e solte seu arquivo aqui
          </h4>
          <p className="text-gray-600 mb-4">
            ou clique para selecionar um arquivo .txt
          </p>
          
          <input
            type="file"
            accept=".txt"
            onChange={handleFileInputChange}
            className="hidden"
            id="file-upload"
          />
          
          <label htmlFor="file-upload">
            <span>
              <Button variant="secondary">
                <FileText className="w-4 h-4 mr-2" />
                Selecionar Arquivo
              </Button>
            </span>
          </label>
          
          <p className="text-xs text-gray-500 mt-4">
            Formatos aceitos: .txt (máximo 1MB)
          </p>
        </div>
      )}

      {/* Processing */}
      {isProcessing && (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Processando especificação...</p>
        </div>
      )}

      {/* File Uploaded Successfully */}
      {uploadedFile && !isProcessing && (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <h4 className="font-semibold text-green-900">
                  Arquivo carregado com sucesso!
                </h4>
                <p className="text-sm text-green-700">
                  {uploadedFile.name} ({Math.round(uploadedFile.size / 1024)} KB)
                </p>
              </div>
            </div>
          </div>

          {/* Extracted Data Preview */}
          {Object.keys(extractedData).length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-3">
                Dados Extraídos da Especificação
              </h4>
              <div className="space-y-2 text-sm">
                {extractedData.name && (
                  <div>
                    <span className="font-medium text-blue-800">Nome:</span>
                    <span className="ml-2 text-blue-700">{extractedData.name}</span>
                  </div>
                )}
                {extractedData.type && (
                  <div>
                    <span className="font-medium text-blue-800">Tipo:</span>
                    <span className="ml-2 text-blue-700">{extractedData.type}</span>
                  </div>
                )}
                {extractedData.description && (
                  <div>
                    <span className="font-medium text-blue-800">Descrição:</span>
                    <span className="ml-2 text-blue-700">{extractedData.description}</span>
                  </div>
                )}
                {extractedData.context?.tables && extractedData.context.tables.length > 0 && (
                  <div>
                    <span className="font-medium text-blue-800">Tabelas:</span>
                    <span className="ml-2 text-blue-700">
                      {extractedData.context.tables.join(', ')}
                    </span>
                  </div>
                )}
                {extractedData.context?.businessRules && extractedData.context.businessRules.length > 0 && (
                  <div>
                    <span className="font-medium text-blue-800">Regras:</span>
                    <span className="ml-2 text-blue-700">
                      {extractedData.context.businessRules.length} regra(s) identificada(s)
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Specification Preview */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">
              Prévia da Especificação
            </h4>
            <pre className="text-sm text-gray-700 max-h-64 overflow-y-auto whitespace-pre-wrap bg-white p-3 rounded border">
              {specification}
            </pre>
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <Button 
              variant="secondary" 
              onClick={() => {
                setUploadedFile(null);
                setSpecification('');
                setExtractedData({});
              }}
            >
              Carregar Outro Arquivo
            </Button>
            <Button onClick={handleContinue}>
              Continuar com Esta Especificação
            </Button>
          </div>
        </div>
      )}

      {/* Example Format */}
      <Alert>
        <FileText className="w-4 h-4" />
        <div>
          <h4 className="font-semibold mb-2">Formato de Especificação Sugerido:</h4>
          <pre className="text-xs bg-gray-100 p-2 rounded whitespace-pre-wrap">
{`Nome: ZRELATORIO_VENDAS
Tipo: report  
Descrição: Relatório de vendas mensais com filtros por região

Tabelas: VBAK, VBAP, KNA1, T001W

Regras:
- Mostrar apenas vendas dos últimos 12 meses
- Filtrar por região selecionada pelo usuário  
- Calcular total por mês e região
- Exibir em formato ALV com opção de download

Módulos: REUSE_ALV_GRID_DISPLAY

Lógica:
Criar tela de seleção com parâmetros de data e região.
Realizar JOIN otimizado entre as tabelas.
Processar dados em lote para performance.
Gerar saída em ALV Grid com subtotais.`}
          </pre>
        </div>
      </Alert>
    </div>
  );
}