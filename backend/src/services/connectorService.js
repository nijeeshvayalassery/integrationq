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
      executeAction: async (action, config, data, credentials) => {
        const { apiKey } = credentials;
        
        switch (action) {
          case 'send_email':
            return await this._sendgridSendEmail(config, data, apiKey);
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
      const connector = this.connectors.get(connectorName);
      
      if (!connector) {
        throw new Error(`Connector not found: ${connectorName}`);
      }

      // Get connection credentials
      const connection = await Connection.findOne({
        connectorId: config.connectionId,
        status: 'active',
      });

      if (!connection) {
        throw new Error(`No active connection found for ${connectorName}`);
      }

      const credentials = connection.getDecryptedCredentials();

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
    const query = { isActive: true };
    
    if (filters.category) {
      query.category = filters.category;
    }

    return await Connector.find(query).lean();
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
        },
      }
    );

    return response.data;
  }

  async _githubGetIssues(config, token) {
    const { owner, repo, state = 'open' } = config.parameters;
    
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/issues`,
      {
        params: { state },
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

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
    const { from, to, subject, html, text } = data;
    
    const response = await axios.post(
      'https://api.sendgrid.com/v3/mail/send',
      {
        personalizations: [
          {
            to: [{ email: to }],
            subject,
          },
        ],
        from: { email: from },
        content: [
          {
            type: 'text/html',
            value: html || text,
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

    return { success: true, messageId: response.headers['x-message-id'] };
  }

  /**
   * Test connector connection
   */
  async testConnection(connectorName, credentials) {
    try {
      const connector = this.connectors.get(connectorName);
      
      if (!connector) {
        throw new Error(`Connector not found: ${connectorName}`);
      }

      // Perform a simple test action based on connector type
      switch (connectorName) {
        case 'github':
          await axios.get('https://api.github.com/user', {
            headers: {
              Authorization: `token ${credentials.token}`,
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
}

module.exports = new ConnectorService();

// Made with Bob
