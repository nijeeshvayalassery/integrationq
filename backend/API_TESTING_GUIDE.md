# API Testing Guide - IntegrationIQ

This guide provides curl commands to test all external API integrations used in IntegrationIQ.

## Table of Contents
- [GitHub API](#github-api)
- [SendGrid API](#sendgrid-api)
- [Testing Scripts](#testing-scripts)

---

## GitHub API

### Prerequisites
- GitHub Personal Access Token (PAT) with `repo` scope
- Add to `.env`: `GITHUB_PAT=your_token_here`

### 1. Verify API Key & Get User Info

```bash
curl -H "Authorization: token YOUR_GITHUB_PAT" \
     -H "Accept: application/vnd.github.v3+json" \
     -H "User-Agent: IntegrationIQ" \
     https://api.github.com/user
```

**Expected Response:**
```json
{
  "login": "username",
  "name": "Your Name",
  "email": "your@email.com",
  "public_repos": 10
}
```

### 2. List User Repositories

```bash
curl -H "Authorization: token YOUR_GITHUB_PAT" \
     -H "Accept: application/vnd.github.v3+json" \
     -H "User-Agent: IntegrationIQ" \
     "https://api.github.com/user/repos?sort=updated&per_page=5"
```

### 3. Get Repository Issues (All States)

```bash
curl -H "Authorization: token YOUR_GITHUB_PAT" \
     -H "Accept: application/vnd.github.v3+json" \
     -H "User-Agent: IntegrationIQ" \
     "https://api.github.com/repos/OWNER/REPO/issues?state=all&per_page=10"
```

**Example for nijeeshvayalassery/integrationq:**
```bash
curl -H "Authorization: token YOUR_GITHUB_PAT" \
     -H "Accept: application/vnd.github.v3+json" \
     -H "User-Agent: IntegrationIQ" \
     "https://api.github.com/repos/nijeeshvayalassery/integrationq/issues?state=all"
```

### 4. Get Only Open Issues

```bash
curl -H "Authorization: token YOUR_GITHUB_PAT" \
     -H "Accept: application/vnd.github.v3+json" \
     -H "User-Agent: IntegrationIQ" \
     "https://api.github.com/repos/OWNER/REPO/issues?state=open"
```

### 5. Get Specific Issue

```bash
curl -H "Authorization: token YOUR_GITHUB_PAT" \
     -H "Accept: application/vnd.github.v3+json" \
     -H "User-Agent: IntegrationIQ" \
     https://api.github.com/repos/OWNER/REPO/issues/1
```

### 6. Create New Issue

```bash
curl -X POST "https://api.github.com/repos/OWNER/REPO/issues" \
     -H "Authorization: token YOUR_GITHUB_PAT" \
     -H "Accept: application/vnd.github.v3+json" \
     -H "User-Agent: IntegrationIQ" \
     -d '{
       "title": "Test Issue from API",
       "body": "This is a test issue created via GitHub API",
       "labels": ["bug", "test"]
     }'
```

### 7. Check Rate Limit

```bash
curl -H "Authorization: token YOUR_GITHUB_PAT" \
     -H "Accept: application/vnd.github.v3+json" \
     -H "User-Agent: IntegrationIQ" \
     https://api.github.com/rate_limit
```

### GitHub API Response Examples

**Issue Object:**
```json
{
  "id": 123456789,
  "number": 1,
  "title": "Bug in login feature",
  "state": "open",
  "html_url": "https://github.com/owner/repo/issues/1",
  "created_at": "2026-03-01T10:00:00Z",
  "updated_at": "2026-03-05T15:30:00Z",
  "user": {
    "login": "username",
    "avatar_url": "https://avatars.githubusercontent.com/u/123456"
  },
  "labels": [
    {
      "name": "bug",
      "color": "d73a4a"
    }
  ],
  "body": "Description of the issue..."
}
```

---

## SendGrid API

### Prerequisites
- SendGrid API Key with "Mail Send" permission
- Verified sender email in SendGrid
- Add to `.env`: `SENDGRID_API_KEY=your_api_key_here`

### 1. Verify API Key

```bash
curl -X GET "https://api.sendgrid.com/v3/scopes" \
     -H "Authorization: Bearer YOUR_SENDGRID_API_KEY" \
     -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "scopes": [
    "mail.send",
    "sender_verification_eligible",
    ...
  ]
}
```

### 2. Get Account Profile

```bash
curl -X GET "https://api.sendgrid.com/v3/user/profile" \
     -H "Authorization: Bearer YOUR_SENDGRID_API_KEY" \
     -H "Content-Type: application/json"
```

### 3. Send Simple Email

```bash
curl -X POST "https://api.sendgrid.com/v3/mail/send" \
     -H "Authorization: Bearer YOUR_SENDGRID_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "personalizations": [
         {
           "to": [{"email": "recipient@example.com"}]
         }
       ],
       "from": {"email": "sender@yourdomain.com"},
       "subject": "Test Email",
       "content": [
         {
           "type": "text/plain",
           "value": "Hello World!"
         }
       ]
     }'
```

**Expected Response:**
- Status: `202 Accepted`
- Headers include: `x-message-id`

### 4. Send HTML Email

```bash
curl -X POST "https://api.sendgrid.com/v3/mail/send" \
     -H "Authorization: Bearer YOUR_SENDGRID_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "personalizations": [
         {
           "to": [{"email": "recipient@example.com", "name": "Recipient Name"}],
           "subject": "Test Email from IntegrationIQ"
         }
       ],
       "from": {
         "email": "noreply@yourdomain.com",
         "name": "IntegrationIQ"
       },
       "content": [
         {
           "type": "text/html",
           "value": "<h1>Test Email</h1><p>This is a <strong>test</strong> email!</p>"
         }
       ]
     }'
```

### 5. Send Email with GitHub Issue Data

```bash
curl -X POST "https://api.sendgrid.com/v3/mail/send" \
     -H "Authorization: Bearer YOUR_SENDGRID_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "personalizations": [
         {
           "to": [{"email": "developer@example.com"}],
           "subject": "New GitHub Issue: Bug in Login"
         }
       ],
       "from": {
         "email": "github-bot@yourdomain.com",
         "name": "GitHub Notifications"
       },
       "content": [
         {
           "type": "text/html",
           "value": "<h2>New Issue Created</h2><p><strong>Title:</strong> Bug in Login</p><p><strong>Number:</strong> #42</p><p><strong>State:</strong> open</p><p><strong>Author:</strong> username</p><p><strong>URL:</strong> <a href=\"https://github.com/user/repo/issues/42\">View Issue</a></p><hr><p>Issue description goes here...</p>"
         }
       ]
     }'
```

### 6. Send Email with Multiple Recipients

```bash
curl -X POST "https://api.sendgrid.com/v3/mail/send" \
     -H "Authorization: Bearer YOUR_SENDGRID_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "personalizations": [
         {
           "to": [
             {"email": "recipient1@example.com"},
             {"email": "recipient2@example.com"}
           ],
           "cc": [{"email": "cc@example.com"}],
           "subject": "Team Notification"
         }
       ],
       "from": {"email": "noreply@yourdomain.com"},
       "content": [
         {
           "type": "text/plain",
           "value": "This is a team notification."
         }
       ]
     }'
```

---

## Testing Scripts

### Run GitHub API Tests

```bash
cd integrationiq/backend
node test-github-api.js
```

### Run GitHub Issues Test (Specific Repo)

```bash
cd integrationiq/backend
node test-specific-repo.js
```

### Run SendGrid API Tests

```bash
cd integrationiq/backend
node test-sendgrid.js
```

---

## Common Issues & Solutions

### GitHub API

**Issue: "Request forbidden by administrative rules"**
- **Solution:** Add `User-Agent` header to all requests
- **Example:** `-H "User-Agent: IntegrationIQ"`

**Issue: "Bad credentials" (401)**
- **Solution:** Check your GitHub PAT is valid and has correct scopes
- **Generate new token:** https://github.com/settings/tokens

**Issue: "Not Found" (404)**
- **Solution:** Verify repository exists and token has access
- **For private repos:** Ensure token has `repo` scope

**Issue: Rate limit exceeded (403)**
- **Solution:** Wait for rate limit reset or use authenticated requests
- **Check limits:** `curl https://api.github.com/rate_limit`

### SendGrid API

**Issue: "Unauthorized" (401)**
- **Solution:** Verify API key is correct and active
- **Check:** https://app.sendgrid.com/settings/api_keys

**Issue: "Forbidden" (403)**
- **Solution:** Ensure API key has "Mail Send" permission
- **Fix:** Regenerate key with correct permissions

**Issue: "Bad Request" (400) - Invalid sender**
- **Solution:** Verify sender email in SendGrid
- **Setup:** https://app.sendgrid.com/settings/sender_auth

**Issue: Email not received**
- **Solution:** Check SendGrid Activity Feed
- **Monitor:** https://app.sendgrid.com/email_activity

---

## Environment Variables

Create a `.env` file in `integrationiq/backend/`:

```env
# GitHub
GITHUB_PAT=ghp_your_github_personal_access_token

# SendGrid
SENDGRID_API_KEY=SG.your_sendgrid_api_key

# MongoDB
MONGODB_URI=mongodb://localhost:27017/integrationiq

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your_jwt_secret_key

# AI Provider (Groq)
GROQ_API_KEY=gsk_your_groq_api_key
AI_PROVIDER=groq
AI_MODEL=llama-3.3-70b-versatile
```

---

## Useful Links

### GitHub
- **API Documentation:** https://docs.github.com/en/rest
- **Create PAT:** https://github.com/settings/tokens
- **Rate Limits:** https://docs.github.com/en/rest/overview/resources-in-the-rest-api#rate-limiting

### SendGrid
- **API Documentation:** https://docs.sendgrid.com/api-reference/mail-send/mail-send
- **Dashboard:** https://app.sendgrid.com/
- **API Keys:** https://app.sendgrid.com/settings/api_keys
- **Sender Authentication:** https://app.sendgrid.com/settings/sender_auth
- **Activity Feed:** https://app.sendgrid.com/email_activity

---

## Quick Test Commands

### Test Everything at Once

```bash
# GitHub
curl -H "Authorization: token YOUR_GITHUB_PAT" \
     -H "User-Agent: IntegrationIQ" \
     https://api.github.com/user

# SendGrid
curl -X GET "https://api.sendgrid.com/v3/scopes" \
     -H "Authorization: Bearer YOUR_SENDGRID_API_KEY"
```

### One-Liner Tests

```bash
# GitHub - Check if token works
curl -s -H "Authorization: token $GITHUB_PAT" -H "User-Agent: IntegrationIQ" https://api.github.com/user | jq '.login'

# SendGrid - Check if API key works
curl -s -H "Authorization: Bearer $SENDGRID_API_KEY" https://api.sendgrid.com/v3/scopes | jq '.scopes[0:3]'
```

---

## Notes

1. **Replace placeholders:**
   - `YOUR_GITHUB_PAT` → Your actual GitHub token
   - `YOUR_SENDGRID_API_KEY` → Your actual SendGrid key
   - `OWNER/REPO` → Actual repository path
   - `sender@yourdomain.com` → Verified sender email
   - `recipient@example.com` → Valid recipient email

2. **Security:**
   - Never commit API keys to version control
   - Use environment variables for sensitive data
   - Rotate keys regularly

3. **Testing:**
   - Use test repositories for GitHub API testing
   - Use test email addresses for SendGrid testing
   - Monitor API usage and rate limits

4. **Production:**
   - Implement proper error handling
   - Add retry logic for failed requests
   - Log all API interactions
   - Monitor webhook deliveries