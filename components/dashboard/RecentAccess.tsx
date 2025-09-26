// components/dashboard/RecentAccess.tsx
'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Code, Package, Bug, BarChart, Monitor, Settings, Building } from 'lucide-react';
import { useRecentAccess } from '@/hooks/useRecentAccess';

const iconMap = {
  Code,
  Package,
  Bug,
  BarChart,
  Monitor,
  Settings,
  Building
};

export function RecentAccess() {
  const { recentItems, isLoading } = useRecentAccess();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-300 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (recentItems.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Nenhum acesso recente encontrado</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {recentItems.map((item) => {
        const IconComponent = iconMap[item.iconName as keyof typeof iconMap] || Code;
        
        return (
          <Link key={item.id} href={item.href}>
            <Card className="hover:shadow-md transition-shadow duration-200 cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <IconComponent className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium text-gray-900 truncate">
                        {item.title}
                      </h3>
                      <Badge 
                        variant="outline" 
                        className="text-xs px-2 py-0"
                      >
                        {item.type === 'program' ? 'Prog' : 
                         item.type === 'module' ? 'Mod' : 'Debug'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        {item.lastAccess}
                      </span>
                      {item.metadata?.provider && (
                        <span className="text-xs text-blue-600 font-medium">
                          {item.metadata.provider === 'groq' ? '⚡' : 
                           item.metadata.provider === 'arcee' ? '💎' : '🤖'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}