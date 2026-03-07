# React Frontend Setup Guide

## 🚀 Complete Setup Instructions

### Step 1: Install Dependencies

```bash
cd /Users/nijeeshvayalassery/Desktop/integrationiq/frontend

# Install all dependencies
npm install
```

This will install:
- React 18 + React DOM
- TypeScript
- Vite (build tool)
- React Router (navigation)
- Axios (API calls)
- IBM Carbon Design System
- Recharts (charts)
- Date-fns (date utilities)

### Step 2: Create Environment File

```bash
# Create .env file
cat > .env << 'EOF'
VITE_API_URL=http://localhost:3000/api/v1
EOF
```

### Step 3: Start Development Server

```bash
npm run dev
```

The app will be available at: **http://localhost:3001**

---

## 📦 What's Included

### Project Structure Created:
```
frontend/
├── src/
│   ├── components/     # UI components (to be created)
│   ├── pages/          # Page components (to be created)
│   ├── services/       # ✅ API service (created)
│   ├── hooks/          # Custom hooks (to be created)
│   ├── contexts/       # React contexts (to be created)
│   ├── types/          # TypeScript types (to be created)
│   └── utils/          # Utilities (to be created)
├── package.json        # ✅ Dependencies defined
├── vite.config.ts      # ✅ Vite configuration
├── tsconfig.json       # ✅ TypeScript config
└── README.md           # ✅ Documentation
```

### API Service (✅ Complete)

Located at `src/services/api.ts`, provides:

**Authentication:**
- `register(data)` - Register new user
- `login(data)` - Login user
- `logout()` - Logout user
- `getProfile()` - Get user profile

**Workflows:**
- `getWorkflows()` - List all workflows
- `getWorkflow(id)` - Get workflow details
- `generateWorkflow(prompt)` - AI workflow generation
- `createWorkflow(data)` - Create workflow
- `updateWorkflow(id, data)` - Update workflow
- `deleteWorkflow(id)` - Delete workflow
- `executeWorkflow(id, triggerData)` - Execute workflow
- `getWorkflowExecutions(id)` - Get execution history
- `getWorkflowStats(id)` - Get statistics

**Connectors:**
- `getConnectors()` - List connectors
- `getConnector(name)` - Get connector details
- `testConnection(name, credentials)` - Test connection
- `getConnections()` - List user connections
- `createConnection(data)` - Create connection
- `updateConnection(id, data)` - Update connection
- `deleteConnection(id)` - Delete connection

**Execution Logs:**
- `getExecutionLogs(filters)` - List execution logs
- `getExecutionLog(id)` - Get execution details

---

## 🎯 Next Steps

### Option 1: Use Existing HTML Frontend (Quick Demo)

The HTML frontend at `integrationiq/index.html` already works and has all the UI.

**To use it:**
```bash
# Just open in browser
open /Users/nijeeshvayalassery/Desktop/integrationiq/index.html
```

### Option 2: Build React Components (Full Development)

Create React components to replace the HTML UI:

1. **Create Main App Component**
2. **Build Authentication Pages**
3. **Create Workflow Management**
4. **Add Connector Setup**
5. **Implement Monitoring Dashboard**

---

## 🔨 Building React Components

### 1. Create Main App (App.tsx)

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Workflows from './pages/Workflows';
import CreateWorkflow from './pages/CreateWorkflow';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/workflows" element={<Workflows />} />
          <Route path="/workflows/create" element={<CreateWorkflow />} />
          {/* Add more routes */}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
```

### 2. Create Login Page (pages/Login.tsx)

```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { Button, TextInput, Form } from '@carbon/react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.login({ email, password });
      navigate('/workflows');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <Form onSubmit={handleLogin}>
      <TextInput
        id="email"
        labelText="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextInput
        id="password"
        type="password"
        labelText="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button type="submit">Login</Button>
    </Form>
  );
}
```

### 3. Create Workflows Page (pages/Workflows.tsx)

```typescript
import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { DataTable } from '@carbon/react';

export default function Workflows() {
  const [workflows, setWorkflows] = useState([]);

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    const response = await apiService.getWorkflows();
    setWorkflows(response.data);
  };

  return (
    <div>
      <h1>My Workflows</h1>
      <DataTable rows={workflows} headers={[
        { key: 'name', header: 'Name' },
        { key: 'status', header: 'Status' },
        { key: 'createdAt', header: 'Created' }
      ]} />
    </div>
  );
}
```

### 4. Create Workflow Generator (pages/CreateWorkflow.tsx)

```typescript
import { useState } from 'react';
import { apiService } from '../services/api';
import { TextArea, Button } from '@carbon/react';

export default function CreateWorkflow() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [workflow, setWorkflow] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await apiService.generateWorkflow(prompt);
      setWorkflow(response.data.workflow);
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Create Workflow with AI</h1>
      <TextArea
        labelText="Describe your workflow"
        placeholder="When a GitHub issue is created, send a Slack notification"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <Button onClick={handleGenerate} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Workflow'}
      </Button>
      {workflow && (
        <pre>{JSON.stringify(workflow, null, 2)}</pre>
      )}
    </div>
  );
}
```

---

## 🎨 Styling with IBM Carbon

### Import Carbon Styles

Add to `src/main.tsx`:

```typescript
import '@carbon/react/scss/styles.scss';
```

### Use Carbon Components

```typescript
import {
  Button,
  TextInput,
  DataTable,
  Modal,
  Loading,
  Notification,
  Tabs,
  Tab,
  TabList,
  TabPanels,
  TabPanel
} from '@carbon/react';
```

---

## 🔐 Authentication Context

Create `src/contexts/AuthContext.tsx`:

```typescript
import { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';

interface AuthContextType {
  user: any;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const response = await apiService.getProfile();
      setUser(response.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    await apiService.login({ email, password });
    await loadUser();
  };

  const logout = async () => {
    await apiService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

---

## 🚀 Quick Start Commands

```bash
# 1. Install dependencies
cd frontend
npm install

# 2. Start dev server
npm run dev

# 3. Open browser
open http://localhost:3001
```

---

## 📝 Development Workflow

1. **Backend must be running** on `http://localhost:3000`
2. **Frontend runs** on `http://localhost:3001`
3. **API calls** automatically proxied to backend
4. **Hot reload** enabled for instant updates

---

## 🐛 Troubleshooting

### Dependencies Won't Install
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Port 3001 Already in Use
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or change port in vite.config.ts
```

### CORS Errors
Make sure backend allows frontend origin:
```javascript
// backend/src/server.js
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true
}));
```

---

## 📚 Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [IBM Carbon Design](https://carbondesignsystem.com/)
- [React Router](https://reactrouter.com/)

---

## ✅ Checklist

- [ ] Install Node.js 18+
- [ ] Navigate to frontend directory
- [ ] Run `npm install`
- [ ] Create `.env` file
- [ ] Start backend server
- [ ] Run `npm run dev`
- [ ] Open http://localhost:3001
- [ ] Test API integration

---

**Made with ❤️ by Bob**