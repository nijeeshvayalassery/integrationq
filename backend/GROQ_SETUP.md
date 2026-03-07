# 🚀 Groq Setup Guide

## What is Groq?

Groq provides **FREE, ultra-fast AI inference** using open-source models like Llama 3.1, Mixtral, and Gemma. It's perfect for hackathons and development!

### Why Groq?
- ✅ **100% FREE** - No credit card required
- ✅ **Lightning Fast** - Up to 10x faster than OpenAI
- ✅ **High Quality** - Llama 3.1 70B rivals GPT-4
- ✅ **Generous Limits** - 30 requests/minute, 14,400/day
- ✅ **OpenAI Compatible** - Drop-in replacement

---

## Step 1: Get Your Groq API Key

1. **Visit Groq Console:**
   ```
   https://console.groq.com/
   ```

2. **Sign Up (Free):**
   - Click "Sign Up" or "Get Started"
   - Use Google, GitHub, or email
   - No credit card required!

3. **Create API Key:**
   - Go to: https://console.groq.com/keys
   - Click "Create API Key"
   - Give it a name (e.g., "IntegrationIQ")
   - Copy the key (starts with `gsk_...`)

---

## Step 2: Configure Your Application

1. **Open `.env` file:**
   ```bash
   cd integrationiq/backend
   nano .env
   ```

2. **Update these lines:**
   ```env
   # Change provider to groq
   AI_PROVIDER=groq
   
   # Add your Groq API key
   GROQ_API_KEY=gsk_your_actual_groq_api_key_here
   
   # Choose a model (recommended: llama-3.1-70b-versatile)
   GROQ_MODEL=llama-3.1-70b-versatile
   ```

3. **Save and close** (Ctrl+X, Y, Enter)

---

## Step 3: Test the Integration

1. **Restart your backend:**
   ```bash
   npm run dev
   ```

2. **You should see:**
   ```
   AI Service initialized with provider: groq, model: llama-3.1-70b-versatile
   ```

3. **Test with curl:**
   ```bash
   # First, register and login to get a token
   curl -X POST http://localhost:3000/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "Test123!@#",
       "name": "Test User"
     }'

   # Login to get token
   curl -X POST http://localhost:3000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "Test123!@#"
     }'

   # Use the token to generate a workflow
   curl -X POST http://localhost:3000/api/v1/workflows/generate \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
     -d '{
       "prompt": "When a new issue is created in GitHub, send a notification to Slack"
     }'
   ```

---

## Available Groq Models

| Model | Description | Best For | Speed |
|-------|-------------|----------|-------|
| **llama-3.1-70b-versatile** | Most capable, GPT-4 quality | Complex workflows, reasoning | Fast |
| **llama-3.1-8b-instant** | Smaller, faster | Simple tasks, quick responses | Ultra-fast |
| **mixtral-8x7b-32768** | Large context window | Long documents, complex logic | Fast |
| **gemma2-9b-it** | Google's model | General purpose | Fast |

### Recommended for IntegrationIQ:
```env
GROQ_MODEL=llama-3.1-70b-versatile
```

---

## Rate Limits (Free Tier)

- **Requests per minute:** 30
- **Requests per day:** 14,400
- **Tokens per minute:** 6,000

**More than enough for development and hackathons!**

---

## Troubleshooting

### Error: "Invalid API Key"
- Check your API key in `.env`
- Make sure it starts with `gsk_`
- Regenerate key if needed: https://console.groq.com/keys

### Error: "Rate limit exceeded"
- Wait 1 minute and try again
- Free tier: 30 requests/minute
- Consider caching responses

### Model not found
- Check available models: https://console.groq.com/docs/models
- Update `GROQ_MODEL` in `.env`

### Slow responses
- Try `llama-3.1-8b-instant` for faster responses
- Check your internet connection
- Groq is usually 10x faster than OpenAI!

---

## Switching Between Providers

### Use Groq (Free):
```env
AI_PROVIDER=groq
GROQ_API_KEY=gsk_your_key_here
GROQ_MODEL=llama-3.1-70b-versatile
```

### Use OpenAI (Paid):
```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your_key_here
OPENAI_MODEL=gpt-3.5-turbo
```

Just change `AI_PROVIDER` and restart!

---

## Performance Comparison

| Provider | Model | Speed | Cost | Quality |
|----------|-------|-------|------|---------|
| Groq | Llama 3.1 70B | ⚡⚡⚡ | FREE | ⭐⭐⭐⭐⭐ |
| OpenAI | GPT-3.5 | ⚡⚡ | $0.002/1K | ⭐⭐⭐⭐ |
| OpenAI | GPT-4 | ⚡ | $0.03/1K | ⭐⭐⭐⭐⭐ |

**Groq is the clear winner for hackathons!**

---

## Example Workflow Generation

**Prompt:**
```
When a new issue is created in GitHub, send a notification to Slack channel #dev-alerts
```

**Groq Response Time:** ~1-2 seconds
**OpenAI Response Time:** ~5-10 seconds

**Quality:** Both produce excellent results!

---

## Resources

- **Groq Console:** https://console.groq.com/
- **API Keys:** https://console.groq.com/keys
- **Documentation:** https://console.groq.com/docs
- **Models:** https://console.groq.com/docs/models
- **Playground:** https://console.groq.com/playground

---

## Need Help?

1. Check Groq status: https://status.groq.com/
2. Read docs: https://console.groq.com/docs
3. Check your API key: https://console.groq.com/keys
4. Review logs: `npm run dev` output

---

**Made with ❤️ by Bob**