import React, { useEffect, useState } from 'react';
import { 
  DataTable, 
  Table, 
  TableHead, 
  TableRow, 
  TableHeader, 
  TableBody, 
  TableCell, 
  Tag,
  Button,
  Modal
} from '@carbon/react';
import { View } from '@carbon/icons-react';
import { executionAPI } from '../../services/api';
import { Loading } from '../../components/common/Loading';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import './Monitoring.css';

export const Monitoring: React.FC = () => {
  const [executions, setExecutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedExecution, setSelectedExecution] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleViewDetails = (executionId: string) => {
    const execution = executions.find(e => e._id === executionId);
    setSelectedExecution(execution);
    setIsModalOpen(true);
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  const headers = [
    { key: 'workflow', header: 'Workflow' },
    { key: 'status', header: 'Status' },
    { key: 'duration', header: 'Duration' },
    { key: 'startedAt', header: 'Started At' },
    { key: 'actions', header: 'Actions' },
  ];

  const rows = executions.map((execution) => ({
    id: execution._id,
    workflow: execution.workflow?.name || 'Unknown',
    status: execution.status,
    duration: execution.duration ? `${execution.duration}ms` : '-',
    startedAt: execution.startedAt ? new Date(execution.startedAt).toLocaleString() : 'N/A',
    actions: execution._id,
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
                            cell.value === 'success'
                              ? 'green'
                              : cell.value === 'failed'
                              ? 'red'
                              : cell.value === 'running'
                              ? 'blue'
                              : 'gray'
                          }
                        >
                          {cell.value}
                        </Tag>
                      ) : cell.info.header === 'actions' ? (
                        <Button
                          kind="ghost"
                          size="sm"
                          renderIcon={View}
                          onClick={() => handleViewDetails(cell.value)}
                        >
                          View Details
                        </Button>
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

      {/* Execution Details Modal */}
      <Modal
        open={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        modalHeading="Execution Details"
        primaryButtonText="Close"
        onRequestSubmit={() => setIsModalOpen(false)}
        size="lg"
      >
        {selectedExecution && (
          <div className="execution-details">
            <div className="detail-section">
              <h4>Workflow Information</h4>
              <p><strong>Name:</strong> {selectedExecution.workflow?.name || 'Unknown'}</p>
              <p><strong>Status:</strong> <Tag type={selectedExecution.status === 'success' ? 'green' : 'red'}>{selectedExecution.status}</Tag></p>
              <p><strong>Started:</strong> {selectedExecution.startedAt ? new Date(selectedExecution.startedAt).toLocaleString() : 'N/A'}</p>
              <p><strong>Completed:</strong> {selectedExecution.endTime ? new Date(selectedExecution.endTime).toLocaleString() : 'N/A'}</p>
              <p><strong>Duration:</strong> {selectedExecution.duration ? `${selectedExecution.duration}ms` : 'N/A'}</p>
            </div>

            {/* Error Details */}
            {selectedExecution.error && (
              <div className="detail-section error-section">
                <h4>🔴 Error Details</h4>
                <div className="error-box">
                  <p><strong>Message:</strong> {selectedExecution.error.message}</p>
                  {selectedExecution.error.code && (
                    <p><strong>Code:</strong> {selectedExecution.error.code}</p>
                  )}
                  {selectedExecution.error.step && (
                    <p><strong>Failed Step:</strong> {selectedExecution.error.step}</p>
                  )}
                  {selectedExecution.error.stack && (
                    <details>
                      <summary>Stack Trace</summary>
                      <pre className="stack-trace">{selectedExecution.error.stack}</pre>
                    </details>
                  )}
                </div>
              </div>
            )}

            {/* Step Details */}
            {selectedExecution.steps && selectedExecution.steps.length > 0 && (
              <div className="detail-section">
                <h4>📋 Step Execution Details</h4>
                {selectedExecution.steps.map((step: any, index: number) => (
                  <div key={index} className={`step-detail ${step.status}`}>
                    <div className="step-header">
                      <span className="step-icon">
                        {step.status === 'success' ? '✅' : step.status === 'failed' ? '❌' : '⏸️'}
                      </span>
                      <strong>Step {index + 1}: {step.stepName || step.stepId}</strong>
                      <Tag type={step.status === 'success' ? 'green' : step.status === 'failed' ? 'red' : 'gray'} size="sm">
                        {step.status}
                      </Tag>
                    </div>
                    
                    {step.error && (
                      <div className="step-error">
                        <p><strong>Error:</strong> {step.error.message}</p>
                        {step.error.code && <p><strong>Code:</strong> {step.error.code}</p>}
                      </div>
                    )}
                    
                    {step.output && (
                      <details className="step-output">
                        <summary>Output Data</summary>
                        <pre>{JSON.stringify(step.output, null, 2)}</pre>
                      </details>
                    )}
                    
                    {step.duration && (
                      <p className="step-duration">Duration: {step.duration}ms</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

// Made with Bob
