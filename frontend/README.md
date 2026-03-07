# IntegrationIQ React Frontend

Modern React + TypeScript frontend for IntegrationIQ with full backend API integration.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Backend server running on `http://localhost:3000`

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3001`

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Auth/           # Login, Register components
│   │   ├── Workflow/       # Workflow-related components
│   │   ├── Connector/      # Connector management
│   │   └── Common/         # Shared components
│   ├── pages/              # Page components
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── Workflows.tsx
│   │   ├── CreateWorkflow.tsx
│   │   ├── WorkflowDetail.tsx
│   │   ├── Connectors.tsx
│   │   └── Monitoring.tsx
│   ├── services/           # API services
│   │   └── api.ts         # Backend API integration
│   ├── contexts/           # React contexts
│   │   └── AuthContext.tsx
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.ts
│   │   └── useWorkflows.ts
│   ├── types/              # TypeScript types
│   │   └── index.ts
│   ├── utils/              # Utility functions
│   │   └── helpers.ts
│   ├── App.tsx             # Main app component
│   └── main.tsx            # Entry point
├── public/                 # Static assets
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 🔌 API Integration

The frontend integrates with the backend through the `apiService` in `src/services/api.ts`.

### Key Features:
- ✅ Automatic token management
- ✅ Token refresh on expiry
- ✅ Request/response interceptors
- ✅ Error handling
- ✅ TypeScript support

### Example Usage:

```typescript
import { apiService } from './services/api';

// Login
const response = await apiService.login({
  email: 'user@example.com',
  password: 'password123'
});

// Generate workflow with AI
const workflow = await apiService.generateWorkflow(
  'When a GitHub issue is created, send a Slack notification'
);

// Get all workflows
const workflows = await apiService.getWorkflows();

// Execute workflow
await apiService.executeWorkflow(workflowId, {
  issue: { title: 'Bug found' }
});
```

## 🎨 UI Components

Built with **IBM Carbon Design System** for professional, accessible UI.

### Key Components:

1. **Authentication**
   - Login form
   - Registration form
   - Protected routes

2. **Workflow Management**
   - Workflow list with search/filter
   - AI-powered workflow generator
   - Workflow editor
   - Execution history
   - Real-time monitoring

3. **Connector Management**
   - Available connectors list
   - Connection setup wizard
   - Credential management
   - Connection testing

4. **Dashboard**
   - Workflow statistics
   - Execution metrics
   - Recent activity
   - System health

## 🔐 Authentication Flow

```typescript
// 1. User logs in
const { accessToken, refreshToken } = await apiService.login(credentials);
// Tokens stored in localStorage

// 2. Authenticated requests
// Token automatically added to headers via interceptor

// 3. Token expires
// Interceptor automatically refreshes token

// 4. Refresh fails
// User redirected to login page
```

## 📊 State Management

Using React Context API for global state:

```typescript
// AuthContext - User authentication state
// WorkflowContext - Workflow data and operations
// ConnectorContext - Connector and connection management
```

## 🛠️ Development

### Available Scripts

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Environment Variables

Create `.env` file:

```env
VITE_API_URL=http://localhost:3000/api/v1
```

## 🔄 API Endpoints Used

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user
- `POST /auth/refresh` - Refresh access token
- `GET /auth/profile` - Get user profile

### Workflows
- `GET /workflows` - List all workflows
- `GET /workflows/:id` - Get workflow details
- `POST /workflows/generate` - Generate workflow with AI
- `POST /workflows` - Create workflow
- `PUT /workflows/:id` - Update workflow
- `DELETE /workflows/:id` - Delete workflow
- `POST /workflows/:id/execute` - Execute workflow
- `GET /workflows/:id/executions` - Get execution history
- `GET /workflows/:id/stats` - Get workflow statistics

### Connectors
- `GET /connectors` - List available connectors
- `GET /connectors/:name` - Get connector details
- `POST /connectors/test` - Test connection
- `GET /connectors/connections/all` - List user connections
- `POST /connectors/connections` - Create connection
- `PUT /connectors/connections/:id` - Update connection
- `DELETE /connectors/connections/:id` - Delete connection

### Execution Logs
- `GET /workflows/executions` - List execution logs
- `GET /workflows/executions/:id` - Get execution details

## 🎯 Key Features

### 1. AI Workflow Generation
```typescript
const WorkflowGenerator = () => {
  const [prompt, setPrompt] = useState('');
  
  const handleGenerate = async () => {
    const result = await apiService.generateWorkflow(prompt);
    // AI converts natural language to workflow
  };
};
```

### 2. Real-time Monitoring
```typescript
const MonitoringDashboard = () => {
  useEffect(() => {
    const interval = setInterval(async () => {
      const logs = await apiService.getExecutionLogs();
      setExecutions(logs.data);
    }, 5000); // Poll every 5 seconds
    
    return () => clearInterval(interval);
  }, []);
};
```

### 3. Connection Management
```typescript
const ConnectorSetup = () => {
  const handleTest = async (credentials) => {
    const result = await apiService.testConnection(
      'github',
      { token: credentials.pat }
    );
    // Shows success/error message
  };
};
```

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

Output in `dist/` directory.

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Variables (Production)

Set in Vercel dashboard:
- `VITE_API_URL` - Your backend API URL

## 🔧 Troubleshooting

### CORS Issues
Backend must allow frontend origin:
```javascript
// backend/src/server.js
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true
}));
```

### API Connection Failed
1. Check backend is running: `http://localhost:3000/health`
2. Verify API URL in `.env`
3. Check browser console for errors

### Token Expired
- Tokens automatically refresh
- If refresh fails, user is logged out
- Check refresh token validity in backend

## 📚 Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Routing
- **Axios** - HTTP client
- **IBM Carbon Design** - UI components
- **Recharts** - Data visualization

## 🎨 Styling

Using IBM Carbon Design System:
- Consistent design language
- Accessible components
- Professional appearance
- Dark/light theme support

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test
```

## 📖 Documentation

- [Backend API Documentation](../backend/API_DOCUMENTATION.md)
- [How It Works](../backend/HOW_IT_WORKS.md)
- [Groq Setup](../backend/GROQ_SETUP.md)
- [GitHub PAT Setup](../backend/GITHUB_PAT_SETUP.md)

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## 📝 License

MIT

---

**Made with ❤️ by Bob**