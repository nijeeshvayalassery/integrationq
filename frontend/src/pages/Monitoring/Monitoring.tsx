import React, { useEffect, useState } from 'react';
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
    duration: execution.duration ? `${execution.duration}ms` : '-',
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

// Made with Bob
