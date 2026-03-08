const axios = require('axios');
const logger = require('../utils/logger');
const Connector = require('../models/Connector');
const Connection = require('../models/Connection');

class ConnectorService {
  constructor() {
    this.connectors = new Map();
    this._initializeConnectors();
  }

  /**
   * Initialize built-in connectors
   */
  async _initializeConnectors() {
    // GitHub Connector
    this.connectors.set('github', {
      executeAction: async (action, config, data, credentials) => {
        const { token } = credentials;
        
        switch (action) {
          case 'create_issue':
            return await this._githubCreateIssue(config, data, token);
          case 'get_issues':
            return await this._githubGetIssues(config, token);
          case 'update_issue':
            return await this._githubUpdateIssue(config, data, token);
          default:
            throw new Error(`Unknown GitHub action: ${action}`);
        }
      },
    });

    // Airtable Connector
    this.connectors.set('airtable', {
      executeAction: async (action, config, data, credentials) => {
        const { apiKey } = credentials;
        
        switch (action) {
          case 'create_record':
            return await this._airtableCreateRecord(config, data, apiKey);
          case 'get_records':
            return await this._airtableGetRecords(config, apiKey);
          case 'update_record':
            return await this._airtableUpdateRecord(config, data, apiKey);
          default:
            throw new Error(`Unknown Airtable action: ${action}`);
        }
      },
    });

    // Slack Connector
    this.connectors.set('slack', {
      executeAction: async (action, config, data, credentials) => {
        const { token } = credentials;
        
        switch (action) {
          case 'send_message':
            return await this._slackSendMessage(config, data, token);
          case 'create_channel':
            return await this._slackCreateChannel(config, token);
          default:
            throw new Error(`Unknown Slack action: ${action}`);
        }
      },
    });

    // SendGrid Connector
    this.connectors.set('sendgrid', {
      executeAction: async (action, parameters, data, credentials) => {
        const { apiKey } = credentials;
        
        switch (action) {
          case 'send_email':
            // parameters is actually config.parameters from executeAction call
            // Wrap it back into a config object for _sendgridSendEmail
            return await this._sendgridSendEmail({ parameters }, data, apiKey);
          default:
            throw new Error(`Unknown SendGrid action: ${action}`);
        }
      },
    });
  }

