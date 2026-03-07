# 🔄 How IntegrationIQ Works - Complete Guide

## The Big Picture

When you say: **"When a GitHub issue is created, send a Slack notification"**

Here's what happens behind the scenes:

```
User Prompt → AI Generates Workflow → System Monitors GitHub → Issue Created → Slack Notification Sent
```

---

## 🎯 Step-by-Step Flow

### Step 1: User Creates Workflow with Natural Language

**User Input:**
```
"When a GitHub issue is created, send a Slack notification"
```

**What Happens:**
1. User sends prompt to `/api/v1/workflows/generate`
2. AI (Groq/OpenAI) analyzes the prompt
3. AI identifies:
   - **Trigger:** GitHub issue created
   - **Action:** Send Slack message
4. AI generates workflow JSON:

```json
{
  "name": "GitHub Issue to Slack",
  "trigger": {
    "type": "webhook",
    "connector": "github",
    "event": "issues.opened"
  },
  "steps": [
    {
      "type": "action",
      "connector": "slack",
      "action": "send_message",
      "config": {
        "channel": "#dev-alerts",
        "message": "New issue: {{issue.title}}"
      }
    }
  ]
}
```

---

### Step 2: System Sets Up GitHub Webhook

**How the System Knows About New Issues:**

#### Option A: GitHub Webhooks (Real-time) ⭐ Recommended

```
GitHub → Webhook → IntegrationIQ → Workflow Executes → Slack Notification
```

**Setup Process:**
1. User creates workflow
2. System automatically creates GitHub webhook:
   ```
   POST https://api.github.com/repos/owner/repo/hooks
   {
     "config": {
       "url": "https://your-app.com/webhooks/github",
       "content_type": "json"
     },
     "events": ["issues"]
   }
   ```
3. GitHub sends events to your webhook URL
4. IntegrationIQ receives event instantly
5. Workflow executes automatically

**Webhook Flow:**
```
┌─────────┐         ┌──────────────┐         ┌───────────┐
│ GitHub  │ Event   │ IntegrationIQ│ Process │  Slack    │
│         ├────────>│   Webhook    ├────────>│           │
│ Issue   │         │   Endpoint   │         │ Message   │
│ Created │         │              │         │ Sent      │
└─────────┘         └──────────────┘         └───────────┘
```

#### Option B: Polling (Backup method)

```
IntegrationIQ checks GitHub every X minutes → Finds new issues → Executes workflow
```

**Polling Process:**
1. System checks GitHub API every 5 minutes:
   ```
   GET https://api.github.com/repos/owner/repo/issues?since=2024-01-01
   ```
2. Compares with last check
3. If new issues found → Execute workflow
4. Store last check timestamp

---

## 🏗️ System Architecture

### Current Implementation (For Hackathon)

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface                        │
│  (Frontend - HTML/CSS/JS with IBM Carbon Design)        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  Backend API (Node.js)                   │
│  ┌──────────────────────────────────────────────────┐  │
│  │  AI Orchestration Service (Groq/OpenAI)          │  │
│  │  - Converts prompts to workflows                 │  │
│  │  - Analyzes errors                               │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Workflow Execution Service (Bull Queue)         │  │
│  │  - Executes workflows                            │  │
│  │  - Handles retries                               │  │
│  │  - Self-healing                                  │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Connector Service                               │  │
│  │  - GitHub, Slack, Airtable, SendGrid            │  │
│  │  - Manages API calls                             │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              External Services                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │  GitHub  │  │  Slack   │  │ Airtable │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────┘
```

---

## 🔔 How Triggers Work

### 1. Webhook-Based Triggers (Real-time)

**GitHub Webhook Setup:**

```javascript
// When workflow is created, system registers webhook
async function setupGitHubWebhook(workflow) {
  const webhookUrl = `${process.env.APP_URL}/webhooks/github/${workflow._id}`;
  
  await axios.post(
    `https://api.github.com/repos/${owner}/${repo}/hooks`,
    {
      config: {
        url: webhookUrl,
        content_type: 'json',
        secret: process.env.WEBHOOK_SECRET
      },
      events: ['issues', 'pull_request', 'push']
    },
    {
      headers: {
        Authorization: `token ${githubPAT}`
      }
    }
  );
}
```

**Webhook Endpoint:**

```javascript
// Receives events from GitHub
router.post('/webhooks/github/:workflowId', async (req, res) => {
  const { workflowId } = req.params;
  const event = req.body;
  
  // Verify webhook signature
  if (!verifyWebhookSignature(req)) {
    return res.status(401).send('Invalid signature');
  }
  
  // Find workflow
  const workflow = await Workflow.findById(workflowId);
  
  // Execute workflow with event data
  await workflowExecutionService.execute(workflow, event);
  
  res.status(200).send('OK');
});
```

### 2. Polling-Based Triggers (Fallback)

**Polling Service:**

```javascript
// Runs every 5 minutes
setInterval(async () => {
  const workflows = await Workflow.find({ 
    'trigger.type': 'polling',
    status: 'active'
  });
  
  for (const workflow of workflows) {
    // Check for new data
    const newData = await checkForNewData(workflow);
    
    if (newData.length > 0) {
      // Execute workflow for each new item
      for (const item of newData) {
        await workflowExecutionService.execute(workflow, item);
      }
    }
  }
}, 5 * 60 * 1000); // 5 minutes
```

---

## 📊 Complete Example: GitHub Issue → Slack

### Step 1: User Creates Workflow

```bash
curl -X POST http://localhost:3000/api/v1/workflows/generate \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "prompt": "When a GitHub issue is created, send a Slack notification"
  }'
