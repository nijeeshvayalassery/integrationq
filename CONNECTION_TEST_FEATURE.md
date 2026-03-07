# Connection Test Feature

## Overview
Added connection testing functionality to the Connectors page that uses credentials from environment variables to test GitHub and SendGrid connections.

## Changes Made

### Backend Changes

#### 1. New API Endpoint (`backend/src/routes/connectors.js`)
- Added `POST /api/v1/connectors/test-env/:name` endpoint
- Tests connector connections using credentials from `.env` file
- Returns connection status and user information

#### 2. Connector Service (`backend/src/services/connectorService.js`)
- Added `testConnectionWithEnv(connectorName)` method
- Supports testing for:
  - **GitHub**: Uses `GITHUB_PAT` from env, returns username and name
  - **SendGrid**: Uses `SENDGRID_API_KEY` from env, returns email
  - **Airtable**: Shows message that credentials need to be configured
  - **Slack**: Shows message that credentials need to be configured

### Frontend Changes

#### 1. API Service (`frontend/src/services/api.ts`)
- Added `testConnectorWithEnv(connectorName: string)` method
- Calls the new backend endpoint

#### 2. Connectors Page (`frontend/src/pages/Connectors/Connectors.tsx`)
- Added connector-specific icons:
  - GitHub: `LogoGithub` from Carbon icons
  - Slack: `LogoSlack` from Carbon icons
  - Airtable: Custom SVG icon
  - SendGrid: Custom SVG grid icon
- Added test connection functionality:
  - "Test Connection" button for each connector
  - Shows loading state while testing
  - Displays success/error notifications with results
  - Shows username/email for successful connections

#### 3. Connectors CSS (`frontend/src/pages/Connectors/Connectors.css`)
- Improved icon display with centered layout
- Fixed icon sizing (48x48px)
- Added minimum height for consistent spacing

## Environment Variables Required

The following credentials should be configured in `backend/.env`:

```env
# GitHub Personal Access Token
GITHUB_PAT=github_pat_xxxxx

# SendGrid API Key
SENDGRID_API_KEY=SG.xxxxx

# Optional: Airtable API Key
AIRTABLE_API_KEY=keyxxxxx

# Optional: Slack credentials
SLACK_CLIENT_ID=xxxxx
SLACK_CLIENT_SECRET=xxxxx
```

## How to Use

1. **Start the backend server**:
   ```bash
   cd integrationiq/backend
   npm start
   ```

2. **Start the frontend**:
   ```bash
   cd integrationiq/frontend
   npm run dev
   ```

3. **Navigate to Connectors page** in the UI

4. **Click "Test Connection"** on any connector tile

5. **View results**:
   - ✅ Success: Shows green notification with user details
   - ❌ Error: Shows red notification with error message

## API Response Examples

### Successful GitHub Test
```json
{
  "success": true,
  "message": "GitHub connection successful",
  "data": {
    "username": "your-username",
    "name": "Your Name"
  }
}
```

### Successful SendGrid Test
```json
{
  "success": true,
  "message": "SendGrid connection successful",
  "data": {
    "email": "your-email@example.com"
  }
}
```

### Failed Connection
```json
{
  "success": false,
  "message": "Bad credentials"
}
```

### Not Configured
```json
{
  "success": false,
  "message": "GitHub PAT not configured in environment"
}
```

## Features

✅ Test connections using environment credentials  
✅ Connector-specific icons (GitHub, Slack, Airtable, SendGrid)  
✅ Real-time connection testing  
✅ Success/error notifications  
✅ User information display on successful connection  
✅ Loading states during testing  
✅ Support for multiple connectors  

## Future Enhancements

- Add OAuth flow for connectors that require it
- Store successful connections in database
- Add connection health monitoring
- Support for custom credential input
- Batch testing for all connectors
- Connection retry mechanism

---

Made with Bob 🤖