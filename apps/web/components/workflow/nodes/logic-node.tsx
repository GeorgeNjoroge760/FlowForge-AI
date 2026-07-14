'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import {
  Pause,
  Filter,
  Repeat,
  GitBranch,
  Split,
  Code,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WorkflowNodeData } from '@/store/workflow-store';
import { NODE_TYPES, type NodeCategory } from 'shared';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  pause: Pause,
  filter: Filter,
  repeat: Repeat,
  'git-branch': GitBranch,
  split: Split,
  code: Code,
};

function LogicNodeComponent({ data, selected }: NodeProps & { data: WorkflowNodeData }) {
  const typeInfo = NODE_TYPES[data.category as NodeCategory];
  const iconName = typeInfo?.icon || 'pause';
  const Icon = iconMap[iconName] || Pause;
  const outputs = typeInfo?.handles.outputs || ['output'];

  return (
    <div
      className={cn(
        'relative min-w-[200px] rounded-lg border-2 border-purple-500/50 bg-card px-4 py-3 shadow-md transition-all',
        selected && 'ring-2 ring-purple-500 ring-offset-2 ring-offset-background',
        'hover:shadow-lg hover:border-purple-500'
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!h-3 !w-3 !border-2 !border-purple-500 !bg-background"
      />

      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-purple-500/10">
          <Icon className="h-5 w-5 text-purple-500" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-purple-500">
            Logic
          </p>
          <p className="truncate text-sm font-medium text-foreground">
            {data.label}
          </p>
        </div>
      </div>

      {outputs.map((output, index) => {
        const offset = outputs.length === 1 ? 50 : (100 / (outputs.length + 1)) * (index + 1);
        const isConditional = output === 'true' || output === 'false';
        const handleColor = isConditional
          ? output === 'true'
            ? '!border-emerald-500'
            : '!border-red-500'
          : '!border-purple-500';

        return (
          <Handle
            key={output}
            type="source"
            position={Position.Bottom}
            id={output}
            style={{ left: `${offset}%` }}
            className={cn('!h-3 !w-3 !border-2 !bg-background', handleColor)}
          />
        );
      })}

      {outputs.length > 1 && (
        <div className="mt-2 flex gap-2 text-xs text-muted-foreground">
          {outputs.map((output) => (
            <span key={output} className="truncate">
              {output}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export const LogicNode = memo(LogicNodeComponent);
