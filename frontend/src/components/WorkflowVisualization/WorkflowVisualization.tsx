import React from 'react';
import { Workflow } from '../../types';
import './WorkflowVisualization.css';

interface WorkflowVisualizationProps {
  workflow: Workflow;
}

export const WorkflowVisualization: React.FC<WorkflowVisualizationProps> = ({ workflow }) => {
  // Get unique connectors from workflow steps
  const getConnectors = () => {
    const connectors = new Set<string>();
    workflow.steps.forEach(step => {
      if (step.connector) {
        connectors.add(step.connector);
      }
    });
    return Array.from(connectors);
  };

  const connectors = getConnectors();

  // Map connector names to icons and colors
  const getConnectorInfo = (connector: string) => {
    const connectorMap: Record<string, { icon: string; color: string; label: string }> = {
      github: {
        icon: '🐙',
        color: '#24292e',
        label: 'GitHub'
      },
      sendgrid: {
        icon: '📧',
        color: '#1a82e2',
        label: 'SendGrid'
      },
      airtable: {
        icon: '📊',
        color: '#18bfff',
        label: 'Airtable'
      },
      slack: {
        icon: '💬',
        color: '#4a154b',
        label: 'Slack'
      }
    };

    return connectorMap[connector.toLowerCase()] || {
      icon: '🔧',
      color: '#666',
      label: connector
    };
  };

  return (
    <div className="workflow-visualization">
      <h2>Workflow Visualization</h2>
      <p className="viz-subtitle">Visual representation of your workflow connections</p>

      <div className="viz-container">
        {/* Hub and Spoke Diagram */}
        <div className="viz-hub-spoke">
          {/* IntegrationIQ Central Hub (Top Row) */}
          <div className="viz-hub-row">
            <div className="viz-node center-node hub-node">
              <div className="node-icon">⚡</div>
              <div className="node-label">IntegrationIQ</div>
              <div className="node-badge">{workflow.steps.length} steps</div>
            </div>
          </div>

          {/* Connection Lines Container */}
          <div className="viz-connections-container">
            {connectors.map((connector, index) => {
              const info = getConnectorInfo(connector);
              return (
                <div key={connector} className="viz-spoke-line" style={{ '--spoke-index': index, '--total-spokes': connectors.length } as React.CSSProperties}>
                  <div className="spoke-arrow-down">↓</div>
                  <div className="spoke-line-vertical"></div>
                  <div className="spoke-arrow-up">↑</div>
                </div>
              );
            })}
          </div>

          {/* Connected Services (Bottom Row) */}
          <div className="viz-services-row">
            {connectors.map((connector, index) => {
              const info = getConnectorInfo(connector);
              const steps = workflow.steps.filter(s => s.connector === connector);
              
              return (
                <div key={connector} className="viz-service-column">
                  {/* Service Node */}
                  <div className="viz-node service-node" style={{ borderColor: info.color }}>
                    <div className="node-icon" style={{ background: `${info.color}20` }}>
                      {info.icon}
                    </div>
                    <div className="node-label">{info.label}</div>
                    <div className="node-badge">{steps.length} action{steps.length > 1 ? 's' : ''}</div>
                    
                    {/* Actions List */}
                    <div className="node-actions">
                      {steps.map((step, idx) => (
                        <div key={idx} className="action-item">
                          <span className="action-number">{workflow.steps.indexOf(step) + 1}</span>
                          <span className="action-name">{step.action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Flow Description */}
        <div className="viz-flow-description">
          <h3>Flow Sequence</h3>
          <ol className="flow-steps">
            {workflow.steps.map((step, index) => {
              const info = getConnectorInfo(step.connector);
              return (
                <li key={index} className="flow-step-item">
                  <span className="step-icon">{info.icon}</span>
                  <span className="step-text">
                    <strong>{info.label}:</strong> {step.action}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
};

// Made with Bob