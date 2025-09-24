'use client';

import { useState } from 'react';
import { Save, Play, Code, Share, Wand2, Upload } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Toolbar } from '@/components/layout/Toolbar';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Field } from '@/components/ui/Field';
import { Alert } from '@/components/ui/Alert';
import { Modal } from '@/components/ui/Modal';
import { Tabs } from '@/components/ui/Tabs';
import { helloProgram } from '@/lib/abapSamples';

export default function ProgramasPage() {
  const [code, setCode] = useState(helloProgram);
  const [programName, setProgramName] = useState('ZHELLO_ABAPFY');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [output, setOutput] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    // Simula geração com IA
    setTimeout(() => {
      const mockGeneratedCode = `REPORT z${prompt.toLowerCase().replace(/\s+/g, '_')}.

* Programa gerado automaticamente pela IA do Abapfy
* Prompt: ${prompt}

DATA: lv_result TYPE string.

START-OF-SELECTION.
  lv_result = 'Programa criado com sucesso usando IA!'.
  WRITE: / lv_result.

* Lógica personalizada baseada no prompt
PERFORM process_user_request.

FORM process_user_request.
  WRITE: / 'Executando lógica para: ${prompt}'.
ENDFORM.`;

      setCode(mockGeneratedCode);
      setIsGenerating(false);
      setPrompt('');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 2000);
  };

  const handleExecute = () => {
    setOutput(`Executando programa: ${programName}

[14:32:15] Início da execução
[14:32:15] Hello ABAPFY - Sua plataforma de desenvolvimento ABAP!
[14:32:15] Bem-vindo ao futuro do desenvolvimento SAP.
[14:32:15] ABAPFY está funcionando perfeitamente!
[14:32:16] Execução concluída com sucesso

Tempo total: 1.2 segundos
Linhas processadas: 8
Status: ✅ Sucesso`);
  };

  const handleFormat = () => {
    // Simula formatação de código
    const formattedCode = code
      .replace(/\bDATA:/g, 'DATA:')
      .replace(/\bWRITE:/g, 'WRITE:')
      .replace(/\bSTART-OF-SELECTION/g, 'START-OF-SELECTION');
    setCode(formattedCode);
  };

  const tabs = [
    {
      id: 'editor',
      label: 'Editor de Código',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <Field
                label="Nome do Programa"
                value={programName}
                onChange={(e) => setProgramName(e.target.value)}
                placeholder="Ex: ZTEST_PROGRAM"
              />
              
              <div className="space-y-3">
                <label className="block text-sm font-medium text-text">
                  Gerador IA
                </label>
                <Textarea
                  placeholder="Descreva o que você quer criar... Ex: 'Criar um relatório de vendas com filtro por data'"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                />
                <Button 
                  onClick={handleGenerate}
                  loading={isGenerating}
                  disabled={!prompt.trim()}
                  className="w-full"
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  Gerar com IA
                </Button>
              </div>

              <div className="pt-4 border-t border-border">
                <Button variant="secondary" className="w-full">
                  <Upload className="w-4 h-4 mr-2" />
                  Carregar Arquivo
                </Button>
              </div>
            </div>

            <div className="lg:col-span-2">
              <Textarea
                label="Código ABAP"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={20}
                className="font-mono"
                placeholder="Seu código ABAP aqui..."
              />
            </div>
          </div>

          {showSuccess && (
            <Alert type="success">
              Código gerado com sucesso! Você pode editá-lo ou executar diretamente.
            </Alert>
          )}
        </div>
      )
    },
    {
      id: 'output',
      label: 'Saída',
      content: (
        <div className="space-y-4">
          {output ? (
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm whitespace-pre-line">
              {output}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
                <Play className="w-8 h-8 text-subtle" />
              </div>
              <p className="text-subtle">Execute o programa para ver a saída aqui</p>
            </div>
          )}
        </div>
      )
    }
  ];

  const toolbarActions = (
    <>
      <Button variant="secondary" onClick={handleFormat}>
        <Code className="w-4 h-4 mr-2" />
        Formatar
      </Button>
      <Button variant="secondary">
        <Save className="w-4 h-4 mr-2" />
        Salvar
      </Button>
      <Button onClick={handleExecute}>
        <Play className="w-4 h-4 mr-2" />
        Executar
      </Button>
      <Button variant="tertiary" onClick={() => setShowShareModal(true)}>
        <Share className="w-4 h-4 mr-2" />
        Compartilhar
      </Button>
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Toolbar 
        title="Editor de Programas ABAP"
        breadcrumb={[{label: 'Home', href: '/dashboard'}, {label: 'Programas'}]}
        actions={toolbarActions}
      />
      
      <div className="container mx-auto px-6 py-8">
        <Tabs tabs={tabs} />
      </div>

      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="Compartilhar Programa"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowShareModal(false)}>
              Cancelar
            </Button>
            <Button>
              Copiar Link
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-subtle">
            Gere um link público para compartilhar este programa com outros desenvolvedores.
          </p>
          <Field
            label="Link Público"
            value="https://abapfy.com/share/zhello-abapfy-abc123"
            readOnly
          />
        </div>
      </Modal>
    </div>
  );
}