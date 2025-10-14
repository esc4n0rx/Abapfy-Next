// app/dashboard/page.tsx (modificado)
'use client';

import { Header } from '@/components/layout/Header';
import { ToolCard } from '@/components/home/ToolCard';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CodeDebugCard } from '@/components/code/CodeDebugCard';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { RecentAccess } from '@/components/dashboard/RecentAccess';


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
    title: 'Gerador de Especificações',
    description: 'Monte documentos funcionais e técnicos completos com IA protegida pelo guardião.',
    iconName: 'FileText',
    href: '/especificacoes',
    category: 'Arquitetura'
  }
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
        <div className="mb-8">
        <StatsCards />
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Acessos Recentes</h2>
        <RecentAccess />
      </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Ferramentas Disponíveis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <CodeDebugCard />
            
            {allTools.map((tool, index) => (
              <ToolCard index={index + 1} key={index} {...tool} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}