# How to Check if MongoDB is Running

Since you've run `docker-compose up -d`, here are several ways to verify MongoDB is accessible:

## Method 1: Check Docker Desktop (Easiest)

1. **Open Docker Desktop application**
2. Go to **"Containers"** tab
3. You should see 3 running containers:
   - `integrationiq-mongodb` (green/running)
   - `integrationiq-redis` (green/running)
   - `integrationiq-mongo-express` (green/running)

If they're running, MongoDB is UP! ✅

---

## Method 2: Use Terminal Commands

Open a new terminal and run these commands:

### Check Docker Containers
```bash
docker ps
```

**Expected output:**
```
CONTAINER ID   IMAGE              STATUS         PORTS                      NAMES
xxxxx          mongo:7.0          Up 2 minutes   0.0.0.0:27017->27017/tcp   integrationiq-mongodb
xxxxx          redis:7-alpine     Up 2 minutes   0.0.0.0:6379->6379/tcp     integrationiq-redis
xxxxx          mongo-express      Up 2 minutes   0.0.0.0:8081->8081/tcp     integrationiq-mongo-express
```

If you see these 3 containers with "Up" status, MongoDB is running! ✅

### Check MongoDB Logs
```bash
docker logs integrationiq-mongodb
```

**Look for:**
```
Waiting for connections on port 27017
```

This means MongoDB is ready! ✅

### Test MongoDB Connection
```bash
docker exec -it integrationiq-mongodb mongosh
```

**If successful, you'll see:**
```
Current Mongosh Log ID: ...
Connecting to: mongodb://127.0.0.1:27017
Using MongoDB: 7.0.x
```

**Try these commands:**
```javascript
// Show databases
show dbs

// Create test database
use integrationiq

// Insert test data
db.test.insertOne({name: "test"})

// Query test data
db.test.find()

// Exit
exit
```

If all these work, MongoDB is accessible! ✅

---

## Method 3: Use Mongo Express Web UI

1. **Open your browser**
2. Go to: **http://localhost:8081**
3. Login with:
   - Username: `admin`
   - Password: `admin123`

If you see the MongoDB admin interface, MongoDB is accessible! ✅

---

## Method 4: Test with Node.js Script

In the backend directory, run:

```bash
cd /Users/nijeeshvayalassery/Desktop/integrationiq/backend

# Make sure dependencies are installed
npm install

# Run the checker script
node check-mongodb.js
```

**Expected output:**
```
✅ MongoDB connection successful!
ℹ️  Database: integrationiq
ℹ️  Host: localhost:27017
✅ Write operation successful!
✅ Read operation successful!
```

---

## Method 5: Check Port Availability

```bash
# Check if port 27017 is listening
lsof -i :27017

# Or on Linux:
netstat -tuln | grep 27017

# Or on Windows:
netstat -ano | findstr :27017
```

**Expected output:**
```
com.docke  xxxxx  user   TCP *:27017 (LISTEN)
```

If you see this, MongoDB is listening on port 27017! ✅

---

## Method 6: Start Your Backend

The ultimate test - just start your backend:

```bash
cd /Users/nijeeshvayalassery/Desktop/integrationiq/backend

# Make sure .env is configured
cat .env | grep MONGODB_URI

# Should show:
# MONGODB_URI=mongodb://localhost:27017/integrationiq

# Start the backend
npm run dev
```

**Expected output:**
```
Server running in development mode on port 3000
✅ MongoDB Connected: localhost
Health check: http://localhost:3000/health
```

If you see "MongoDB Connected", everything is working! ✅

---

## Quick Verification Checklist

Run these in order:

1. ✅ **Docker Desktop** - Check containers are running
2. ✅ **Browser** - Open http://localhost:8081 (Mongo Express)
3. ✅ **Terminal** - Run `docker ps` to see containers
4. ✅ **Backend** - Run `npm run dev` to start server

If any of these work, MongoDB is accessible!

---

## Troubleshooting

### If containers are not running:

```bash
# Check what happened
docker-compose logs

# Restart containers
docker-compose restart

# Or stop and start fresh
docker-compose down
docker-compose up -d
```

### If port 27017 is already in use:

```bash
# Find what's using the port
lsof -i :27017

# Kill the process
kill -9 <PID>

# Restart Docker containers
docker-compose restart
```

### If Docker Desktop is not running:

1. Open Docker Desktop application
2. Wait for it to start (whale icon in menu bar)
3. Run `docker-compose up -d` again

---

## What to Do Next

Once MongoDB is confirmed running:

1. **Configure .env file:**
   ```bash
   cd /Users/nijeeshvayalassery/Desktop/integrationiq/backend
   cp .env.example .env
   ```

2. **Edit .env and set:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/integrationiq
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Start backend:**
   ```bash
   npm run dev
   ```

5. **Test API:**
   ```bash
   curl http://localhost:3000/health
   ```

---

## Still Having Issues?

Try these commands in order:

```bash
# 1. Check Docker is installed
docker --version

# 2. Check Docker is running
docker info

# 3. Check containers
docker ps -a

# 4. View all logs
docker-compose logs

# 5. Restart everything
docker-compose down
docker-compose up -d

# 6. Check logs again
docker-compose logs -f
```

---

## Success Indicators

You'll know MongoDB is working when you see:

✅ Docker containers showing "Up" status
✅ Mongo Express accessible at http://localhost:8081
✅ Backend connects successfully
✅ No connection errors in logs
✅ Can create/read data

---

**Need more help?** Check the full guide in `MONGODB_SETUP.md`