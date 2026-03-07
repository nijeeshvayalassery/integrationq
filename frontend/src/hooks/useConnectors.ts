import { useState, useEffect } from 'react';
import { connectorAPI } from '../services/api';
import { Connector, Connection } from '../types';

export const useConnectors = () => {
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConnectors = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await connectorAPI.getConnectors();
      setConnectors(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch connectors');
      console.error('Error fetching connectors:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchConnections = async () => {
    try {
      const data = await connectorAPI.getConnections();
      setConnections(data);
    } catch (err: any) {
      console.error('Error fetching connections:', err);
    }
  };

  useEffect(() => {
    fetchConnectors();
    fetchConnections();
  }, []);

  const testConnection = async (connectorId: string, credentials: any) => {
    try {
      return await connectorAPI.testConnection(connectorId, credentials);
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Connection test failed');
    }
  };

  const createConnection = async (connectionData: any) => {
    try {
      const newConnection = await connectorAPI.createConnection(connectionData);
      setConnections((prev) => [newConnection, ...prev]);
      return newConnection;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to create connection');
    }
  };

  const updateConnection = async (id: string, connectionData: any) => {
    try {
      const updatedConnection = await connectorAPI.updateConnection(id, connectionData);
      setConnections((prev) =>
        prev.map((c) => (c._id === id ? updatedConnection : c))
      );
      return updatedConnection;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to update connection');
    }
  };

  const deleteConnection = async (id: string) => {
    try {
      await connectorAPI.deleteConnection(id);
      setConnections((prev) => prev.filter((c) => c._id !== id));
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to delete connection');
    }
  };

  return {
    connectors,
    connections,
    loading,
    error,
    refetch: () => {
      fetchConnectors();
      fetchConnections();
    },
    testConnection,
    createConnection,
    updateConnection,
    deleteConnection,
  };
};

// Made with Bob
