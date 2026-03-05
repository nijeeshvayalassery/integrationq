# IntegrationIQ Backend - Quick Start Guide

Get your IntegrationIQ backend up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- MongoDB running locally or connection string
- Redis running locally (optional for development)
- OpenAI API key

## Step 1: Install Dependencies

```bash
cd backend
npm install
```

## Step 2: Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Minimum required configuration
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/integrationiq
JWT_SECRET=your-super-secret-key-change-this
OPENAI_API_KEY=sk-your-openai-api-key
ENCRYPTION_KEY=your-32-byte-hex-encryption-key
```

Generate encryption key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 3: Start Services

### Option A: Local Services

**Start MongoDB:**
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Start Redis (Optional):**
```bash
# macOS
brew services start redis

# Linux
sudo systemctl start redis

# Docker
docker run -d -p 6379:6379 --name redis redis:latest
```

### Option B: Docker Compose (Recommended)

Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
  
  redis:
    image: redis:latest
    ports:
      - "6379:6379"

volumes:
  mongodb_data:
```

Start services:
```bash
docker-compose up -d
```

## Step 4: Start the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

You should see:
```
Server running in development mode on port 3000
MongoDB Connected: localhost
Health check: http://localhost:3000/health
```

## Step 5: Test the API

### Check Health
```bash
curl http://localhost:3000/health
```

### Register a User
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234",
    "name": "Test User"
  }'
```

Save the `accessToken` from the response.

### Generate a Workflow
```bash
curl -X POST http://localhost:3000/api/v1/workflows/generate \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "When a GitHub issue is created, send a Slack message"
  }'
```

## Common Issues

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Make sure MongoDB is running
```bash
brew services start mongodb-community
# or
docker start mongodb
```

### Redis Connection Error (Optional)
```
Error: connect ECONNREFUSED 127.0.0.1:6379
```
**Solution:** Redis is optional for basic functionality. To enable:
```bash
brew services start redis
# or
docker start redis
```

### OpenAI API Error
```
Error: Invalid API key
```
**Solution:** Check your `OPENAI_API_KEY` in `.env`

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution:** Change port in `.env` or kill the process:
```bash
lsof -ti:3000 | xargs kill -9
```

## Next Steps

1. **Read the Documentation**
   - [README.md](./README.md) - Full documentation
   - [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - API reference

2. **Set Up Connectors**
   - Add GitHub, Slack, Airtable, SendGrid API keys to `.env`
   - Test connections via API

3. **Explore the Frontend**
   - Navigate to `../index.html`
   - Open in browser to see the UI

4. **Deploy**
   - See [README.md](./README.md) for deployment options

## Development Tips

### Watch Logs
```bash
# In development
npm run dev

# View specific log files
tail -f logs/combined.log
tail -f logs/error.log
```

### Test Endpoints with Postman
Import this collection: [Download Postman Collection](./postman_collection.json)

### Debug Mode
```bash
LOG_LEVEL=debug npm run dev
```

### Reset Database
```bash
# Drop database
mongo integrationiq --eval "db.dropDatabase()"

# Or use MongoDB Compass GUI
```

## Quick Commands Reference

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start

# Run tests
npm test

# Lint code
npm run lint

# Check health
curl http://localhost:3000/health

# View logs
tail -f logs/combined.log
```

## Support

- 📖 [Full Documentation](./README.md)
- 🔧 [API Reference](./API_DOCUMENTATION.md)
- 🐛 [Report Issues](https://github.com/integrationiq/backend/issues)
- 💬 [Discord Community](https://discord.gg/integrationiq)

---

**Ready to build amazing integrations!** 🚀