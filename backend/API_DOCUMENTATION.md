# IntegrationIQ API Documentation

Complete API reference for IntegrationIQ Backend v1.0

Base URL: `http://localhost:3000/api/v1`

## Table of Contents

1. [Authentication](#authentication)
2. [Workflows](#workflows)
3. [Connectors](#connectors)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)

---

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Register User

**POST** `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "7d"
  }
}
```

### Login

**POST** `/auth/login`

Authenticate user and receive tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "7d"
  }
}
```

### Refresh Token

**POST** `/auth/refresh`

Get a new access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "7d"
  }
}
```

### Get Current User

**GET** `/auth/me`

Get authenticated user's profile.

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## Workflows

### Generate Workflow from Natural Language

**POST** `/workflows/generate`

Generate a workflow definition using AI from natural language prompt.

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Request Body:**
```json
{
  "prompt": "When a GitHub issue is created, store it in Airtable, send a Slack notification, and email the team"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Workflow generated successfully",
  "data": {
    "workflow": {
      "name": "GitHub Issues to Team Notification",
      "description": "Automatically process GitHub issues and notify team",
      "trigger": {
        "id": "trigger-1",
        "type": "trigger",
        "connector": "github",
        "config": {
          "event": "issues.opened",
          "repository": "owner/repo"
        }
      },
      "steps": [
        {
          "id": "step-1",
          "type": "action",
          "connector": "airtable",
          "config": {
            "action": "create_record",
            "parameters": {
              "baseId": "appXXXXXXXXXXXXXX",
              "tableId": "tblXXXXXXXXXXXXXX"
            }
          },
          "nextSteps": ["step-2"]
        },
        {
          "id": "step-2",
          "type": "action",
          "connector": "slack",
          "config": {
            "action": "send_message",
            "parameters": {
              "channel": "#team"
            }
          },
          "nextSteps": ["step-3"]
        },
        {
          "id": "step-3",
          "type": "action",
          "connector": "sendgrid",
          "config": {
            "action": "send_email",
            "parameters": {
              "to": "team@example.com"
            }
          },
          "nextSteps": []
        }
      ]
    },
    "metadata": {
      "model": "gpt-4",
      "confidence": 0.95,
      "generatedAt": "2024-01-01T00:00:00.000Z",
      "tokensUsed": 450
    }
  }
}
```

### Create Workflow

**POST** `/workflows`

Create a new workflow.

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Request Body:**
```json
{
  "name": "GitHub Issues to Team",
  "description": "Process GitHub issues automatically",
  "trigger": {
    "id": "trigger-1",
    "type": "trigger",
    "connector": "github",
    "config": {
      "event": "issues.opened"
    }
  },
  "steps": [
    {
      "id": "step-1",
      "type": "action",
      "connector": "airtable",
      "config": {
        "action": "create_record",
        "parameters": {
          "baseId": "appXXXXXXXXXXXXXX",
          "tableId": "tblXXXXXXXXXXXXXX"
        }
      }
    }
  ],
  "settings": {
    "retryOnFailure": true,
    "maxRetries": 3,
    "timeout": 30000
  },
  "tags": ["github", "automation"]
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Workflow created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "GitHub Issues to Team",
    "status": "draft",
    "userId": "507f1f77bcf86cd799439012",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Get All Workflows

**GET** `/workflows`

Get all workflows for authenticated user.

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Query Parameters:**
- `status` (optional): Filter by status (draft, active, paused, error)
- `limit` (optional): Number of results (default: 50)
- `skip` (optional): Number to skip (default: 0)
- `tags` (optional): Comma-separated tags

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "workflows": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "name": "GitHub Issues to Team",
        "description": "Process GitHub issues",
        "status": "active",
        "executionStats": {
          "totalExecutions": 1247,
          "successfulExecutions": 1244,
          "failedExecutions": 3,
          "lastExecutedAt": "2024-01-01T00:00:00.000Z"
        },
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 12,
    "limit": 50,
    "skip": 0
  }
}
```

### Execute Workflow

**POST** `/workflows/:id/execute`

Execute a workflow with trigger data.

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Request Body:**
```json
{
  "triggerData": {
    "issue": {
      "title": "Bug found in login",
      "body": "Users cannot login with email",
      "labels": ["bug", "urgent"]
    }
  }
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Workflow execution started",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "workflowId": "507f1f77bcf86cd799439011",
    "status": "running",
    "startTime": "2024-01-01T00:00:00.000Z"
  }
}
```

### Get Execution Logs

**GET** `/workflows/:id/executions`

Get execution logs for a workflow.

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Query Parameters:**
- `limit` (optional): Number of results (default: 50)
- `skip` (optional): Number to skip (default: 0)
- `status` (optional): Filter by status

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "workflowId": "507f1f77bcf86cd799439011",
        "status": "success",
        "startTime": "2024-01-01T00:00:00.000Z",
        "endTime": "2024-01-01T00:00:01.245Z",
        "duration": 1245,
        "steps": [
          {
            "stepId": "step-1",
            "stepName": "airtable",
            "status": "success",
            "duration": 450
          }
        ]
      }
    ],
    "total": 1247,
    "limit": 50,
    "skip": 0
  }
}
```

### Get Execution Statistics

**GET** `/workflows/:id/stats`

Get execution statistics for a workflow.

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Query Parameters:**
- `timeRange` (optional): Time range (1h, 24h, 7d, 30d) (default: 24h)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "_id": "success",
      "count": 1244,
      "avgDuration": 1245.5
    },
    {
      "_id": "failed",
      "count": 3,
      "avgDuration": 2500.0
    }
  ]
}
```