  /**
   * Execute connector action
   */
  async executeAction(connectorName, config, data) {
    try {
      // Make connector lookup case-insensitive
      const normalizedName = connectorName.toLowerCase();
      const connector = this.connectors.get(normalizedName);
      
      if (!connector) {
        throw new Error(`Connector not found: ${connectorName}`);
      }

      // Get connection credentials
      let credentials;
      
      // Try to find connection in database
      const connection = await Connection.findOne({
        connectorId: config.connectionId,
        status: 'active',
      });

      if (connection) {
        credentials = connection.getDecryptedCredentials();
      } else {
        // Demo mode: Use environment credentials if no connection found
        logger.info('No connection found, using environment credentials', {
          connector: normalizedName,
        });
        
        credentials = this._getEnvCredentials(normalizedName);
        
        if (!credentials) {
          throw new Error(`No active connection found for ${connectorName} and no environment credentials configured`);
        }
      }

      logger.info('Executing connector action', {
        connector: connectorName,
        action: config.action,
      });

      const result = await connector.executeAction(
        config.action,
        config.parameters,
        data,
        credentials
      );

      logger.info('Connector action completed', {
        connector: connectorName,
        action: config.action,
      });

      return result;
    } catch (error) {
      logger.error('Connector action failed', {
        connector: connectorName,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get all available connectors
   */
  async getConnectors(filters = {}) {
    // Return hardcoded connectors for demo
    const connectors = [
      {
        _id: 'github',
        name: 'GitHub',
        description: 'Connect to GitHub to manage issues, pull requests, and repositories',
        category: 'Development',
        icon: 'github',
        isActive: true,
        actions: ['create_issue', 'get_issues', 'update_issue'],
      },
      {
        _id: 'airtable',
        name: 'Airtable',
        description: 'Connect to Airtable to manage records and databases',
        category: 'Database',
        icon: 'airtable',
        isActive: true,
        actions: ['create_record', 'get_records', 'update_record'],
      },
      {
        _id: 'slack',
        name: 'Slack',
        description: 'Send messages and notifications to Slack channels',
        category: 'Communication',
        icon: 'slack',
        isActive: true,
        actions: ['send_message', 'create_channel'],
      },
      {
        _id: 'sendgrid',
        name: 'SendGrid',
        description: 'Send transactional and marketing emails via SendGrid',
        category: 'Email',
        icon: 'sendgrid',
        isActive: true,
        actions: ['send_email'],
      },
    ];

    if (filters.category) {
      return connectors.filter(c => c.category === filters.category);
    }

    return connectors;
  }

  /**
   * Get connector by name
   */
  async getConnector(name) {
    return await Connector.findOne({ name, isActive: true }).lean();
  }

  // GitHub Actions
  async _githubCreateIssue(config, data, token) {
    const { owner, repo } = config.parameters;
    
    const response = await axios.post(
      `https://api.github.com/repos/${owner}/${repo}/issues`,
      {
        title: data.title,
        body: data.body,
        labels: data.labels || [],
      },
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'IntegrationIQ',
        },
      }
    );

    return response.data;
  }

  async _githubGetIssues(config, token) {
    // Extract parameters with fallbacks
    const parameters = config.parameters || config;
    let owner = parameters.owner || parameters.repository?.split('/')[0];
    let repo = parameters.repo || parameters.repository?.split('/')[1];
    const state = parameters.state || 'open';
    
    // Fallback to environment variable if not provided
    if (!owner || !repo) {
      const defaultRepo = process.env.GITHUB_DEFAULT_REPO || 'nijeeshvayalassery/integrationq';
      [owner, repo] = defaultRepo.split('/');
    }
    
    if (!owner || !repo) {
      throw new Error('GitHub repository owner and name are required. Please provide "owner" and "repo" in config, or set GITHUB_DEFAULT_REPO environment variable.');
    }
    
    logger.info('Fetching GitHub issues', {
      owner,
      repo,
      state,
    });
    
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/issues`,
      {
        params: { state },
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'IntegrationIQ',
        },
      }
    );

    logger.info('GitHub issues fetched', {
      count: response.data.length,
    });

    return response.data;
  }

  async _githubUpdateIssue(config, data, token) {
    const { owner, repo, issue_number } = config.parameters;
    
    const response = await axios.patch(
      `https://api.github.com/repos/${owner}/${repo}/issues/${issue_number}`,
      data,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'IntegrationIQ',
        },
      }
    );

