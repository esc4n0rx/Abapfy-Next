// components/modules/ModuleTypeSelector.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { MODULE_TYPES } from '@/lib/prompts/abap';

interface ModuleTypeSelectorProps {
  selectedType: string;
  onTypeSelect: (type: string) => void;
  onNext: () => void;
}

export function ModuleTypeSelector({ selectedType, onTypeSelect, onNext }: ModuleTypeSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const categories = ['all', ...Array.from(new Set(MODULE_TYPES.map(t => t.category)))];
  
  const filteredTypes = selectedCategory === 'all' 
    ? MODULE_TYPES 
    : MODULE_TYPES.filter(t => t.category === selectedCategory);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Escolha o Tipo de Módulo
        </h3>
        <p className="text-sm text-gray-600">
          Selecione o tipo de código ABAP que você deseja gerar
        </p>
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

      {/* Module Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTypes.map((moduleType, index) => (
          <motion.div
            key={moduleType.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`
              p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md
              ${selectedType === moduleType.id 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
              }
            `}
            onClick={() => onTypeSelect(moduleType.id)}
          >
            <div className="flex items-start space-x-3">
              <div className="text-2xl">{moduleType.icon}</div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 text-sm">
                  {moduleType.name}
                </h4>
                <p className="text-xs text-gray-600 mt-1">
                  {moduleType.description}
                </p>
                <div className="mt-2">
                  <Badge variant="outline" className="text-xs">
                    {moduleType.category}
                  </Badge>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Continue Button */}
      {selectedType && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-end"
        >
          <Button onClick={onNext}>
            Continuar
          </Button>
        </motion.div>
      )}
    </div>
  );
}