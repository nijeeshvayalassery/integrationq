#!/usr/bin/env node

/**
 * IntegrationIQ React App Generator
 * Generates all core pages and components for the React application
 */

const fs = require('fs');
const path = require('path');

// Ensure directories exist
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Write file with content
const writeFile = (filePath, content) => {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content);
  console.log(`✅ Created: ${filePath}`);
};

const srcDir = path.join(__dirname, 'src');

// ============================================================================
// LAYOUT COMPONENTS
// ============================================================================

const headerComponent = `import React from 'react';
import { Header as CarbonHeader, HeaderName, HeaderGlobalBar, HeaderGlobalAction } from '@carbon/react';
import { Notification, UserAvatar } from '@carbon/icons-react';

export const Header: React.FC = () => {
  return (
    <CarbonHeader aria-label="IntegrationIQ">
      <HeaderName href="/" prefix="IBM">
        IntegrationIQ
      </HeaderName>
      <HeaderGlobalBar>
        <HeaderGlobalAction aria-label="Notifications">
          <Notification size={20} />
        </HeaderGlobalAction>
        <HeaderGlobalAction aria-label="User Profile">
          <UserAvatar size={20} />
        </HeaderGlobalAction>
      </HeaderGlobalBar>
    </CarbonHeader>
  );
};
`;

const sidebarComponent = `import React from 'react';
import { SideNav, SideNavItems, SideNavLink } from '@carbon/react';
import { Dashboard, Flow, Connect, Activity } from '@carbon/icons-react';
import { useLocation } from 'react-router-dom';

export const Sidebar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <SideNav aria-label="Side navigation" isFixedNav expanded>
      <SideNavItems>
        <SideNavLink
          renderIcon={Dashboard}
          href="/"
          isActive={isActive('/')}
        >
          Dashboard
        </SideNavLink>
        <SideNavLink
          renderIcon={Flow}
          href="/workflows"
          isActive={isActive('/workflows')}
        >
          Workflows
        </SideNavLink>
        <SideNavLink
          renderIcon={Connect}
          href="/connectors"
          isActive={isActive('/connectors')}
        >
          Connectors
        </SideNavLink>
        <SideNavLink
          renderIcon={Activity}
          href="/monitoring"
          isActive={isActive('/monitoring')}
        >
          Monitoring
        </SideNavLink>
      </SideNavItems>
    </SideNav>
  );
};
`;

const layoutComponent = `import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="app-layout">
      <Header />
      <div className="app-content">
        <Sidebar />
        <main className="app-main">{children}</main>
      </div>
    </div>
  );
};
`;

const layoutCSS = `.app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.app-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.app-main {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  background: #f4f4f4;
}
`;

// ============================================================================
// DASHBOARD PAGE
// ============================================================================

const dashboardPage = `import React, { useEffect, useState } from 'react';
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
`;

const dashboardCSS = `.dashboard h1 {
  margin-bottom: 2rem;
  font-size: 2rem;
  font-weight: 300;
}

.stat-tile {
  padding: 1.5rem;
  text-align: center;
}

.stat-tile h3 {
  font-size: 1rem;
  font-weight: 400;
  margin-bottom: 1rem;
  color: #525252;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 300;
  color: #0f62fe;
  margin: 0;
}
`;

// ============================================================================
// WORKFLOWS PAGE
// ============================================================================

