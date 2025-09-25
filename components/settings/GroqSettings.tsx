'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { Eye, EyeOff } from 'lucide-react';
import { GROQ_MODELS } from '@/lib/providers';
import { ProviderConfig, ProviderUsage } from '@/types/providers';

interface GroqSettingsProps {
  config: ProviderConfig;
  usage: ProviderUsage[];
  onUpdate: (config: Partial<ProviderConfig>) => Promise<void>;
}

export function GroqSettings({ config, usage, onUpdate }: GroqSettingsProps) {
  const [apiKey, setApiKey] = useState(config.apiKey || '');
  const [defaultModel, setDefaultModel] = useState(config.defaultModel || 'qwen/qwen3-32b');
  const [isEnabled, setIsEnabled] = useState(config.isEnabled);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      alert('Por favor, insira a chave da API do Groq');
      return;
    }

    setIsSaving(true);
    try {
      await onUpdate({
        apiKey: apiKey.trim(),
        defaultModel,
        isEnabled,
      });
      alert('Configurações do Groq salvas com sucesso!');
    } catch (error: any) {
      alert(`Erro ao salvar: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const getTodayUsage = () => {
    const today = new Date().toISOString().split('T')[0];
    return usage.filter(u => u.date === today && u.provider === 'groq');
  };

  const getUsageForModel = (modelId: string) => {
    const todayUsage = getTodayUsage();
    const modelUsage = todayUsage.find(u => u.model === modelId);
    return {
      requests: modelUsage?.requestsMade || 0,
      tokens: modelUsage?.tokensUsed || 0,
    };
  };

  const getUsagePercent = (current: number, limit: number) => {
    return Math.min((current / limit) * 100, 100);
  };

  const getUsageBadgeVariant = (percent: number) => {
    if (percent >= 90) return 'destructive';
    if (percent >= 70) return 'secondary';
    return 'default';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-text">Groq Configuration</h3>
          <p className="text-sm text-subtle">
            API gratuita com modelos de alta performance e limites diários
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Label htmlFor="groq-enabled">Habilitar</Label>
          <Switch
            id="groq-enabled"
            checked={isEnabled}
            onCheckedChange={setIsEnabled}
          />
        </div>
      </div>

      {/* API Key */}
      <div className="space-y-2">
        <Label>Chave da API</Label>
        <div className="relative">
          <Field
                      type={showApiKey ? 'text' : 'password'}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="gsk_..."
                      disabled={!isEnabled} label={''}          />
          <button
            type="button"
            onClick={() => setShowApiKey(!showApiKey)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-subtle hover:text-text"
            disabled={!isEnabled}
          >
            {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-xs text-subtle">
          Obtenha sua chave gratuita em{' '}
          <a
            href="https://console.groq.com/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand hover:underline"
          >
            console.groq.com/keys
          </a>
        </p>
      </div>

      {/* Model Selection */}
      <div className="space-y-2">
        <Label>Modelo Padrão</Label>
        <Select value={defaultModel} onValueChange={setDefaultModel} disabled={!isEnabled}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {GROQ_MODELS.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                {model.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Usage Statistics */}
      {isEnabled && (
        <div className="space-y-4">
          <h4 className="font-medium text-text">Uso de Hoje</h4>
          
          <div className="grid gap-4">
            {GROQ_MODELS.map((model) => {
              const modelUsage = getUsageForModel(model.id);
              const requestPercent = getUsagePercent(modelUsage.requests, model.requestsPerDay);
              const tokenPercent = getUsagePercent(modelUsage.tokens, model.tokensPerDay);

              return (
                <div key={model.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-sm">{model.name}</h5>
                    <Badge
                      variant={model.id === defaultModel ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {model.id === defaultModel ? 'Padrão' : 'Disponível'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-subtle">Requests</span>
                        <Badge
                          variant={getUsageBadgeVariant(requestPercent)}
                          className="text-xs"
                        >
                          {modelUsage.requests}/{model.requestsPerDay}
                        </Badge>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all ${
                            requestPercent >= 90 ? 'bg-red-500' :
                            requestPercent >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${requestPercent}%` }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-subtle">Tokens</span>
                        <Badge
                          variant={getUsageBadgeVariant(tokenPercent)}
                          className="text-xs"
                        >
                          {modelUsage.tokens.toLocaleString()}/{model.tokensPerDay.toLocaleString()}
                        </Badge>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all ${
                            tokenPercent >= 90 ? 'bg-red-500' :
                            tokenPercent >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${tokenPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Limits Info */}
      <Alert>
        <div className="text-sm">
          <strong>Limites do Groq:</strong>
          <ul className="mt-2 list-disc list-inside space-y-1 text-xs">
            <li>API gratuita com reset diário dos limites</li>
            <li>Diferentes modelos têm diferentes limites de requests e tokens</li>
            <li>Monitoramento em tempo real do uso</li>
          </ul>
        </div>
      </Alert>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        loading={isSaving}
        disabled={!isEnabled || !apiKey.trim()}
        className="w-full"
      >
        Salvar Configurações
      </Button>
    </div>
  );
}