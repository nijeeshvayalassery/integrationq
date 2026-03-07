import React, { useState } from 'react';
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
      navigate(`/workflows/${workflow._id}`);
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

// Made with Bob
