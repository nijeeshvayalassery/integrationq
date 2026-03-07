# API Configuration Guide

## 📍 Where API URL is Configured

### 1. **Primary Configuration: `.env` File** ✅

**Location:** `frontend/.env`

```env
VITE_API_URL=http://localhost:3000/api/v1
```

**This is the main place to configure your backend API URL.**

### 2. **How It's Used: `src/services/api.ts`**

**Location:** `frontend/src/services/api.ts` (Line 3)

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
```

**Explanation:**
- `import.meta.env.VITE_API_URL` - Reads from `.env` file
- `|| 'http://localhost:3000/api/v1'` - Fallback if `.env` not found

---

## 🔧 Configuration for Different Environments

### Development (Local)

**File:** `frontend/.env`
```env
VITE_API_URL=http://localhost:3000/api/v1
```

**Backend runs on:** `http://localhost:3000`
**Frontend runs on:** `http://localhost:3001`

### Production (Deployed)

**File:** `frontend/.env.production`
```env
VITE_API_URL=https://your-backend.herokuapp.com/api/v1
```

Or set in Vercel/Netlify dashboard:
- Variable: `VITE_API_URL`
- Value: `https://your-backend-url.com/api/v1`

---

## 🚀 How to Change API URL

### Method 1: Edit `.env` File (Recommended)

```bash
cd frontend

# Edit .env file
nano .env

# Change the URL
VITE_API_URL=http://localhost:3000/api/v1

# Save and restart dev server
npm run dev
```

### Method 2: Set Environment Variable

```bash
# Linux/Mac
export VITE_API_URL=http://localhost:3000/api/v1
npm run dev

# Windows
set VITE_API_URL=http://localhost:3000/api/v1
npm run dev
```

### Method 3: Inline (One-time)

```bash
VITE_API_URL=http://localhost:3000/api/v1 npm run dev
```

---

## 📝 Complete Configuration Flow

```
1. Create .env file
   └─> VITE_API_URL=http://localhost:3000/api/v1

2. Vite reads .env
   └─> Makes available as import.meta.env.VITE_API_URL

3. api.ts uses it
   └─> const API_BASE_URL = import.meta.env.VITE_API_URL

4. All API calls use this URL
   └─> axios.create({ baseURL: API_BASE_URL })
```

---

## 🔍 Verify Configuration

### Check Current API URL

Add this to any component:

```typescript
console.log('API URL:', import.meta.env.VITE_API_URL);
```

### Test API Connection

```typescript
import { apiService } from './services/api';

// Test health endpoint
fetch('http://localhost:3000/health')
  .then(res => res.json())
  .then(data => console.log('Backend health:', data));

// Test with API service
apiService.getConnectors()
  .then(data => console.log('Connectors:', data))
  .catch(err => console.error('API Error:', err));
```

---

## 🌐 Different Backend URLs

### Local Development
```env
VITE_API_URL=http://localhost:3000/api/v1
```

### Docker
```env
VITE_API_URL=http://host.docker.internal:3000/api/v1
```

### Network (Same WiFi)
```env
VITE_API_URL=http://192.168.1.100:3000/api/v1
```

### Production
```env
VITE_API_URL=https://api.integrationiq.com/api/v1
```

---

## 🔐 CORS Configuration

**Important:** Backend must allow frontend origin!

### Backend CORS Setup

**File:** `backend/src/server.js`

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:3001',      // Local frontend
    'https://your-app.vercel.app' // Production frontend
  ],
  credentials: true
}));
```

### Or allow all (development only):

```javascript
app.use(cors({
  origin: '*',
  credentials: true
}));
```

---

## 🔄 Proxy Configuration (Alternative)

Instead of CORS, you can use Vite's proxy:

**File:** `frontend/vite.config.ts`

```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
```

Then use relative URLs:

```typescript
// Instead of: http://localhost:3000/api/v1/workflows
// Use: /api/v1/workflows
const API_BASE_URL = '/api/v1';
```

---

## 🐛 Troubleshooting

### Error: "Network Error" or "Failed to fetch"

**Check:**
1. Backend is running: `curl http://localhost:3000/health`
2. API URL is correct in `.env`
3. CORS is configured in backend
4. Firewall isn't blocking

**Solution:**
```bash
# 1. Check backend
cd backend
npm run dev

# 2. Check frontend .env
cat frontend/.env

# 3. Restart frontend
cd frontend
npm run dev
```

### Error: "Cannot read property 'VITE_API_URL'"

**Cause:** `.env` file not found or not loaded

**Solution:**
```bash
# Create .env file
cd frontend
echo "VITE_API_URL=http://localhost:3000/api/v1" > .env

# Restart dev server
npm run dev
```

### Error: "404 Not Found"

**Cause:** Wrong API URL or endpoint

**Check:**
```bash
# Test backend directly
curl http://localhost:3000/api/v1/connectors

# Check .env
cat .env

# Verify in browser console
console.log(import.meta.env.VITE_API_URL)
```

---

## 📊 Environment Variables Reference

### Vite Environment Variables

**Prefix:** All env vars must start with `VITE_`

```env
# ✅ Correct - Will be exposed to frontend
VITE_API_URL=http://localhost:3000/api/v1
VITE_APP_NAME=IntegrationIQ

# ❌ Wrong - Won't be exposed (no VITE_ prefix)
API_URL=http://localhost:3000/api/v1
```

### Access in Code

```typescript
// ✅ Correct
import.meta.env.VITE_API_URL

// ❌ Wrong
process.env.VITE_API_URL  // This is Node.js, not Vite
```

---

## 🎯 Quick Reference

| Environment | API URL | Frontend URL |
|-------------|---------|--------------|
| Local Dev | `http://localhost:3000/api/v1` | `http://localhost:3001` |
| Docker | `http://host.docker.internal:3000/api/v1` | `http://localhost:3001` |
| Network | `http://192.168.1.x:3000/api/v1` | `http://192.168.1.x:3001` |
| Production | `https://api.yourdomain.com/api/v1` | `https://app.yourdomain.com` |

---

## ✅ Checklist

- [x] `.env` file created in `frontend/` directory
- [x] `VITE_API_URL` set to backend URL
- [ ] Backend is running on specified URL
- [ ] CORS configured in backend
- [ ] Frontend dev server restarted after `.env` changes
- [ ] API connection tested

---

## 📚 Files to Check

1. **`frontend/.env`** - Main configuration
2. **`frontend/src/services/api.ts`** - API service (line 3)
3. **`frontend/vite.config.ts`** - Vite config (proxy settings)
4. **`backend/src/server.js`** - CORS configuration

---

**Made with ❤️ by Bob**