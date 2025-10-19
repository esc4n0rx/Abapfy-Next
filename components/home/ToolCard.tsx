'use client';

import { motion } from 'framer-motion';
import { Code, Package, Bug, FileSearch, MessageSquare, type LucideIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

const iconMap: Record<string, LucideIcon> = {
  Code,
  Package,
  Bug,
  FileSearch,
  MessageSquare,
};

interface ToolCardProps {
  title: string;
  description: string;
  iconName: string;
  href: string;
  index: number;
  isSmall?: boolean;
}

export function ToolCard({ title, description, iconName, href, index, isSmall = false }: ToolCardProps) {
  const router = useRouter();
  const Icon = iconMap[iconName];

  if (isSmall) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.3, 
          delay: index * 0.1,
          ease: "easeOut"
        }}
        whileHover={{ 
          scale: 1.03,
          transition: { duration: 0.2 }
        }}
        whileTap={{ scale: 0.98 }}
        className="bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md cursor-pointer group transition-all duration-200"
        onClick={() => router.push(href)}
      >
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-brand/10 rounded-lg">
            <Icon className="w-6 h-6 text-brand" />
          </div>
          <div>
            <h3 className="font-semibold text-text text-sm group-hover:text-brand transition-colors duration-200">
              {title}
            </h3>
            <p className="text-subtle text-xs">
              {description}
            </p>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.3, 
        delay: index * 0.1,
        ease: "easeOut"
      }}
      whileHover={{ 
        scale: 1.02,
        y: -4,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      className="bg-card border border-border rounded-2xl p-8 shadow-card hover:shadow-card-hover cursor-pointer group transition-all duration-200"
      onClick={() => router.push(href)}
    >
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="p-4 bg-brand/10 rounded-2xl group-hover:bg-brand/15 transition-colors duration-200">
          <Icon className="w-12 h-12 text-brand" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-text group-hover:text-brand transition-colors duration-200">
            {title}
          </h3>
          <p className="text-subtle text-sm leading-relaxed max-w-xs">
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}