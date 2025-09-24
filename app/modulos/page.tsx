'use client';

import { useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Package } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Toolbar } from '@/components/layout/Toolbar';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Alert } from '@/components/ui/Alert';
import { Textarea } from '@/components/ui/Textarea';
import { modulesMock } from '@/lib/abapSamples';

export default function ModulosPage() {
  const [modules, setModules] = useState(modulesMock);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [newModule, setNewModule] = useState({
    name: '',
    package: '',
    type: 'Function Module',
    description: ''
  });

  const filteredModules = modules.filter(moduleItem => {
    const matchesSearch = moduleItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         moduleItem.package.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'Todos' || moduleItem.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Ativo': return 'success';
      case 'Warning': return 'warning';
      case 'Obsoleto': return 'error';
      default: return 'default';
    }
  };

  const handleCreateModule = () => {
    const moduleItem = {
      id: modules.length + 1,
      ...newModule,
      lastModified: new Date().toISOString().split('T')[0],
      status: 'Ativo'
    };
    
    setModules([...modules, moduleItem]);
    setNewModule({ name: '', package: '', type: 'Function Module', description: '' });
    setShowCreateModal(false);
  };

  const handleDeleteModule = () => {
    if (selectedModule) {
      setModules(modules.filter(m => m.id !== selectedModule.id));
      setShowDeleteConfirm(false);
      setSelectedModule(null);
    }
  };

  const toolbarActions = (
    <>
      <Button onClick={() => setShowCreateModal(true)}>
        <Plus className="w-4 h-4 mr-2" />
        Novo Módulo
      </Button>
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Toolbar 
        title="Gerenciador de Módulos"
        breadcrumb={[{label: 'Home', href: '/dashboard'}, {label: 'Módulos'}]}
        actions={toolbarActions}
      />
      
      <div className="container mx-auto px-6 py-8 space-y-6">
        {/* Filtros */}
        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-subtle" />
                <input
                  type="text"
                  placeholder="Buscar módulos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-subtle" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
              >
                <option>Todos</option>
                <option>Ativo</option>
                <option>Warning</option>
                <option>Obsoleto</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabela de Módulos */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          {filteredModules.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-subtle mx-auto mb-4" />
              <p className="text-subtle mb-2">Nenhum módulo encontrado</p>
              <p className="text-sm text-subtle">
                {searchTerm ? 'Tente ajustar os filtros de busca' : 'Crie seu primeiro módulo para começar'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-border">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm font-medium text-text">Nome</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-text">Tipo</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-text">Pacote</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-text">Modificado</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-text">Status</th>
                    <th className="text-right px-6 py-3 text-sm font-medium text-text">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredModules.map((moduleItem) => (
                    <tr key={moduleItem.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-text">{moduleItem.name}</div>
                          <div className="text-sm text-subtle">{moduleItem.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-text">{moduleItem.type}</td>
                      <td className="px-6 py-4 text-sm text-text">{moduleItem.package}</td>
                      <td className="px-6 py-4 text-sm text-subtle">{moduleItem.lastModified}</td>
                      <td className="px-6 py-4">
                        <Badge variant={getStatusVariant(moduleItem.status)}>
                          {moduleItem.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedModule(moduleItem);
                            setShowDeleteConfirm(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Criar Módulo */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Criar Novo Módulo"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateModule} disabled={!newModule.name.trim()}>
              Criar Módulo
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field
            label="Nome do Módulo"
            value={newModule.name}
            onChange={(e) => setNewModule({...newModule, name: e.target.value})}
            placeholder="Ex: Z_CALC_DISCOUNT"
            required
          />
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text">Tipo</label>
            <select
              value={newModule.type}
              onChange={(e) => setNewModule({...newModule, type: e.target.value})}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option>Function Module</option>
              <option>Class</option>
              <option>CDS View</option>
              <option>Interface</option>
            </select>
          </div>

          <Field
            label="Pacote"
            value={newModule.package}
            onChange={(e) => setNewModule({...newModule, package: e.target.value})}
            placeholder="Ex: ZUTILS"
          />

          <Textarea
            label="Descrição"
            value={newModule.description}
            onChange={(e) => setNewModule({...newModule, description: e.target.value})}
            placeholder="Breve descrição da funcionalidade..."
            rows={3}
          />
        </div>
      </Modal>

      {/* Modal Confirmar Exclusão */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Confirmar Exclusão"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDeleteModule}>
              Excluir
            </Button>
          </>
        }
      >
        <Alert type="warning">
          Tem certeza que deseja excluir o módulo <strong>{selectedModule?.name}</strong>?
          Esta ação não pode ser desfeita.
        </Alert>
      </Modal>
    </div>
  );
}