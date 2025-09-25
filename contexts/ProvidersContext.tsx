'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ProviderContextType, ProviderConfig, ProviderUsage, ProviderType } from '@/types/providers';
import { ProvidersManager } from '@/lib/providers';
import { useAuth } from '@/hooks/useAuth';

const ProvidersContext = createContext<ProviderContextType | undefined>(undefined);

export function ProvidersProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [providers, setProviders] = useState<ProviderConfig[]>([]);
  const [usage, setUsage] = useState<ProviderUsage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadProviders();
      loadUsage();
    }
  }, [isAuthenticated, user]);

  const loadProviders = async () => {
    try {
      const response = await fetch('/api/providers/settings', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setProviders(data.providers || ProvidersManager.getDefaultConfigs());
      } else {
        // Se não encontrou configurações, usar padrão
        setProviders(ProvidersManager.getDefaultConfigs());
      }
    } catch (error) {
      console.error('Erro ao carregar providers:', error);
      setProviders(ProvidersManager.getDefaultConfigs());
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsage = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/providers/usage?date=${today}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setUsage(data.usage || []);
      }
    } catch (error) {
      console.error('Erro ao carregar uso dos providers:', error);
    }
  };

  const updateProvider = async (providerType: ProviderType, config: Partial<ProviderConfig>) => {
    try {
      const response = await fetch('/api/providers/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          provider: providerType,
          ...config,
        }),
      });

      if (response.ok) {
        await loadProviders(); // Recarregar providers
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao atualizar provider');
      }
    } catch (error) {
      console.error('Erro ao atualizar provider:', error);
      throw error;
    }
  };

  const getUsage = async (providerType: ProviderType, date?: string): Promise<ProviderUsage[]> => {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/providers/usage?provider=${providerType}&date=${targetDate}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        return data.usage || [];
      }
      return [];
    } catch (error) {
      console.error('Erro ao buscar uso do provider:', error);
      return [];
    }
  };

  const refreshUsage = async () => {
    await loadUsage();
  };

  return (
    <ProvidersContext.Provider
      value={{
        providers,
        usage,
        isLoading,
        updateProvider,
        getUsage,
        refreshUsage,
      }}
    >
      {children}
    </ProvidersContext.Provider>
  );
}

export const useProviders = () => {
  const context = useContext(ProvidersContext);
  if (context === undefined) {
    throw new Error('useProviders deve ser usado dentro de ProvidersProvider');
  }
  return context;
};