'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Mail,
  Table,
  Hash,
  MessageCircle,
  Send,
  GitBranch,
  Sparkles,
  BookOpen,
  CreditCard,
  Link2,
  Unlink,
} from 'lucide-react';
import type { IntegrationDefinition } from 'shared';
import type { Integration } from '@/types';

interface IntegrationCardProps {
  definition: IntegrationDefinition;
  connection?: Integration;
  onConnect?: (provider: string) => void;
  onDisconnect?: (provider: string) => void;
  loading?: boolean;
}

const iconMap: Record<string, typeof Mail> = {
  mail: Mail,
  table: Table,
  hash: Hash,
  'message-circle': MessageCircle,
  send: Send,
  'git-branch': GitBranch,
  sparkles: Sparkles,
  'book-open': BookOpen,
  'credit-card': CreditCard,
};

export function IntegrationCard({
  definition,
  connection,
  onConnect,
  onDisconnect,
  loading = false,
}: IntegrationCardProps) {
  const [actionLoading, setActionLoading] = useState(false);
  const Icon = iconMap[definition.icon] || Mail;
  const isConnected = connection?.status === 'connected';

  const handleAction = async () => {
    setActionLoading(true);
    try {
      if (isConnected) {
        await onDisconnect?.(definition.name);
      } else {
        await onConnect?.(definition.name);
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-9 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      'transition-colors',
      isConnected && 'border-green-500/50'
    )}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              'rounded-lg p-2',
              isConnected ? 'bg-green-500/10' : 'bg-muted'
            )}>
              <Icon className={cn(
                'h-5 w-5',
                isConnected ? 'text-green-500' : 'text-muted-foreground'
              )} />
            </div>
            <div>
              <CardTitle className="text-base">{definition.displayName}</CardTitle>
              {isConnected && (
                <Badge variant="default" className="mt-1 bg-green-500">
                  Connected
                </Badge>
              )}
            </div>
          </div>
        </div>
        <CardDescription>{definition.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant={isConnected ? 'outline' : 'default'}
          className="w-full"
          onClick={handleAction}
          disabled={actionLoading}
        >
          {actionLoading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              {isConnected ? 'Disconnecting...' : 'Connecting...'}
            </span>
          ) : isConnected ? (
            <span className="flex items-center gap-2">
              <Unlink className="h-4 w-4" />
              Disconnect
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              Connect
            </span>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}