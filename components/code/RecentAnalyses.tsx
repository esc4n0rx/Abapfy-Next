// components/code/RecentAnalyses.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/alert';
import { Bug, FileSearch, Clock, BarChart3, ChevronRight, Loader2 } from 'lucide-react';
import { RecentAnalysis } from '@/types/codeAnalysis';

interface RecentAnalysesProps {
  onSelectAnalysis: (analysisId: string) => void;
}

export function RecentAnalyses({ onSelectAnalysis }: RecentAnalysesProps) {
  const [analyses, setAnalyses] = useState<RecentAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecentAnalyses();
  }, []);

  const loadRecentAnalyses = async () => {
    try {
      const response = await fetch('/api/code/recent', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setAnalyses(data.analyses);
      }
    } catch (error) {
      console.error('Erro ao carregar análises:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAnalysisIcon = (type: 'debug' | 'review') => {
    return type === 'debug' ? (
      <Bug className="w-4 h-4 text-red-500" />
    ) : (
      <FileSearch className="w-4 h-4 text-blue-500" />
    );
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'default';
    if (score >= 90) return 'default';
    if (score >= 80) return 'secondary';
    if (score >= 70) return 'outline';
    return 'destructive';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Agora há pouco';
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    if (diffInHours < 48) return 'Ontem';
    return date.toLocaleDateString('pt-BR');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Análises Recentes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (analyses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Análises Recentes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="default">
            <BarChart3 className="w-4 h-4" />
            Suas análises de código aparecerão aqui. Faça sua primeira análise para começar!
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="w-5 h-5" />
          <span>Análises Recentes</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {analyses.map((analysis) => (
            <div
              key={analysis.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => onSelectAnalysis(analysis.id)}
            >
              <div className="flex items-center space-x-3 flex-1">
                {getAnalysisIcon(analysis.analysisType)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {analysis.title}
                    </h4>
                    <Badge variant="outline" className="text-xs">
                      {analysis.analysisType === 'debug' ? 'Debug' : 'Review'}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 truncate">
                    {analysis.summary}
                  </p>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="text-xs text-gray-500">
                      {formatDate(analysis.createdAt)}
                    </span>
                    {analysis.score !== undefined && (
                      <Badge variant={getScoreColor(analysis.score)} className="text-xs">
                        {analysis.score}/100
                      </Badge>
                    )}
                    <span className="text-xs text-gray-500">
                      {analysis.issueCount} problema{analysis.issueCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          ))}
        </div>
        
        {analyses.length >= 5 && (
          <div className="mt-4 text-center">
            <Button variant="outline" size="sm">
              Ver Todas as Análises
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}