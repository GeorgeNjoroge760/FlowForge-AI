'use client';

import { cn } from '@/lib/utils';
import { formatDuration, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import type { Execution } from '@/types';

interface ExecutionTableProps {
  executions: Execution[];
  loading?: boolean;
  totalPages?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (field: string) => void;
}

const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
  SUCCESS: { variant: 'default', label: 'Success' },
  FAILED: { variant: 'destructive', label: 'Failed' },
  RUNNING: { variant: 'secondary', label: 'Running' },
  PENDING: { variant: 'outline', label: 'Pending' },
  CANCELLED: { variant: 'secondary', label: 'Cancelled' },
  WAITING: { variant: 'secondary', label: 'Waiting' },
};

function SortButton({ field, label, sortField, sortDirection, onSort }: {
  field: string;
  label: string;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (field: string) => void;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 px-2"
      onClick={() => onSort?.(field)}
    >
      {label}
      <ArrowUpDown className={cn(
        'ml-2 h-3 w-3',
        sortField === field ? 'text-foreground' : 'text-muted-foreground'
      )} />
    </Button>
  );
}

export function ExecutionTable({
  executions,
  loading = false,
  totalPages = 1,
  currentPage = 1,
  onPageChange,
  sortField,
  sortDirection,
  onSort,
}: ExecutionTableProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border">
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-5 w-[80px]" />
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[60px]" />
                <Skeleton className="h-4 w-[120px]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="h-10 px-4 text-left text-xs font-medium text-muted-foreground">
                  <SortButton field="workflow" label="Workflow" sortField={sortField} sortDirection={sortDirection} onSort={onSort} />
                </th>
                <th className="h-10 px-4 text-left text-xs font-medium text-muted-foreground">
                  <SortButton field="status" label="Status" sortField={sortField} sortDirection={sortDirection} onSort={onSort} />
                </th>
                <th className="h-10 px-4 text-left text-xs font-medium text-muted-foreground">
                  <SortButton field="trigger" label="Trigger" sortField={sortField} sortDirection={sortDirection} onSort={onSort} />
                </th>
                <th className="h-10 px-4 text-left text-xs font-medium text-muted-foreground">
                  <SortButton field="duration" label="Duration" sortField={sortField} sortDirection={sortDirection} onSort={onSort} />
                </th>
                <th className="h-10 px-4 text-left text-xs font-medium text-muted-foreground">
                  <SortButton field="date" label="Date" sortField={sortField} sortDirection={sortDirection} onSort={onSort} />
                </th>
              </tr>
            </thead>
            <tbody>
              {executions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="h-24 text-center text-muted-foreground">
                    No executions found
                  </td>
                </tr>
              ) : (
                executions.map((execution) => (
                  <tr key={execution.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="p-4">
                      <Link href={`/executions/${execution.id}`} className="font-medium hover:underline">
                        {execution.workflow?.name || 'Unknown Workflow'}
                      </Link>
                    </td>
                    <td className="p-4">
                      <Badge variant={statusConfig[execution.status]?.variant || 'secondary'}>
                        {statusConfig[execution.status]?.label || execution.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {execution.triggerType || 'Manual'}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {execution.duration ? formatDuration(execution.duration) : '-'}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {formatDate(execution.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}