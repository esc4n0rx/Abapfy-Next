// components/code/CodeUploader.tsx
'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Alert } from '@/components/ui/alert';
import { Upload, FileText, Code, AlertCircle } from 'lucide-react';

interface CodeUploaderProps {
  onCodeLoaded: (code: string, filename?: string) => void;
  placeholder?: string;
  maxSize?: number; // em KB
}

export function CodeUploader({ 
  onCodeLoaded, 
  placeholder = "Cole seu código ABAP aqui...",
  maxSize = 500 
}: CodeUploaderProps) {
  const [code, setCode] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const validateCode = (codeContent: string): boolean => {
    if (!codeContent.trim()) {
      setError('Código não pode estar vazio');
      return false;
    }

    if (codeContent.length > maxSize * 1024) {
      setError(`Código muito grande. Máximo: ${maxSize}KB`);
      return false;
    }

    // Validação básica se parece com ABAP
    const abapKeywords = ['REPORT', 'PROGRAM', 'DATA', 'SELECT', 'FORM', 'FUNCTION', 'CLASS', 'METHOD'];
    const hasAbapKeyword = abapKeywords.some(keyword => 
      codeContent.toUpperCase().includes(keyword)
    );

    if (!hasAbapKeyword) {
      setError('O código não parece ser ABAP válido');
      return false;
    }

    setError('');
    return true;
  };

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    if (newCode.trim() && validateCode(newCode)) {
      onCodeLoaded(newCode);
    }
  };

  const handleFileUpload = useCallback((file: File) => {
    const validExtensions = ['.abap', '.txt', '.prog', '.fnc', '.clas'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!validExtensions.includes(fileExtension)) {
      setError('Formato não suportado. Use: .abap, .txt, .prog, .fnc, .clas');
      return;
    }

    if (file.size > maxSize * 1024) {
      setError(`Arquivo muito grande. Máximo: ${maxSize}KB`);
      return;
    }

    setUploadedFile(file);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        if (validateCode(content)) {
          setCode(content);
          onCodeLoaded(content, file.name);
        }
      } catch (error) {
        setError('Erro ao ler o arquivo');
      }
    };
    
    reader.readAsText(file);
  }, [maxSize, onCodeLoaded]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 transition-all duration-200 ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <input
            type="file"
            id="code-file"
            className="hidden"
            accept=".abap,.txt,.prog,.fnc,.clas"
            onChange={handleFileChange}
          />
          <label htmlFor="code-file" className="cursor-pointer">
            <div className="flex flex-col items-center">
              {uploadedFile ? (
                <>
                  <FileText className="w-8 h-8 mb-2 text-green-500" />
                  <p className="text-sm font-medium text-green-700">
                    {uploadedFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(uploadedFile.size / 1024).toFixed(1)} KB
                  </p>
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Clique para upload</span> ou arraste o arquivo
                  </p>
                  <p className="text-xs text-gray-500">
                    Formatos: .abap, .txt, .prog, .fnc, .clas
                  </p>
                </>
              )}
            </div>
          </label>
        </div>
      </div>

      {/* Code Editor */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            Código ABAP
          </label>
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <Code className="w-4 h-4" />
            <span>{code.length} caracteres</span>
          </div>
        </div>
        
        <Textarea
          value={code}
          onChange={(e) => handleCodeChange(e.target.value)}
          placeholder={placeholder}
          rows={12}
          className="font-mono text-sm resize-y"
        />
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          {error}
        </Alert>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => {
            setCode('');
            setUploadedFile(null);
            setError('');
          }}
          disabled={!code.trim()}
        >
          Limpar
        </Button>
        
        <div className="text-xs text-gray-500">
          Máximo: {maxSize}KB | Formatos suportados: ABAP, TXT, PROG, FNC, CLAS
        </div>
      </div>
    </div>
  );
}