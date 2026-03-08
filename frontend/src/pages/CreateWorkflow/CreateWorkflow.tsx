import React, { useState } from 'react';
import { TextArea, Button, InlineLoading } from '@carbon/react';
import { useNavigate } from 'react-router-dom';
import { workflowAPI } from '../../services/api';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { WorkflowGenerationFlow } from '../../components/WorkflowGenerationFlow/WorkflowGenerationFlow';
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
      
      // Start timing to ensure minimum display time
      const startTime = Date.now();
      
      const workflow = await workflowAPI.generateWorkflow(description);
      
      // Calculate how long the API call took
      const elapsedTime = Date.now() - startTime;
      
      // Ensure animation shows for at least 9 seconds total (6s animation + 3s completion)
      const minimumDisplayTime = 9000;
      const remainingTime = Math.max(0, minimumDisplayTime - elapsedTime);
      
      // Wait for remaining time before navigating
      setTimeout(() => {
        setLoading(false);
        // Small additional delay to show the completion state
        setTimeout(() => {
          navigate(`/workflows/${workflow._id}`);
        }, 500);
      }, remainingTime);
    } catch (err: any) {
      setError(err.message || 'Failed to generate workflow');
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

      {/* Visual Flow Animation */}
      <WorkflowGenerationFlow isGenerating={loading} />

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
          <Button kind="secondary" onClick={() => navigate('/workflows')} disabled={loading}>
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
