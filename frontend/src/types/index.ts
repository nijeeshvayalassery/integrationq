// Type definitions for IntegrationIQ

export interface User {
  _id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

export interface Workflow {
  _id: string;
  userId: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'error';
  trigger: WorkflowTrigger;
  steps: WorkflowStep[];
  executionCount: number;
  successCount: number;
  failureCount: number;
  lastExecutedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowTrigger {
  id: string;
  type: 'webhook' | 'schedule' | 'manual';
  connector: string;
  event: string;
  config: Record<string, any>;
}

export interface WorkflowStep {
  id: string;
  type: 'action' | 'condition' | 'transform';
  connector: string;
  action: string;
  config: Record<string, any>;
  nextSteps?: string[];
  onError?: string;
}

export interface Connector {
  _id: string;
  name: string;
  displayName: string;
  description: string;
  icon: string;
  category: string;
  status: 'active' | 'beta' | 'deprecated';
  capabilities: {
    triggers: Trigger[];
    actions: Action[];
  };
  authType: 'oauth' | 'apiKey' | 'basic';
  configSchema: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Trigger {
  name: string;
  displayName: string;
  description: string;
  eventType: string;
  configSchema: Record<string, any>;
}

export interface Action {
  name: string;
  displayName: string;
  description: string;
  configSchema: Record<string, any>;
}

export interface Connection {
  _id: string;
  userId: string;
  connectorId: string;
  name: string;
  status: 'active' | 'inactive' | 'error';
  credentials: Record<string, any>;
  lastTestedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExecutionLog {
  _id: string;
  workflowId: string;
  status: 'success' | 'failed' | 'running' | 'pending';
  triggerData: Record<string, any>;
  steps: ExecutionStep[];
  error?: string;
  startedAt: string;
  completedAt?: string;
  duration?: number;
}

export interface ExecutionStep {
  stepId: string;
  status: 'success' | 'failed' | 'skipped';
  input: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
  startedAt: string;
  completedAt?: string;
}

export interface WorkflowStats {
  totalExecutions: number;
  successRate: number;
  averageDuration: number;
  lastExecution?: string;
  recentExecutions: ExecutionLog[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Made with Bob
