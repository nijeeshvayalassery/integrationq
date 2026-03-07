import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { Workflows } from './pages/Workflows/Workflows';
import { CreateWorkflow } from './pages/CreateWorkflow/CreateWorkflow';
import { WorkflowDetail } from './pages/WorkflowDetail/WorkflowDetail';
import { Connectors } from './pages/Connectors/Connectors';
import { Monitoring } from './pages/Monitoring/Monitoring';
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

// Made with Bob
