import { Header } from '@/components/layout/Header';
import { ToolCard } from '@/components/home/ToolCard';

const recentTools = [
  {
    title: 'ZCL_MY_CLASS',
    description: 'Classe de utilitários',
    iconName: 'Package',
    href: '/modulos/ZCL_MY_CLASS'
  },
  {
    title: 'ZPROGRAM_TEST',
    description: 'Programa de teste de performance',
    iconName: 'Code',
    href: '/programas/ZPROGRAM_TEST'
  },
];

const allTools = [
  {
    title: 'Programas',
    description: 'Crie, edite e valide programas ABAP/ABAP Cloud com assistência de IA.',
    iconName: 'Code',
    href: '/programas'
  },
  {
    title: 'Módulos',
    description: 'Gerencie módulos de função, classes e CDS Views facilmente.',
    iconName: 'Package',
    href: '/modulos'
  },
  {
    title: 'Debugger',
    description: 'Simule e inspecione execução de código com breakpoints virtuais.',
    iconName: 'Bug',
    href: '/debugger'
  },
  {
    title: 'Code Review',
    description: 'Analise qualidade, formatação e identifique riscos no seu código.',
    iconName: 'FileSearch',
    href: '/code-review'
  }
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-12">
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-text mb-6">Recentes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {recentTools.map((tool, index) => (
              <ToolCard
                key={tool.title}
                title={tool.title}
                description={tool.description}
                iconName={tool.iconName}
                href={tool.href}
                index={index}
                isSmall
              />
            ))}
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-text mb-6">Área Geral</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {allTools.map((tool, index) => (
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

        <div className="mt-16 text-center">
          <div className="inline-flex items-center px-6 py-3 bg-brand/10 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-3"></div>
            <span className="text-sm font-medium text-brand">
              Todas as ferramentas estão online e funcionando
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
