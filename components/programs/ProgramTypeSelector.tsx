// components/programs/ProgramTypeSelector.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { ChevronLeft } from 'lucide-react';
import { PROGRAM_TYPES } from '@/lib/prompts/programs';

interface ProgramTypeSelectorProps {
  selectedType: string;
  onTypeSelect: (type: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function ProgramTypeSelector({ 
  selectedType, 
  onTypeSelect, 
  onNext, 
  onBack 
}: ProgramTypeSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const categories = ['all', ...Array.from(new Set(PROGRAM_TYPES.map(t => t.category)))];
  
  const filteredTypes = selectedCategory === 'all' 
    ? PROGRAM_TYPES 
    : PROGRAM_TYPES.filter(t => t.category === selectedCategory);

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'very_high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplexityLabel = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'Simples';
      case 'medium': return 'Médio';
      case 'high': return 'Avançado';
      case 'very_high': return 'Expert';
      default: return 'Padrão';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Escolha o Tipo de Programa
          </h3>
          <p className="text-sm text-gray-600">
            Selecione o tipo de programa ABAP que você deseja gerar
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setSelectedCategory(category)}
          >
            {category === 'all' ? 'Todos' : category}
          </Button>
        ))}
      </div>

      {/* Program Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTypes.map((programType, index) => (
          <motion.div
            key={programType.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`
              p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md
              ${selectedType === programType.id 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 bg-white hover:border-gray-300'
              }
            `}
            onClick={() => onTypeSelect(programType.id)}
          >
            <div className="text-center">
              <div className="text-3xl mb-3">{programType.icon}</div>
              <h4 className="font-semibold text-gray-900 mb-2">
                {programType.name}
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                {programType.description}
              </p>
              <div className="flex justify-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  {programType.category}
                </Badge>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getComplexityColor(programType.complexity)}`}
                >
                  {getComplexityLabel(programType.complexity)}
                </Badge>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Next Button */}
      <div className="flex justify-end">
        <Button 
          onClick={onNext}
          disabled={!selectedType}
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}