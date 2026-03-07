import React, { useState } from 'react';
import { Grid, Column, Tile, Button, InlineNotification } from '@carbon/react';
import { LogoGithub, LogoSlack } from '@carbon/icons-react';
import { useConnectors } from '../../hooks/useConnectors';
import { Loading } from '../../components/common/Loading';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import apiService from '../../services/api';
import './Connectors.css';

// Connector icon components
const ConnectorIcon: React.FC<{ name: string }> = ({ name }) => {
  const iconProps = { size: 48, style: { marginBottom: '1rem' } };
  
  switch (name.toLowerCase()) {
    case 'github':
      return <LogoGithub {...iconProps} />;
    case 'slack':
      return <LogoSlack {...iconProps} />;
    case 'airtable':
      return (
        <svg {...iconProps} viewBox="0 0 200 170" fill="currentColor">
          <path d="M88.5 12.7l-56 33.6c-3.2 1.9-3.2 6.7 0 8.6l56 33.6c3.2 1.9 8.8 1.9 12 0l56-33.6c3.2-1.9 3.2-6.7 0-8.6l-56-33.6c-3.2-1.9-8.8-1.9-12 0z"/>
          <path d="M32.5 77.5v56c0 3.8 2.4 7.2 6 8.5l56 21c1.2.5 2.4.7 3.5.7 1.2 0 2.4-.2 3.5-.7l56-21c3.6-1.3 6-4.7 6-8.5v-56L107 111.1c-3.2 1.9-8.8 1.9-12 0L32.5 77.5z"/>
        </svg>
      );
    case 'sendgrid':
      return (
        <svg {...iconProps} viewBox="0 0 200 200" fill="currentColor">
          <rect x="0" y="0" width="60" height="60" rx="8"/>
          <rect x="70" y="0" width="60" height="60" rx="8"/>
          <rect x="140" y="0" width="60" height="60" rx="8"/>
          <rect x="0" y="70" width="60" height="60" rx="8"/>
          <rect x="140" y="70" width="60" height="60" rx="8"/>
          <rect x="0" y="140" width="60" height="60" rx="8"/>
          <rect x="70" y="140" width="60" height="60" rx="8"/>
          <rect x="140" y="140" width="60" height="60" rx="8"/>
        </svg>
      );
    default:
      return <LogoGithub {...iconProps} />;
  }
};

export const Connectors: React.FC = () => {
  const { connectors, connections, loading, error } = useConnectors();
  const [testingConnector, setTestingConnector] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string; data?: any }>>({});

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  const isConnected = (connectorId: string) => {
    return connections.some((conn) => conn.connectorId === connectorId);
  };

  const handleTestConnection = async (connectorId: string) => {
    setTestingConnector(connectorId);
    try {
      const result = await apiService.testConnectorWithEnv(connectorId);
      setTestResults(prev => ({
        ...prev,
        [connectorId]: result
      }));
    } catch (err: any) {
      setTestResults(prev => ({
        ...prev,
        [connectorId]: {
          success: false,
          message: err.response?.data?.message || err.message || 'Connection test failed'
        }
      }));
    } finally {
      setTestingConnector(null);
    }
  };

  return (
    <div className="connectors-page">
      <h1>Connectors</h1>
      <p className="subtitle">Connect your favorite tools and services</p>

      <Grid>
        {connectors.map((connector) => (
          <Column lg={4} md={4} sm={4} key={connector._id}>
            <Tile className="connector-tile">
              <div className="connector-icon">
                <ConnectorIcon name={connector.name} />
              </div>
              <h3>{connector.name}</h3>
              <p>{connector.description}</p>
              
              {testResults[connector._id] && (
                <InlineNotification
                  kind={testResults[connector._id].success ? 'success' : 'error'}
                  title={testResults[connector._id].success ? 'Connected!' : 'Connection Failed'}
                  subtitle={testResults[connector._id].message}
                  lowContrast
                  hideCloseButton
                  style={{ marginTop: '1rem', marginBottom: '1rem' }}
                />
              )}
              
              <div className="connector-actions">
                {isConnected(connector._id) ? (
                  <Button kind="secondary" size="sm" disabled>
                    Connected
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleTestConnection(connector._id)}
                    disabled={testingConnector === connector._id}
                  >
                    {testingConnector === connector._id ? 'Testing...' : 'Test Connection'}
                  </Button>
                )}
              </div>
            </Tile>
          </Column>
        ))}
      </Grid>
    </div>
  );
};

// Made with Bob
