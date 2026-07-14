'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import {
  Zap,
  Brain,
  ArrowRight,
  FileText,
  Sparkles,
} from 'lucide-react';

export default function NewWorkflowPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [creating, setCreating] = useState(false);
  const [generating, setGenerating] = useState(false);

  async function handleCreateBlank() {
    if (!name.trim()) return;
    setCreating(true);
    try {
      const workflow = await api.createWorkflow({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      router.push(`/workflows/${workflow.id}/editor`);
    } catch (error) {
      console.error('Failed to create workflow:', error);
    } finally {
      setCreating(false);
    }
  }

  async function handleGenerateWithAI() {
    if (!aiPrompt.trim()) return;
    setGenerating(true);
    try {
      const generated = await api.generateWorkflow(aiPrompt.trim());
      const workflow = await api.createWorkflow({
        name: generated.name,
        description: generated.description,
        definition: {
          nodes: generated.nodes.map((n: any, i: number) => ({
            id: n.id || `node-${i}`,
            type: n.type,
            category: n.category,
            label: n.label,
            position: n.position || { x: 250 + i * 250, y: 100 },
            config: n.config || {},
          })),
          edges: generated.edges.map((e: any, i: number) => ({
            id: e.id || `edge-${i}`,
            source: e.source,
            target: e.target,
            sourceHandle: e.sourceHandle,
            targetHandle: e.targetHandle,
          })),
        },
      });
      router.push(`/workflows/${workflow.id}/editor`);
    } catch (error) {
      console.error('Failed to generate workflow:', error);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Workflow</h1>
        <p className="text-muted-foreground mt-2">
          Start from scratch or let AI build it for you
        </p>
      </div>

      {/* AI Builder */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            <CardTitle>AI Workflow Builder</CardTitle>
          </div>
          <CardDescription>
            Describe what you want to automate in natural language
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="When I receive a Gmail from a client, summarize it with AI, save it to Google Sheets, and notify me on Slack."
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <Button
            onClick={handleGenerateWithAI}
            disabled={!aiPrompt.trim() || generating}
            className="w-full"
          >
            {generating ? (
              <>
                <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                Generating workflow...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate with AI
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">or</span>
        </div>
      </div>

      {/* Blank Workflow */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-muted-foreground" />
            <CardTitle>Blank Workflow</CardTitle>
          </div>
          <CardDescription>
            Start with an empty canvas and build manually
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Workflow name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
          <Button
            onClick={handleCreateBlank}
            disabled={!name.trim() || creating}
            variant="outline"
            className="w-full"
          >
            {creating ? (
              'Creating...'
            ) : (
              <>
                Create Blank Workflow
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
