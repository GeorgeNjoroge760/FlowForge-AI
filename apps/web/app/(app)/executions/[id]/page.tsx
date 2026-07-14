'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ExecutionTimeline } from '@/components/executions/execution-timeline';
import { LogViewer } from '@/components/executions/log-viewer';
import { api } from '@/lib/api';
import { formatDuration, formatDate, formatRelativeTime } from '@/lib/utils';
import {
  ArrowLeft,
  Activity,
  Clock,
  Zap,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import type { Execution } from '@/types';

const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof CheckCircle2; color: string }> = {
  SUCCESS: { variant: 'default', icon: CheckCircle2, color: 'text-green-500' },
  FAILED: { variant: 'destructive', icon: XCircle, color: 'text-red-500' },
  RUNNING: { variant: 'secondary', icon: Activity, color: 'text-blue-500' },
  PENDING: { variant: 'outline', icon: Clock, color: 'text-muted-foreground' },
  CANCELLED: { variant: 'secondary', icon: AlertCircle, color: 'text-orange-500' },
  WAITING: { variant: 'secondary', icon: Clock, color: 'text-yellow-500' },
};

export default function ExecutionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [execution, setExecution] = useState<Execution | null>(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadExecution = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getExecution(params.id as string);
      setExecution(data);
    } catch (err) {
      console.error('Failed to load execution:', err);
      setError('Failed to load execution details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExecution();
  }, [params.id]);

  const handleRetry = async () => {
    if (!execution) return;
    setRetrying(true);
    try {
      await api.retryExecution(execution.id);
      await loadExecution();
    } catch (err) {
      console.error('Failed to retry execution:', err);
    } finally {
      setRetrying(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  if (error || !execution) {
    return (
      <div className="space-y-6">
        <Link href="/executions">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Executions
          </Button>
        </Link>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">{error || 'Execution not found'}</p>
            <Button onClick={loadExecution} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusInfo = statusConfig[execution.status] || statusConfig.PENDING;
  const StatusIcon = statusInfo.icon;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/executions">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {execution.workflow?.name || 'Execution'}
            </h1>
            <p className="text-muted-foreground">
              {formatRelativeTime(execution.createdAt)}
            </p>
          </div>
        </div>
        {execution.status === 'FAILED' && (
          <Button onClick={handleRetry} disabled={retrying}>
            <RefreshCw className={`mr-2 h-4 w-4 ${retrying ? 'animate-spin' : ''}`} />
            {retrying ? 'Retrying...' : 'Retry'}
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <StatusIcon className={`h-4 w-4 ${statusInfo.color}`} />
          </CardHeader>
          <CardContent>
            <Badge variant={statusInfo.variant}>{execution.status}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {execution.duration ? formatDuration(execution.duration) : '-'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trigger</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{execution.triggerType || 'Manual'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits Used</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{execution.creditsUsed}</div>
          </CardContent>
        </Card>
      </div>

      {execution.error && (
        <Card className="border-red-500/50">
          <CardHeader>
            <CardTitle className="text-red-500 flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground font-mono">
              {execution.error}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Input</CardTitle>
          </CardHeader>
          <CardContent>
            {execution.input ? (
              <LogViewer data={execution.input} maxHeight={300} />
            ) : (
              <p className="text-sm text-muted-foreground">No input data</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Output</CardTitle>
          </CardHeader>
          <CardContent>
            {execution.output ? (
              <LogViewer data={execution.output} maxHeight={300} />
            ) : (
              <p className="text-sm text-muted-foreground">
                {execution.status === 'RUNNING' ? 'Still running...' : 'No output data'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Execution Timeline</CardTitle>
          <CardDescription>
            Detailed view of each step in the execution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <ExecutionTimeline logs={execution.logs || []} />
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}