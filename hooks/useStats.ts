// hooks/useStats.ts
import { useState, useEffect } from 'react';
import { DashboardStats } from '@/types/dashboard';

export function useStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [programsResponse, modulesResponse] = await Promise.all([
        fetch('/api/programs/stats', { credentials: 'include' }),
        fetch('/api/modules/stats', { credentials: 'include' })
      ]);

      if (!programsResponse.ok || !modulesResponse.ok) {
        throw new Error('Erro ao carregar estatísticas');
      }

      const [programsData, modulesData] = await Promise.all([
        programsResponse.json(),
        modulesResponse.json()
      ]);

      const combinedStats: DashboardStats = {
        totalPrograms: programsData.stats.totalPrograms + modulesData.stats.totalModules,
        totalModules: modulesData.stats.totalModules,
        recentActivity: programsData.stats.recentActivity + modulesData.stats.recentActivity,
        totalTokensUsed: programsData.stats.totalTokensUsed + modulesData.stats.totalTokensUsed,
        totalCost: programsData.stats.totalCost + modulesData.stats.totalCost
      };

      setStats(combinedStats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return { stats, isLoading, error, refetch: loadStats };
}