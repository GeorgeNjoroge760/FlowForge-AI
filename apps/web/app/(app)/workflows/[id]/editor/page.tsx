'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Save,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Play,
  ArrowLeft,
  PanelLeftOpen,
  PanelLeftClose,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { WorkflowCanvas } from '@/components/workflow/canvas';
import { NodePalette } from '@/components/workflow/node-palette';
import { NodeConfigPanel } from '@/components/workflow/node-config-panel';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useWorkflowStore } from '@/store/workflow-store';
import { useUiStore } from '@/store/ui-store';
import { formatRelativeTime } from '@/lib/utils';
import type { Workflow } from '@/types';
import type { Node, Edge } from '@xyflow/react';

export default function WorkflowEditorPage() {
  const params = useParams();
  const workflowId = params.id as string;

  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const {
    nodes,
    edges,
    isDirty,
    isSaving,
    lastSavedAt,
    loadWorkflow,
    setNodes,
    setEdges,
    markSaved,
    markDirty,
  } = useWorkflowStore();

  const { nodePaletteOpen, toggleNodePalette } = useUiStore();

  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadWorkflowData();
  }, [workflowId]);

  useEffect(() => {
    if (isDirty && !isSaving) {
      autoSaveRef.current = setInterval(() => {
        handleSave();
      }, 30000);
    }

    return () => {
      if (autoSaveRef.current) {
        clearInterval(autoSaveRef.current);
      }
    };
  }, [isDirty, isSaving]);

  async function loadWorkflowData() {
    setLoading(true);
    setError(null);
    try {
      const data: Workflow = await api.getWorkflow(workflowId);
      setWorkflow(data);

      const wfNodes: Node[] = (data.definition?.nodes || []).map((n: any) => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: {
          type: n.type,
          category: n.category,
          label: n.label,
          config: n.config || {},
        },
      }));

      const wfEdges: Edge[] = (data.definition?.edges || []).map((e: any) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle,
        label: e.label,
        type: 'default',
        animated: true,
      }));

      loadWorkflow(wfNodes, wfEdges);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workflow');
    } finally {
      setLoading(false);
    }
  }

  const handleSave = useCallback(async () => {
    if (isSaving) return;
    useWorkflowStore.setState({ isSaving: true });

    try {
      await api.updateWorkflow(workflowId, {
        name: workflow?.name,
        definition: { nodes, edges },
      });
      markSaved();
    } catch (err) {
      console.error('Failed to save workflow:', err);
      useWorkflowStore.setState({ isSaving: false });
    }
  }, [workflowId, workflow, nodes, edges, isSaving, markSaved]);

  const handleRun = useCallback(async () => {
    setIsRunning(true);
    try {
      if (isDirty) await handleSave();
      await api.executeWorkflow(workflowId);
    } catch (err) {
      console.error('Failed to run workflow:', err);
    } finally {
      setIsRunning(false);
    }
  }, [workflowId, isDirty, handleSave]);

  if (loading) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-4 border-b border-border px-4 py-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-6 w-48" />
          <div className="ml-auto flex items-center gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
        <div className="flex-1 p-6">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    );
  }

  if (error || !workflow) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-lg text-muted-foreground">
          {error || 'Workflow not found'}
        </p>
        <Link href="/workflows">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Workflows
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex h-full flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-2 border-b border-border px-3 py-1.5">
          <Link href="/workflows">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>

          <Separator orientation="vertical" className="h-6" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={toggleNodePalette}
              >
                {nodePaletteOpen ? (
                  <PanelLeftClose className="h-4 w-4" />
                ) : (
                  <PanelLeftOpen className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle palette</TooltipContent>
          </Tooltip>

          <div className="flex items-center gap-2 min-w-0">
            <h1 className="truncate text-sm font-medium text-foreground">
              {workflow.name}
            </h1>
            {isDirty && (
              <span className="shrink-0 text-xs text-muted-foreground">
                (unsaved)
              </span>
            )}
            {lastSavedAt && !isDirty && (
              <span className="shrink-0 text-xs text-muted-foreground">
                Saved {formatRelativeTime(lastSavedAt)}
              </span>
            )}
          </div>

          <div className="ml-auto flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleSave}
                  disabled={!isDirty || isSaving}
                >
                  <Save className={cn('h-4 w-4', isSaving && 'animate-pulse')} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isSaving ? 'Saving...' : 'Save'}
              </TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="h-6" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                  <Undo2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Undo</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                  <Redo2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Redo</TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="h-6" />

            <Button
              onClick={handleRun}
              disabled={isRunning || nodes.length === 0}
              size="sm"
              className="h-8"
            >
              <Play className={cn('mr-1.5 h-3.5 w-3.5', isRunning && 'animate-pulse')} />
              {isRunning ? 'Running...' : 'Run'}
            </Button>
          </div>
        </div>

        {/* Canvas area */}
        <div className="flex flex-1 overflow-hidden">
          {nodePaletteOpen && <NodePalette />}
          <div className="flex-1">
            <WorkflowCanvas />
          </div>
          <NodeConfigPanel />
        </div>
      </div>
    </TooltipProvider>
  );
}
