# 🔧 Troubleshooting Guide - IntegrationIQ

## Issue: Pages Not Rendering

### Quick Fix Steps:

#### 1. Install Dependencies
```bash
cd integrationiq/frontend
rm -rf node_modules package-lock.json
npm install
```

#### 2. Restart Dev Server
```bash
# Stop the server (Ctrl+C)
npm run dev
```

#### 3. Clear Browser Cache
- Open DevTools (F12)
- Right-click refresh button
- Select "Empty Cache and Hard Reload"

---

## Common Issues & Solutions

### Issue 1: "Cannot find module '@carbon/react'"

**Solution:**
```bash
cd frontend
npm install @carbon/react @carbon/icons-react
npm run dev
```

### Issue 2: "Failed to resolve import"

**Solution:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Issue 3: Blank Page / White Screen

**Check Browser Console:**
1. Open DevTools (F12)
2. Go to Console tab
3. Look for errors
4. Share the error message

**Common Causes:**
- Dependencies not installed
- Backend not running
- Port conflict

### Issue 4: Backend Connection Error

**Solution:**
```bash
# Terminal 1 - Start Backend
cd integrationiq/backend
docker-compose up -d
npm run dev

# Wait for "Server running on port 3000"
```

### Issue 5: MongoDB Connection Error

**Solution:**
```bash
cd backend
docker-compose down
docker-compose up -d
# Wait 10 seconds
npm run dev
```

---

## Step-by-Step Fresh Start

### 1. Stop Everything
```bash
# Stop frontend (Ctrl+C in terminal)
# Stop backend (Ctrl+C in terminal)
cd backend
docker-compose down
```

### 2. Clean Install Frontend
```bash
cd ../frontend
rm -rf node_modules package-lock.json
npm install
```

### 3. Start Backend
```bash
cd ../backend
docker-compose up -d
sleep 10
npm run dev
```

### 4. Start Frontend
```bash
cd ../frontend
npm run dev
```

### 5. Open Browser
```
http://localhost:3001
```

---

## Verify Installation

### Check Frontend Dependencies:
```bash
cd frontend
npm list @carbon/react
npm list react-router-dom
npm list axios
```

Should show versions installed.

### Check Backend is Running:
```bash
curl http://localhost:3000/api/v1/connectors
```

Should return JSON response.

### Check MongoDB is Running:
```bash
docker ps
```

Should show `integrationiq-mongodb` and `integrationiq-redis` containers.

---

## Debug Mode

### Enable Detailed Logging:

**Frontend (vite.config.ts):**
```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  logLevel: 'info', // Add this
})
```

**Backend (.env):**
```env
NODE_ENV=development
DEBUG=*
```

---

## Check What's Working

### Test Backend:
```bash
# List connectors
curl http://localhost:3000/api/v1/connectors

# Should return: {"success":true,"data":[...]}
```

### Test Frontend Build:
```bash
cd frontend
npm run build
# Should complete without errors
```

---

## Browser Console Errors

### If you see: "Failed to fetch"
- Backend is not running
- CORS issue
- Wrong API URL

**Fix:**
```bash
# Check backend/.env has:
CORS_ORIGIN=http://localhost:3001

# Check frontend/.env has:
VITE_API_URL=http://localhost:3000/api/v1
```

### If you see: "Cannot read property of undefined"
- Component import error
- Missing dependency

**Fix:**
```bash
cd frontend
npm install
```

---

## Still Not Working?

### Share These Details:

1. **Browser Console Errors:**
   - Open DevTools (F12)
   - Copy all red errors

2. **Terminal Output:**
   - Frontend terminal errors
   - Backend terminal errors

3. **Versions:**
   ```bash
   node --version
   npm --version
   ```

4. **What You See:**
   - Blank page?
   - Error message?
   - Partial render?

---

## Quick Health Check

Run this command to check everything:

```bash
# Check Node/NPM
node --version && npm --version

# Check Docker
docker ps

# Check Backend
curl http://localhost:3000/api/v1/connectors

# Check Frontend Dependencies
cd frontend && npm list @carbon/react
```

---

## Nuclear Option (Complete Reset)

If nothing works, start fresh:

```bash
# 1. Stop everything
cd integrationiq/backend
docker-compose down -v
cd ../frontend
rm -rf node_modules package-lock.json

# 2. Reinstall
npm install

# 3. Start backend
cd ../backend
docker-compose up -d
sleep 10
npm run dev

# 4. Start frontend (new terminal)
cd ../frontend
npm run dev

# 5. Open browser
# http://localhost:3001
```

---

## Contact Info

If you're still stuck, share:
- Browser console errors
- Terminal output
- What you see on screen

I'll help you fix it! 🚀