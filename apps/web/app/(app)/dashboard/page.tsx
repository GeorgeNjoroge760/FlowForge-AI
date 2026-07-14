'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { formatDuration, formatRelativeTime } from '@/lib/utils';
import Link from 'next/link';
import {
  Activity,
  Zap,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  ArrowRight,
  TrendingUp,
  Workflow,
} from 'lucide-react';

interface DashboardStats {
  totalWorkflows: number;
  activeWorkflows: number;
  todayExecutions: number;
  failedExecutions: number;
  successRate: number;
  recentExecutions: Array<{
    id: string;
    status: string;
    createdAt: string;
    workflow: { id: string; name: string };
  }>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const data = await api.getWorkflowStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your workflow automation
          </p>
        </div>
        <Link href="/workflows/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Workflow
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workflows</CardTitle>
            <Workflow className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalWorkflows || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.activeWorkflows || 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Executions Today</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.todayExecutions || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.successRate || 0}% success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {stats?.activeWorkflows || 0}
            </div>
            <p className="text-xs text-muted-foreground">Running smoothly</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {stats?.failedExecutions || 0}
            </div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Executions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Executions</CardTitle>
              <CardDescription>Latest workflow runs across your account</CardDescription>
            </div>
            <Link href="/executions">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {stats?.recentExecutions && stats.recentExecutions.length > 0 ? (
            <div className="space-y-4">
              {stats.recentExecutions.map((execution) => (
                <div
                  key={execution.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      {execution.status === 'SUCCESS' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : execution.status === 'FAILED' ? (
                        <XCircle className="h-5 w-5 text-red-500" />
                      ) : execution.status === 'RUNNING' ? (
                        <Activity className="h-5 w-5 text-blue-500 animate-pulse" />
                      ) : (
                        <Clock className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{execution.workflow.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatRelativeTime(execution.createdAt)}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      execution.status === 'SUCCESS'
                        ? 'default'
                        : execution.status === 'FAILED'
                          ? 'destructive'
                          : 'secondary'
                    }
                  >
                    {execution.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Zap className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium">No executions yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Create and run your first workflow to see executions here
              </p>
              <Link href="/workflows/new">
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Workflow
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:border-primary/50 transition-colors">
          <Link href="/workflows/new">
            <CardHeader>
              <Zap className="h-8 w-8 text-blue-500 mb-2" />
              <CardTitle className="text-lg">Create Workflow</CardTitle>
              <CardDescription>
                Build a new automation workflow from scratch or use AI
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>

        <Card className="cursor-pointer hover:border-primary/50 transition-colors">
          <Link href="/templates">
            <CardHeader>
              <TrendingUp className="h-8 w-8 text-violet-500 mb-2" />
              <CardTitle className="text-lg">Browse Templates</CardTitle>
              <CardDescription>
                Start with pre-built templates for common automations
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>

        <Card className="cursor-pointer hover:border-primary/50 transition-colors">
          <Link href="/integrations">
            <CardHeader>
              <Activity className="h-8 w-8 text-green-500 mb-2" />
              <CardTitle className="text-lg">Connect Integrations</CardTitle>
              <CardDescription>
                Link your favorite apps and services to use in workflows
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>
      </div>
    </div>
  );
}
