'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Toolbar } from '@/components/layout/Toolbar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Modal } from '@/components/ui/Modal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProviders } from '@/hooks/useProviders';
import { useAuth } from '@/hooks/useAuth';
import { ChatMessageEntity, ChatProject, ChatSession } from '@/types/chat';
import { ProviderConfig } from '@/types/providers';
import {
  FolderPlus,
  Loader2,
  MessageSquare,
  Plus,
  Send,
  Sparkles,
  Trash,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PendingMessage extends ChatMessageEntity {
  pending?: boolean;
}

export default function ChatConsultorPage() {
  const { providers } = useProviders();
  const { user } = useAuth();

  const [projects, setProjects] = useState<ChatProject[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<PendingMessage[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [projectForm, setProjectForm] = useState({ name: '', description: '' });
  const [sessionForm, setSessionForm] = useState({ title: '', provider: '', model: '', projectId: '' });
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [isSavingSession, setIsSavingSession] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [chatError, setChatError] = useState<string | null>(null);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const messageEndRef = useRef<HTMLDivElement | null>(null);

  const availableProviders = useMemo(
    () => providers.filter((provider) => provider.isEnabled && provider.apiKey),
    [providers]
  );

  const selectedSession = useMemo(
    () => sessions.find((session) => session.id === selectedSessionId) || null,
    [sessions, selectedSessionId]
  );

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    if (selectedProjectId) {
      loadSessions(selectedProjectId);
    } else {
      loadSessions();
    }
  }, [selectedProjectId, loadSessions]);

  useEffect(() => {
    if (selectedSession) {
      loadMessages(selectedSession.id);
    } else {
      setMessages([]);
    }
  }, [selectedSession, loadMessages]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isStreaming]);

  const loadProjects = useCallback(async () => {
    setIsLoadingProjects(true);
    try {
      const response = await fetch('/api/chat/projects', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error('Erro ao carregar projetos de chat', error);
    } finally {
      setIsLoadingProjects(false);
    }
  }, []);

  const loadSessions = useCallback(async (projectId?: string | null) => {
    setIsLoadingSessions(true);
    try {
      const params = new URLSearchParams();
      if (projectId === 'none') {
        params.append('projectId', 'none');
      } else if (projectId) {
        params.append('projectId', projectId);
      }
      const response = await fetch(`/api/chat/sessions${params.toString() ? `?${params.toString()}` : ''}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        const sessionsList: ChatSession[] = data.sessions || [];
        setSessions(sessionsList);
        if (!sessionsList.length) {
          setSelectedSessionId(null);
        } else if (!sessionsList.find((session) => session.id === selectedSessionId)) {
          setSelectedSessionId(sessionsList[0].id);
        }
      } else if (response.status === 404) {
        setSessions([]);
      }
    } catch (error) {
      console.error('Erro ao carregar sessões de chat', error);
    } finally {
      setIsLoadingSessions(false);
    }
  }, [selectedSessionId]);

  const loadMessages = useCallback(async (sessionId: string) => {
    setIsLoadingMessages(true);
    try {
      const response = await fetch(`/api/chat/messages?sessionId=${sessionId}`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens', error);
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  const resetProjectForm = () => {
    setProjectForm({ name: '', description: '' });
    setIsProjectModalOpen(false);
    setProjectError(null);
  };

  const resetSessionForm = () => {
    setSessionForm({ title: '', provider: '', model: '', projectId: '' });
    setIsSessionModalOpen(false);
    setSessionError(null);
  };

  const handleCreateProject = async () => {
    if (!projectForm.name.trim()) {
      setProjectError('Informe o nome do projeto.');
      return;
    }

    setIsSavingProject(true);
    setProjectError(null);
    try {
      const response = await fetch('/api/chat/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(projectForm),
      });

      if (response.ok) {
        const data = await response.json();
        setProjects((prev) => [data.project, ...prev]);
        resetProjectForm();
      } else {
        const error = await response.json();
        setProjectError(error.error || 'Não foi possível criar o projeto');
      }
    } catch (error) {
      console.error('Erro ao criar projeto', error);
      setProjectError('Erro interno ao criar projeto');
    } finally {
      setIsSavingProject(false);
    }
  };

  const defaultProvider = useMemo(() => availableProviders[0], [availableProviders]);

  useEffect(() => {
    if (isSessionModalOpen) {
      setSessionForm((prev) => ({
        ...prev,
        provider: prev.provider || defaultProvider?.type || '',
        model: prev.model || defaultProvider?.defaultModel || '',
        projectId: selectedProjectId && selectedProjectId !== 'none' ? selectedProjectId : '',
      }));
    }
  }, [isSessionModalOpen, defaultProvider, selectedProjectId]);

  const selectedProviderConfig = useMemo<ProviderConfig | undefined>(
    () => availableProviders.find((config) => config.type === sessionForm.provider),
    [availableProviders, sessionForm.provider]
  );

  const handleCreateSession = async () => {
    if (!sessionForm.title.trim()) {
      setSessionError('Informe o título da conversa.');
      return;
    }

    if (!sessionForm.provider || !sessionForm.model) {
      setSessionError('Selecione o provider e o modelo da IA.');
      return;
    }

    setIsSavingSession(true);
    setSessionError(null);

    try {
      const response = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: sessionForm.title,
          provider: sessionForm.provider,
          model: sessionForm.model,
          projectId: sessionForm.projectId || null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSessions((prev) => [data.session, ...prev]);
        setSelectedSessionId(data.session.id);
        resetSessionForm();
      } else {
        const error = await response.json();
        setSessionError(error.error || 'Não foi possível criar a conversa');
      }
    } catch (error) {
      console.error('Erro ao criar conversa', error);
      setSessionError('Erro interno ao criar conversa');
    } finally {
      setIsSavingSession(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Deseja realmente excluir esta conversa?')) {
      return;
    }

    try {
      const response = await fetch(`/api/chat/sessions/${sessionId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setSessions((prev) => prev.filter((session) => session.id !== sessionId));
        if (selectedSessionId === sessionId) {
          setSelectedSessionId(null);
          setMessages([]);
        }
      }
    } catch (error) {
      console.error('Erro ao excluir conversa', error);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedSession) {
      setChatError('Crie ou selecione uma sessão para iniciar o chat.');
      return;
    }

    if (!inputMessage.trim()) {
      return;
    }

    setChatError(null);
    const userMessage: PendingMessage = {
      id: `temp-user-${Date.now()}`,
      sessionId: selectedSession.id,
      userId: user?.id || 'me',
      role: 'user',
      content: inputMessage,
      createdAt: new Date().toISOString(),
      pending: true,
    };

    const assistantMessage: PendingMessage = {
      id: `temp-assistant-${Date.now()}`,
      sessionId: selectedSession.id,
      userId: selectedSession.userId,
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString(),
      pending: true,
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInputMessage('');
    setIsStreaming(true);

    try {
      const response = await fetch('/api/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          sessionId: selectedSession.id,
          message: userMessage.content,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        setChatError(error.error || 'Não foi possível enviar a mensagem');
        await loadMessages(selectedSession.id);
        return;
      }

      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          setMessages((prev) =>
            prev.map((message) =>
              message.id === assistantMessage.id
                ? { ...message, content: accumulated }
                : message
            )
          );
        }

        accumulated += decoder.decode();

        setMessages((prev) => prev.filter((message) => !message.id.startsWith('temp-')));
        await loadMessages(selectedSession.id);
      }
    } catch (error) {
      console.error('Erro durante o streaming da IA', error);
      setChatError('Erro durante a geração da resposta. Tente novamente.');
      await loadMessages(selectedSession.id);
    } finally {
      setIsStreaming(false);
    }
  };

  const renderMessage = (message: PendingMessage) => {
    const isUser = message.role === 'user';
    return (
      <div
        key={message.id}
        className={cn('flex w-full', isUser ? 'justify-end' : 'justify-start')}
      >
        <div
          className={cn(
            'max-w-3xl rounded-2xl px-4 py-3 shadow-sm border',
            isUser
              ? 'bg-brand text-white border-brand/80'
              : 'bg-white border-border text-gray-900'
          )}
        >
          {!isUser && (
            <div className="flex items-center gap-2 text-sm font-medium text-brand mb-2">
              <MessageSquare className="w-4 h-4" />
              Consultor Virtual
            </div>
          )}
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
        </div>
      </div>
    );
  };

  const toolbarActions = (
    <div className="flex gap-3">
      <Button onClick={() => setIsProjectModalOpen(true)} variant="secondary">
        <FolderPlus className="w-4 h-4 mr-2" />
        Novo Projeto
      </Button>
      <Button
        onClick={() => setIsSessionModalOpen(true)}
        disabled={!availableProviders.length}
      >
        <Plus className="w-4 h-4 mr-2" />
        Nova Conversa
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Toolbar
        title="Consultor SAP - Modo Chat"
        breadcrumb={[{ label: 'Home', href: '/dashboard' }, { label: 'Chat Consultor' }]}
        actions={toolbarActions}
      />

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="w-4 h-4 text-brand" />
                Projetos & Conversas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                <div className="p-4 space-y-6">
                  <div>
                    <h3 className="text-xs font-semibold uppercase text-gray-500 mb-3">Projetos</h3>
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          setSelectedProjectId(null);
                        }}
                        className={cn(
                          'w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors',
                          selectedProjectId === null
                            ? 'border-brand bg-brand/10 text-brand'
                            : 'border-transparent hover:bg-gray-100 text-gray-700'
                        )}
                      >
                        Todos os projetos
                      </button>
                      <button
                        onClick={() => setSelectedProjectId('none')}
                        className={cn(
                          'w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors',
                          selectedProjectId === 'none'
                            ? 'border-brand bg-brand/10 text-brand'
                            : 'border-transparent hover:bg-gray-100 text-gray-700'
                        )}
                      >
                        Sem projeto
                      </button>
                      {isLoadingProjects && (
                        <div className="flex items-center gap-2 text-sm text-gray-500 px-3 py-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Carregando projetos...
                        </div>
                      )}
                      {projects.map((project) => (
                        <button
                          key={project.id}
                          onClick={() => setSelectedProjectId(project.id)}
                          className={cn(
                            'w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors',
                            selectedProjectId === project.id
                              ? 'border-brand bg-brand/10 text-brand'
                              : 'border-transparent hover:bg-gray-100 text-gray-700'
                          )}
                        >
                          <div className="font-medium">{project.name}</div>
                          {project.description && (
                            <p className="text-xs text-gray-500 line-clamp-2">{project.description}</p>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-semibold uppercase text-gray-500">Conversas</h3>
                      <Badge variant="outline" className="text-[10px]">
                        {sessions.length}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {isLoadingSessions && (
                        <div className="flex items-center gap-2 text-sm text-gray-500 px-3 py-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Carregando conversas...
                        </div>
                      )}
                      {sessions.map((session) => (
                        <div
                          key={session.id}
                          className={cn(
                            'border rounded-lg p-3 cursor-pointer group relative',
                            selectedSessionId === session.id
                              ? 'border-brand bg-brand/5'
                              : 'border-border hover:bg-gray-100'
                          )}
                          onClick={() => setSelectedSessionId(session.id)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="text-sm font-semibold text-gray-900 group-hover:text-brand">
                                {session.title}
                              </div>
                              <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-gray-500">
                                <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                  <Sparkles className="w-3 h-3" />
                                  {session.provider.toUpperCase()} · {session.model}
                                </span>
                                {session.project?.name && (
                                  <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                                    {session.project.name}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-2">
                                Última atividade: {new Date(session.lastActivityAt).toLocaleString('pt-BR')}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-400 hover:text-red-500"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleDeleteSession(session.id);
                              }}
                            >
                              <Trash className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}

                      {!sessions.length && !isLoadingSessions && (
                        <div className="text-sm text-gray-500 border border-dashed border-gray-300 rounded-lg p-4">
                          Nenhuma conversa encontrada. Crie uma nova sessão para começar.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="border-border/80 flex flex-col h-[700px]">
            <CardHeader className="border-b border-border/70">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-brand" />
                    {selectedSession ? selectedSession.title : 'Inicie uma conversa'}
                  </CardTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedSession
                      ? 'Faça perguntas específicas sobre SAP, SPRO e ABAP. A IA manterá o contexto da conversa.'
                      : 'Crie uma nova sessão de chat com o consultor virtual para tirar dúvidas sobre SAP.'}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Streaming ativo
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">
                    Contexto preservado durante toda a sessão.
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              <ScrollArea className="flex-1 px-6 py-6">
                <div className="space-y-4">
                  {isLoadingMessages && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Carregando histórico...
                    </div>
                  )}
                  {!isLoadingMessages && messages.length === 0 && (
                    <div className="text-sm text-gray-500 border border-dashed border-gray-300 rounded-lg p-6 text-center">
                      {selectedSession
                        ? 'Nenhuma mensagem ainda. Envie a primeira pergunta para iniciar.'
                        : 'Selecione ou crie uma conversa para começar a usar o consultor virtual.'}
                    </div>
                  )}
                  {messages.map(renderMessage)}
                  {isStreaming && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      A IA está respondendo...
                    </div>
                  )}
                  <div ref={messageEndRef} />
                </div>
              </ScrollArea>

              <div className="border-t border-border/60 bg-gray-50 p-4">
                {chatError && (
                  <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                    {chatError}
                  </div>
                )}
                <div className="flex items-end gap-3">
                  <Textarea
                    value={inputMessage}
                    onChange={(event) => setInputMessage(event.target.value)}
                    placeholder={
                      selectedSession
                        ? 'Descreva sua dúvida sobre SAP, SPRO ou ABAP...'
                        : 'Crie uma conversa antes de enviar mensagens.'
                    }
                    disabled={!selectedSession || isStreaming}
                    rows={3}
                  />
                  <Button
                    className="h-12 px-6"
                    onClick={handleSendMessage}
                    disabled={!selectedSession || isStreaming || !inputMessage.trim()}
                  >
                    {isStreaming ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Modal
        isOpen={isProjectModalOpen}
        onClose={resetProjectForm}
        title="Novo Projeto de Conversa"
        footer={
          <>
            <Button variant="ghost" onClick={resetProjectForm}>Cancelar</Button>
            <Button onClick={handleCreateProject} disabled={isSavingProject}>
              {isSavingProject ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar Projeto'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {projectError && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {projectError}
            </div>
          )}
          <Input
            placeholder="Nome do projeto"
            value={projectForm.name}
            onChange={(event) => setProjectForm((prev) => ({ ...prev, name: event.target.value }))}
          />
          <Textarea
            placeholder="Descrição opcional"
            value={projectForm.description}
            onChange={(event) => setProjectForm((prev) => ({ ...prev, description: event.target.value }))}
            rows={4}
          />
        </div>
      </Modal>

      <Modal
        isOpen={isSessionModalOpen}
        onClose={resetSessionForm}
        title="Nova Conversa com o Consultor"
        footer={
          <>
            <Button variant="ghost" onClick={resetSessionForm}>Cancelar</Button>
            <Button onClick={handleCreateSession} disabled={isSavingSession || !availableProviders.length}>
              {isSavingSession ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Iniciar Conversa'}
            </Button>
          </>
        }
      >
        {!availableProviders.length ? (
          <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-lg p-4">
            Nenhum provider configurado. Acesse as configurações de providers para cadastrar uma chave de API.
          </div>
        ) : (
          <div className="space-y-4">
            {sessionError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {sessionError}
              </div>
            )}
            <Input
              placeholder="Título da conversa"
              value={sessionForm.title}
              onChange={(event) => setSessionForm((prev) => ({ ...prev, title: event.target.value }))}
            />

            <Select
              value={sessionForm.provider}
              onValueChange={(value) => {
                const provider = availableProviders.find((item) => item.type === value);
                setSessionForm((prev) => ({
                  ...prev,
                  provider: value,
                  model: provider?.defaultModel || '',
                }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o provider" />
              </SelectTrigger>
              <SelectContent>
                {availableProviders.map((provider) => (
                  <SelectItem key={provider.type} value={provider.type}>
                    {provider.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedProviderConfig?.models?.length ? (
              <Select
                value={sessionForm.model}
                onValueChange={(value) =>
                  setSessionForm((prev) => ({
                    ...prev,
                    model: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Modelo" />
                </SelectTrigger>
                <SelectContent>
                  {selectedProviderConfig.models.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                placeholder="Modelo"
                value={sessionForm.model}
                onChange={(event) =>
                  setSessionForm((prev) => ({
                    ...prev,
                    model: event.target.value,
                  }))
                }
              />
            )}

            <Select
              value={sessionForm.projectId}
              onValueChange={(value) =>
                setSessionForm((prev) => ({
                  ...prev,
                  projectId: value,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Vincular a um projeto?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sem projeto</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </Modal>
    </div>
  );
}
