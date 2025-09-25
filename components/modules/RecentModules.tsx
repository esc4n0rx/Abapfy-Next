// components/modules/RecentModules.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Code, Eye, Download, Trash2, Calendar, Zap, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/Modal';
import { ABAPModule } from '@/types/modules';

interface RecentModulesProps {
  onModuleSelect?: (module: ABAPModule) => void;
}

export function RecentModules({ onModuleSelect }: RecentModulesProps) {
  const [modules, setModules] = useState<ABAPModule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState<ABAPModule | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);

  useEffect(() => {
    loadRecentModules();
  }, []);

  const loadRecentModules = async () => {
    try {
      const response = await fetch('/api/modules/recent', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setModules(data.modules || []);
      }
    } catch (error) {
      console.error('Error loading modules:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewModule = (module: ABAPModule) => {
    setSelectedModule(module);
    setShowViewModal(true);
    onModuleSelect?.(module);
  };

  const handleDownloadModule = (module: ABAPModule) => {
    const blob = new Blob([module.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${module.name}.abap`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Tem certeza que deseja excluir este módulo?')) return;

    try {
      const response = await fetch(`/api/modules/${moduleId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setModules(prev => prev.filter(m => m.id !== moduleId));
      } else {
        alert('Erro ao excluir módulo');
      }
    } catch (error) {
      alert('Erro ao excluir módulo');
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'groq': return '⚡';
      case 'arcee': return '💎';
      default: return '🤖';
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

  if (modules.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
          <Code className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhum módulo encontrado
        </h3>
        <p className="text-gray-600">
          Você ainda não criou nenhum módulo. Comece gerando seu primeiro módulo ABAP!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {modules.map((module, index) => (
          <motion.div
            key={module.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="font-medium text-gray-900 truncate">
                    {module.name}
                  </h4>
                  <Badge variant="outline" className="text-xs">
                    {module.type}
                  </Badge>
                  {module.metadata.provider && (
                    <Badge variant="default" className="text-xs">
                      {getProviderIcon(module.metadata.provider)} {module.metadata.provider}
                    </Badge>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {module.description}
                </p>
                
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(module.createdAt)}</span>
                  </div>
                  
                  {module.metadata.tokensUsed && (
                    <div className="flex items-center space-x-1">
                      <Zap className="w-3 h-3" />
                      <span>{module.metadata.tokensUsed.toLocaleString()} tokens</span>
                    </div>
                  )}
                  
                  {module.tags && module.tags.length > 0 && (
                    <div className="flex space-x-1">
                      {module.tags.slice(0, 2).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs px-1 py-0">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewModule(module)}
                  className="p-2"
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownloadModule(module)}
                  className="p-2"
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteModule(module.id)}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Module Viewer Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title={selectedModule?.name || 'Módulo ABAP'}
        size="xl"
      >
        {selectedModule && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Tipo:</span>
                  <span className="ml-2">{selectedModule.type}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Criado:</span>
                  <span className="ml-2">{formatDate(selectedModule.createdAt)}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Provider:</span>
                  <span className="ml-2">
                    {getProviderIcon(selectedModule.metadata.provider)} {selectedModule.metadata.provider}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Tokens:</span>
                  <span className="ml-2">{selectedModule.metadata.tokensUsed?.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Descrição</h4>
              <p className="text-sm text-gray-600">{selectedModule.description}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Código ABAP</h4>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono whitespace-pre-wrap max-h-96">
                {selectedModule.code}
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}