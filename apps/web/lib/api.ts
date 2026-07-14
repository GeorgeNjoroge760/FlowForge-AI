const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

class ApiClient {
  private baseUrl: string;
  private tokenGetter: (() => Promise<string | null>) | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setTokenGetter(getter: () => Promise<string | null>) {
    this.tokenGetter = getter;
  }

  private async getToken(): Promise<string | null> {
    if (typeof window === 'undefined') return null;

    if (this.tokenGetter) {
      try {
        return await this.tokenGetter();
      } catch {
        // fall through
      }
    }

    try {
      const clerk = (window as any).Clerk;
      if (clerk?.session) return await clerk.session.getToken();
    } catch {
      // ignore
    }
    return null;
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, headers: customHeaders = {} } = options;

    const token = await this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async getMe() {
    return this.request<any>('/api/v1/auth/me');
  }

  // Users
  async getUser() {
    return this.request<any>('/api/v1/users/me');
  }

  async updateUser(data: { name?: string; avatarUrl?: string }) {
    return this.request<any>('/api/v1/users/me', { method: 'PATCH', body: data });
  }

  // Organizations
  async getOrganizations() {
    return this.request<any[]>('/api/v1/organizations');
  }

  async createOrganization(data: { name: string }) {
    return this.request<any>('/api/v1/organizations', { method: 'POST', body: data });
  }

  async getOrganization(id: string) {
    return this.request<any>(`/api/v1/organizations/${id}`);
  }

  async updateOrganization(id: string, data: { name?: string; logoUrl?: string }) {
    return this.request<any>(`/api/v1/organizations/${id}`, { method: 'PATCH', body: data });
  }

  // Workflows
  async getWorkflows(params?: { page?: number; limit?: number; search?: string; status?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.search) searchParams.set('search', params.search);
    if (params?.status) searchParams.set('status', params.status);
    const query = searchParams.toString();
    return this.request<any>(`/api/v1/workflows${query ? `?${query}` : ''}`);
  }

  async getWorkflow(id: string) {
    return this.request<any>(`/api/v1/workflows/${id}`);
  }

  async createWorkflow(data: { name: string; description?: string; definition?: any }) {
    return this.request<any>('/api/v1/workflows', { method: 'POST', body: data });
  }

  async updateWorkflow(id: string, data: { name?: string; description?: string; status?: string; definition?: any }) {
    return this.request<any>(`/api/v1/workflows/${id}`, { method: 'PATCH', body: data });
  }

  async deleteWorkflow(id: string) {
    return this.request<any>(`/api/v1/workflows/${id}`, { method: 'DELETE' });
  }

  async duplicateWorkflow(id: string) {
    return this.request<any>(`/api/v1/workflows/${id}/duplicate`, { method: 'POST' });
  }

  async getWorkflowStats() {
    return this.request<any>('/api/v1/workflows/stats');
  }

  // Executions
  async getExecutions(params?: { page?: number; limit?: number; workflowId?: string; status?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.workflowId) searchParams.set('workflowId', params.workflowId);
    if (params?.status) searchParams.set('status', params.status);
    const query = searchParams.toString();
    return this.request<any>(`/api/v1/executions${query ? `?${query}` : ''}`);
  }

  async getExecution(id: string) {
    return this.request<any>(`/api/v1/executions/${id}`);
  }

  async executeWorkflow(workflowId: string, data?: { input?: Record<string, unknown>; triggerType?: string }) {
    return this.request<any>(`/api/v1/executions/workflow/${workflowId}`, {
      method: 'POST',
      body: data || {},
    });
  }

  async retryExecution(id: string) {
    return this.request<any>(`/api/v1/executions/${id}/retry`, { method: 'POST' });
  }

  async getExecutionStats() {
    return this.request<any>('/api/v1/executions/stats');
  }

  // AI
  async generateWorkflow(prompt: string) {
    return this.request<any>('/api/v1/ai/generate-workflow', { method: 'POST', body: { prompt } });
  }

  async explainWorkflow(definition: any) {
    return this.request<any>('/api/v1/ai/explain-workflow', { method: 'POST', body: { definition } });
  }

  async optimizeWorkflow(definition: any) {
    return this.request<any>('/api/v1/ai/optimize-workflow', { method: 'POST', body: { definition } });
  }

  async debugExecution(execution: any, logs: any[], error: string) {
    return this.request<any>('/api/v1/ai/debug-execution', {
      method: 'POST',
      body: { execution, logs, error },
    });
  }

  // Templates
  async getTemplates(params?: { page?: number; limit?: number; category?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.category) searchParams.set('category', params.category);
    const query = searchParams.toString();
    return this.request<any>(`/api/v1/templates${query ? `?${query}` : ''}`);
  }

  async cloneTemplate(id: string) {
    return this.request<any>(`/api/v1/templates/${id}/clone`, { method: 'POST' });
  }

  // Integrations
  async getIntegrations() {
    return this.request<any[]>('/api/v1/integrations');
  }

  async connectIntegration(provider: string) {
    return this.request<any>(`/api/v1/integrations/${provider}/connect`, { method: 'POST' });
  }

  async disconnectIntegration(provider: string) {
    return this.request<any>(`/api/v1/integrations/${provider}`, { method: 'DELETE' });
  }

  // Usage
  async getUsage() {
    return this.request<any>('/api/v1/usage');
  }
}

export const api = new ApiClient(API_BASE_URL);
