# Hugging Face Setup Guide

Your app now supports Hugging Face Inference API! Here's how to set it up.

## ✅ Why Hugging Face?

- **Free Tier**: 30,000 requests/month (plenty for development!)
- **Good Quality**: Models like Llama-2-70b are excellent for tutoring
- **No Credit Card**: Free tier doesn't require payment info
- **Works Great**: Perfect for educational applications

## Step 1: Get Your Hugging Face API Key

1. **Sign up/Login**
   - Go to [https://huggingface.co](https://huggingface.co)
   - Sign up (free) or login

2. **Get API Token**
   - Click on your profile (top right)
   - Go to **Settings** → **Access Tokens**
   - Click **"New token"**
   - Name it: `AI Learning Platform`
   - Select **"Read"** permission (that's enough)
   - Click **"Generate token"**
   - **Copy the token** (starts with `hf_...`)

## Step 2: Add to .env File

Add this line to your `.env` file:

```env
HUGGINGFACE_API_KEY=hf_your_token_here
```

**Priority**: The app will use Hugging Face if `HUGGINGFACE_API_KEY` is set, otherwise it falls back to OpenAI.

## Step 3: Test It!

1. Start your app:
   ```bash
   npm run dev
   ```

2. Go to http://localhost:3000
3. Sign in and try the AI tutor chat
4. It should work with Hugging Face!

## Available Models

The app currently uses: `meta-llama/Llama-2-70b-chat-hf`

You can change this in `lib/engines/ai-tutor.ts` if you want to try other models:

**Recommended Models:**
- `meta-llama/Llama-2-70b-chat-hf` (current) - Best quality
- `mistralai/Mixtral-8x7B-Instruct-v0.1` - Fast and good
- `meta-llama/Llama-2-13b-chat-hf` - Faster, smaller

**To change model:**
1. Open `lib/engines/ai-tutor.ts`
2. Find `model: 'meta-llama/Llama-2-70b-chat-hf'`
3. Replace with your preferred model
4. Save and restart

## How It Works

The app automatically:
1. ✅ Checks for `HUGGINGFACE_API_KEY` first
2. ✅ Falls back to `OPENAI_API_KEY` if Hugging Face not set
3. ✅ Uses fallback responses if no API key at all

## Free Tier Limits

- **30,000 requests/month** (free tier)
- Each conversation = ~1-3 requests
- That's ~10,000-30,000 conversations/month for free!

## Troubleshooting

**"Invalid API key"**
- Make sure token starts with `hf_`
- Check for extra spaces in `.env` file
- Regenerate token if needed

**"Model not found"**
- Some models require access approval
- Go to model page on Hugging Face and click "Agree and access repository"
- Try a different model if issues persist

**Slow responses**
- Hugging Face can be slower than OpenAI
- Try a smaller model like `Llama-2-13b-chat-hf`
- Or use OpenAI for faster responses

## Cost Comparison

| Service | Free Tier | Cost After |
|---------|-----------|------------|
| Hugging Face | ✅ 30K requests/month | Free |
| OpenAI | ❌ None | $0.50-30/1M tokens |
| Groq | ✅ Free tier | Pay-as-you-go |

**For this app, Hugging Face is perfect!** 🎉

---

That's it! Your AI tutor now works with Hugging Face for free!

