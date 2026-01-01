# Google Gemini Pro Setup Guide

Your app now supports Google Gemini Pro! Here's how to set it up.

## ✅ Why Gemini Pro?

- **Free Tier**: Generous free tier (60 requests/minute)
- **Great Quality**: Excellent for educational content and tutoring
- **Fast**: Quick response times
- **Google Quality**: Powered by Google's advanced AI

## Step 1: Get Your Gemini API Key

1. **Go to Google AI Studio**
   - Visit [https://aistudio.google.com](https://aistudio.google.com)
   - Sign in with your Google account

2. **Get API Key**
   - Click **"Get API key"** button
   - Click **"Create API key"**
   - Select or create a Google Cloud project
   - Copy the API key (starts with `AIza...`)

**Note**: The API key is free to use within Google's free tier limits.

## Step 2: Add to .env File

Add this line to your `.env` file:

```env
GEMINI_API_KEY=AIza_your_key_here
```

**Priority Order**: The app uses APIs in this order:
1. Hugging Face (if `HUGGINGFACE_API_KEY` is set)
2. Gemini (if `GEMINI_API_KEY` is set)
3. OpenAI (if `OPENAI_API_KEY` is set)
4. Fallback responses (if none are set)

## Step 3: Test It!

1. Start your app:
   ```bash
   npm run dev
   ```

2. Go to http://localhost:3000
3. Sign in and try the AI tutor chat
4. It should work with Gemini Pro!

## Free Tier Limits

- **60 requests per minute** (free tier)
- **1,500 requests per day** (free tier)
- Each conversation = ~1-3 requests
- That's plenty for development and testing!

## Model Used

The app uses: **`gemini-pro`**

This is Google's general-purpose model, perfect for:
- ✅ Socratic questioning
- ✅ Educational explanations
- ✅ Adaptive tutoring
- ✅ First-principles teaching

## How It Works

The app automatically:
1. ✅ Checks for `HUGGINGFACE_API_KEY` first
2. ✅ Falls back to `GEMINI_API_KEY` if Hugging Face not set
3. ✅ Falls back to `OPENAI_API_KEY` if neither above are set
4. ✅ Uses fallback responses if no API key at all

## Troubleshooting

**"Invalid API key"**
- Make sure key starts with `AIza`
- Check for extra spaces in `.env` file
- Verify key is active in Google AI Studio

**"Quota exceeded"**
- You've hit the free tier limit (60/min or 1500/day)
- Wait a minute or upgrade to paid tier
- Or use Hugging Face as backup

**"Model not found"**
- Make sure you're using `gemini-pro` (default)
- Check Google AI Studio for available models
- Some regions may have restrictions

## Cost Comparison

| Service | Free Tier | Cost After |
|---------|-----------|------------|
| Gemini Pro | ✅ 60 req/min, 1500/day | Pay-as-you-go |
| Hugging Face | ✅ 30K requests/month | Free |
| OpenAI | ❌ None | $0.50-30/1M tokens |

**For this app, Gemini Pro is excellent!** 🎉

## Example .env Configuration

```env
# Database
DATABASE_URL="postgresql://..."

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# AI Provider (use one or more)
GEMINI_API_KEY=AIza_your_key_here
# HUGGINGFACE_API_KEY=hf_your_token_here
# OPENAI_API_KEY=sk_your_key_here
```

---

That's it! Your AI tutor now works with Google Gemini Pro! 🚀

