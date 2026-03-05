# IntegrationIQ Backend

AI-Powered Integration Platform Backend built with Node.js, Express, and MongoDB.

## 🏗️ Architecture

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   └── database.js  # MongoDB connection
│   ├── middleware/      # Express middleware
│   │   ├── auth.js      # Authentication middleware
│   │   ├── errorHandler.js
│   │   └── validation.js
│   ├── models/          # Mongoose models
│   │   ├── User.js
│   │   ├── Workflow.js
│   │   ├── Connector.js
│   │   ├── Connection.js
│   │   └── ExecutionLog.js
│   ├── routes/          # API routes
│   │   ├── auth.js
│   │   ├── workflows.js
│   │   └── connectors.js
│   ├── services/        # Business logic
│   │   ├── aiOrchestrationService.js
│   │   ├── workflowExecutionService.js
│   │   ├── connectorService.js
│   │   └── authService.js
│   ├── utils/           # Utility functions
│   │   └── logger.js
│   └── server.js        # Main application file
├── .env.example         # Environment variables template
├── package.json
└── README.md
```

## 🚀 Features

### Core Services

1. **AI Orchestration Service**
   - Natural language to workflow conversion
   - Error analysis and healing suggestions
   - Workflow optimization

2. **Workflow Execution Service**
   - Async workflow execution with Bull queue
   - Retry mechanism with exponential backoff
   - Self-healing capabilities
   - Execution logging and monitoring

3. **Connector Service**
   - GitHub, Airtable, Slack, SendGrid integrations
   - Connection testing and verification
   - Secure credential storage with encryption

4. **Authentication Service**
   - JWT-based authentication
   - Refresh token mechanism
   - Password hashing with bcrypt

### Key Features

- ✅ RESTful API with Express
- ✅ MongoDB with Mongoose ODM
- ✅ JWT Authentication
- ✅ OpenAI Integration for AI features
- ✅ Bull Queue for async job processing
- ✅ Redis for caching and queue management
- ✅ Winston logging
- ✅ Joi validation
- ✅ Rate limiting
- ✅ CORS support
- ✅ Helmet security
- ✅ Compression
- ✅ Error handling

## 📋 Prerequisites

- Node.js >= 18.0.0
- MongoDB >= 5.0
- Redis >= 6.0
- npm >= 9.0.0

## 🛠️ Installation

1. **Clone the repository**
```bash
cd integrationiq/backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Server
NODE_ENV=development
PORT=3000

# Database
MONGODB_URI=mongodb://localhost:27017/integrationiq

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Third-party APIs
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
# ... add other API keys
```

4. **Generate encryption key**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Add the output to `ENCRYPTION_KEY` in `.env`

5. **Start MongoDB**
```bash
# macOS with Homebrew
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

6. **Start Redis**
```bash
# macOS with Homebrew
brew services start redis

# Linux
sudo systemctl start redis

# Docker
docker run -d -p 6379:6379 --name redis redis:latest
```

## 🏃 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Run Tests
```bash
npm test
```

### Lint Code
```bash
npm run lint
```

## 📡 API Endpoints

### Authentication
```
POST   /api/v1/auth/register      - Register new user
POST   /api/v1/auth/login         - Login user
POST   /api/v1/auth/refresh       - Refresh access token
POST   /api/v1/auth/logout        - Logout user
GET    /api/v1/auth/me            - Get current user
PUT    /api/v1/auth/profile       - Update profile
PUT    /api/v1/auth/password      - Change password
```

### Workflows
```
POST   /api/v1/workflows/generate           - Generate workflow from NL
POST   /api/v1/workflows                    - Create workflow
GET    /api/v1/workflows                    - Get all workflows
GET    /api/v1/workflows/:id                - Get workflow by ID
PUT    /api/v1/workflows/:id                - Update workflow
DELETE /api/v1/workflows/:id                - Delete workflow
POST   /api/v1/workflows/:id/execute        - Execute workflow
GET    /api/v1/workflows/:id/executions     - Get execution logs
GET    /api/v1/workflows/:id/stats          - Get execution stats
POST   /api/v1/workflows/:id/activate       - Activate workflow
POST   /api/v1/workflows/:id/pause          - Pause workflow
```

