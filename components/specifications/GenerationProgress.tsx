// components/specifications/GenerationProgress.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, CheckCircle } from 'lucide-react';

interface GenerationProgressProps {
  isGenerating: boolean;
  provider?: string;
  model?: string;
  onComplete?: () => void;
}

const STEPS = [
  { id: 1, label: 'Consolidando contexto do projeto', icon: '🧭' },
  { id: 2, label: 'Validando requisitos com o guardião', icon: '🛡️' },
  { id: 3, label: 'Gerando estrutura da especificação', icon: '🧱' },
  { id: 4, label: 'Documentando regras e fluxos', icon: '📋' },
  { id: 5, label: 'Finalizando documento', icon: '🎉' },
];

export function GenerationProgress({ isGenerating, provider, model, onComplete }: GenerationProgressProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isGenerating) {
      setCurrentStep(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= STEPS.length - 1) {
          clearInterval(interval);
          setTimeout(() => onComplete?.(), 500);
          return prev;
        }
        return prev + 1;
      });
    }, 900);

    return () => clearInterval(interval);
  }, [isGenerating, onComplete]);

  if (!isGenerating) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 p-8"
      >
        <div className="text-center mb-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 mx-auto mb-4 bg-indigo-100 rounded-full flex items-center justify-center"
          >
            <Sparkles className="w-8 h-8 text-indigo-600" />
          </motion.div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Gerando Especificação Completa</h3>
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
          {STEPS.map((step, index) => (
            <motion.div
              key={step.id}
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{
                opacity: index <= currentStep ? 1 : 0.35,
                x: 0,
              }}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  index <= currentStep ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-500'
                }`}
              >
                {index < currentStep ? (
                  <CheckCircle className="w-4 h-4" />
                ) : index === currentStep ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>{step.icon}</span>
                )}
              </div>
              <span className={`text-sm ${index <= currentStep ? 'text-gray-900' : 'text-gray-500'}`}>
                {step.label}
              </span>
            </motion.div>
          ))}
        </div>

        <div className="mt-6">
          <div className="bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-indigo-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            {Math.round(((currentStep + 1) / STEPS.length) * 100)}% concluído
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
