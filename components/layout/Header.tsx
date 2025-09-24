'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, HelpCircle, Bell, UserCircle2, Settings, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SettingsModal } from './SettingsModal';

export function Header() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const openSettingsModal = () => {
    setIsProfileOpen(false);
    setIsSettingsModalOpen(true);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card shadow-sm">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center space-x-8">
          {/* Branding */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-brand rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <h1 className="text-xl font-semibold text-text">Abapfy</h1>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-subtle" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-64 pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="p-2">
            <HelpCircle className="w-5 h-5" />
            <span className="sr-only">Ajuda</span>
          </Button>
          
          <Button variant="ghost" size="sm" className="p-2 relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            <span className="sr-only">Notificações</span>
          </Button>

          {/* Profile Menu */}
          <div className="relative">
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <UserCircle2 className="w-6 h-6" />
              <span className="sr-only">Perfil do usuário</span>
            </Button>

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg py-1 z-50"
                >
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-medium text-text">Desenvolvedor ABAP</p>
                    <p className="text-sm text-subtle">dev@abapfy.com</p>
                  </div>
                  
                  <div className="py-1">
                    <button 
                      className="flex items-center px-4 py-2 text-sm text-text hover:bg-gray-50 w-full text-left"
                      onClick={openSettingsModal}
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      Configurações
                    </button>
                    <button className="flex items-center px-4 py-2 text-sm text-text hover:bg-gray-50 w-full text-left">
                      <User className="w-4 h-4 mr-3" />
                      Perfil
                    </button>
                    <hr className="my-1 border-border" />
                    <button className="flex items-center px-4 py-2 text-sm text-text hover:bg-gray-50 w-full text-left">
                      <LogOut className="w-4 h-4 mr-3" />
                      Sair
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      {/* Click outside to close profile menu */}
      {isProfileOpen && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => setIsProfileOpen(false)}
        />
      )}

      <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
    </header>
  );
}
