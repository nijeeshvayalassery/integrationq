import React from 'react';
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
                  onClick={() => navigate(`/workflows/${row.id}`)}
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

// Made with Bob
