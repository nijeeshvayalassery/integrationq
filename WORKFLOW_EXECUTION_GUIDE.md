# Workflow Execution Guide

## What Happens When You Execute a Workflow?

### Overview
When you click "Execute" on a workflow, the system performs a series of automated steps to run your integration workflow. Here's the complete flow:

## Execution Flow

### 1. **API Request** 
```
POST /api/v1/workflows/{workflowId}/execute
```
- Frontend sends execution request to backend
- Optional input data can be provided

### 2. **Validation**
- Checks if workflow exists
- Verifies workflow status is 'active'
- Validates user permissions

### 3. **Execution Log Created**
- Creates a new ExecutionLog document in MongoDB
- Status: 'running'
- Records start time and trigger data
- Generates unique execution ID

### 4. **Queue Job**
- Adds execution to Bull queue (Redis-backed)
- Allows async processing
- Returns immediately to user with execution ID

### 5. **Background Processing**
The workflow executes in the background through these steps:

#### Step-by-Step Execution:
```javascript
For each step in workflow.steps:
  1. Get connector (GitHub, Airtable, Slack, SendGrid)
  2. Retrieve connection credentials from database
  3. Execute connector action with parameters
  4. Log step result (success/failure)
  5. Pass output to next step as input
  6. If error occurs:
     - Log error details
     - Trigger AI healing (if enabled)
     - Apply retry/backoff strategy
```

### 6. **Real-World Actions**
Depending on your workflow, actual API calls are made:

**Example: GitHub → Slack Workflow**
```
Step 1: GitHub - Create Issue
  → POST https://api.github.com/repos/{owner}/{repo}/issues
  → Creates actual GitHub issue
  → Returns issue number and URL

Step 2: Slack - Send Message
  → POST https://slack.com/api/chat.postMessage
  → Sends notification to Slack channel
  → Includes GitHub issue link
```

### 7. **Execution Completion**
- Updates ExecutionLog status to 'completed' or 'failed'
- Records end time and duration
- Stores all step results
- Calculates success metrics

### 8. **Results Available**
- View in Monitoring page
- See execution logs with timestamps
- Check each step's input/output
- Review any errors or warnings

## Example Workflow Execution

### Workflow: "GitHub Issue to Airtable and Slack"

**Generated Steps:**
```json
{
  "name": "GitHub Issue Tracker",
  "steps": [
    {
      "id": "step1",
      "name": "Create GitHub Issue",
      "connector": "github",
      "action": "create_issue",
      "config": {
        "parameters": {
          "owner": "your-org",
          "repo": "your-repo"
        }
      }
    },
    {
      "id": "step2",
      "name": "Add to Airtable",
      "connector": "airtable",
      "action": "create_record",
      "config": {
        "parameters": {
          "baseId": "appXXXXXX",
          "tableId": "tblYYYYYY"
        }
      },
      "inputMapping": {
        "title": "{{step1.output.title}}",
        "url": "{{step1.output.html_url}}"
      }
    },
    {
      "id": "step3",
      "name": "Notify Slack",
      "connector": "slack",
      "action": "send_message",
      "config": {
        "parameters": {
          "channel": "#dev-team"
        }
      },
      "inputMapping": {
        "text": "New issue created: {{step1.output.title}}"
      }
    }
  ]
}
```

**Execution Result:**
```json
{
  "_id": "exec123",
  "workflowId": "wf456",
  "status": "completed",
  "startTime": "2026-03-06T13:00:00Z",
  "endTime": "2026-03-06T13:00:05Z",
  "duration": 5000,
  "steps": [
    {
      "stepId": "step1",
      "status": "success",
      "startTime": "2026-03-06T13:00:00Z",
      "endTime": "2026-03-06T13:00:02Z",
      "output": {
        "id": 123,
        "number": 456,
        "title": "Bug: Login not working",
        "html_url": "https://github.com/org/repo/issues/456"
      }
    },
    {
      "stepId": "step2",
      "status": "success",
      "startTime": "2026-03-06T13:00:02Z",
      "endTime": "2026-03-06T13:00:04Z",
      "output": {
        "id": "recXXXXXX",
        "fields": {
          "title": "Bug: Login not working",
          "url": "https://github.com/org/repo/issues/456"
        }
      }
    },
    {
      "stepId": "step3",
      "status": "success",
      "startTime": "2026-03-06T13:00:04Z",
      "endTime": "2026-03-06T13:00:05Z",
      "output": {
        "ok": true,
        "ts": "1234567890.123456"
      }
    }
  ]
}
```

