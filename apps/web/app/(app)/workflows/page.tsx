'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { formatRelativeTime } from '@/lib/utils';
import type { Workflow as WorkflowType, PaginatedResponse } from '@/types';
import {
  Plus,
  Search,
  MoreHorizontal,
  Play,
  Pause,
  Trash2,
  Copy,
  Workflow,
  Zap,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<WorkflowType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadWorkflows();
  }, [page, search]);

  async function loadWorkflows() {
    setLoading(true);
    try {
      const data: PaginatedResponse<WorkflowType> = await api.getWorkflows({
        page,
        limit: 20,
        search: search || undefined,
      });
      setWorkflows(data.data);
      setTotalPages(data.meta.totalPages);
    } catch (error) {
      console.error('Failed to load workflows:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this workflow?')) return;
    try {
      await api.deleteWorkflow(id);
      loadWorkflows();
    } catch (error) {
      console.error('Failed to delete workflow:', error);
    }
  }

  async function handleDuplicate(id: string) {
    try {
      await api.duplicateWorkflow(id);
      loadWorkflows();
    } catch (error) {
      console.error('Failed to duplicate workflow:', error);
    }
  }

  async function handleToggleStatus(workflow: WorkflowType) {
    try {
      await api.updateWorkflow(workflow.id, {
        status: workflow.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
      });
      loadWorkflows();
    } catch (error) {
      console.error('Failed to update workflow:', error);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workflows</h1>
          <p className="text-muted-foreground">
            Manage your automation workflows
          </p>
        </div>
        <Link href="/workflows/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Workflow
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search workflows..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="pl-9"
        />
      </div>

      {/* Workflow List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : workflows.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Workflow className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium">No workflows found</p>
            <p className="text-sm text-muted-foreground mb-4">
              {search
                ? 'Try a different search term'
                : 'Create your first workflow to get started'}
            </p>
            {!search && (
              <Link href="/workflows/new">
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Workflow
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {workflows.map((workflow) => (
            <Card key={workflow.id} className="hover:border-primary/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Zap className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/workflows/${workflow.id}/editor`}
                        className="font-medium hover:underline truncate block"
                      >
                        {workflow.name}
                      </Link>
                      <p className="text-sm text-muted-foreground truncate">
                        {workflow.description || 'No description'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge
                      variant={workflow.status === 'ACTIVE' ? 'default' : 'secondary'}
                    >
                      {workflow.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground hidden sm:inline">
                      {formatRelativeTime(workflow.updatedAt)}
                    </span>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/workflows/${workflow.id}/editor`}>
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(workflow)}>
                          {workflow.status === 'ACTIVE' ? (
                            <>
                              <Pause className="mr-2 h-4 w-4" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <Play className="mr-2 h-4 w-4" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(workflow.id)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(workflow.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
