import React, { useEffect, useState } from 'react';
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
            <AccordionItem title={`Step ${index + 1}: ${step.action}`} key={index}>
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

// Made with Bob
