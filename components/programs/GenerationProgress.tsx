// components/programs/GenerationProgress.tsx
'use client';

import { motion } from 'framer-motion';
import { Sparkles, Code, CheckCircle } from 'lucide-react';

interface GenerationProgressProps {
  programName: string;
  programType: string;
  isGenerating: boolean;
}

export function GenerationProgress({ 
  programName, 
  programType, 
  isGenerating 
}: GenerationProgressProps) {
  const steps = [
    { 
      id: 1, 
      label: 'Analisando especificação', 
      icon: Sparkles,
      completed: true 
    },
    { 
      id: 2, 
      label: 'Preparando contexto ABAP', 
      icon: Code,
      completed: true 
    },
    { 
      id: 3, 
      label: 'Gerando código profissional', 
      icon: CheckCircle,
      completed: !isGenerating 
    }
  ];

  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Gerando Programa ABAP
        </h3>
        <p className="text-gray-600">
          Criando <strong>{programName}</strong> - {programType}
        </p>
      </div>

      {/* Progress Steps */}
      <div className="space-y-6">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            className="flex items-center space-x-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.2 }}
          >
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center
              ${step.completed 
                ? 'bg-green-100 text-green-600' 
                : isGenerating 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-100 text-gray-400'
              }
            `}>
              {step.completed ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <step.icon className={`w-5 h-5 ${isGenerating && step.id === 3 ? 'animate-pulse' : ''}`} />
              )}
            </div>
            
            <div className="flex-1">
              <p className={`font-medium ${
                step.completed 
                  ? 'text-green-900' 
                  : isGenerating && step.id === 3
                    ? 'text-blue-900' 
                    : 'text-gray-500'
              }`}>
                {step.label}
              </p>
              
              {isGenerating && step.id === 3 && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="bg-blue-600 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 3, ease: 'easeInOut' }}
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {isGenerating && (
        <div className="text-center mt-8 text-sm text-gray-600">
          <motion.p
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Gerando código ABAP profissional e performático...
          </motion.p>
        </div>
      )}
    </div>
  );
}