```

**AI Generates:**
```json
{
  "name": "GitHub Issue to Slack",
  "trigger": {
    "connector": "github",
    "event": "issues.opened",
    "config": {
      "owner": "username",
      "repo": "my-repo"
    }
  },
  "steps": [
    {
      "id": "step-1",
      "connector": "slack",
      "action": "send_message",
      "config": {
        "channel": "#dev-alerts",
        "message": "🐛 New issue: {{issue.title}}\n{{issue.html_url}}"
      }
    }
  ]
}
```

### Step 2: System Registers Webhook

```javascript
// Automatically done when workflow is saved
const webhook = await github.createWebhook({
  owner: 'username',
  repo: 'my-repo',
  url: 'https://integrationiq.com/webhooks/github/workflow-123',
  events: ['issues']
});
```

### Step 3: GitHub Sends Event

**When someone creates an issue on GitHub:**

```json
POST https://integrationiq.com/webhooks/github/workflow-123
{
  "action": "opened",
  "issue": {
    "id": 123,
    "title": "Bug in login page",
    "body": "Users can't login",
    "html_url": "https://github.com/user/repo/issues/123",
    "user": {
      "login": "developer"
    }
  }
}
```

### Step 4: IntegrationIQ Processes Event

```javascript
// Webhook handler receives event
async function handleGitHubWebhook(workflowId, event) {
  // 1. Load workflow
  const workflow = await Workflow.findById(workflowId);
  
  // 2. Check if event matches trigger
  if (event.action === 'opened') {
    // 3. Execute workflow steps
    for (const step of workflow.steps) {
      if (step.connector === 'slack') {
        // 4. Replace variables with actual data
        const message = step.config.message
          .replace('{{issue.title}}', event.issue.title)
          .replace('{{issue.html_url}}', event.issue.html_url);
        
        // 5. Send to Slack
        await slackService.sendMessage({
          channel: step.config.channel,
          text: message
        });
      }
    }
    
    // 6. Log execution
    await ExecutionLog.create({
      workflowId,
      status: 'success',
      triggerData: event,
      executedAt: new Date()
    });
  }
}
```

### Step 5: Slack Receives Notification

**Slack message appears:**
```
🐛 New issue: Bug in login page
https://github.com/user/repo/issues/123
```

---

## 🔧 For Hackathon Demo

### Quick Setup (Without Real Webhooks)

**Option 1: Manual Trigger**
```bash
# Manually trigger workflow with test data
curl -X POST http://localhost:3000/api/v1/workflows/WORKFLOW_ID/execute \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "triggerData": {
      "issue": {
        "title": "Test Issue",
        "html_url": "https://github.com/test/repo/issues/1"
      }
    }
  }'
```

**Option 2: Polling Demo**
```javascript
// Check GitHub every minute for demo
setInterval(async () => {
  const issues = await github.getIssues({
    owner: 'username',
    repo: 'repo',
    since: lastCheck
  });
  
  for (const issue of issues) {
    await executeWorkflow(workflow, { issue });
  }
}, 60000); // 1 minute
```

**Option 3: Webhook Simulation**
```bash
# Simulate GitHub webhook
curl -X POST http://localhost:3000/webhooks/github/WORKFLOW_ID \
  -H "Content-Type: application/json" \
  -d '{
    "action": "opened",
    "issue": {
      "title": "Demo Issue",
      "html_url": "https://github.com/demo/repo/issues/1"
    }
  }'
```

---

## 🎬 Demo Flow for Hackathon

### 1. Setup Phase (Before Demo)
```bash
# 1. Start backend
npm run dev

# 2. Create user and login
# 3. Connect GitHub and Slack
# 4. Generate workflow with AI
```

### 2. Demo Phase (Live)
```bash
# Option A: Create real GitHub issue
# - Open GitHub repo
# - Create new issue
# - Show Slack notification appears

# Option B: Simulate webhook
curl -X POST http://localhost:3000/webhooks/github/WORKFLOW_ID \
  -d '{"action":"opened","issue":{"title":"Live Demo Issue"}}'

# Option C: Manual execution
curl -X POST http://localhost:3000/api/v1/workflows/WORKFLOW_ID/execute \
  -d '{"triggerData":{"issue":{"title":"Demo"}}}'
```

### 3. Show Results
- Execution logs in dashboard
- Slack message received
- Workflow statistics updated

---

## 🚀 Production Implementation

For a production system, you would:

1. **Deploy backend** to cloud (Heroku, AWS, etc.)
2. **Get public URL** for webhooks
3. **Register webhooks** with GitHub/Slack
4. **Set up monitoring** for webhook delivery
5. **Implement retry logic** for failed webhooks
6. **Add webhook signature verification**
7. **Scale with queue workers** (Bull + Redis)

---

## 📝 Summary

**How System Knows About GitHub Issues:**

1. ✅ **Webhooks (Real-time)** - GitHub sends events to your server
2. ✅ **Polling (Backup)** - System checks GitHub API periodically
3. ✅ **Manual Trigger (Demo)** - User manually executes workflow

**For Hackathon:**
- Use manual triggers or simulated webhooks
- Focus on AI workflow generation
- Show the concept working end-to-end

**For Production:**
- Implement real webhooks
- Deploy to public server
- Add monitoring and error handling

---

**Made with ❤️ by Bob**