---

## Connectors

### Get All Connectors

**GET** `/connectors`

Get all available connectors.

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Query Parameters:**
- `category` (optional): Filter by category

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "name": "github",
      "displayName": "GitHub",
      "description": "GitHub integration for issues, PRs, and more",
      "category": "development",
      "authType": "oauth2",
      "capabilities": {
        "triggers": [
          {
            "id": "issues.opened",
            "name": "Issue Opened",
            "description": "Triggered when a new issue is created"
          }
        ],
        "actions": [
          {
            "id": "create_issue",
            "name": "Create Issue",
            "description": "Create a new GitHub issue"
          }
        ]
      }
    }
  ]
}
```

### Create Connection

**POST** `/connectors/connections`

Create a new connector connection.

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Request Body:**
```json
{
  "connectorId": "507f1f77bcf86cd799439014",
  "name": "My GitHub Account",
  "credentials": {
    "token": "ghp_xxxxxxxxxxxxxxxxxxxx"
  },
  "metadata": {
    "username": "johndoe"
  }
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Connection created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439015",
    "connectorId": "507f1f77bcf86cd799439014",
    "name": "My GitHub Account",
    "status": "active",
    "lastVerified": "2024-01-01T00:00:00.000Z"
  }
}
```

### Test Connection

**POST** `/connectors/test`

Test a connector connection before saving.

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Request Body:**
```json
{
  "connectorName": "github",
  "credentials": {
    "token": "ghp_xxxxxxxxxxxxxxxxxxxx"
  }
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Connection successful"
}
```

---

## Error Handling

All errors follow this format:

```json
{
  "success": false,
  "message": "Error message",
  "errors": ["Detailed error 1", "Detailed error 2"]
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

### Common Error Examples

**Validation Error (400):**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "\"email\" must be a valid email"
    },
    {
      "field": "password",
      "message": "\"password\" length must be at least 8 characters long"
    }
  ]
}
```

**Authentication Error (401):**
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

**Not Found Error (404):**
```json
{
  "success": false,
  "message": "Workflow not found"
}
```

---

## Rate Limiting

API requests are rate-limited to prevent abuse:

- **Default Limit:** 100 requests per 15 minutes per IP
- **Headers Included:**
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Requests remaining
  - `X-RateLimit-Reset`: Time when limit resets (Unix timestamp)

**Rate Limit Exceeded Response (429):**
```json
{
  "success": false,
  "message": "Too many requests from this IP, please try again later"
}
```

---

## Pagination

List endpoints support pagination:

**Query Parameters:**
- `limit`: Number of items per page (default: 50, max: 100)
- `skip`: Number of items to skip (default: 0)

**Response Format:**
```json
{
  "success": true,
  "data": {
    "items": [...],
    "total": 150,
    "limit": 50,
    "skip": 0
  }
}
```

---

## Webhooks

Workflows can be triggered via webhooks:

**Webhook URL Format:**
```
POST https://api.integrationiq.com/webhooks/:workflowId/:secret
```

**Example:**
```bash
curl -X POST https://api.integrationiq.com/webhooks/507f1f77bcf86cd799439011/abc123 \
  -H "Content-Type: application/json" \
  -d '{"data": "your trigger data"}'
```

---

## SDK Examples

### JavaScript/Node.js

```javascript
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

// Generate workflow
const response = await api.post('/workflows/generate', {
  prompt: 'When a GitHub issue is created, send a Slack message'
});

console.log(response.data);
```

### Python

```python
import requests

headers = {
    'Authorization': f'Bearer {access_token}',
    'Content-Type': 'application/json'
}

response = requests.post(
    'http://localhost:3000/api/v1/workflows/generate',
    headers=headers,
    json={'prompt': 'When a GitHub issue is created, send a Slack message'}
)

print(response.json())
```

### cURL

```bash
curl -X POST http://localhost:3000/api/v1/workflows/generate \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "When a GitHub issue is created, send a Slack message"}'
```

---

## Support

For API support:
- Documentation: https://docs.integrationiq.com
- Email: api-support@integrationiq.com
- GitHub Issues: https://github.com/integrationiq/backend/issues

---

**Version:** 1.0.0  
**Last Updated:** 2024-01-01