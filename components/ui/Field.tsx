'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
  error?: string;
  success?: string;
}

const Field = forwardRef<HTMLInputElement, FieldProps>(
  ({ label, description, error, success, className, id, ...props }, ref) => {
    const fieldId = id || `field-${Math.random().toString(36).substr(2, 9)}`;
    
    return (
      <div className="space-y-2">
        <label htmlFor={fieldId} className="block text-sm font-medium text-text">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        {description && (
          <p className="text-sm text-subtle">{description}</p>
        )}
        
        <input
          ref={ref}
          id={fieldId}
          className={cn(
            'block w-full px-3 py-2 border border-border rounded-lg shadow-sm placeholder-subtle',
            'focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-red-300 focus:ring-red-500',
            success && 'border-green-300 focus:ring-green-500',
            className
          )}
          {...props}
        />
        
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        
        {success && (
          <p className="text-sm text-green-600">{success}</p>
        )}
      </div>
    );
  }
);

Field.displayName = 'Field';
export { Field };