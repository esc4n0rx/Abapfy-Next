// hooks/useRecentAccess.ts
import { useState, useEffect } from 'react';
import { RecentAccessItem } from '@/types/dashboard';

export function useRecentAccess() {
  const [recentItems, setRecentItems] = useState<RecentAccessItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRecentAccess = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Carregar dados recentes de programas, módulos e análises
      const [programsResponse, modulesResponse, codeResponse] = await Promise.all([
        fetch('/api/programs?limit=5', { credentials: 'include' }),
        fetch('/api/modules/recent?limit=5', { credentials: 'include' }),
        fetch('/api/code/recent', { credentials: 'include' })
      ]);

      const responses = [programsResponse, modulesResponse, codeResponse];
      const validResponses = responses.filter(r => r.ok);
      
      const results = await Promise.all(
        validResponses.map(r => r.json())
      );

      const items: RecentAccessItem[] = [];

      // Processar programas
      if (programsResponse.ok && results[0]?.programs) {
        results[0].programs.slice(0, 3).forEach((program: any) => {
          items.push({
            id: program.id,
            title: program.name,
            description: program.description,
            type: 'program',
            iconName: getTypeIcon(program.type),
            href: `/programas/${program.id}`,
            lastAccess: formatRelativeTime(program.updatedAt || program.createdAt),
            metadata: {
              provider: program.metadata?.provider
            }
          });
        });
      }

      // Processar módulos
      if (modulesResponse.ok && results[1]?.modules) {
        results[1].modules.slice(0, 2).forEach((module: any) => {
          items.push({
            id: module.id,
            title: module.name,
            description: module.description,
            type: 'module',
            iconName: 'Package',
            href: `/modulos/${module.id}`,
            lastAccess: formatRelativeTime(module.updatedAt || module.createdAt),
            metadata: {
              provider: module.metadata?.provider
            }
          });
        });
      }

      // Processar análises de código
      if (codeResponse.ok && results[2]?.analyses) {
        results[2].analyses.slice(0, 1).forEach((analysis: any) => {
          items.push({
            id: analysis.id,
            title: analysis.title,
            description: analysis.summary,
            type: 'analysis',
            iconName: 'Bug',
            href: `/debugger`,
            lastAccess: formatRelativeTime(analysis.createdAt),
            metadata: {
              analysisType: analysis.analysisType,
              score: analysis.score
            }
          });
        });
      }

      // Ordenar por data de acesso mais recente
      items.sort((a, b) => {
        const aTime = getTimeFromRelative(a.lastAccess);
        const bTime = getTimeFromRelative(b.lastAccess);
        return aTime - bTime;
      });

      setRecentItems(items.slice(0, 6));
    } catch (error) {
      console.error('Erro ao carregar acessos recentes:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'report': return 'BarChart';
      case 'module_pool': return 'Monitor';
      case 'function_group': return 'Settings';
      case 'class_pool': return 'Building';
      default: return 'Code';
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
      return diffInMinutes <= 1 ? 'Agora' : `${diffInMinutes} min atrás`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h atrás`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}d atrás`;
    }
  };

  const getTimeFromRelative = (relative: string): number => {
    if (relative === 'Agora') return 0;
    if (relative.includes('min')) return parseInt(relative);
    if (relative.includes('h')) return parseInt(relative) * 60;
    if (relative.includes('d')) return parseInt(relative) * 1440;
    return 999999;
  };

  useEffect(() => {
    loadRecentAccess();
  }, []);

  return { recentItems, isLoading, error, refetch: loadRecentAccess };
}