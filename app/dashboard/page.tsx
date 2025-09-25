// app/dashboard/page.tsx
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
    title: 'ZPROGRAM_TEST',
    description: 'Programa de teste de performance',
    iconName: 'Code',
    href: '/programas/ZPROGRAM_TEST',
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
    title: 'Editor de Programas',
    description: 'Crie, edite e valide programas ABAP/ABAP Cloud com assistência de IA.',
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
              <Badge variant="outline" className="px-3 py-1">
                {user?.role === 'admin' ? '🔧 Administrador' : '👨‍💻 Desenvolvedor'}
              </Badge>
              {user?.company && (
                <Badge variant="secondary" className="px-3 py-1">
                  🏢 {user.company}
                </Badge>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {quickStats.map((stat, index) => (
              <Card key={index} className="bg-white border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <Badge 
                      variant={stat.trend.startsWith('+') ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {stat.trend}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Seção Recentes */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Acessados Recentemente</h2>
            <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              Ver todos
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentTools.map((tool, index) => (
              <Card key={tool.title} className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
                      <div className="w-6 h-6 text-blue-600">
                        {tool.iconName === 'Package' && '📦'}
                        {tool.iconName === 'Code' && '💻'}
                        {tool.iconName === 'Bug' && '🐛'}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {tool.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{tool.description}</p>
                      <p className="text-xs text-gray-400 mt-2">{tool.lastAccess}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Todas as Ferramentas */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Todas as Ferramentas</h2>
            <div className="flex space-x-2">
              <Badge variant="outline">4 disponíveis</Badge>
            </div>
          </div>
          
          {/* Agrupamento por categoria */}
          <div className="space-y-8">
            {['Desenvolvimento', 'Debug', 'Qualidade'].map(category => (
              <div key={category}>
                <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  {category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allTools
                    .filter(tool => tool.category === category)
                    .map((tool, index) => (
                      <ToolCard
                        key={tool.title}
                        title={tool.title}
                        description={tool.description}
                        iconName={tool.iconName}
                        href={tool.href}
                        index={index}
                      />
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status do Sistema */}
        <div className="mt-16">
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-center">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-medium text-gray-800">
                    Todas as ferramentas estão online e funcionando perfeitamente
                  </span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Sistema Saudável
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}