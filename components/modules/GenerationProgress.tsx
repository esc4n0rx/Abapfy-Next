// components/modules/GenerationProgress.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Zap, Code, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface GenerationProgressProps {
  isGenerating: boolean;
  provider?: string;
  model?: string;
  onComplete?: () => void;
}

const GENERATION_STEPS = [
  { id: 1, label: 'Analisando requisitos', icon: '🔍' },
  { id: 2, label: 'Selecionando provider de IA', icon: '🤖' },
  { id: 3, label: 'Gerando código ABAP', icon: '⚡' },
  { id: 4, label: 'Validando estrutura', icon: '✅' },
  { id: 5, label: 'Finalizando...', icon: '🎉' }
];

// components/modules/GenerationProgress.tsx (continuação)
export function GenerationProgress({ 
  isGenerating, 
  provider, 
  model, 
  onComplete 
}: GenerationProgressProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isGenerating) {
      setCurrentStep(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= GENERATION_STEPS.length - 1) {
          clearInterval(interval);
          setTimeout(() => onComplete?.(), 500);
          return prev;
        }
        return prev + 1;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [isGenerating, onComplete]);

  if (!isGenerating) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl"
      >
        <div className="text-center mb-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center"
          >
            <Zap className="w-8 h-8 text-blue-600" />
          </motion.div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Gerando Código ABAP
          </h3>
          
          {provider && (
            <div className="flex items-center justify-center space-x-2">
              <Badge variant="default" className="text-xs">
                {provider === 'groq' ? '⚡ Groq' : '💎 Arcee'}
              </Badge>
              {model && (
                <Badge variant="outline" className="text-xs">
                  {model}
                </Badge>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {GENERATION_STEPS.map((step, index) => (
            <motion.div
              key={step.id}
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ 
                opacity: index <= currentStep ? 1 : 0.3,
                x: 0
              }}
              transition={{ delay: index * 0.1 }}
            >
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm
                ${index <= currentStep 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-100 text-gray-400'
                }
              `}>
                {index < currentStep ? (
                  <CheckCircle className="w-4 h-4" />
                ) : index === currentStep ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>{step.icon}</span>
                )}
              </div>
              
              <span className={`text-sm ${
                index <= currentStep ? 'text-gray-900' : 'text-gray-400'
              }`}>
                {step.label}
              </span>
            </motion.div>
          ))}
        </div>

        <div className="mt-6">
          <div className="bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-blue-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / GENERATION_STEPS.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            {Math.round(((currentStep + 1) / GENERATION_STEPS.length) * 100)}% concluído
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}