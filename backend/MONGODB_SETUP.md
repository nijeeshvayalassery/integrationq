# MongoDB Setup Guide for IntegrationIQ

Complete guide to set up MongoDB for your IntegrationIQ backend. Choose the method that works best for you!

## Table of Contents

1. [Option 1: Docker (Recommended - Easiest)](#option-1-docker-recommended)
2. [Option 2: MongoDB Atlas (Cloud - Free)](#option-2-mongodb-atlas-cloud)
3. [Option 3: Local Installation](#option-3-local-installation)
4. [Verify Installation](#verify-installation)
5. [Configure Backend](#configure-backend)
6. [Troubleshooting](#troubleshooting)

---

## Option 1: Docker (Recommended)

**Best for:** Quick setup, isolated environment, easy cleanup

### Prerequisites
- Docker installed ([Download Docker](https://www.docker.com/products/docker-desktop))

### Step 1: Create Docker Compose File

Create `docker-compose.yml` in the backend directory:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7.0
    container_name: integrationiq-mongodb
    restart: unless-stopped
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password123
      MONGO_INITDB_DATABASE: integrationiq
    volumes:
      - mongodb_data:/data/db
      - mongodb_config:/data/configdb
    networks:
      - integrationiq-network

  redis:
    image: redis:7-alpine
    container_name: integrationiq-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - integrationiq-network

volumes:
  mongodb_data:
    driver: local
  mongodb_config:
    driver: local
  redis_data:
    driver: local

networks:
  integrationiq-network:
    driver: bridge
```

### Step 2: Start Services

```bash
# Start MongoDB and Redis
docker-compose up -d

# Check if containers are running
docker ps

# View logs
docker-compose logs -f mongodb
```

### Step 3: Configure Backend

Update your `.env` file:

```env
# With authentication
MONGODB_URI=mongodb://admin:password123@localhost:27017/integrationiq?authSource=admin

# Or without authentication (simpler for development)
MONGODB_URI=mongodb://localhost:27017/integrationiq
```

### Useful Docker Commands

```bash
# Stop services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v

# Restart services
docker-compose restart

# View logs
docker-compose logs -f

# Access MongoDB shell
docker exec -it integrationiq-mongodb mongosh

# Backup database
docker exec integrationiq-mongodb mongodump --out /data/backup

# Stop just MongoDB
docker stop integrationiq-mongodb

# Start just MongoDB
docker start integrationiq-mongodb
```

---

## Option 2: MongoDB Atlas (Cloud)

**Best for:** No local installation, free tier available, production-ready

### Step 1: Create Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for free account
3. Verify your email

### Step 2: Create Cluster

1. Click **"Build a Database"**
2. Choose **"M0 FREE"** tier
3. Select your preferred cloud provider and region
4. Name your cluster (e.g., "integrationiq-cluster")
5. Click **"Create Cluster"** (takes 3-5 minutes)

### Step 3: Create Database User

1. Go to **"Database Access"** in left sidebar
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Username: `integrationiq`
5. Password: Generate or create strong password
6. Database User Privileges: **"Read and write to any database"**
7. Click **"Add User"**

### Step 4: Whitelist IP Address

1. Go to **"Network Access"** in left sidebar
2. Click **"Add IP Address"**
3. For development: Click **"Allow Access from Anywhere"** (0.0.0.0/0)
4. For production: Add your specific IP
5. Click **"Confirm"**

### Step 5: Get Connection String

1. Go to **"Database"** in left sidebar
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Copy the connection string
5. Replace `<password>` with your database user password

Example connection string:
```
mongodb+srv://integrationiq:<password>@integrationiq-cluster.xxxxx.mongodb.net/integrationiq?retryWrites=true&w=majority
```

### Step 6: Configure Backend

Update your `.env` file:

```env
MONGODB_URI=mongodb+srv://integrationiq:YOUR_PASSWORD@integrationiq-cluster.xxxxx.mongodb.net/integrationiq?retryWrites=true&w=majority
```

### Atlas Benefits

✅ Free 512MB storage
✅ Automatic backups
✅ Built-in monitoring
✅ No maintenance required
✅ Production-ready
✅ Global deployment

---

## Option 3: Local Installation

**Best for:** Permanent local development setup

### macOS

#### Using Homebrew (Recommended)

```bash
# Install Homebrew if not installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Tap MongoDB formula
brew tap mongodb/brew

# Install MongoDB Community Edition
brew install mongodb-community@7.0

# Start MongoDB as a service
brew services start mongodb-community@7.0

# Or start manually
mongod --config /usr/local/etc/mongod.conf

# Verify installation
mongosh --version
```

#### Manual Installation

1. Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Choose macOS platform
3. Download and install .tgz file
4. Follow installation wizard

### Linux (Ubuntu/Debian)

```bash
# Import MongoDB public GPG key
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg \
   --dearmor

# Create list file
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update package database
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod

# Enable MongoDB to start on boot
sudo systemctl enable mongod

# Check status
sudo systemctl status mongod
```

### Windows

1. Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Choose Windows platform
3. Download MSI installer
4. Run installer
5. Choose "Complete" installation
6. Install as Windows Service
7. Install MongoDB Compass (GUI tool)

**Start MongoDB:**
```powershell
# MongoDB should start automatically as a service
# To start manually:
net start MongoDB

# To stop:
net stop MongoDB
```

### Configure Backend (Local Installation)

Update your `.env` file:

```env
MONGODB_URI=mongodb://localhost:27017/integrationiq
```

---

## Verify Installation

### Test Connection

```bash
# Using mongosh (MongoDB Shell)
mongosh

# You should see:
# Current Mongosh Log ID: ...
# Connecting to: mongodb://127.0.0.1:27017
# Using MongoDB: 7.0.x

# Test commands:
show dbs
use integrationiq
db.test.insertOne({name: "test"})
db.test.find()
```

### Test with Node.js

Create `test-connection.js` in backend directory:

```javascript
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://localhost:27017/integrationiq';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully!');
    console.log('Database:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  });
```

Run test:
```bash
node test-connection.js
```

---

## Configure Backend

### 1. Update .env File

```env
# Choose ONE of these based on your setup:

# Docker (with auth)
MONGODB_URI=mongodb://admin:password123@localhost:27017/integrationiq?authSource=admin

# Docker (without auth)
MONGODB_URI=mongodb://localhost:27017/integrationiq

# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/integrationiq?retryWrites=true&w=majority

# Local Installation
MONGODB_URI=mongodb://localhost:27017/integrationiq
```

### 2. Install Dependencies

```bash
cd backend
npm install
```

### 3. Start Backend

```bash
npm run dev
```

You should see:
```
Server running in development mode on port 3000
MongoDB Connected: localhost (or your Atlas cluster)
```

---

## MongoDB GUI Tools

### MongoDB Compass (Official)

**Free, user-friendly GUI**

1. Download from [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Install and open
3. Connect using your connection string
4. Browse databases, collections, and documents visually

### Studio 3T

**Advanced features, free trial**

1. Download from [Studio 3T](https://studio3t.com/)
2. Great for complex queries and data migration

### VS Code Extension

**MongoDB for VS Code**

1. Install extension: "MongoDB for VS Code"
2. Connect to your database
3. Browse and query from VS Code

---

## Troubleshooting

### Connection Refused

**Error:** `MongoNetworkError: connect ECONNREFUSED 127.0.0.1:27017`

**Solutions:**

```bash
# Check if MongoDB is running
# Docker:
docker ps | grep mongo

# macOS:
brew services list | grep mongodb

# Linux:
sudo systemctl status mongod

# Windows:
net start | findstr MongoDB

# Start MongoDB if not running
# Docker:
docker-compose up -d mongodb

# macOS:
brew services start mongodb-community

# Linux:
sudo systemctl start mongod

# Windows:
net start MongoDB
```

### Authentication Failed

**Error:** `MongoServerError: Authentication failed`

**Solutions:**

1. Check username and password in connection string
2. Verify user exists in database
3. Check authSource parameter

```bash
# Docker: Access MongoDB shell
docker exec -it integrationiq-mongodb mongosh -u admin -p password123

# Create user manually
use admin
db.createUser({
  user: "integrationiq",
  pwd: "yourpassword",
  roles: [{role: "readWrite", db: "integrationiq"}]
})
```

### Atlas Connection Issues

**Error:** `MongoNetworkError: connection timeout`

**Solutions:**

1. Check IP whitelist in Atlas
2. Verify connection string format
3. Check firewall settings
4. Try using VPN if corporate network blocks MongoDB

### Port Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::27017`

**Solutions:**

```bash
# Find process using port 27017
# macOS/Linux:
lsof -i :27017

# Windows:
netstat -ano | findstr :27017

# Kill the process
# macOS/Linux:
kill -9 <PID>

# Windows:
taskkill /PID <PID> /F
```

### Database Not Found

**Error:** Database doesn't exist

**Solution:** MongoDB creates databases automatically when you first write data. Just start your backend and it will create the database.

---

## Quick Reference

### Connection String Formats

```bash
# Local without auth
mongodb://localhost:27017/integrationiq

# Local with auth
mongodb://username:password@localhost:27017/integrationiq?authSource=admin

# Docker
mongodb://admin:password123@localhost:27017/integrationiq?authSource=admin

# Atlas
mongodb+srv://username:password@cluster.mongodb.net/integrationiq?retryWrites=true&w=majority

# Multiple hosts (replica set)
mongodb://host1:27017,host2:27017,host3:27017/integrationiq?replicaSet=rs0
```

### Common Commands

```bash
# MongoDB Shell
mongosh                          # Connect to local MongoDB
mongosh "connection-string"      # Connect to remote MongoDB
show dbs                         # List databases
use integrationiq                # Switch to database
show collections                 # List collections
db.users.find()                  # Query collection
db.users.countDocuments()        # Count documents
db.dropDatabase()                # Delete database

# Docker
docker-compose up -d             # Start services
docker-compose down              # Stop services
docker-compose logs -f mongodb   # View logs
docker exec -it mongodb mongosh  # Access shell

# Service Management
# macOS:
brew services start mongodb-community
brew services stop mongodb-community
brew services restart mongodb-community

# Linux:
sudo systemctl start mongod
sudo systemctl stop mongod
sudo systemctl restart mongod
sudo systemctl status mongod
```

---

## Recommended Setup for Development

**I recommend Docker for the easiest setup:**

1. Install Docker Desktop
2. Create `docker-compose.yml` (provided above)
3. Run `docker-compose up -d`
4. Update `.env` with connection string
5. Start your backend with `npm run dev`

**Benefits:**
- ✅ No system-wide installation
- ✅ Easy to start/stop
- ✅ Includes Redis for queue management
- ✅ Easy to reset (just delete volumes)
- ✅ Same setup works on all platforms

---

## Need Help?

- MongoDB Documentation: https://docs.mongodb.com/
- MongoDB University (Free Courses): https://university.mongodb.com/
- Community Forums: https://www.mongodb.com/community/forums/

---

**You're all set! MongoDB is ready for IntegrationIQ!** 🚀