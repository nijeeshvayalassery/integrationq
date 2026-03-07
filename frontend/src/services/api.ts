import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // No authentication interceptors - app is open without login
  }

  // Authentication APIs
  async register(name: string, email: string, password: string) {
    const response = await this.api.post('/auth/register', { name, email, password });
    return response.data.data;
  }

  async login(email: string, password: string) {
    const response = await this.api.post('/auth/login', { email, password });
    return response.data.data;
  }

  async logout() {
    const response = await this.api.post('/auth/logout');
    return response.data;
  }

  async getProfile() {
    const response = await this.api.get('/auth/profile');
    return response.data.data;
  }

  // Workflow APIs
  async getWorkflows(filters?: any) {
    const response = await this.api.get('/workflows', { params: filters });
    return response.data.data.workflows;
  }

  async getWorkflow(id: string) {
    const response = await this.api.get(`/workflows/${id}`);
    return response.data.data;
  }

  async generateWorkflow(description: string) {
    const response = await this.api.post('/workflows/generate', { prompt: description });
    return response.data.data;
  }

  async createWorkflow(data: any) {
    const response = await this.api.post('/workflows', data);
    return response.data.data;
  }

  async updateWorkflow(id: string, data: any) {
    const response = await this.api.put(`/workflows/${id}`, data);
    return response.data.data;
  }

  async deleteWorkflow(id: string) {
    const response = await this.api.delete(`/workflows/${id}`);
    return response.data;
  }

  async executeWorkflow(id: string, input?: any) {
    const response = await this.api.post(`/workflows/${id}/execute`, { input });
    return response.data.data;
  }

  async pauseWorkflow(id: string) {
    const response = await this.api.post(`/workflows/${id}/pause`);
    return response.data.data;
  }

  async resumeWorkflow(id: string) {
    const response = await this.api.post(`/workflows/${id}/resume`);
    return response.data.data;
  }

  // Connector APIs
  async getConnectors() {
    const response = await this.api.get('/connectors');
    return response.data.data;
  }

  async getConnector(id: string) {
    const response = await this.api.get(`/connectors/${id}`);
    return response.data.data;
  }

  async testConnection(connectorId: string, credentials: any) {
    const response = await this.api.post(`/connectors/${connectorId}/test`, { credentials });
    return response.data;
  }

  async testConnectorWithEnv(connectorName: string) {
    const response = await this.api.post(`/connectors/test-env/${connectorName}`);
    return response.data;
  }

  async createConnection(data: any) {
    const response = await this.api.post('/connectors/connections', data);
    return response.data.data;
  }

  async getConnections() {
    const response = await this.api.get('/connectors/connections');
    return response.data.data;
  }

  async getConnection(id: string) {
    const response = await this.api.get(`/connectors/connections/${id}`);
    return response.data.data;
  }

  async updateConnection(id: string, data: any) {
    const response = await this.api.put(`/connectors/connections/${id}`, data);
    return response.data.data;
  }

  async deleteConnection(id: string) {
    const response = await this.api.delete(`/connectors/connections/${id}`);
    return response.data;
  }

  // Execution Log APIs
  async getExecutionLogs(filters?: any) {
    const response = await this.api.get('/workflows/executions', { params: filters });
    return response.data.data.executions;
  }

  async getExecutionLog(id: string) {
    const response = await this.api.get(`/workflows/executions/${id}`);
    return response.data.data;
  }
}

const service = new ApiService();

// Export individual API sections for cleaner imports
export const authAPI = {
  register: (name: string, email: string, password: string) => service.register(name, email, password),
  login: (email: string, password: string) => service.login(email, password),
  logout: () => service.logout(),
  getProfile: () => service.getProfile(),
};

export const workflowAPI = {
  getWorkflows: (filters?: any) => service.getWorkflows(filters),
  getWorkflow: (id: string) => service.getWorkflow(id),
  generateWorkflow: (description: string) => service.generateWorkflow(description),
  createWorkflow: (data: any) => service.createWorkflow(data),
  updateWorkflow: (id: string, data: any) => service.updateWorkflow(id, data),
  deleteWorkflow: (id: string) => service.deleteWorkflow(id),
  executeWorkflow: (id: string, input?: any) => service.executeWorkflow(id, input),
  pauseWorkflow: (id: string) => service.pauseWorkflow(id),
  resumeWorkflow: (id: string) => service.resumeWorkflow(id),
};

export const connectorAPI = {
  getConnectors: () => service.getConnectors(),
  getConnector: (id: string) => service.getConnector(id),
  testConnection: (connectorId: string, credentials: any) => service.testConnection(connectorId, credentials),
  createConnection: (data: any) => service.createConnection(data),
  getConnections: () => service.getConnections(),
  getConnection: (id: string) => service.getConnection(id),
  updateConnection: (id: string, data: any) => service.updateConnection(id, data),
  deleteConnection: (id: string) => service.deleteConnection(id),
};

export const executionAPI = {
  getExecutionLogs: (filters?: any) => service.getExecutionLogs(filters),
  getExecutionLog: (id: string) => service.getExecutionLog(id),
};

export const apiService = service;
export default service;

// Made with Bob
