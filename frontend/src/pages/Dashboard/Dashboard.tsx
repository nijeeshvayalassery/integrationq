import React, { useEffect, useState } from 'react';
import { Grid, Column, Tile, SkeletonText } from '@carbon/react';
import { workflowAPI, connectorAPI, executionAPI } from '../../services/api';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalWorkflows: 0,
    activeWorkflows: 0,
    totalConnectors: 0,
    recentExecutions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [workflows, connectors, executions] = await Promise.all([
          workflowAPI.getWorkflows(),
          connectorAPI.getConnectors(),
          executionAPI.getExecutionLogs({ limit: 10 }),
        ]);

        setStats({
          totalWorkflows: workflows.length,
          activeWorkflows: workflows.filter((w: any) => w.status === 'active').length,
          totalConnectors: connectors.length,
          recentExecutions: executions.length,
        });
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <Grid>
        <Column lg={4} md={4} sm={4}>
          <Tile className="stat-tile">
            <h3>Total Workflows</h3>
            {loading ? <SkeletonText /> : <p className="stat-value">{stats.totalWorkflows}</p>}
          </Tile>
        </Column>
        <Column lg={4} md={4} sm={4}>
          <Tile className="stat-tile">
            <h3>Active Workflows</h3>
            {loading ? <SkeletonText /> : <p className="stat-value">{stats.activeWorkflows}</p>}
          </Tile>
        </Column>
        <Column lg={4} md={4} sm={4}>
          <Tile className="stat-tile">
            <h3>Connectors</h3>
            {loading ? <SkeletonText /> : <p className="stat-value">{stats.totalConnectors}</p>}
          </Tile>
        </Column>
        <Column lg={4} md={4} sm={4}>
          <Tile className="stat-tile">
            <h3>Recent Executions</h3>
            {loading ? <SkeletonText /> : <p className="stat-value">{stats.recentExecutions}</p>}
          </Tile>
        </Column>
      </Grid>
    </div>
  );
};

// Made with Bob
