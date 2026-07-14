'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import {
  Webhook,
  Clock,
  Calendar,
  Mail,
  FormInput,
  CreditCard,
  GitBranch,
  MessageCircle,
  Send,
  Rss,
  Table,
  Globe,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WorkflowNodeData } from '@/store/workflow-store';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  webhook: Webhook,
  clock: Clock,
  calendar: Calendar,
  mail: Mail,
  form: FormInput,
  'credit-card': CreditCard,
  'git-branch': GitBranch,
  'message-circle': MessageCircle,
  send: Send,
  rss: Rss,
  table: Table,
  globe: Globe,
};

function TriggerNodeComponent({ data, selected }: NodeProps & { data: WorkflowNodeData }) {
  const Icon = iconMap[data.config?.icon as string] || iconMap[data.category?.split('_')[1]?.toLowerCase()] || Webhook;

  return (
    <div
      className={cn(
        'relative min-w-[200px] rounded-lg border-2 border-emerald-500/50 bg-card px-4 py-3 shadow-md transition-all',
        selected && 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-background',
        'hover:shadow-lg hover:border-emerald-500'
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-500/10">
          <Icon className="h-5 w-5 text-emerald-500" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-emerald-500">
            Trigger
          </p>
          <p className="truncate text-sm font-medium text-foreground">
            {data.label}
          </p>
        </div>
      </div>

      {!!(data.config as Record<string, unknown>)?.status && (
        <div className="mt-2 flex items-center gap-1.5">
          <span
            className={cn(
              'h-2 w-2 rounded-full',
              (data.config as Record<string, unknown>).status === 'active' ? 'bg-emerald-500' : 'bg-muted-foreground'
            )}
          />
          <span className="text-xs text-muted-foreground capitalize">
            {String((data.config as Record<string, unknown>).status)}
          </span>
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-3 !w-3 !border-2 !border-emerald-500 !bg-background"
      />
    </div>
  );
}

export const TriggerNode = memo(TriggerNodeComponent);
