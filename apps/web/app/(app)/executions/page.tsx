'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ExecutionTable } from '@/components/executions/execution-table';
import { EmptyState } from '@/components/shared/empty-state';
import { api } from '@/lib/api';
import { Activity, Search, Zap } from 'lucide-react';
import type { Execution, PaginatedResponse, Workflow } from '@/types';

export default function ExecutionsPage() {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [workflowFilter, setWorkflowFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const loadExecutions = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {
        page,
        limit: 10,
      };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (workflowFilter !== 'all') params.workflowId = workflowFilter;

      const response: PaginatedResponse<Execution> = await api.getExecutions(params);
      
      let filteredData = response.data;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredData = filteredData.filter(
          (e) =>
            e.workflow?.name?.toLowerCase().includes(query) ||
            e.id.toLowerCase().includes(query)
        );
      }

      filteredData.sort((a, b) => {
        let comparison = 0;
        switch (sortField) {
          case 'workflow':
            comparison = (a.workflow?.name || '').localeCompare(b.workflow?.name || '');
            break;
          case 'status':
            comparison = a.status.localeCompare(b.status);
            break;
          case 'trigger':
            comparison = (a.triggerType || '').localeCompare(b.triggerType || '');
            break;
          case 'duration':
            comparison = (a.duration || 0) - (b.duration || 0);
            break;
          case 'date':
          default:
            comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            break;
        }
        return sortDirection === 'asc' ? comparison : -comparison;
      });

      setExecutions(filteredData);
      setTotalPages(response.meta.totalPages);
    } catch (error) {
      console.error('Failed to load executions:', error);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, workflowFilter, searchQuery, sortField, sortDirection]);

  const loadWorkflows = async () => {
    try {
      const response = await api.getWorkflows({ limit: 100 });
      setWorkflows(response.data || []);
    } catch (error) {
      console.error('Failed to load workflows:', error);
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, []);

  useEffect(() => {
    loadExecutions();
  }, [loadExecutions]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Executions</h1>
          <p className="text-muted-foreground">
            View and monitor your workflow executions
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>All Executions</CardTitle>
              <CardDescription>
                Track the status and history of your workflow runs
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search executions..."
                  className="pl-8 w-[200px]"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="SUCCESS">Success</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                  <SelectItem value="RUNNING">Running</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={workflowFilter}
                onValueChange={(value) => {
                  setWorkflowFilter(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Workflow" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Workflows</SelectItem>
                  {workflows.map((workflow) => (
                    <SelectItem key={workflow.id} value={workflow.id}>
                      {workflow.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
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
          ) : executions.length === 0 ? (
            <EmptyState
              icon={Activity}
              title="No executions found"
              description={
                searchQuery || statusFilter !== 'all' || workflowFilter !== 'all'
                  ? 'Try adjusting your filters or search query'
                  : 'Run a workflow to see executions here'
              }
            />
          ) : (
            <ExecutionTable
              executions={executions}
              totalPages={totalPages}
              currentPage={page}
              onPageChange={setPage}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}