const workflowsPage = `import React from 'react';
import { Button, DataTable, Table, TableHead, TableRow, TableHeader, TableBody, TableCell, Tag } from '@carbon/react';
import { Add } from '@carbon/icons-react';
import { useNavigate } from 'react-router-dom';
import { useWorkflows } from '../../hooks/useWorkflows';
import { Loading } from '../../components/common/Loading';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import './Workflows.css';

export const Workflows: React.FC = () => {
  const navigate = useNavigate();
  const { workflows, loading, error } = useWorkflows();

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  const headers = [
    { key: 'name', header: 'Name' },
    { key: 'description', header: 'Description' },
    { key: 'status', header: 'Status' },
    { key: 'steps', header: 'Steps' },
    { key: 'createdAt', header: 'Created' },
  ];

  const rows = workflows.map((workflow) => ({
    id: workflow._id,
    name: workflow.name,
    description: workflow.description,
    status: workflow.status,
    steps: workflow.steps.length,
    createdAt: new Date(workflow.createdAt).toLocaleDateString(),
  }));

  return (
    <div className="workflows-page">
      <div className="page-header">
        <h1>Workflows</h1>
        <Button
          renderIcon={Add}
          onClick={() => navigate('/workflows/create')}
        >
          Create Workflow
        </Button>
      </div>

      <DataTable rows={rows} headers={headers}>
        {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
          <Table {...getTableProps()}>
            <TableHead>
              <TableRow>
                {headers.map((header) => (
                  <TableHeader {...getHeaderProps({ header })} key={header.key}>
                    {header.header}
                  </TableHeader>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  {...getRowProps({ row })}
                  key={row.id}
                  onClick={() => navigate(\`/workflows/\${row.id}\`)}
                  style={{ cursor: 'pointer' }}
                >
                  {row.cells.map((cell) => (
                    <TableCell key={cell.id}>
                      {cell.info.header === 'status' ? (
                        <Tag type={cell.value === 'active' ? 'green' : 'gray'}>
                          {cell.value}
                        </Tag>
                      ) : (
                        cell.value
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DataTable>
    </div>
  );
};
`;

const workflowsCSS = `.workflows-page {
  max-width: 1400px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 300;
  margin: 0;
}
`;

// ============================================================================
// CREATE WORKFLOW PAGE
// ============================================================================

const createWorkflowPage = `import React, { useState } from 'react';
import { TextArea, Button, InlineLoading } from '@carbon/react';
import { useNavigate } from 'react-router-dom';
import { workflowAPI } from '../../services/api';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import './CreateWorkflow.css';

export const CreateWorkflow: React.FC = () => {
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!description.trim()) {
      setError('Please enter a workflow description');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const workflow = await workflowAPI.generateWorkflow(description);
      navigate(\`/workflows/\${workflow._id}\`);
    } catch (err: any) {
      setError(err.message || 'Failed to generate workflow');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-workflow">
      <h1>Create Workflow with AI</h1>
      <p className="subtitle">
        Describe what you want to automate, and our AI will generate a workflow for you.
      </p>

      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

      <div className="form-section">
        <TextArea
          labelText="Workflow Description"
          placeholder="Example: When a new issue is created in GitHub, create a task in Airtable and send a Slack notification"
          rows={6}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
        />

        <div className="button-group">
          <Button kind="secondary" onClick={() => navigate('/workflows')}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={loading}>
            {loading ? <InlineLoading description="Generating..." /> : 'Generate Workflow'}
          </Button>
        </div>
      </div>
    </div>
  );
};
`;

const createWorkflowCSS = `.create-workflow {
  max-width: 800px;
}

.create-workflow h1 {
  font-size: 2rem;
  font-weight: 300;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #525252;
  margin-bottom: 2rem;
}

.form-section {
  background: white;
  padding: 2rem;
  border-radius: 4px;
}

.button-group {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  justify-content: flex-end;
}
`;

// ============================================================================
// WORKFLOW DETAIL PAGE
// ============================================================================

const workflowDetailPage = `import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Accordion, AccordionItem, Tag } from '@carbon/react';
import { Play, Edit, TrashCan } from '@carbon/icons-react';
import { workflowAPI } from '../../services/api';
import { Loading } from '../../components/common/Loading';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { Workflow } from '../../types';
import './WorkflowDetail.css';

export const WorkflowDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [executing, setExecuting] = useState(false);

  useEffect(() => {
    const fetchWorkflow = async () => {
      try {
        setLoading(true);
        const data = await workflowAPI.getWorkflow(id!);
        setWorkflow(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load workflow');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchWorkflow();
  }, [id]);

  const handleExecute = async () => {
    try {
      setExecuting(true);
      await workflowAPI.executeWorkflow(id!);
      alert('Workflow executed successfully!');
    } catch (err: any) {
      alert('Execution failed: ' + err.message);
    } finally {
      setExecuting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this workflow?')) {
      try {
        await workflowAPI.deleteWorkflow(id!);
        navigate('/workflows');
      } catch (err: any) {
        alert('Delete failed: ' + err.message);
      }
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;
  if (!workflow) return <ErrorMessage message="Workflow not found" />;

  return (
    <div className="workflow-detail">
      <div className="page-header">
        <div>
          <h1>{workflow.name}</h1>
          <p className="description">{workflow.description}</p>
        </div>
        <div className="actions">
          <Tag type={workflow.status === 'active' ? 'green' : 'gray'}>
            {workflow.status}
          </Tag>
          <Button kind="secondary" renderIcon={Edit} size="sm">
            Edit
          </Button>
          <Button kind="danger" renderIcon={TrashCan} size="sm" onClick={handleDelete}>
            Delete
          </Button>
          <Button renderIcon={Play} onClick={handleExecute} disabled={executing}>
            {executing ? 'Executing...' : 'Execute'}
          </Button>
        </div>
      </div>

      <div className="workflow-steps">
        <h2>Workflow Steps</h2>
        <Accordion>
          {workflow.steps.map((step, index) => (
            <AccordionItem title={\`Step \${index + 1}: \${step.name}\`} key={index}>
              <p><strong>Type:</strong> {step.type}</p>
              <p><strong>Connector:</strong> {step.connector}</p>
              <p><strong>Action:</strong> {step.action}</p>
              {step.config && (
                <pre>{JSON.stringify(step.config, null, 2)}</pre>
              )}
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};
`;

