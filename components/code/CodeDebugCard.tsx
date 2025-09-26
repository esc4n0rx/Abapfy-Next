// components/code/CodeDebugCard.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Bug, FileSearch, X, Code, TrendingUp } from 'lucide-react';
import { RecentAnalyses } from './RecentAnalyses';
import { DebugFlow } from './DebugFlow';
import { CodeReviewFlow } from './CodeReviewFlow';
import { AnalysisResults } from './AnalysisResults';
import { CodeAnalysisResult } from '@/types/codeAnalysis';

export function CodeDebugCard() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'menu' | 'debug' | 'review' | 'analysis'>('menu');
  const [selectedAnalysis, setSelectedAnalysis] = useState<CodeAnalysisResult | null>(null);

  const handleSelectAnalysis = async (analysisId: string) => {
    try {
      const response = await fetch(`/api/code/analysis/${analysisId}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedAnalysis(data.analysis);
        setCurrentView('analysis');
      }
    } catch (error) {
      console.error('Erro ao carregar análise:', error);
    }
  };

  const handleBack = () => {
    if (currentView === 'analysis') {
      setSelectedAnalysis(null);
    }
    setCurrentView('menu');
  };

  const handleClose = () => {
    setIsOpen(false);
    setCurrentView('menu');
    setSelectedAnalysis(null);
  };

  return (
    <>
      {/* Main Card - Always Visible */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.3, 
          delay: 0.1,
          ease: "easeOut"
        }}
        whileHover={{ 
          scale: 1.02,
          y: -4,
          transition: { duration: 0.2 }
        }}
        whileTap={{ scale: 0.98 }}
        className="bg-card border border-border rounded-2xl p-8 shadow-card hover:shadow-card-hover cursor-pointer group transition-all duration-200"
        onClick={() => setIsOpen(true)}
      >
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-4 bg-gradient-to-br from-red-500/10 to-blue-500/10 rounded-2xl group-hover:from-red-500/15 group-hover:to-blue-500/15 transition-colors duration-200">
            <div className="relative">
              <Code className="w-12 h-12 text-blue-600" />
              <Bug className="w-6 h-6 text-red-500 absolute -top-1 -right-1" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-text group-hover:text-brand transition-colors duration-200">
              Análise de Código
            </h3>
            <p className="text-subtle text-sm leading-relaxed max-w-xs">
              Debug de problemas e review completo de qualidade com IA avançada
            </p>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Badge variant="outline" className="text-xs">
              <Bug className="w-3 h-3 mr-1" />
              Debug
            </Badge>
            <Badge variant="outline" className="text-xs">
              <FileSearch className="w-3 h-3 mr-1" />
              Review
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Modal/Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleClose();
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full max-w-4xl max-h-[90vh] overflow-hidden"
            >
              <Card className="bg-white border shadow-2xl">
                <CardContent className="p-0">
                  {/* Header */}
                  <div className="flex items-center justify-between p-6 border-b bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-br from-red-500/10 to-blue-500/10 rounded-lg">
                        <Code className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                          Análise de Código
                        </h2>
                        <p className="text-sm text-gray-600">
                          {currentView === 'menu' && 'Escolha o tipo de análise ou veja análises recentes'}
                          {currentView === 'debug' && 'Debug e resolução de problemas'}
                          {currentView === 'review' && 'Análise de qualidade e padrões'}
                          {currentView === 'analysis' && 'Resultado da análise'}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleClose}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Content */}
                  <div className="p-6 max-h-[calc(90vh-100px)] overflow-y-auto">
                    {currentView === 'menu' && (
                      <div className="space-y-6">
                        {/* Action Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="border-2 border-dashed border-red-200 rounded-xl p-6 hover:border-red-300 hover:bg-red-50/50 cursor-pointer transition-all duration-200"
                            onClick={() => setCurrentView('debug')}
                          >
                            <div className="text-center space-y-3">
                              <div className="p-3 bg-red-100 rounded-full w-fit mx-auto">
                                <Bug className="w-8 h-8 text-red-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 mb-1">
                                  Debug de Código
                                </h3>
                                <p className="text-sm text-gray-600">
                                  Identifique e resolva erros, problemas de lógica e performance
                                </p>
                              </div>
                              <div className="flex justify-center space-x-2">
                                <Badge variant="secondary" className="text-xs">
                                  Análise de Erro
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  Soluções IA
                                </Badge>
                              </div>
                            </div>
                          </motion.div>

                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="border-2 border-dashed border-blue-200 rounded-xl p-6 hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer transition-all duration-200"
                            onClick={() => setCurrentView('review')}
                          >
                            <div className="text-center space-y-3">
                              <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto">
                                <FileSearch className="w-8 h-8 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 mb-1">
                                  Code Review
                                </h3>
                                <p className="text-sm text-gray-600">
                                  Análise completa de qualidade, padrões e oportunidades de melhoria
                                </p>
                              </div>
                              <div className="flex justify-center space-x-2">
                                <Badge variant="secondary" className="text-xs">
                                  Pontuação
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  Relatório
                                </Badge>
                              </div>
                            </div>
                          </motion.div>
                        </div>

                        {/* Recent Analyses */}
                        <RecentAnalyses onSelectAnalysis={handleSelectAnalysis} />

                        {/* Quick Stats */}
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <TrendingUp className="w-5 h-5 text-blue-600" />
                              <div>
                                <h4 className="font-medium text-gray-900">Estatísticas</h4>
                                <p className="text-sm text-gray-600">
                                  Suas análises de código este mês
                                </p>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-center">
                              <div>
                                <div className="text-lg font-bold text-blue-600">12</div>
                                <div className="text-xs text-gray-600">Debugs</div>
                              </div>
                              <div>
                                <div className="text-lg font-bold text-green-600">8</div>
                                <div className="text-xs text-gray-600">Reviews</div>
                              </div>
                              <div>
                                <div className="text-lg font-bold text-purple-600">95%</div>
                                <div className="text-xs text-gray-600">Precisão</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {currentView === 'debug' && (
                      <DebugFlow onBack={handleBack} />
                    )}

                    {currentView === 'review' && (
                      <CodeReviewFlow onBack={handleBack} />
                    )}

                    {currentView === 'analysis' && selectedAnalysis && (
                      <AnalysisResults 
                        results={selectedAnalysis} 
                        onNewAnalysis={() => {
                          setCurrentView('menu');
                          setSelectedAnalysis(null);
                        }}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}