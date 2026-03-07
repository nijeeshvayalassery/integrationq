#!/bin/bash

# Test GitHub Connection Script
# This script tests if your GitHub PAT works with IntegrationIQ

echo "🔍 Testing GitHub Connection..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if backend is running
echo "1️⃣  Checking if backend is running..."
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is running${NC}"
else
    echo -e "${RED}❌ Backend is not running${NC}"
    echo "Please start the backend with: npm run dev"
    exit 1
fi
echo ""

# Get GitHub PAT from .env
echo "2️⃣  Reading GitHub PAT from .env..."
if [ -f .env ]; then
    GITHUB_PAT=$(grep GITHUB_PAT .env | cut -d '=' -f2)
    if [ -z "$GITHUB_PAT" ] || [ "$GITHUB_PAT" = "your-github-pat-token-here" ]; then
        echo -e "${RED}❌ GitHub PAT not configured in .env${NC}"
        echo "Please add your GitHub PAT to .env file"
        exit 1
    fi
    echo -e "${GREEN}✅ GitHub PAT found${NC}"
else
    echo -e "${RED}❌ .env file not found${NC}"
    exit 1
fi
echo ""

# Test GitHub PAT directly with GitHub API
echo "3️⃣  Testing GitHub PAT with GitHub API..."
GITHUB_RESPONSE=$(curl -s -H "Authorization: token $GITHUB_PAT" https://api.github.com/user)
GITHUB_LOGIN=$(echo $GITHUB_RESPONSE | grep -o '"login":"[^"]*"' | cut -d'"' -f4)

if [ -n "$GITHUB_LOGIN" ]; then
    echo -e "${GREEN}✅ GitHub PAT is valid${NC}"
    echo "   Authenticated as: $GITHUB_LOGIN"
else
    echo -e "${RED}❌ GitHub PAT is invalid${NC}"
    echo "   Response: $GITHUB_RESPONSE"
    exit 1
fi
echo ""

# Register a test user
echo "4️⃣  Registering test user..."
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "github-test@example.com",
    "password": "Test123!@#",
    "name": "GitHub Test User"
  }')

if echo "$REGISTER_RESPONSE" | grep -q "accessToken"; then
    echo -e "${GREEN}✅ User registered${NC}"
elif echo "$REGISTER_RESPONSE" | grep -q "already exists"; then
    echo -e "${YELLOW}⚠️  User already exists, continuing...${NC}"
else
    echo -e "${YELLOW}⚠️  Registration response: $REGISTER_RESPONSE${NC}"
fi
echo ""

# Login to get token
echo "5️⃣  Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "github-test@example.com",
    "password": "Test123!@#"
  }')

ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -n "$ACCESS_TOKEN" ]; then
    echo -e "${GREEN}✅ Login successful${NC}"
else
    echo -e "${RED}❌ Login failed${NC}"
    echo "   Response: $LOGIN_RESPONSE"
    exit 1
fi
echo ""

# Test GitHub connection through API
echo "6️⃣  Testing GitHub connection through IntegrationIQ API..."
TEST_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/connectors/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d "{
    \"connectorName\": \"github\",
    \"credentials\": {
      \"token\": \"$GITHUB_PAT\"
    }
  }")

if echo "$TEST_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ GitHub connection test successful!${NC}"
    echo ""
    echo -e "${GREEN}🎉 All tests passed! Your GitHub integration is working!${NC}"
else
    echo -e "${RED}❌ GitHub connection test failed${NC}"
    echo "   Response: $TEST_RESPONSE"
    exit 1
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ GitHub Connection Test Summary${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Backend is running"
echo "✅ GitHub PAT is valid"
echo "✅ Authenticated as: $GITHUB_LOGIN"
echo "✅ IntegrationIQ API connection works"
echo ""
echo "Next steps:"
echo "1. Create a GitHub connection via API"
echo "2. Generate workflows with GitHub triggers/actions"
echo "3. Start building your integration!"
echo ""

# Made with Bob
