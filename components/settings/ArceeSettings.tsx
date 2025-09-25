'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { Eye, EyeOff, DollarSign } from 'lucide-react';
import { ProviderConfig, ProviderUsage } from '@/types/providers';

interface ArceeSettingsProps {
  config: ProviderConfig;
  usage: ProviderUsage[];
  onUpdate: (config: Partial<ProviderConfig>) => Promise<void>;
}

export function ArceeSettings({ config, usage, onUpdate }: ArceeSettingsProps) {
  const [apiKey, setApiKey] = useState(config.apiKey || '');
  const [isEnabled, setIsEnabled] = useState(config.isEnabled);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      alert('Por favor, insira a chave da API do Arcee');
      return;
    }

    setIsSaving(true);
    try {
      await onUpdate({
        apiKey: apiKey.trim(),
        defaultModel: 'auto',
        isEnabled,
      });
      alert('Configurações do Arcee salvas com sucesso!');
    } catch (error: any) {
      alert(`Erro ao salvar: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const getTodayUsage = () => {
    const today = new Date().toISOString().split('T')[0];
    return usage.filter(u => u.date === today && u.provider === 'arcee');
  };

  const calculateTodayCost = () => {
    const todayUsage = getTodayUsage();
    return todayUsage.reduce((total, u) => total + u.costCents, 0);
  };

  const getTotalRequests = () => {
    const todayUsage = getTodayUsage();
    return todayUsage.reduce((total, u) => total + u.requestsMade, 0);
  };

  const getTotalTokens = () => {
    const todayUsage = getTodayUsage();
    return todayUsage.reduce((total, u) => total + u.tokensUsed, 0);
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4,
    }).format(cents / 100);
  };

  const getCostBadgeVariant = (costCents: number) => {
    if (costCents >= 50) return 'destructive'; // > $0.50
    if (costCents >= 20) return 'secondary';   // > $0.20
    return 'default';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-text">Arcee Conductor</h3>
          <p className="text-sm text-subtle">
            API premium com modelo auto-otimizado e cobrança por uso
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Label htmlFor="arcee-enabled">Habilitar</Label>
          <Switch
            id="arcee-enabled"
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
                      placeholder="arcee_..."
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
          Obtenha sua chave em{' '}
          <a
            href="https://conductor.arcee.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand hover:underline"
          >
            conductor.arcee.ai
          </a>
        </p>
      </div>

      {/* Model Info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-sm mb-2">Modelo</h4>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-text">Auto-otimizado</p>
            <p className="text-xs text-subtle">
              O Arcee automaticamente seleciona o melhor modelo para cada tarefa
            </p>
          </div>
          <Badge variant="default">auto</Badge>
        </div>
      </div>

      {/* Usage Statistics */}
      {isEnabled && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-text">Uso de Hoje</h4>
            <div className="flex items-center space-x-1">
              <DollarSign className="w-4 h-4 text-green-600" />
              <Badge
                variant={getCostBadgeVariant(calculateTodayCost())}
                className="text-xs font-mono"
              >
                {formatCurrency(calculateTodayCost())}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-lg font-semibold text-text">{getTotalRequests()}</div>
              <div className="text-xs text-subtle">Requests</div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-lg font-semibold text-text">
                {getTotalTokens().toLocaleString()}
              </div>
              <div className="text-xs text-subtle">Tokens</div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-lg font-semibold text-green-600">
                {formatCurrency(calculateTodayCost())}
              </div>
              <div className="text-xs text-subtle">Custo Total</div>
            </div>
          </div>

          {/* Recent Usage */}
          {getTodayUsage().length > 0 && (
            <div>
              <h5 className="font-medium text-sm mb-2">Uso Recente</h5>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {getTodayUsage().slice(0, 5).map((u, index) => (
                  <div key={index} className="flex items-center justify-between text-xs bg-white p-2 rounded border">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        {u.model}
                      </Badge>
                      <span className="text-subtle">
                        {u.tokensUsed.toLocaleString()} tokens
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-3 h-3 text-green-600" />
                      <span className="font-mono text-green-600">
                        {formatCurrency(u.costCents)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cost Warning */}
      {isEnabled && calculateTodayCost() >= 20 && (
        <Alert variant="destructive">
          <DollarSign className="w-4 h-4" />
          <div className="text-sm">
            <strong>Atenção aos custos!</strong>
            <p className="mt-1">
              Você já gastou {formatCurrency(calculateTodayCost())} hoje. 
              Monitore seu uso para evitar custos inesperados.
            </p>
          </div>
        </Alert>
      )}

      {/* Pricing Info */}
      <Alert>
        <div className="text-sm">
          <strong>Informações de Preços:</strong>
          <ul className="mt-2 list-disc list-inside space-y-1 text-xs">
            <li>Custo médio por request: ~$0.0057</li>
            <li>Cobrança baseada no uso real</li>
            <li>Modelo otimizado automaticamente</li>
            <li>Sem limites fixos, apenas cobrança por uso</li>
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