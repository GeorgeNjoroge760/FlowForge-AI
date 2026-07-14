'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/lib/api';
import {
  User,
  Building2,
  CreditCard,
  Key,
  Plus,
  Trash2,
  Copy,
  ExternalLink,
  Check,
} from 'lucide-react';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsedAt: string | null;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [orgName, setOrgName] = useState('');
  const [orgPlan, setOrgPlan] = useState('free');

  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [showNewKey, setShowNewKey] = useState<string | null>(null);
  const [creatingKey, setCreatingKey] = useState(false);

  const loadProfile = async () => {
    try {
      const user = await api.getUser();
      setName(user.name || '');
      setEmail(user.email || '');

      const orgs = await api.getOrganizations();
      if (orgs.length > 0) {
        setOrgName(orgs[0].name || '');
        setOrgPlan(orgs[0].plan || 'free');
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadApiKeys = async () => {
    try {
      const keys = await api.request<any[]>('/api/v1/api-keys');
      setApiKeys(keys || []);
    } catch (error) {
      console.error('Failed to load API keys:', error);
    }
  };

  useEffect(() => {
    loadProfile();
    loadApiKeys();
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await api.updateUser({ name });
      await api.updateOrganization('current', { name: orgName });
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateApiKey = async () => {
    if (!newKeyName.trim()) return;
    setCreatingKey(true);
    try {
      const response = await api.request<any>('/api/v1/api-keys', {
        method: 'POST',
        body: { name: newKeyName },
      });
      setShowNewKey(response.key);
      setNewKeyName('');
      await loadApiKeys();
    } catch (error) {
      console.error('Failed to create API key:', error);
    } finally {
      setCreatingKey(false);
    }
  };

  const handleRevokeKey = async (id: string) => {
    try {
      await api.request(`/api/v1/api-keys/${id}`, { method: 'DELETE' });
      await loadApiKeys();
    } catch (error) {
      console.error('Failed to revoke API key:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="organization" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Organization
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="api-keys" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            API Keys
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={email}
                  disabled
                  placeholder="Your email"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed here. Please contact support.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveProfile} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="organization">
          <Card>
            <CardHeader>
              <CardTitle>Organization</CardTitle>
              <CardDescription>
                Manage your organization settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orgName">Organization Name</Label>
                <Input
                  id="orgName"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="Organization name"
                />
              </div>
              <div className="space-y-2">
                <Label>Current Plan</Label>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="capitalize">
                    {orgPlan}
                  </Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveProfile} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing</CardTitle>
              <CardDescription>
                Manage your subscription and billing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Current Plan</h3>
                    <p className="text-sm text-muted-foreground capitalize">
                      {orgPlan} Plan
                    </p>
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {orgPlan}
                  </Badge>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border p-4">
                  <h4 className="font-medium">Free</h4>
                  <p className="text-sm text-muted-foreground">
                    100 executions/month
                  </p>
                  <Button variant="outline" size="sm" className="mt-4" disabled>
                    Current Plan
                  </Button>
                </div>
                <div className="rounded-lg border border-primary p-4">
                  <h4 className="font-medium">Pro</h4>
                  <p className="text-sm text-muted-foreground">
                    10,000 executions/month
                  </p>
                  <Button size="sm" className="mt-4">
                    Upgrade to Pro
                  </Button>
                </div>
                <div className="rounded-lg border p-4">
                  <h4 className="font-medium">Enterprise</h4>
                  <p className="text-sm text-muted-foreground">
                    Unlimited executions
                  </p>
                  <Button variant="outline" size="sm" className="mt-4">
                    Contact Sales
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api-keys">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>API Keys</CardTitle>
                  <CardDescription>
                    Manage API keys for programmatic access
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {showNewKey && (
                <div className="rounded-lg border bg-green-500/10 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-green-600">
                      API Key Created
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowNewKey(null)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Copy this key now. You won&apos;t be able to see it again.
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-muted p-2 rounded text-sm font-mono">
                      {showNewKey}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(showNewKey)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Input
                  placeholder="Key name"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                />
                <Button
                  onClick={handleCreateApiKey}
                  disabled={creatingKey || !newKeyName.trim()}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Key
                </Button>
              </div>

              <Separator />

              <div className="space-y-2">
                {apiKeys.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No API keys created yet
                  </p>
                ) : (
                  apiKeys.map((key) => (
                    <div
                      key={key.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">{key.name}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="font-mono">
                            {key.key.slice(0, 8)}...{key.key.slice(-4)}
                          </span>
                          {key.lastUsedAt && (
                            <span>
                              Last used: {new Date(key.lastUsedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevokeKey(key.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}