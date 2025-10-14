// components/specifications/RecentSpecifications.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Download, Eye, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/Modal';
import { ProjectSpecification } from '@/types/specifications';
import { generateSpecificationPdf } from '@/lib/utils/specificationPdf';
import { SpecificationProcessor } from '@/lib/utils/specificationProcessor';

interface RecentSpecificationsProps {
  refreshKey?: number;
}

export function RecentSpecifications({ refreshKey }: RecentSpecificationsProps) {
  const [specifications, setSpecifications] = useState<ProjectSpecification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSpecification, setSelectedSpecification] = useState<ProjectSpecification | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadSpecifications();
  }, [refreshKey]);

  const loadSpecifications = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/specifications/recent', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setSpecifications(data.specifications || []);
      }
    } catch (error) {
      console.error('Erro ao carregar especificações:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewSpecification = (spec: ProjectSpecification) => {
    setSelectedSpecification(spec);
    setIsModalOpen(true);
  };

  const handleDownloadSpecification = (spec: ProjectSpecification) => {
    const pdfBytes = generateSpecificationPdf({
      title: spec.projectName,
      projectType: spec.projectType,
      summary: spec.summary,
      specification: SpecificationProcessor.cleanResponse(spec.specification),
      context: spec.context,
      preferences: spec.preferences,
      metadata: spec.metadata,
    });

    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${spec.projectName.replace(/\s+/g, '_')}_especificacao.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (value?: string) => {
    if (!value) return '';
    return new Date(value).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="border border-gray-200 bg-white rounded-xl p-4 flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-48 animate-pulse" />
              <div className="h-3 bg-gray-100 rounded w-72 animate-pulse" />
            </div>
            <Loader2 className="w-5 h-5 text-gray-300 animate-spin" />
          </div>
        ))}
      </div>
    );
  }

  if (specifications.length === 0) {
    return (
      <div className="text-center py-12 bg-white border border-dashed border-gray-300 rounded-xl">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <FileText className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Nenhuma especificação encontrada</h3>
        <p className="text-sm text-gray-500">
          Gere sua primeira especificação para visualizá-la aqui.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {specifications.map((spec, index) => (
          <motion.div
            key={spec.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow"
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between md:space-x-4">
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-lg font-semibold text-gray-900">{spec.projectName}</h4>
                  {spec.projectType && (
                    <Badge variant="outline" className="text-xs">
                      {spec.projectType}
                    </Badge>
                  )}
                  {spec.metadata?.provider && (
                    <Badge variant="secondary" className="text-xs">
                      {spec.metadata.provider}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{spec.summary}</p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(spec.createdAt)}
                  </span>
                  {spec.metadata?.tokensUsed && (
                    <span>{spec.metadata.tokensUsed.toLocaleString('pt-BR')} tokens</span>
                  )}
                  {spec.isPublic && <Badge variant="outline" className="text-xs">Pública</Badge>}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 md:mt-0">
                <Button variant="ghost" size="sm" onClick={() => handleViewSpecification(spec)}>
                  <Eye className="w-4 h-4 mr-1" />
                  Visualizar
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDownloadSpecification(spec)}>
                  <Download className="w-4 h-4 mr-1" />
                  PDF
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedSpecification?.projectName || 'Especificação'}
        size="2xl"
      >
        <div className="space-y-4">
          {selectedSpecification && (
            <>
              <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                {selectedSpecification.projectType && (
                  <Badge variant="outline" className="text-xs">
                    {selectedSpecification.projectType}
                  </Badge>
                )}
                {selectedSpecification.metadata?.provider && (
                  <Badge variant="outline" className="text-xs">
                    Provider: {selectedSpecification.metadata.provider}
                  </Badge>
                )}
                {selectedSpecification.metadata?.model && (
                  <Badge variant="outline" className="text-xs">
                    Modelo: {selectedSpecification.metadata.model}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{selectedSpecification.summary}</p>
              <div className="max-h-[480px] overflow-y-auto bg-gray-50 border border-gray-200 rounded-lg p-4">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans leading-relaxed">
                  {SpecificationProcessor.cleanResponse(selectedSpecification.specification)}
                </pre>
              </div>
            </>
          )}
        </div>
      </Modal>
    </>
  );
}
