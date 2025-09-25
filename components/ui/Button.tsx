'use client';

import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Movido para fora para que o tipo possa ser usado na interface
const MotionButton = motion.button;

// A interface agora estende as props do próprio motion.button, resolvendo o conflito de tipos
interface ButtonProps extends React.ComponentProps<typeof MotionButton> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-brand text-white hover:bg-brand-strong focus:ring-brand shadow-sm',
      secondary: 'bg-white border border-border text-text hover:bg-gray-50 focus:ring-brand shadow-sm',
      tertiary: 'text-brand hover:text-brand-strong hover:bg-blue-50 focus:ring-brand',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm',
      ghost: 'text-subtle hover:text-text hover:bg-gray-100 focus:ring-brand'
    };
    
    const sizes = {
      sm: 'h-8 px-3 text-sm rounded-lg',
      md: 'h-10 px-4 text-sm rounded-xl',
      lg: 'h-12 px-6 text-base rounded-xl'
    };

    return (
      <MotionButton
        ref={ref}
        className={cn(baseClasses, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        whileTap={{ scale: variant === 'primary' ? 0.98 : 1 }}
        transition={{ duration: 0.1 }}
        // O type casting foi removido pois as props agora estão corretamente tipadas
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {children}
      </MotionButton>
    );
  }
);

Button.displayName = 'Button';
export { Button };