    return response.data;
  }

  // Airtable Actions
  async _airtableCreateRecord(config, data, apiKey) {
    const { baseId, tableId } = config.parameters;
    
    const response = await axios.post(
      `https://api.airtable.com/v0/${baseId}/${tableId}`,
      {
        fields: data.fields,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  }

  async _airtableGetRecords(config, apiKey) {
    const { baseId, tableId } = config.parameters;
    
    const response = await axios.get(
      `https://api.airtable.com/v0/${baseId}/${tableId}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    return response.data;
  }

  async _airtableUpdateRecord(config, data, apiKey) {
    const { baseId, tableId, recordId } = config.parameters;
    
    const response = await axios.patch(
      `https://api.airtable.com/v0/${baseId}/${tableId}/${recordId}`,
      {
        fields: data.fields,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  }

  // Slack Actions
  async _slackSendMessage(config, data, token) {
    const { channel } = config.parameters;
    
    const response = await axios.post(
      'https://slack.com/api/chat.postMessage',
      {
        channel,
        text: data.text,
        blocks: data.blocks,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.data.ok) {
      throw new Error(`Slack API error: ${response.data.error}`);
    }

    return response.data;
  }

  async _slackCreateChannel(config, token) {
    const { name, is_private = false } = config.parameters;
    
    const response = await axios.post(
      'https://slack.com/api/conversations.create',
      {
        name,
        is_private,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.data.ok) {
      throw new Error(`Slack API error: ${response.data.error}`);
    }

    return response.data;
  }

  // SendGrid Actions
  async _sendgridSendEmail(config, data, apiKey) {
    // Debug logging
    logger.info('SendGrid _sendgridSendEmail called with:', {
      'config.parameters': config.parameters,
      'config.parameters.to': config.parameters?.to,
      'data': data,
      'data.to': data?.to,
    });
    
    // Priority order: config.parameters > data > defaults
    // This ensures workflow config takes precedence
    const emailData = {
      from: config.parameters?.from || data?.from || 'nijeeshvayalassery@gmail.com',
      to: config.parameters?.to || config.parameters?.recipient || data?.to || 'nijeeshvayalassery@gmail.com',
      subject: config.parameters?.subject || data?.subject || 'GitHub Issue Notification',
      html: config.parameters?.html || config.parameters?.text || data?.html || data?.text || this._buildDefaultEmailContent(data),
    };

    // Validate required fields
    if (!config.parameters?.to && !config.parameters?.recipient && !data?.to) {
      logger.warn('SendGrid: No recipient email found in workflow config, using default email:', emailData.to);
    }
    
    logger.info('SendGrid final emailData:', emailData);
    
    logger.info('Sending email via SendGrid', {
      from: emailData.from,
      to: emailData.to,
      subject: emailData.subject,
    });
    
    const response = await axios.post(
      'https://api.sendgrid.com/v3/mail/send',
      {
        personalizations: [
          {
            to: [{ email: emailData.to }],
            subject: emailData.subject,
          },
        ],
        from: { email: emailData.from },
        content: [
          {
            type: 'text/html',
            value: emailData.html,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      success: true,
      messageId: response.headers['x-message-id'],
      sentTo: emailData.to,
      subject: emailData.subject,
    };
  }

  /**
   * Test connector connection
   */
  async testConnection(connectorName, credentials) {
    try {
      // Make connector lookup case-insensitive
      const normalizedName = connectorName.toLowerCase();
      const connector = this.connectors.get(normalizedName);
      
      if (!connector) {
        throw new Error(`Connector not found: ${connectorName}`);
      }

      // Perform a simple test action based on connector type
      switch (connectorName) {
        case 'github':
          await axios.get('https://api.github.com/user', {
            headers: {
              Authorization: `token ${credentials.token}`,
              'User-Agent': 'IntegrationIQ',
            },
          });
          break;
        
        case 'airtable':
          await axios.get('https://api.airtable.com/v0/meta/bases', {
            headers: {
              Authorization: `Bearer ${credentials.apiKey}`,
            },
          });
          break;
        
        case 'slack':
          await axios.post(
            'https://slack.com/api/auth.test',
            {},
            {
              headers: {
                Authorization: `Bearer ${credentials.token}`,
              },
            }
          );
          break;
        
        case 'sendgrid':
          await axios.get('https://api.sendgrid.com/v3/user/profile', {
            headers: {
              Authorization: `Bearer ${credentials.apiKey}`,
            },
          });
          break;
        
        default:
          throw new Error(`Test not implemented for ${connectorName}`);
      }

      return { success: true, message: 'Connection successful' };
    } catch (error) {
      logger.error('Connection test failed', {
        connector: connectorName,
        error: error.message,
      });
      
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Test connector connection using environment credentials
   */
  async testConnectionWithEnv(connectorName) {
    try {
      // Make connector lookup case-insensitive
      const normalizedName = connectorName.toLowerCase();
      const connector = this.connectors.get(normalizedName);
      
      if (!connector) {
        return {
          success: false,
          message: `Connector not found: ${connectorName}`,
        };
      }

      let credentials = {};
      let testResult;

      // Get credentials from environment
      switch (connectorName) {
        case 'github':
          if (!process.env.GITHUB_PAT) {
            return {
              success: false,
              message: 'GitHub PAT not configured in environment',
            };
          }
          credentials = { token: process.env.GITHUB_PAT };
          
          // Test GitHub connection
          const githubResponse = await axios.get('https://api.github.com/user', {
            headers: {
              Authorization: `token ${credentials.token}`,
              'User-Agent': 'IntegrationIQ',
            },
          });
          
          testResult = {
            success: true,
            message: 'GitHub connection successful',
            data: {
              username: githubResponse.data.login,
              name: githubResponse.data.name,
            },
          };
          break;
        
        case 'sendgrid':
          if (!process.env.SENDGRID_API_KEY) {
            return {
              success: false,
              message: 'SendGrid API key not configured in environment',
            };
          }
          credentials = { apiKey: process.env.SENDGRID_API_KEY };
          
          // Test SendGrid connection
          const sendgridResponse = await axios.get('https://api.sendgrid.com/v3/user/profile', {
            headers: {
              Authorization: `Bearer ${credentials.apiKey}`,
            },
          });
          
          testResult = {
            success: true,
            message: 'SendGrid connection successful',
            data: {
              email: sendgridResponse.data.email,
            },
          };
          break;
        
        case 'airtable':
          if (!process.env.AIRTABLE_API_KEY) {
            return {
              success: false,
              message: 'Airtable API key not configured in environment',
            };
          }
          return {
            success: false,
            message: 'Airtable credentials not configured. Please add AIRTABLE_API_KEY to .env',
          };
        
        case 'slack':
          if (!process.env.SLACK_CLIENT_ID || !process.env.SLACK_CLIENT_SECRET) {
            return {
              success: false,
              message: 'Slack credentials not configured in environment',
            };
          }
          return {
            success: false,
            message: 'Slack credentials not configured. Please add SLACK_CLIENT_ID and SLACK_CLIENT_SECRET to .env',
          };
        
        default:
          return {
            success: false,
            message: `Test not implemented for ${connectorName}`,
          };
      }

      logger.info('Connection test with env successful', {
        connector: connectorName,
      });

      return testResult;
    } catch (error) {
      logger.error('Connection test with env failed', {
        connector: connectorName,
        error: error.message,
      });
      
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Get credentials from environment variables (demo mode)
   */
  _getEnvCredentials(connectorName) {
    switch (connectorName) {
      case 'github':
        if (process.env.GITHUB_PAT) {
          return { token: process.env.GITHUB_PAT };
        }
        break;
      
      case 'sendgrid':
        if (process.env.SENDGRID_API_KEY) {
          return { apiKey: process.env.SENDGRID_API_KEY };
        }
        break;
      
      case 'slack':
        if (process.env.SLACK_CLIENT_ID && process.env.SLACK_CLIENT_SECRET) {
          return {
            clientId: process.env.SLACK_CLIENT_ID,
            clientSecret: process.env.SLACK_CLIENT_SECRET,
          };
        }
        break;
      
      case 'airtable':
        if (process.env.AIRTABLE_API_KEY) {
          return { apiKey: process.env.AIRTABLE_API_KEY };
        }
        break;
    }
    
    return null;
  }

  /**
   * Build default email content from workflow data
   */
  _buildDefaultEmailContent(data) {
    if (!data) {
      return '<p>This is an automated notification from IntegrationIQ.</p>';
    }
    
    // Handle array of GitHub issues
    if (Array.isArray(data)) {
      if (data.length === 0) {
        return `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #24292e;">✅ No Open Issues</h2>
            <p style="color: #586069; font-size: 16px;">
              Great news! There are currently no open issues in the repository.
            </p>
            <p style="color: #586069; font-size: 14px; margin-top: 20px;">
              <em>This is an automated notification from IntegrationIQ</em>
            </p>
          </div>
        `;
      }
      
      const issueCount = data.length;
      const issuesHtml = data.map((issue, index) => `
        <div style="border-left: 4px solid #0366d6; padding-left: 16px; margin-bottom: 24px;">
          <h3 style="color: #24292e; margin: 0 0 8px 0;">
            <a href="${issue.html_url}" style="color: #0366d6; text-decoration: none;">
              #${issue.number}: ${issue.title}
            </a>
          </h3>
          <p style="color: #586069; font-size: 14px; margin: 4px 0;">
            <span style="background: #28a745; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px;">
              ${issue.state}
            </span>
            Opened by <strong>${issue.user?.login || 'Unknown'}</strong>
            ${issue.created_at ? `on ${new Date(issue.created_at).toLocaleDateString()}` : ''}
          </p>
          ${issue.body ? `
            <p style="color: #24292e; font-size: 14px; margin-top: 12px; line-height: 1.5;">
              ${issue.body.substring(0, 200)}${issue.body.length > 200 ? '...' : ''}
            </p>
          ` : ''}
          ${issue.labels && issue.labels.length > 0 ? `
            <p style="margin-top: 8px;">
              ${issue.labels.map(label => `
                <span style="background: #${label.color || 'e1e4e8'}; color: #000; padding: 2px 8px; border-radius: 3px; font-size: 12px; margin-right: 4px;">
                  ${label.name}
                </span>
              `).join('')}
            </p>
          ` : ''}
        </div>
      `).join('');
      
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #24292e;">📋 GitHub Issues Report</h2>
          <p style="color: #586069; font-size: 16px;">
            Found <strong>${issueCount}</strong> open issue${issueCount !== 1 ? 's' : ''} in the repository:
          </p>
          <div style="margin-top: 24px;">
            ${issuesHtml}
          </div>
          <hr style="border: none; border-top: 1px solid #e1e4e8; margin: 32px 0;">
          <p style="color: #586069; font-size: 14px;">
            <em>This is an automated notification from IntegrationIQ</em>
          </p>
        </div>
      `;
    }
    
    // Handle single GitHub issue
    if (data.title || data.html_url) {
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #24292e;">🔔 New GitHub Issue</h2>
          <div style="border-left: 4px solid #0366d6; padding-left: 16px; margin: 24px 0;">
            <h3 style="color: #24292e; margin: 0 0 8px 0;">
              <a href="${data.html_url}" style="color: #0366d6; text-decoration: none;">
                #${data.number}: ${data.title}
              </a>
            </h3>
            <p style="color: #586069; font-size: 14px; margin: 4px 0;">
              <span style="background: #28a745; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px;">
                ${data.state || 'open'}
              </span>
              Opened by <strong>${data.user?.login || 'Unknown'}</strong>
              ${data.created_at ? `on ${new Date(data.created_at).toLocaleDateString()}` : ''}
            </p>
            ${data.body ? `
              <div style="background: #f6f8fa; padding: 16px; border-radius: 6px; margin-top: 16px;">
                <p style="color: #24292e; font-size: 14px; margin: 0; line-height: 1.6;">
                  ${data.body}
                </p>
              </div>
            ` : ''}
            ${data.labels && data.labels.length > 0 ? `
              <p style="margin-top: 12px;">
                ${data.labels.map(label => `
                  <span style="background: #${label.color || 'e1e4e8'}; color: #000; padding: 2px 8px; border-radius: 3px; font-size: 12px; margin-right: 4px;">
                    ${label.name}
                  </span>
                `).join('')}
              </p>
            ` : ''}
          </div>
          <p style="color: #586069; font-size: 14px; margin-top: 32px;">
            <em>This is an automated notification from IntegrationIQ</em>
          </p>
        </div>
      `;
    }
    
    // Generic content for other data types
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #24292e;">📬 Workflow Notification</h2>
        <p style="color: #586069; font-size: 16px;">
          Your workflow has completed successfully.
        </p>
        <div style="background: #f6f8fa; padding: 16px; border-radius: 6px; margin: 24px 0;">
          <pre style="margin: 0; overflow-x: auto; font-size: 12px;">${JSON.stringify(data, null, 2)}</pre>
        </div>
        <p style="color: #586069; font-size: 14px;">
          <em>This is an automated notification from IntegrationIQ</em>
        </p>
      </div>
    `;
  }
}

module.exports = new ConnectorService();

// Made with Bob
