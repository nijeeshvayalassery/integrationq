# 🚀 IntegrationIQ - Quick Start Guide

## You Have 2 Frontend Options:

### Option 1: HTML Frontend (✅ Ready to Use - No Setup Needed!)

**Location:** `integrationiq/index.html`

**How to use:**
```bash
# Just open in browser
open /Users/nijeeshvayalassery/Desktop/integrationiq/index.html
```

**Features:**
- ✅ Complete UI with IBM Carbon Design
- ✅ All pages: Home, Workflows, Create, Monitoring
- ✅ Works immediately, no installation
- ✅ Perfect for quick demo

---

### Option 2: React Frontend (Requires Setup)

**Location:** `integrationiq/frontend/`

**Setup Required:**
```bash
cd /Users/nijeeshvayalassery/Desktop/integrationiq/frontend

# 1. Install dependencies (takes 2-3 minutes)
npm install

# 2. Start dev server
npm run dev

# 3. Open browser
open http://localhost:3001
```

**Features:**
- ✅ Modern React + TypeScript
- ✅ Full API integration
- ✅ Hot reload for development
- ✅ Production-ready build system

---

## 🎯 Recommended: Use HTML Frontend for Now

Since you want to test quickly, use the HTML frontend:

```bash
# Open the HTML file
open /Users/nijeeshvayalassery/Desktop/integrationiq/index.html
```

**It has everything:**
- Login/Register
- Workflow creation with AI
- Connector management
- Monitoring dashboard
- Beautiful IBM Carbon Design UI

---

## 🔧 Backend Setup (Required for Both)

### 1. Start MongoDB (Docker)

```bash
cd /Users/nijeeshvayalassery/Desktop/integrationiq/backend
docker-compose up -d
```

### 2. Start Backend Server

```bash
cd /Users/nijeeshvayalassery/Desktop/integrationiq/backend
npm run dev
```

**Backend will run on:** `http://localhost:3000`

### 3. Add Your Groq API Key

```bash
cd /Users/nijeeshvayalassery/Desktop/integrationiq/backend
nano .env
```

Update:
```env
AI_PROVIDER=groq
GROQ_API_KEY=your-groq-api-key-here
```

---

## ✅ Complete Startup Sequence

### Terminal 1: MongoDB
```bash
cd /Users/nijeeshvayalassery/Desktop/integrationiq/backend
docker-compose up -d
```

### Terminal 2: Backend
```bash
cd /Users/nijeeshvayalassery/Desktop/integrationiq/backend
npm run dev
```

### Browser: Frontend
```bash
# Option A: HTML (Quick)
open /Users/nijeeshvayalassery/Desktop/integrationiq/index.html

# Option B: React (After npm install)
cd /Users/nijeeshvayalassery/Desktop/integrationiq/frontend
npm install
npm run dev
open http://localhost:3001
```

---

## 🧪 Test the System

### 1. Check Backend Health
```bash
curl http://localhost:3000/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2. Test MongoDB
```bash
curl http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "name": "Test User"
  }'
```

### 3. Test AI Workflow Generation
```bash
# First login to get token
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#"}' \
  | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

# Generate workflow
curl -X POST http://localhost:3000/api/v1/workflows/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "prompt": "When a GitHub issue is created, send a Slack notification"
  }'
```

---

## 🐛 Troubleshooting

### "localhost:3001 can't be found"

**Cause:** React dev server not running

**Solution:**
```bash
# Use HTML frontend instead
open /Users/nijeeshvayalassery/Desktop/integrationiq/index.html

# OR install and start React
cd frontend
npm install
npm run dev
```

### "Backend connection failed"

**Check:**
```bash
# 1. Is backend running?
curl http://localhost:3000/health

# 2. Is MongoDB running?
docker ps

# 3. Check backend logs
cd backend
npm run dev
```

### "MongoDB connection error"

**Solution:**
```bash
# Start MongoDB
cd backend
docker-compose up -d

# Check it's running
docker ps
```

---

## 📊 System Status Check

Run this to check everything:

```bash
#!/bin/bash
echo "🔍 Checking IntegrationIQ System Status..."
echo ""

# Check MongoDB
echo "1️⃣  MongoDB:"
if docker ps | grep -q mongodb; then
    echo "   ✅ Running"
else
    echo "   ❌ Not running - Run: docker-compose up -d"
fi

# Check Backend
echo "2️⃣  Backend:"
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "   ✅ Running on http://localhost:3000"
else
    echo "   ❌ Not running - Run: npm run dev"
fi

# Check React Frontend
echo "3️⃣  React Frontend:"
if curl -s http://localhost:3001 > /dev/null 2>&1; then
    echo "   ✅ Running on http://localhost:3001"
else
    echo "   ⚠️  Not running (Optional)"
    echo "   Use HTML frontend or run: npm run dev"
fi

# Check HTML Frontend
echo "4️⃣  HTML Frontend:"
if [ -f "/Users/nijeeshvayalassery/Desktop/integrationiq/index.html" ]; then
    echo "   ✅ Available"
    echo "   Open: /Users/nijeeshvayalassery/Desktop/integrationiq/index.html"
else
    echo "   ❌ Not found"
fi

echo ""
echo "📝 Summary:"
echo "   - Use HTML frontend for quick demo"
echo "   - Use React frontend for development"
echo "   - Backend must be running for both"
```

---

## 🎯 Recommended Workflow

### For Quick Demo/Testing:
1. Start MongoDB: `docker-compose up -d`
2. Start Backend: `npm run dev`
3. Open HTML: `open index.html`
4. Done! ✅

### For Development:
1. Start MongoDB: `docker-compose up -d`
2. Start Backend: `npm run dev`
3. Install React deps: `cd frontend && npm install`
4. Start React: `npm run dev`
5. Open: `http://localhost:3001`

---

## 📚 Documentation

- **Backend:** `backend/README.md`
- **React Frontend:** `frontend/README.md`
- **API Config:** `frontend/API_CONFIG.md`
- **Groq Setup:** `backend/GROQ_SETUP.md`
- **GitHub PAT:** `backend/GITHUB_PAT_SETUP.md`
- **How It Works:** `backend/HOW_IT_WORKS.md`

---

## ✅ Quick Checklist

- [ ] MongoDB running (`docker ps`)
- [ ] Backend running (`curl http://localhost:3000/health`)
- [ ] Groq API key added to `.env`
- [ ] Frontend opened (HTML or React)
- [ ] Test user registered
- [ ] Workflow generated with AI

---

**Made with ❤️ by Bob**