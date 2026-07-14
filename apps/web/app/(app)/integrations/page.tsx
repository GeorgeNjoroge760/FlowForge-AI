'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { IntegrationCard } from '@/components/integrations/integration-card';
import { EmptyState } from '@/components/shared/empty-state';
import { api } from '@/lib/api';
import { INTEGRATIONS } from 'shared';
import { Search, Link2 } from 'lucide-react';
import type { Integration } from '@/types';

export default function IntegrationsPage() {
  const [connections, setConnections] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadConnections = async () => {
    try {
      const data = await api.getIntegrations();
      setConnections(data || []);
    } catch (error) {
      console.error('Failed to load integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConnections();
  }, []);

  const handleConnect = async (provider: string) => {
    try {
      await api.connectIntegration(provider);
      await loadConnections();
    } catch (error) {
      console.error('Failed to connect integration:', error);
    }
  };

  const handleDisconnect = async (provider: string) => {
    try {
      await api.disconnectIntegration(provider);
      await loadConnections();
    } catch (error) {
      console.error('Failed to disconnect integration:', error);
    }
  };

  const filteredIntegrations = INTEGRATIONS.filter((integration) =>
    integration.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    integration.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const connectedCount = connections.filter((c) => c.status === 'connected').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
          <p className="text-muted-foreground">
            Connect your favorite apps and services
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{INTEGRATIONS.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{connectedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Not Connected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">
              {INTEGRATIONS.length - connectedCount}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>All Integrations</CardTitle>
              <CardDescription>
                Browse and connect available integrations
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search integrations..."
                className="pl-8 w-[250px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-[200px]" />
              ))}
            </div>
          ) : filteredIntegrations.length === 0 ? (
            <EmptyState
              icon={Link2}
              title="No integrations found"
              description="Try adjusting your search query"
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredIntegrations.map((integration) => {
                const connection = connections.find(
                  (c) => c.provider === integration.name
                );
                return (
                  <IntegrationCard
                    key={integration.id}
                    definition={integration}
                    connection={connection}
                    onConnect={handleConnect}
                    onDisconnect={handleDisconnect}
                  />
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}