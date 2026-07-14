'use client';

import { useCallback, useRef } from 'react';
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  ReactFlowProvider,
  type OnConnect,
  type OnNodesChange,
  type OnEdgesChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useWorkflowStore, type WorkflowNodeData } from '@/store/workflow-store';
import { useUiStore } from '@/store/ui-store';
import { nodeTypes } from './nodes';
import { NODE_TYPES, type NodeCategory } from 'shared';

function CanvasInner() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode, selectNode } =
    useWorkflowStore();
  const { setConfigPanelOpen } = useUiStore();

  const handleNodesChange: OnNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);

      const selectChange = changes.find(
        (c) => c.type === 'select' && c.selected && 'id' in c
      ) as { type: 'select'; id: string } | undefined;
      if (selectChange) {
        selectNode(selectChange.id);
        setConfigPanelOpen(true);
      }
    },
    [onNodesChange, selectNode, setConfigPanelOpen]
  );

  const handleEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      onEdgesChange(changes);
    },
    [onEdgesChange]
  );

  const handleConnect: OnConnect = useCallback(
    (connection) => {
      onConnect(connection);
    },
    [onConnect]
  );

  const handlePaneClick = useCallback(() => {
    selectNode(null);
    setConfigPanelOpen(false);
  }, [selectNode, setConfigPanelOpen]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const category = event.dataTransfer.getData('application/reactflow-category');
      const type = event.dataTransfer.getData('application/reactflow-type');
      if (!category || !type) return;

      const typeInfo = NODE_TYPES[category as NodeCategory];
      if (!typeInfo) return;

      const reactFlowEl = reactFlowWrapper.current;
      if (!reactFlowEl) return;

      const bounds = reactFlowEl.getBoundingClientRect();
      const position = {
        x: event.clientX - bounds.left - 100,
        y: event.clientY - bounds.top - 30,
      };

      const newNode = {
        id: `node-${Date.now()}`,
        type,
        position,
        data: {
          type,
          category,
          label: typeInfo.label,
          config: {
            icon: typeInfo.icon,
            ...Object.fromEntries(
              Object.entries(typeInfo.configSchema).map(([key, schema]) => [
                key,
                (schema as { default?: unknown }).default,
              ])
            ),
          },
        } satisfies WorkflowNodeData,
      };

      addNode(newNode);
    },
    [addNode]
  );

  return (
    <div ref={reactFlowWrapper} className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        onPaneClick={handlePaneClick}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid
        snapGrid={[16, 16]}
        defaultEdgeOptions={{
          type: 'default',
          animated: true,
        }}
        className="bg-background"
        proOptions={{ hideAttribution: true }}
      >
        <Controls
          className="!rounded-lg !border-border !bg-card !shadow-md [&>button]:!border-border [&>button]:!bg-card [&>button]:!text-foreground [&>button:hover]:!bg-accent"
        />
        <MiniMap
          nodeStrokeWidth={3}
          className="!rounded-lg !border-border !bg-card"
          maskColor="hsl(var(--background) / 0.8)"
        />
        <Background
          variant={BackgroundVariant.Dots}
          gap={16}
          size={1}
          color="hsl(var(--muted-foreground) / 0.2)"
        />
      </ReactFlow>
    </div>
  );
}

export function WorkflowCanvas() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}
