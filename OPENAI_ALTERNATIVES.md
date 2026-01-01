# OpenAI API & Free Alternatives

## OpenAI API Pricing

**OpenAI API is NOT free** - it uses a pay-as-you-go model:

- **GPT-4 Turbo**: ~$10-30 per million tokens (input + output)
- **GPT-3.5 Turbo**: ~$0.50-1.50 per million tokens (much cheaper)
- **No free tier** as of 2024 (previously had free trial credits)

**Cost estimate for this app:**
- Each AI tutor conversation: ~500-2000 tokens
- 1000 conversations ≈ $0.50-6.00 (depending on model)
- For development/testing: Usually $1-10/month

## Free Alternatives

### Option 1: Use GPT-3.5 Turbo (Cheapest)
Still costs money, but very affordable:
- Update `lib/engines/ai-tutor.ts` to use `gpt-3.5-turbo` instead of `gpt-4-turbo-preview`
- Cost: ~$0.50 per million tokens
- Good quality for tutoring

### Option 2: Use Free/Open Source Models

#### A. Hugging Face Inference API (Free Tier)
- Free tier: 30,000 requests/month
- Models: Llama, Mistral, etc.
- Requires API key from [huggingface.co](https://huggingface.co)

#### B. Groq API (Very Fast, Free Tier)
- Free tier available
- Fast inference
- Models: Llama 3, Mixtral
- Get API key from [groq.com](https://groq.com)

#### C. Together AI (Free Credits)
- $25 free credits for new users
- Access to open models
- [together.ai](https://together.ai)

#### D. Local Models (Completely Free)
- Run models locally using Ollama
- No API costs
- Requires good hardware (GPU recommended)
- [ollama.ai](https://ollama.ai)

### Option 3: Disable AI Tutor (Use App Without AI)
The app will still work for:
- ✅ Viewing learning paths
- ✅ Concept pages
- ✅ Progress tracking
- ✅ Assessments (without AI evaluation)
- ❌ AI tutor chat won't work

## Recommended Setup for Free Usage

### Best Free Option: Groq API

1. **Sign up**: [console.groq.com](https://console.groq.com)
2. **Get API key**: Free tier available
3. **Update code**: Modify `lib/engines/ai-tutor.ts` to use Groq

### Quick Groq Integration

Replace OpenAI with Groq in `lib/engines/ai-tutor.ts`:

```typescript
// Install: npm install groq-sdk
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Replace OpenAI calls with Groq
const completion = await groq.chat.completions.create({
  model: 'llama-3-70b-8192', // or 'mixtral-8x7b-32768'
  messages: [...],
});
```

## Cost Comparison

| Service | Free Tier | Cost After Free Tier | Best For |
|---------|-----------|---------------------|----------|
| OpenAI GPT-4 | ❌ None | $10-30/1M tokens | Best quality |
| OpenAI GPT-3.5 | ❌ None | $0.50-1.50/1M tokens | Budget option |
| Groq | ✅ Yes | Pay-as-you-go | Fast & free |
| Hugging Face | ✅ 30K req/month | Free | Open models |
| Together AI | ✅ $25 credits | Pay-as-you-go | Good balance |
| Local (Ollama) | ✅ Free | $0 | Privacy-focused |

## Recommendation

**For development/testing:**
- Use **Groq API** (free tier) - fastest setup
- Or **Together AI** ($25 free credits)

**For production:**
- Start with **GPT-3.5 Turbo** (cheapest OpenAI option)
- Or use **Groq** if free tier is sufficient
- Monitor usage and costs

## Making the App Work Without API Key

You can modify the app to:
1. Show a message when API key is missing
2. Use mock responses for development
3. Make AI tutor optional

Would you like me to implement one of these alternatives?

