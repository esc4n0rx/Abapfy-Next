// app/dashboard/page.tsx (modificado)
'use client';

import { Header } from '@/components/layout/Header';
import { ToolCard } from '@/components/home/ToolCard';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const recentTools = [
  {
    title: 'ZCL_MY_CLASS',
    description: 'Classe de utilitários',
    iconName: 'Package',
    href: '/modulos/ZCL_MY_CLASS',
    lastAccess: '2 horas atrás'
  },
  {
    title: 'ZPROGRAM_SALES',
    description: 'Report de vendas mensais',
    iconName: 'Code',
    href: '/programas/ZPROGRAM_SALES',
    lastAccess: '5 horas atrás'
  },
  {
    title: 'Debug Session #1',
    description: 'Sessão de debug ativa',
    iconName: 'Bug',
    href: '/debugger',
    lastAccess: '1 dia atrás'
  }
];

const allTools = [
  {
    title: 'Gerador de Programas',
    description: 'Crie programas ABAP completos e profissionais com assistência de IA avançada.',
    iconName: 'Code',
    href: '/programas',
    category: 'Desenvolvimento'
  },
  {
    title: 'Gerenciador de Módulos',
    description: 'Gerencie módulos de função, classes e CDS Views facilmente.',
    iconName: 'Package',
    href: '/modulos',
    category: 'Desenvolvimento'
  },
  {
    title: 'Debugger Virtual',
    description: 'Simule e inspecione execução de código com breakpoints virtuais.',
    iconName: 'Bug',
    href: '/debugger',
    category: 'Debug'
  },
  {
    title: 'Code Review IA',
    description: 'Analise qualidade, formatação e identifique riscos no seu código.',
    iconName: 'FileSearch',
    href: '/code-review',
    category: 'Qualidade'
  }
];

const quickStats = [
  { label: 'Programas Criados', value: '24', trend: '+12%' },
  { label: 'Módulos Ativos', value: '8', trend: '+2' },
  { label: 'Reviews Realizados', value: '15', trend: '+5%' },
  { label: 'Bugs Corrigidos', value: '42', trend: '+18' }
];

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        {/* Header de Boas-vindas */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Olá, {user?.firstName}! 👋
              </h1>
              <p className="text-gray-600 mt-1">
                Bem-vindo de volta ao Abapfy. Vamos continuar desenvolvendo?
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Badge variant="outline" className="text-black px-3 py-1">
                {user?.role === 'admin' ? 'Administrador' : 'Desenvolvedor'}
              </Badge>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Online</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
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
                  <div className="text-right">
                    <span className={`text-sm font-medium ${
                      stat.trend.startsWith('+') 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {stat.trend}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Recent Tools */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Acessos Recentes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentTools.map((tool, index) => (
              <ToolCard index={0} key={index} {...tool} />
            ))}
          </div>
        </div>

        {/* All Tools */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Ferramentas Disponíveis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {allTools.map((tool, index) => (
              <ToolCard index={0} key={index} {...tool} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}