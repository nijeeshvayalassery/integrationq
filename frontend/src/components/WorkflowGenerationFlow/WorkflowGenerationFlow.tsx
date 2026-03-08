import React, { useEffect, useState } from 'react';
import './WorkflowGenerationFlow.css';

interface WorkflowGenerationFlowProps {
  isGenerating: boolean;
}

export const WorkflowGenerationFlow: React.FC<WorkflowGenerationFlowProps> = ({ isGenerating }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!isGenerating) {
      setStep(0);
      return;
    }

    // Animation sequence - Slowed down for better visibility
    const steps = [
      { delay: 0, step: 1 },      // Show IQ analyzing
      { delay: 1200, step: 2 },   // Connect to GitHub (was 800)
      { delay: 2400, step: 3 },   // GitHub active (was 1600)
      { delay: 3600, step: 4 },   // Connect to SendGrid (was 2400)
      { delay: 4800, step: 5 },   // SendGrid active (was 3200)
      { delay: 6000, step: 6 },   // Complete workflow (was 4000)
    ];

    const timers = steps.map(({ delay, step: s }) =>
      setTimeout(() => setStep(s), delay)
    );

    return () => timers.forEach(clearTimeout);
  }, [isGenerating]);

  if (!isGenerating) return null;

  return (
    <div className="workflow-generation-flow">
      <div className="flow-header">
        <div className="ai-brain-icon">🧠</div>
        <h3>AI is generating your workflow...</h3>
      </div>

      <div className="flow-diagram">
        {/* IntegrationIQ Node */}
        <div className={`flow-node iq-node ${step >= 1 ? 'active' : ''}`}>
          <div className="node-icon">⚡</div>
          <div className="node-label">IntegrationIQ</div>
          <div className="node-status">
            {step >= 1 && step < 6 && <span className="pulse">Analyzing...</span>}
            {step >= 6 && <span className="success">✓ Complete</span>}
          </div>
        </div>

        {/* Connection Line 1: IQ to GitHub */}
        <div className={`connection-line line-1 ${step >= 2 ? 'active' : ''}`}>
          <div className="flow-arrow">→</div>
          <div className="flow-label">Connecting</div>
        </div>

        {/* GitHub Node */}
        <div className={`flow-node github-node ${step >= 3 ? 'active' : ''}`}>
          <div className="node-icon">
            <svg width="32" height="32" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
          </div>
          <div className="node-label">GitHub</div>
          <div className="node-status">
            {step >= 3 && step < 6 && <span className="pulse">Connected</span>}
            {step >= 6 && <span className="success">✓ Ready</span>}
          </div>
        </div>

        {/* Connection Line 2: GitHub back to IQ */}
        <div className={`connection-line line-2 ${step >= 3 ? 'active' : ''}`}>
          <div className="flow-arrow">←</div>
          <div className="flow-label">Data Flow</div>
        </div>

        {/* Connection Line 3: IQ to SendGrid */}
        <div className={`connection-line line-3 ${step >= 4 ? 'active' : ''}`}>
          <div className="flow-arrow">→</div>
          <div className="flow-label">Connecting</div>
        </div>

        {/* SendGrid Node */}
        <div className={`flow-node sendgrid-node ${step >= 5 ? 'active' : ''}`}>
          <div className="node-icon">📧</div>
          <div className="node-label">SendGrid</div>
          <div className="node-status">
            {step >= 5 && step < 6 && <span className="pulse">Connected</span>}
            {step >= 6 && <span className="success">✓ Ready</span>}
          </div>
        </div>

        {/* Connection Line 4: SendGrid back to IQ */}
        <div className={`connection-line line-4 ${step >= 5 ? 'active' : ''}`}>
          <div className="flow-arrow">←</div>
          <div className="flow-label">Configured</div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="progress-steps">
        <div className={`progress-step ${step >= 1 ? 'completed' : ''}`}>
          <div className="step-number">1</div>
          <div className="step-label">Analyzing Request</div>
        </div>
        <div className={`progress-step ${step >= 3 ? 'completed' : ''}`}>
          <div className="step-number">2</div>
          <div className="step-label">Configuring GitHub</div>
        </div>
        <div className={`progress-step ${step >= 5 ? 'completed' : ''}`}>
          <div className="step-number">3</div>
          <div className="step-label">Setting up SendGrid</div>
        </div>
        <div className={`progress-step ${step >= 6 ? 'completed' : ''}`}>
          <div className="step-number">4</div>
          <div className="step-label">Finalizing Workflow</div>
        </div>
      </div>

      {step >= 6 && (
        <div className="completion-message">
          <div className="success-icon">✓</div>
          <p>Workflow generated successfully!</p>
        </div>
      )}
    </div>
  );
};

// Made with Bob