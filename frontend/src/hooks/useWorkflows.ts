import { useState, useEffect } from 'react';
import { workflowAPI } from '../services/api';
import { Workflow } from '../types';

export const useWorkflows = (filters?: any) => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await workflowAPI.getWorkflows(filters);
      setWorkflows(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch workflows');
      console.error('Error fetching workflows:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, [JSON.stringify(filters)]);

  const createWorkflow = async (workflowData: any) => {
    try {
      const newWorkflow = await workflowAPI.createWorkflow(workflowData);
      setWorkflows((prev) => [newWorkflow, ...prev]);
      return newWorkflow;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to create workflow');
    }
  };

  const updateWorkflow = async (id: string, workflowData: any) => {
    try {
      const updatedWorkflow = await workflowAPI.updateWorkflow(id, workflowData);
      setWorkflows((prev) =>
        prev.map((w) => (w._id === id ? updatedWorkflow : w))
      );
      return updatedWorkflow;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to update workflow');
    }
  };

  const deleteWorkflow = async (id: string) => {
    try {
      await workflowAPI.deleteWorkflow(id);
      setWorkflows((prev) => prev.filter((w) => w._id !== id));
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to delete workflow');
    }
  };

  const executeWorkflow = async (id: string, input?: any) => {
    try {
      return await workflowAPI.executeWorkflow(id, input);
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to execute workflow');
    }
  };

  return {
    workflows,
    loading,
    error,
    refetch: fetchWorkflows,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    executeWorkflow,
  };
};

// Made with Bob