### Connectors
```
GET    /api/v1/connectors                   - Get all connectors
GET    /api/v1/connectors/:name             - Get connector by name
POST   /api/v1/connectors/test              - Test connection
GET    /api/v1/connectors/connections/all   - Get all connections
POST   /api/v1/connectors/connections       - Create connection
GET    /api/v1/connectors/connections/:id   - Get connection
PUT    /api/v1/connectors/connections/:id   - Update connection
DELETE /api/v1/connectors/connections/:id   - Delete connection
POST   /api/v1/connectors/connections/:id/verify - Verify connection
```

### Health Check
```
GET    /health                              - Server health status
```

## 🔐 Authentication

All protected endpoints require a Bearer token in the Authorization header:

```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  http://localhost:3000/api/v1/workflows
```

## 📝 Example Requests

### Register User
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123",
    "name": "John Doe"
  }'
```

### Generate Workflow
```bash
curl -X POST http://localhost:3000/api/v1/workflows/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "When a GitHub issue is created, store it in Airtable and send a Slack notification"
  }'
```

### Execute Workflow
```bash
curl -X POST http://localhost:3000/api/v1/workflows/WORKFLOW_ID/execute \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "triggerData": {
      "issue": {
        "title": "Bug found",
        "body": "Description here"
      }
    }
  }'
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | development |
| `PORT` | Server port | 3000 |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/integrationiq |
| `REDIS_HOST` | Redis host | localhost |
| `REDIS_PORT` | Redis port | 6379 |
| `JWT_SECRET` | JWT secret key | - |
| `JWT_EXPIRES_IN` | JWT expiration time | 7d |
| `OPENAI_API_KEY` | OpenAI API key | - |
| `ENCRYPTION_KEY` | 32-byte encryption key | - |

### Rate Limiting

Default: 100 requests per 15 minutes per IP

Configure in `.env`:
```env
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🐛 Debugging

### Enable Debug Logging
```bash
LOG_LEVEL=debug npm run dev
```

### View Logs
```bash
# Development
tail -f logs/combined.log

# Errors only
tail -f logs/error.log
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- auth.test.js
```

## 📦 Deployment

### Docker
```bash
# Build image
docker build -t integrationiq-backend .

# Run container
docker run -p 3000:3000 \
  -e MONGODB_URI=mongodb://host.docker.internal:27017/integrationiq \
  -e REDIS_HOST=host.docker.internal \
  integrationiq-backend
```

### PM2 (Production)
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start src/server.js --name integrationiq-backend

# Monitor
pm2 monit

# View logs
pm2 logs integrationiq-backend
```

### Heroku
```bash
# Login
heroku login

# Create app
heroku create integrationiq-backend

# Add MongoDB addon
heroku addons:create mongolab

# Add Redis addon
heroku addons:create heroku-redis

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret

# Deploy
git push heroku main
```

## 🔒 Security

- Passwords hashed with bcrypt (10 rounds)
- JWT tokens for authentication
- Credentials encrypted with AES-256-CBC
- Rate limiting to prevent abuse
- Helmet.js for security headers
- Input validation with Joi
- CORS configuration
- SQL injection prevention (NoSQL)

## 🚨 Error Handling

All errors return consistent JSON format:
```json
{
  "success": false,
  "message": "Error message",
  "errors": ["Detailed error 1", "Detailed error 2"]
}
```

HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## 📊 Monitoring

### Health Check
```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 12345,
  "environment": "development"
}
```

### Queue Monitoring

Access Bull Board (if enabled):
```
http://localhost:3000/admin/queues
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
- GitHub Issues: [Create an issue](https://github.com/yourusername/integrationiq/issues)
- Email: support@integrationiq.com

## 🎯 Roadmap

- [ ] GraphQL API
- [ ] WebSocket support for real-time updates
- [ ] More connector integrations
- [ ] Advanced workflow analytics
- [ ] Multi-tenancy support
- [ ] Workflow templates marketplace
- [ ] API versioning
- [ ] Swagger/OpenAPI documentation

---

Built with ❤️ by the IntegrationIQ Team