'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import {
  Sparkles,
  Table,
  Hash,
  MessageCircle,
  Send,
  BookOpen,
  Mail,
  Smartphone,
  Webhook,
  Globe,
  Braces,
  Type,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WorkflowNodeData } from '@/store/workflow-store';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  sparkles: Sparkles,
  table: Table,
  hash: Hash,
  'message-circle': MessageCircle,
  send: Send,
  'book-open': BookOpen,
  mail: Mail,
  smartphone: Smartphone,
  webhook: Webhook,
  globe: Globe,
  braces: Braces,
  type: Type,
};

function ActionNodeComponent({ data, selected }: NodeProps & { data: WorkflowNodeData }) {
  const Icon = iconMap[data.config?.icon as string] || Sparkles;

  return (
    <div
      className={cn(
        'relative min-w-[200px] rounded-lg border-2 border-blue-500/50 bg-card px-4 py-3 shadow-md transition-all',
        selected && 'ring-2 ring-blue-500 ring-offset-2 ring-offset-background',
        'hover:shadow-lg hover:border-blue-500'
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!h-3 !w-3 !border-2 !border-blue-500 !bg-background"
      />

      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-500/10">
          <Icon className="h-5 w-5 text-blue-500" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-blue-500">
            Action
          </p>
          <p className="truncate text-sm font-medium text-foreground">
            {data.label}
          </p>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-3 !w-3 !border-2 !border-blue-500 !bg-background"
      />
    </div>
  );
}

export const ActionNode = memo(ActionNodeComponent);