## Prerequisites for Execution

### 1. **Active Connections Required**
Before executing, you need to create connections for each connector used:

```bash
# Example: Create GitHub connection
POST /api/v1/connectors/connections
{
  "connectorId": "github",
  "name": "My GitHub Account",
  "credentials": {
    "token": "github_pat_xxxxx"
  }
}
```

### 2. **Workflow Must Be Active**
- Status: 'active' (not 'draft' or 'paused')
- All steps must have valid connector references
- Connection IDs must be set for each step

### 3. **Redis Must Be Running**
```bash
# Check Redis
redis-cli ping
# Should return: PONG
```

### 4. **MongoDB Must Be Running**
```bash
# Check MongoDB
mongosh --eval "db.adminCommand('ping')"
```

## Monitoring Execution

### View in UI
1. Navigate to **Monitoring** page
2. See list of all executions
3. Click on execution to view details
4. See step-by-step results

### API Endpoints
```bash
# Get all executions
GET /api/v1/workflows/executions

# Get specific execution
GET /api/v1/workflows/executions/{executionId}

# Get executions for a workflow
GET /api/v1/workflows/{workflowId}/executions
```

## Error Handling

### What Happens on Error?

1. **Step Fails**
   - Error is logged with details
   - Execution status: 'failed'
   - Remaining steps are skipped (by default)

2. **AI Healing (if enabled)**
   - AI analyzes the error
   - Suggests fixes
   - Can auto-retry with adjustments

3. **Retry Strategies**
   - Exponential backoff
   - Circuit breaker
   - Fallback actions

### Example Error Log
```json
{
  "stepId": "step2",
  "status": "failed",
  "error": {
    "message": "Invalid API key",
    "code": "AUTHENTICATION_ERROR",
    "connector": "airtable"
  },
  "aiHealing": {
    "rootCause": "API key expired or invalid",
    "solution": "Update connection credentials",
    "confidence": 0.95
  }
}
```

## Testing Workflow Execution

### 1. Simple Test Workflow
```javascript
// Create a simple workflow that just logs
{
  "name": "Test Workflow",
  "steps": [
    {
      "id": "step1",
      "name": "Log Message",
      "connector": "slack",
      "action": "send_message",
      "config": {
        "parameters": {
          "channel": "#test"
        }
      },
      "input": {
        "text": "Test message from IntegrationIQ"
      }
    }
  ]
}
```

### 2. Execute via API
```bash
curl -X POST http://localhost:3000/api/v1/workflows/{workflowId}/execute \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "testData": "Hello World"
    }
  }'
```

### 3. Check Results
```bash
# Get execution logs
curl http://localhost:3000/api/v1/workflows/executions
```

## Performance Considerations

- **Async Processing**: Workflows run in background via Bull queue
- **Parallel Steps**: Future enhancement for concurrent execution
- **Rate Limiting**: Respects API rate limits of connectors
- **Timeout**: Default 5 minutes per workflow
- **Retry Logic**: Automatic retries for transient failures

## Current Limitations

1. **Sequential Execution**: Steps run one after another (no parallel execution yet)
2. **Connection Required**: Must create connections before execution
3. **No Scheduling**: Manual execution only (no cron/triggers yet)
4. **Limited Error Recovery**: Basic retry logic implemented

## Future Enhancements

- [ ] Scheduled executions (cron-like)
- [ ] Webhook triggers
- [ ] Parallel step execution
- [ ] Conditional branching
- [ ] Loop/iteration support
- [ ] Advanced error recovery
- [ ] Execution history analytics

---

**Made with Bob 🤖**