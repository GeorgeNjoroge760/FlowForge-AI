'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { useWorkflowStore } from '@/store/workflow-store';
import { cn } from '@/lib/utils';
import {
  Brain,
  Send,
  Loader2,
  Sparkles,
  Plus,
  X,
  Lightbulb,
  Wand2,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AiChatProps {
  className?: string;
  onClose?: () => void;
}

export function AiChat({ className, onClose }: AiChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'I can help you build workflows with natural language. Try telling me:\n\n- "When I get a new email, summarize it and save to a spreadsheet"\n- "Create a Slack notification when a GitHub PR is opened"\n- "Add a delay of 5 minutes after the first step"',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { nodes, edges, addNode, setNodes, setEdges } = useWorkflowStore();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const result = await api.generateWorkflow(input.trim());

      // Add nodes to canvas
      if (result.nodes && result.nodes.length > 0) {
        const newNodes = result.nodes.map((n: any, i: number) => ({
          id: n.id || `ai-node-${Date.now()}-${i}`,
          type: 'default' as const,
          position: n.position || { x: 250 + i * 250, y: 100 },
          data: {
            type: n.type,
            category: n.category,
            label: n.label,
            config: n.config || {},
          },
        }));

        const newEdges = result.edges.map((e: any, i: number) => ({
          id: e.id || `ai-edge-${Date.now()}-${i}`,
          source: e.source,
          target: e.target,
          sourceHandle: e.sourceHandle,
          targetHandle: e.targetHandle,
          type: 'default' as const,
          animated: true,
        }));

        setNodes([...nodes, ...newNodes]);
        setEdges([...edges, ...newEdges]);
      }

      const assistantMessage: Message = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: `I've created a workflow with ${result.nodes?.length || 0} nodes:\n\n${result.nodes?.map((n: any) => `- **${n.label}** (${n.category})`).join('\n') || 'No nodes generated'}\n\nThe nodes have been added to your canvas. You can adjust their positions and configurations.`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message || 'Failed to generate workflow'}. Please try again with a different description.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const suggestions = [
    'When I receive a Gmail from a client, summarize it and send to Slack',
    'Every day at 9am, check GitHub PRs and notify the team',
    'When a Stripe payment fails, send an email and create a support ticket',
  ];

  return (
    <div className={cn('flex flex-col h-full bg-background border-l', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <span className="font-semibold text-sm">AI Builder</span>
          <Badge variant="secondary" className="text-xs">
            <Sparkles className="h-3 w-3 mr-1" />
            GPT-4o
          </Badge>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-3" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex flex-col gap-1',
                message.role === 'user' ? 'items-end' : 'items-start',
              )}
            >
              <div
                className={cn(
                  'rounded-lg px-3 py-2 text-sm max-w-[90%]',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted',
                )}
              >
                <div className="whitespace-pre-wrap break-words">{message.content}</div>
              </div>
              <span className="text-xs text-muted-foreground px-1">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}

          {loading && (
            <div className="flex items-start">
              <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Suggestions (shown when no messages except welcome) */}
      {messages.length === 1 && (
        <div className="px-3 pb-2 space-y-2">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Lightbulb className="h-3 w-3" />
            Try these:
          </p>
          {suggestions.map((suggestion, i) => (
            <button
              key={i}
              onClick={() => setInput(suggestion)}
              className="w-full text-left text-xs p-2 rounded-md border hover:bg-muted transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your workflow..."
            rows={2}
            className="resize-none text-sm"
            disabled={loading}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="flex-shrink-0 h-auto"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
