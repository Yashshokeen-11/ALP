# Setup Guide

Step-by-step instructions to get the AI Learning Platform running.

## Prerequisites

1. **Node.js 18+** - [Download](https://nodejs.org/)
2. **PostgreSQL Database** - Options:
   - Local PostgreSQL installation
   - [Supabase](https://supabase.com) (free tier available)
   - [Neon](https://neon.tech) (serverless PostgreSQL)
   - [Railway](https://railway.app) (easy PostgreSQL hosting)
3. **Supabase Account** - For authentication
4. **OpenAI API Key** - For AI tutoring

## Step 1: Clone and Install

```bash
# Install dependencies
npm install
```

## Step 2: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a project
2. In your project settings, go to "API"
3. Copy your:
   - Project URL
   - Anon/public key

## Step 3: Set Up Database

### Option A: Using Supabase (Recommended)

1. In your Supabase project, go to "Database" → "Connection string"
2. Copy the connection string (it will look like: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`)

### Option B: Local PostgreSQL

1. Install PostgreSQL locally
2. Create a database:
   ```sql
   CREATE DATABASE alp;
   ```
3. Connection string: `postgresql://postgres:password@localhost:5432/alp?schema=public`

## Step 4: Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/alp?schema=public"

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key
```

**Important**: Replace all placeholder values with your actual credentials.

## Step 5: Set Up Database Schema

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push
```

This creates all the necessary tables in your database.

## Step 6: Seed Sample Data

```bash
# Seed Mathematics subject with concepts
npm run db:seed
```

This creates:
- Mathematics subject
- 8 foundational math concepts (Numbers, Addition, Subtraction, etc.)
- Prerequisite relationships between concepts

## Step 7: Configure Supabase Authentication

1. In Supabase dashboard, go to "Authentication" → "Providers"
2. Enable "Email" provider
3. (Optional) Configure other providers (Google, GitHub, etc.)

## Step 8: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 9: Create Your First Account

1. Click "Get Started" or "Sign In"
2. Click "Sign Up" to create an account
3. Check your email for verification (if email verification is enabled)
4. Sign in and explore the dashboard!

## Troubleshooting

### Database Connection Issues

- Verify your `DATABASE_URL` is correct
- Check that PostgreSQL is running (if local)
- Ensure your database exists
- Check firewall settings if using cloud database

### Supabase Authentication Issues

- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Check that email provider is enabled in Supabase
- Ensure redirect URLs are configured in Supabase dashboard

### OpenAI API Issues

- Verify your API key is correct
- Check your OpenAI account has credits
- Ensure you have access to GPT-4 (or update model in `lib/engines/ai-tutor.ts`)

### Prisma Issues

```bash
# Reset Prisma client
npm run db:generate

# If schema is out of sync
npm run db:push
```

### TypeScript Errors

```bash
# Check for type errors
npm run type-check
```

## Next Steps

1. **Explore the Dashboard**: See your learning progress
2. **Try Mathematics**: Start learning the seeded math concepts
3. **Chat with AI Tutor**: Ask questions and get Socratic guidance
4. **Add More Subjects**: See [EXTENDING.md](./EXTENDING.md) to add Physics, Computer Science, etc.

## Production Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

1. Set environment variables
2. Run `npm run build`
3. Run `npm run db:migrate` (not `db:push` in production)
4. Run `npm run db:seed` (optional, for initial data)
5. Start with `npm start`

## Environment Variables Reference

| Variable | Description | Required |
|----------|------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Yes |
| `OPENAI_API_KEY` | OpenAI API key for AI tutor | Yes |

## Support

If you encounter issues:
1. Check the error message carefully
2. Verify all environment variables are set
3. Check database and Supabase connections
4. Review [ARCHITECTURE.md](./ARCHITECTURE.md) for system overview
5. See [EXTENDING.md](./EXTENDING.md) for customization help

---

Happy learning! 🎓

