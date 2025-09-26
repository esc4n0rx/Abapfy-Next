export interface DashboardStats {
  totalPrograms: number;
  totalModules: number;
  recentActivity: number;
  totalTokensUsed: number;
  totalCost: number;
}

export interface RecentAccessItem {
  id: string;
  title: string;
  description: string;
  type: 'program' | 'module' | 'analysis';
  iconName: string;
  href: string;
  lastAccess: string;
  metadata?: {
    provider?: string;
    analysisType?: string;
    score?: number;
  };
}