// components/dashboard/StatsCards.tsx
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Code, TrendingUp, Zap, DollarSign } from 'lucide-react';
import { useStats } from '@/hooks/useStats';

export function StatsCards() {
  const { stats, isLoading } = useStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-300 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">Dados não disponíveis</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const quickStats = [
    { 
      label: 'Programas + Módulos', 
      value: stats.totalPrograms.toString(), 
      trend: stats.recentActivity > 0 ? `+${stats.recentActivity}` : '0',
      icon: Code,
      color: 'text-blue-600'
    },
    { 
      label: 'Módulos Ativos', 
      value: stats.totalModules.toString(), 
      trend: '+2',
      icon: TrendingUp,
      color: 'text-green-600'
    },
    { 
      label: 'Tokens Usados', 
      value: stats.totalTokensUsed > 1000 
        ? `${(stats.totalTokensUsed / 1000).toFixed(1)}k` 
        : stats.totalTokensUsed.toString(), 
      trend: '+18%',
      icon: Zap,
      color: 'text-yellow-600'
    },
    { 
      label: 'Custo Total', 
      value: `$${(stats.totalCost / 100).toFixed(2)}`, 
      trend: stats.totalCost > 0 ? '+5%' : '0%',
      icon: DollarSign,
      color: 'text-green-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {quickStats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <IconComponent className={`w-6 h-6 ${stat.color} mb-2`} />
                  <span className={`text-sm font-medium ${
                    stat.trend.startsWith('+') 
                      ? 'text-green-600' 
                      : 'text-gray-600'
                  }`}>
                    {stat.trend}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}