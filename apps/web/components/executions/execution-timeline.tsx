'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { formatDuration } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LogViewer } from './log-viewer';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  SkipForward,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import type { ExecutionLog } from '@/types';

interface ExecutionTimelineProps {
  logs: ExecutionLog[];
  loading?: boolean;
}

const statusIcons: Record<string, typeof CheckCircle2> = {
  success: CheckCircle2,
  failed: XCircle,
  running: Loader2,
  skipped: SkipForward,
};

const statusColors: Record<string, string> = {
  success: 'text-green-500',
  failed: 'text-red-500',
  running: 'text-blue-500 animate-spin',
  skipped: 'text-muted-foreground',
};

const lineColors: Record<string, string> = {
  success: 'bg-green-500',
  failed: 'bg-red-500',
  running: 'bg-blue-500',
  skipped: 'bg-muted-foreground',
};

export function ExecutionTimeline({ logs, loading = false }: ExecutionTimelineProps) {
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());

  const toggleExpanded = (logId: string) => {
    setExpandedLogs((prev) => {
      const next = new Set(prev);
      if (next.has(logId)) {
        next.delete(logId);
      } else {
        next.add(logId);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="w-3 h-3 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-muted rounded" />
              <div className="h-3 w-48 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No execution logs available
      </div>
    );
  }

  return (
    <div className="relative">
      {logs.map((log, index) => {
        const Icon = statusIcons[log.status] || Clock;
        const isExpanded = expandedLogs.has(log.id);
        const isLast = index === logs.length - 1;

        return (
          <div key={log.id} className="relative flex gap-4 pb-6">
            {!isLast && (
              <div
                className={cn(
                  'absolute left-[5px] top-6 w-0.5 h-full',
                  lineColors[log.status] || 'bg-muted-foreground/30'
                )}
              />
            )}
            <div className="relative z-10 flex-shrink-0">
              <Icon
                className={cn('h-3 w-3 mt-1', statusColors[log.status])}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{log.nodeLabel}</span>
                    <Badge variant="outline" className="text-xs">
                      {log.nodeType}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {log.duration && (
                      <span>{formatDuration(log.duration)}</span>
                    )}
                    {log.retryCount > 0 && (
                      <span>Retry {log.retryCount}</span>
                    )}
                  </div>
                  {log.error && (
                    <p className="text-sm text-red-500">{log.error}</p>
                  )}
                </div>
                {(log.input || log.output) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpanded(log.id)}
                    className="flex-shrink-0"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
              {isExpanded && (
                <div className="mt-4 space-y-4">
                  {log.input && (
                    <div>
                      <h5 className="text-xs font-medium text-muted-foreground mb-2">
                        Input
                      </h5>
                      <LogViewer data={log.input} />
                    </div>
                  )}
                  {log.output && (
                    <div>
                      <h5 className="text-xs font-medium text-muted-foreground mb-2">
                        Output
                      </h5>
                      <LogViewer data={log.output} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}