// components/layout/Header.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, HelpCircle, Bell, UserCircle2, Settings, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SettingsModal } from './SettingsModal';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

export function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const openSettingsModal = () => {
    setIsProfileOpen(false);
    setIsSettingsModalOpen(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  const getInitials = () => {
    if (!user) return 'U';
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  };

  const getRoleDisplay = () => {
    switch (user?.role) {
      case 'admin': return { label: 'Administrador', color: 'bg-red-100 text-red-800' };
      case 'developer': return { label: 'Desenvolvedor', color: 'bg-blue-100 text-blue-800' };
      case 'viewer': return { label: 'Visualizador', color: 'bg-gray-100 text-gray-800' };
      default: return { label: 'Usuário', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const roleInfo = getRoleDisplay();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white shadow-sm">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center space-x-8">
          {/* Branding */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Abapfy</h1>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar programas, módulos..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-80 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" className="p-2 text-gray-500 hover:text-gray-700">
            <HelpCircle className="w-5 h-5" />
            <span className="sr-only">Ajuda</span>
          </Button>
          
          <Button variant="ghost" size="sm" className="p-2 relative text-gray-500 hover:text-gray-700">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            <span className="sr-only">Notificações</span>
          </Button>

          {/* Profile Menu */}
          <div className="relative">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <div className="flex items-center space-x-3">
                {user?.avatarUrl ? (
                  <img 
                    src={user.avatarUrl} 
                    alt="Avatar" 
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                    {getInitials()}
                  </div>
                )}
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-700">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.company || roleInfo.label}
                  </p>
                </div>
              </div>
            </Button>

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50"
                >
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      {user?.avatarUrl ? (
                        <img 
                          src={user.avatarUrl} 
                          alt="Avatar" 
                          className="w-12 h-12 rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium">
                          {getInitials()}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge 
                            variant="secondary" 
                            className={`text-xs px-2 py-0.5 ${roleInfo.color}`}
                          >
                            {roleInfo.label}
                          </Badge>
                          {user?.company && (
                            <Badge variant="outline" className="text-xs px-2 py-0.5">
                              {user.company}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-1">
                    <button 
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                      onClick={openSettingsModal}
                    >
                      <Settings className="w-4 h-4 mr-3 text-gray-400" />
                      Configurações
                    </button>
                    <button className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left">
                      <User className="w-4 h-4 mr-3 text-gray-400" />
                      Editar Perfil
                    </button>
                    <hr className="my-1 border-gray-100" />
                    <button 
                      className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sair da Conta
                    </button>
                  </div>

                  {user?.lastLogin && (
                    <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
                      <p className="text-xs text-gray-500">
                        Último acesso: {new Date(user.lastLogin).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  )}
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