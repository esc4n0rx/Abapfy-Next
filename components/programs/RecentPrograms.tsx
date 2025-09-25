// components/programs/RecentPrograms.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/Modal';
import { 
  Code, 
  Download, 
  Trash2, 
  Eye, 
  Calendar,
  FileText,
  ExternalLink
} from 'lucide-react';
import { ABAPProgram } from '@/types/programs';

export function RecentPrograms() {
  const [programs, setPrograms] = useState<ABAPProgram[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProgram, setSelectedProgram] = useState<ABAPProgram | null>(null);

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    try {
      const response = await fetch('/api/programs', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setPrograms(data.programs || []);
      }
    } catch (error) {
      console.error('Error loading programs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewProgram = (program: ABAPProgram) => {
    setSelectedProgram(program);
  };

  const handleDownloadProgram = (program: ABAPProgram) => {
    const blob = new Blob([program.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${program.name}.abap`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteProgram = async (programId: string) => {
    if (!confirm('Tem certeza que deseja excluir este programa?')) return;

    try {
      const response = await fetch(`/api/programs/${programId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setPrograms(prev => prev.filter(p => p.id !== programId));
      } else {
        alert('Erro ao excluir programa');
      }
    } catch (error) {
      alert('Erro ao excluir programa');
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'groq': return '⚡';
      case 'arcee': return '💎';
      default: return '🤖';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'report': return '📊';
      case 'module_pool': return '🖥️';
      case 'function_group': return '⚙️';
      case 'executable_program': return '⚡';
      case 'class_pool': return '🏗️';
      case 'interface_pool': return '🔌';
      case 'transaction_program': return '🔄';
      default: return '📄';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'report': return 'Report';
      case 'module_pool': return 'Module Pool';
      case 'function_group': return 'Function Group';
      case 'executable_program': return 'Executable';
      case 'class_pool': return 'Class Pool';
      case 'interface_pool': return 'Interface Pool';
      case 'transaction_program': return 'Transaction';
      default: return type;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
              <div className="flex space-x-2">
                <div className="w-8 h-8 bg-gray-300 rounded"></div>
                <div className="w-8 h-8 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (programs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
          <Code className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhum programa encontrado
        </h3>
        <p className="text-gray-600">
          Você ainda não criou nenhum programa. Comece gerando seu primeiro programa ABAP!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {programs.map((program) => (
          <div
            key={program.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="text-2xl">{getTypeIcon(program.type)}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-semibold text-gray-900 truncate">
                      {program.name}
                    </h4>
                    <p className="text-sm text-gray-600 truncate">
                      {program.description}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(program.createdAt)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>{getProviderIcon(program.metadata.provider)}</span>
                    <span>{program.metadata.provider}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {getTypeLabel(program.type)}
                  </Badge>
                  {program.isPublic && (
                    <Badge variant="default" className="text-xs bg-blue-100 text-blue-800">
                      Público
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewProgram(program)}
                  title="Visualizar programa"
                >
                  <Eye className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownloadProgram(program)}
                  title="Download do código"
                >
                  <Download className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteProgram(program.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="Excluir programa"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Program Viewer Modal */}
      <Modal
        isOpen={!!selectedProgram}
        onClose={() => setSelectedProgram(null)}
        title={selectedProgram?.name || 'Programa ABAP'}
        size="2xl"
      >
        {selectedProgram && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Tipo:</span>
                  <span className="ml-2">{getTypeLabel(selectedProgram.type)}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Criado:</span>
                  <span className="ml-2">{formatDate(selectedProgram.createdAt)}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Provider:</span>
                  <span className="ml-2">
                    {getProviderIcon(selectedProgram.metadata.provider)} {selectedProgram.metadata.provider}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Tokens:</span>
                  <span className="ml-2">{selectedProgram.metadata.tokensUsed?.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Descrição</h4>
              <p className="text-sm text-gray-600">{selectedProgram.description}</p>
            </div>
            
            {/* Context Information */}
            {selectedProgram.programContext && (
              <div className="space-y-3">
                {selectedProgram.programContext.tables && selectedProgram.programContext.tables.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Tabelas Utilizadas</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedProgram.programContext.tables.map((table, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {table}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedProgram.programContext.businessRules && selectedProgram.programContext.businessRules.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Regras de Negócio</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {selectedProgram.programContext.businessRules.map((rule, idx) => (
                        <li key={idx}>{rule}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">Código ABAP</h4>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDownloadProgram(selectedProgram)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono whitespace-pre-wrap max-h-96">
                {selectedProgram.code}
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}