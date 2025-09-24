import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface ToolbarProps {
  title: string;
  actions?: React.ReactNode;
  breadcrumb?: BreadcrumbItem[];
}

export function Toolbar({ title, actions, breadcrumb }: ToolbarProps) {
  return (
    <div className="bg-card border-b border-border px-6 py-4">
      {breadcrumb && (
        <nav className="text-sm mb-2">
          <ol className="flex items-center space-x-2 text-subtle">
            {breadcrumb.map((item, index) => (
              <li key={index} className="flex items-center">
                {index > 0 && <span className="mx-2">/</span>}
                {item.href ? (
                  <Link href={item.href} className="hover:text-text">
                    {item.label}
                  </Link>
                ) : (
                  <span className={index === breadcrumb.length - 1 ? 'text-text font-medium' : ''}>
                    {item.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-text">{title}</h1>
        {actions && (
          <div className="flex items-center space-x-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}