const workflowDetailCSS = `.workflow-detail {
  max-width: 1200px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 300;
  margin: 0 0 0.5rem 0;
}

.description {
  color: #525252;
  margin: 0;
}

.actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.workflow-steps {
  background: white;
  padding: 2rem;
  border-radius: 4px;
}

.workflow-steps h2 {
  font-size: 1.5rem;
  font-weight: 300;
  margin-bottom: 1rem;
}

.workflow-steps pre {
  background: #f4f4f4;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
}
`;

// ============================================================================
// CONNECTORS PAGE
// ============================================================================

const connectorsPage = `import React from 'react';
import { Grid, Column, Tile, Button } from '@carbon/react';
import { Connect } from '@carbon/icons-react';
import { useConnectors } from '../../hooks/useConnectors';
import { Loading } from '../../components/common/Loading';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import './Connectors.css';

export const Connectors: React.FC = () => {
  const { connectors, connections, loading, error } = useConnectors();

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  const isConnected = (connectorId: string) => {
    return connections.some((conn) => conn.connector === connectorId);
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
                <Connect size={32} />
              </div>
              <h3>{connector.name}</h3>
              <p>{connector.description}</p>
              <div className="connector-actions">
                {isConnected(connector._id) ? (
                  <Button kind="secondary" size="sm" disabled>
                    Connected
                  </Button>
                ) : (
                  <Button size="sm">Connect</Button>
                )}
              </div>
            </Tile>
          </Column>
        ))}
      </Grid>
    </div>
  );
};
`;

const connectorsCSS = `.connectors-page h1 {
  font-size: 2rem;
  font-weight: 300;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #525252;
  margin-bottom: 2rem;
}

.connector-tile {
  padding: 1.5rem;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.connector-icon {
  margin-bottom: 1rem;
  color: #0f62fe;
}

.connector-tile h3 {
  font-size: 1.25rem;
  font-weight: 400;
  margin-bottom: 0.5rem;
}

.connector-tile p {
  flex: 1;
  color: #525252;
  font-size: 0.875rem;
}

.connector-actions {
  margin-top: 1rem;
}
`;

// ============================================================================
// MONITORING PAGE
// ============================================================================

const monitoringPage = `import React, { useEffect, useState } from 'react';
import { DataTable, Table, TableHead, TableRow, TableHeader, TableBody, TableCell, Tag } from '@carbon/react';
import { executionAPI } from '../../services/api';
import { Loading } from '../../components/common/Loading';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import './Monitoring.css';

export const Monitoring: React.FC = () => {
  const [executions, setExecutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExecutions = async () => {
      try {
        setLoading(true);
        const data = await executionAPI.getExecutionLogs();
        setExecutions(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load execution logs');
      } finally {
        setLoading(false);
      }
    };

    fetchExecutions();
  }, []);

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  const headers = [
    { key: 'workflow', header: 'Workflow' },
    { key: 'status', header: 'Status' },
    { key: 'duration', header: 'Duration' },
    { key: 'startedAt', header: 'Started At' },
  ];

  const rows = executions.map((execution) => ({
    id: execution._id,
    workflow: execution.workflow?.name || 'Unknown',
    status: execution.status,
    duration: execution.duration ? \`\${execution.duration}ms\` : '-',
    startedAt: new Date(execution.startedAt).toLocaleString(),
  }));

  return (
    <div className="monitoring-page">
      <h1>Monitoring</h1>
      <p className="subtitle">View workflow execution history</p>

      <DataTable rows={rows} headers={headers}>
        {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
          <Table {...getTableProps()}>
            <TableHead>
              <TableRow>
                {headers.map((header) => (
                  <TableHeader {...getHeaderProps({ header })} key={header.key}>
                    {header.header}
                  </TableHeader>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow {...getRowProps({ row })} key={row.id}>
                  {row.cells.map((cell) => (
                    <TableCell key={cell.id}>
                      {cell.info.header === 'status' ? (
                        <Tag
                          type={
                            cell.value === 'completed'
                              ? 'green'
                              : cell.value === 'failed'
                              ? 'red'
                              : 'blue'
                          }
                        >
                          {cell.value}
                        </Tag>
                      ) : (
                        cell.value
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DataTable>
    </div>
  );
};
`;

