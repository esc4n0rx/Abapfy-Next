'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const fieldId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    
    return (
      <div className="space-y-2">
        {label && (
          <label htmlFor={fieldId} className="block text-sm font-medium text-text">
            {label}
          </label>
        )}
        
        <textarea
          ref={ref}
          id={fieldId}
          className={cn(
            'block w-full px-3 py-2 border border-border rounded-lg shadow-sm placeholder-subtle',
            'focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed resize-vertical',
            'font-mono text-sm',
            error && 'border-red-300 focus:ring-red-500',
            className
          )}
          {...props}
        />
        
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
export { Textarea };