# 🔑 GitHub Personal Access Token (PAT) Setup

## Good News! 🎉

You **don't need** OAuth Client ID/Secret for GitHub integration. You can use your existing **Personal Access Token (PAT)** directly!

---

## What You Have vs What You Need

### ❌ You DON'T Need:
- GitHub OAuth App
- Client ID
- Client Secret
- Complex OAuth flow

### ✅ You DO Need:
- GitHub Personal Access Token (PAT) - **You already have this!**

---

## How to Use Your GitHub PAT

### Option 1: Add to .env (For Testing)

1. **Open `.env` file:**
   ```bash
   cd integrationiq/backend
   nano .env
   ```

2. **Add your PAT:**
   ```env
   GITHUB_PAT=ghp_your_actual_github_pat_token_here
   ```

3. **Save and close** (Ctrl+X, Y, Enter)

### Option 2: Create Connection via API (Recommended)

When you create a GitHub connection through the API, pass your PAT as the `token` credential:

```bash
# 1. Login to get your access token
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your@email.com",
    "password": "your-password"
  }'

# 2. Create GitHub connection with your PAT
curl -X POST http://localhost:3000/api/v1/connectors/connections \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "connectorId": "github-connector-id",
    "name": "My GitHub Connection",
    "credentials": {
      "token": "ghp_your_actual_github_pat_token_here"
    }
  }'
```

---

## Verify Your GitHub PAT

### Check if your PAT works:

```bash
# Test with curl
curl -H "Authorization: token ghp_your_pat_here" \
  https://api.github.com/user

# Should return your GitHub user info
```

### Check PAT permissions:

Your PAT should have these scopes:
- ✅ `repo` - Full control of repositories
- ✅ `read:org` - Read organization data
- ✅ `write:discussion` - Write discussions

---

## If You Need a New PAT

### Create a new GitHub PAT:

1. **Go to GitHub Settings:**
   ```
   https://github.com/settings/tokens
   ```

2. **Click "Generate new token" → "Generate new token (classic)"**

3. **Configure the token:**
   - **Note:** IntegrationIQ Development
   - **Expiration:** 90 days (or No expiration for testing)
   - **Select scopes:**
     - ✅ `repo` (all)
     - ✅ `workflow`
     - ✅ `write:discussion`
     - ✅ `read:org`

4. **Click "Generate token"**

5. **Copy the token** (starts with `ghp_`)
   - ⚠️ Save it now! You won't see it again

---

## Using GitHub in Workflows

### Example 1: Create Issue Workflow

```bash
curl -X POST http://localhost:3000/api/v1/workflows/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "prompt": "When a new issue is created in GitHub repo owner/repo, send a notification to Slack"
  }'
```

### Example 2: Test GitHub Connection

```bash
# Test creating an issue
curl -X POST http://localhost:3000/api/v1/connectors/github/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "connectionId": "your-connection-id",
    "action": "create_issue",
    "config": {
      "owner": "your-username",
      "repo": "your-repo",
      "title": "Test Issue from IntegrationIQ",
      "body": "This is a test issue created via API"
    }
  }'
```

---

## How the GitHub Connector Works

### Behind the Scenes:

1. **You provide PAT** → Stored encrypted in database
2. **Workflow triggers** → Connector retrieves PAT
3. **API call made** → Using your PAT for authentication
4. **Action executed** → Issue created, PR updated, etc.

### Supported GitHub Actions:

- ✅ `create_issue` - Create new issues
- ✅ `get_issues` - List issues
- ✅ `update_issue` - Update existing issues
- ✅ `create_pr` - Create pull requests
- ✅ `merge_pr` - Merge pull requests
- ✅ `add_comment` - Add comments

---

## Security Best Practices

### ✅ DO:
- Use PAT with minimal required scopes
- Set expiration dates on tokens
- Rotate tokens regularly
- Store tokens in `.env` (never commit!)
- Use different tokens for different apps

### ❌ DON'T:
- Share your PAT publicly
- Commit PAT to git
- Use PAT with full admin access
- Use same PAT for multiple apps

---

## Troubleshooting

### Error: "Bad credentials"
- Check if PAT is correct
- Verify PAT hasn't expired
- Ensure PAT has required scopes

### Error: "Not Found"
- Check repository owner/name
- Verify PAT has access to the repo
- Ensure repo exists and is accessible

### Error: "Resource not accessible"
- PAT needs additional scopes
- Check if repo is private (needs `repo` scope)
- Verify organization permissions

---

## Quick Start Checklist

- [ ] Have GitHub PAT ready (starts with `ghp_`)
- [ ] Add PAT to `.env` file or create connection via API
- [ ] Verify PAT works with curl test
- [ ] Create GitHub connection in IntegrationIQ
- [ ] Test with a simple workflow
- [ ] Build your integration!

---

## Example: Complete GitHub Integration

```bash
# 1. Register user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dev@example.com",
    "password": "Test123!@#",
    "name": "Developer"
  }'

# 2. Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dev@example.com",
    "password": "Test123!@#"
  }'
# Save the accessToken from response

# 3. Get GitHub connector ID
curl -X GET http://localhost:3000/api/v1/connectors \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
# Find the GitHub connector and copy its _id

# 4. Create GitHub connection
curl -X POST http://localhost:3000/api/v1/connectors/connections \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "connectorId": "GITHUB_CONNECTOR_ID",
    "name": "My GitHub",
    "credentials": {
      "token": "ghp_your_actual_pat_here"
    }
  }'

# 5. Generate workflow
curl -X POST http://localhost:3000/api/v1/workflows/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "prompt": "When a new issue is created in GitHub, send notification to Slack"
  }'

# 6. Execute workflow
curl -X POST http://localhost:3000/api/v1/workflows/WORKFLOW_ID/execute \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "triggerData": {
      "issue": {
        "title": "New bug found",
        "number": 123
      }
    }
  }'
```

---

## Summary

✅ **You're all set!** Just use your existing GitHub PAT - no OAuth setup needed!

**Next Steps:**
1. Add your PAT to `.env` or create connection via API
2. Test the connection
3. Start building workflows!

---

**Made with ❤️ by Bob**