const monitoringCSS = `.monitoring-page h1 {
  font-size: 2rem;
  font-weight: 300;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #525252;
  margin-bottom: 2rem;
}
`;

// ============================================================================
// MAIN APP.TSX
// ============================================================================

const appTSX = `import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { Workflows } from './pages/Workflows/Workflows';
import { CreateWorkflow } from './pages/CreateWorkflow/CreateWorkflow';
import { WorkflowDetail } from './pages/WorkflowDetail/WorkflowDetail';
import { Connectors } from './pages/Connectors/Connectors';
import { Monitoring } from './pages/Monitoring/Monitoring';
import '@carbon/react/scss/index.scss';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/workflows" element={<Workflows />} />
            <Route path="/workflows/create" element={<CreateWorkflow />} />
            <Route path="/workflows/:id" element={<WorkflowDetail />} />
            <Route path="/connectors" element={<Connectors />} />
            <Route path="/monitoring" element={<Monitoring />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
`;

// ============================================================================
// GENERATE ALL FILES
// ============================================================================

console.log('🚀 Generating IntegrationIQ React Application...\n');

// Layout components
writeFile(path.join(srcDir, 'components/layout/Header.tsx'), headerComponent);
writeFile(path.join(srcDir, 'components/layout/Sidebar.tsx'), sidebarComponent);
writeFile(path.join(srcDir, 'components/layout/Layout.tsx'), layoutComponent);
writeFile(path.join(srcDir, 'components/layout/Layout.css'), layoutCSS);

// Pages
writeFile(path.join(srcDir, 'pages/Dashboard/Dashboard.tsx'), dashboardPage);
writeFile(path.join(srcDir, 'pages/Dashboard/Dashboard.css'), dashboardCSS);
writeFile(path.join(srcDir, 'pages/Workflows/Workflows.tsx'), workflowsPage);
writeFile(path.join(srcDir, 'pages/Workflows/Workflows.css'), workflowsCSS);
writeFile(path.join(srcDir, 'pages/CreateWorkflow/CreateWorkflow.tsx'), createWorkflowPage);
writeFile(path.join(srcDir, 'pages/CreateWorkflow/CreateWorkflow.css'), createWorkflowCSS);
writeFile(path.join(srcDir, 'pages/WorkflowDetail/WorkflowDetail.tsx'), workflowDetailPage);
writeFile(path.join(srcDir, 'pages/WorkflowDetail/WorkflowDetail.css'), workflowDetailCSS);
writeFile(path.join(srcDir, 'pages/Connectors/Connectors.tsx'), connectorsPage);
writeFile(path.join(srcDir, 'pages/Connectors/Connectors.css'), connectorsCSS);
writeFile(path.join(srcDir, 'pages/Monitoring/Monitoring.tsx'), monitoringPage);
writeFile(path.join(srcDir, 'pages/Monitoring/Monitoring.css'), monitoringCSS);

// Main App
writeFile(path.join(srcDir, 'App.tsx'), appTSX);

console.log('\n✨ Generation complete!');
console.log('\n📦 Files created:');
console.log('   - 3 Layout components (Header, Sidebar, Layout)');
console.log('   - 5 Page components (Dashboard, Workflows, CreateWorkflow, WorkflowDetail, Connectors, Monitoring)');
console.log('   - 1 Main App component with routing');
console.log('   - All CSS files');
console.log('\n🎯 Next steps:');
console.log('   1. cd frontend');
console.log('   2. npm install');
console.log('   3. npm run dev');
console.log('\n🚀 Your React app is ready!');

// Made with Bob
