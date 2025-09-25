'use client';

import { useState } from 'react';
import { Play, Square, SkipForward, Bug } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Toolbar } from '@/components/layout/Toolbar';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Field } from '@/components/ui/Field';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { sampleABAPCode, debugFramesMock, debugVariablesMock } from '@/lib/abapSamples';

export default function DebuggerPage() {
  const [code, setCode] = useState(sampleABAPCode);
  const [breakpoints, setBreakpoints] = useState('15,23');
  const [isDebugging, setIsDebugging] = useState(false);
  const [currentLine, setCurrentLine] = useState<number | null>(null);
  const [debugFrames, setDebugFrames] = useState(debugFramesMock);
  const [variables, setVariables] = useState(debugVariablesMock);

  const handleStartDebug = () => {
    setIsDebugging(true);
    setCurrentLine(15);
    // Simula início do debug
  };

  const handleStopDebug = () => {
    setIsDebugging(false);
    setCurrentLine(null);
  };

  const handleStepOver = () => {
    if (currentLine === 15) {
      setCurrentLine(23);
    } else if (currentLine === 23) {
      setCurrentLine(45);
    } else {
      handleStopDebug();
    }
  };

  const renderCodeWithHighlight = () => {
    const lines = code.split('\n');
    const breakpointLines = breakpoints.split(',').map(bp => parseInt(bp.trim())).filter(Boolean);
    
    return (
      <div className="bg-gray-900 text-gray-300 p-4 rounded-lg font-mono text-sm overflow-auto">
        {lines.map((line, index) => {
          const lineNumber = index + 1;
          const isBreakpoint = breakpointLines.includes(lineNumber);
          const isCurrentLine = lineNumber === currentLine;
          
          return (
            <div
              key={lineNumber}
              className={`flex ${isCurrentLine ? 'bg-yellow-600/20' : ''} ${isBreakpoint ? 'bg-red-600/20' : ''}`}
            >
              <span className="w-10 text-right mr-4 text-gray-500 select-none">
                {lineNumber}
              </span>
              {isBreakpoint && (
                <span className="w-2 h-5 bg-red-500 rounded-full mr-2 mt-0.5 flex-shrink-0"></span>
              )}
              {isCurrentLine && (
                <span className="w-0 h-0 border-l-4 border-l-yellow-500 border-t-2 border-b-2 border-t-transparent border-b-transparent mr-2 mt-2"></span>
              )}
              <span className="flex-1">{line}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const toolbarActions = (
    <>
      {!isDebugging ? (
        <Button onClick={handleStartDebug}>
          <Play className="w-4 h-4 mr-2" />
          Iniciar Debug
        </Button>
      ) : (
        <>
          <Button onClick={handleStepOver}>
            <SkipForward className="w-4 h-4 mr-2" />
            Próximo
          </Button>
          <Button variant="danger" onClick={handleStopDebug}>
            <Square className="w-4 h-4 mr-2" />
            Parar
          </Button>
        </>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Toolbar 
        title="Debugger Virtual ABAP"
        breadcrumb={[{label: 'Home', href: '/dashboard'}, {label: 'Debugger'}]}
        actions={toolbarActions}
      />
      
      <div className="container mx-auto px-6 py-8 space-y-6">
        <Alert variant="default">
          <strong>Simulação Estática:</strong> Este debugger não executa código ABAP real, apenas simula 
          a execução para fins educacionais e análise de fluxo.
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Editor e Configuração */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-lg border border-border p-6">
              <h3 className="text-lg font-semibold text-text mb-4">Código ABAP</h3>
              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={15}
                className="font-mono"
                placeholder="Cole seu código ABAP aqui..."
              />
            </div>

            <div className="bg-card rounded-lg border border-border p-6">
              <h3 className="text-lg font-semibold text-text mb-4">Breakpoints</h3>
              <Field
                label="Linhas (separadas por vírgula)"
                value={breakpoints}
                onChange={(e) => setBreakpoints(e.target.value)}
                placeholder="Ex: 15, 23, 45"
                description="Especifique os números das linhas onde deseja pausar a execução"
              />
            </div>

            {/* Visualização do Código com Highlight */}
            {isDebugging && (
              <div className="bg-card rounded-lg border border-border p-6">
                <h3 className="text-lg font-semibold text-text mb-4 flex items-center">
                  <Bug className="w-5 h-5 mr-2" />
                  Execução - Linha {currentLine}
                </h3>
                {renderCodeWithHighlight()}
              </div>
            )}
          </div>

          {/* Painel de Debug */}
          <div className="space-y-6">
            {/* Call Stack */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h3 className="text-lg font-semibold text-text mb-4">Pilha de Execução</h3>
              {isDebugging ? (
                <div className="space-y-2">
                  {debugFrames.map((frame, index) => (
                    <div 
                      key={index}
                      className="p-3 bg-gray-50 rounded border text-sm"
                    >
                      <div className="font-medium text-text">
                        Linha {frame.line}: {frame.method}
                      </div>
                      <div className="text-subtle text-xs">
                        {frame.program}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-subtle text-sm">Inicie o debug para ver a pilha</p>
              )}
            </div>

            {/* Variáveis */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h3 className="text-lg font-semibold text-text mb-4">Variáveis</h3>
              {isDebugging ? (
                <div className="space-y-3">
                  {variables.map((variable, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded text-sm">
                      <div className="flex-1">
                        <div className="font-medium text-text">{variable.name}</div>
                        <div className="text-xs text-subtle">{variable.type}</div>
                      </div>
                      <Badge variant="default" className="text-xs">
                        {variable.value}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-subtle text-sm">Inicie o debug para ver as variáveis</p>
              )}
            </div>

            {/* Status */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h3 className="text-lg font-semibold text-text mb-4">Status</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-subtle">Estado:</span>
                  <Badge variant={isDebugging ? 'warning' : 'default'}>
                    {isDebugging ? 'Debugando' : 'Parado'}
                  </Badge>
                </div>
                {isDebugging && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-subtle">Linha Atual:</span>
                      <span className="text-text font-medium">{currentLine}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-subtle">Breakpoints:</span>
                      <span className="text-text">{breakpoints.split(',').length}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}