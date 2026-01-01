# Complete Supabase Setup Guide

This is a step-by-step guide to connect your AI Learning Platform to Supabase.

## Step 1: Create a Supabase Account and Project

1. **Go to Supabase**
   - Visit [https://supabase.com](https://supabase.com)
   - Click **"Start your project"** or **"Sign in"**

2. **Sign Up / Sign In**
   - If you don't have an account, click **"Sign up"**
   - You can sign up with GitHub, Google, or email
   - Verify your email if required

3. **Create a New Project**
   - Click **"New Project"** button
   - Fill in the project details:
     - **Name**: `AI Learning Platform` (or any name you prefer)
     - **Database Password**: Create a strong password (SAVE THIS - you'll need it!)
     - **Region**: Choose the closest region to you
     - **Pricing Plan**: Free tier is fine for development
   - Click **"Create new project"**
   - Wait 1-2 minutes for the project to be set up

## Step 2: Get Your Supabase Credentials

1. **Go to Project Settings**
   - In your Supabase dashboard, click the **⚙️ Settings** icon (bottom left)
   - Click **"API"** in the settings menu

2. **Copy Your Credentials**
   You'll see two important values:
   
   - **Project URL**: Looks like `https://xxxxxxxxxxxxx.supabase.co`
   - **anon/public key**: A long string starting with `eyJ...`
   
   **Keep this page open** - you'll need these values!

## Step 3: Get Your Database Connection String

1. **Still in Settings → API**
   - Scroll down to find **"Connection string"** section
   - Click on the tab **"URI"**
   - You'll see something like:
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
     ```
   
2. **Replace `[YOUR-PASSWORD]`**
   - This is the database password you created in Step 1
   - Replace `[YOUR-PASSWORD]` with your actual password
   - Example:
     ```
     postgresql://postgres:MySecurePassword123@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
     ```

## Step 4: Configure Environment Variables

1. **Open your project's `.env` file**
   - In your project root (`/Users/ymac/Desktop/ALP/`)
   - If it doesn't exist, create it

2. **Add your Supabase credentials**
   ```env
   # Database - Use the connection string from Step 3
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxxxxxxxxxxxx.supabase.co:5432/postgres?schema=public"

   # Supabase - From Step 2
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

   # OpenAI - You'll need this for AI tutoring
   OPENAI_API_KEY=sk-your-openai-api-key-here
   ```

3. **Replace the placeholders**:
   - Replace `YOUR_PASSWORD` with your actual database password
   - Replace `xxxxxxxxxxxxx` with your actual project reference
   - Replace `eyJ...` with your actual anon key
   - Add your OpenAI API key (get it from [platform.openai.com](https://platform.openai.com))

## Step 5: Set Up the Database Schema

1. **Open terminal in your project directory**
   ```bash
   cd /Users/ymac/Desktop/ALP
   ```

2. **Generate Prisma Client** (if not done already)
   ```bash
   npm run db:generate
   ```

3. **Push the schema to Supabase**
   ```bash
   npm run db:push
   ```
   
   This will create all the tables in your Supabase database.
   
   **Expected output**: You should see tables being created successfully.

4. **Seed sample data** (optional but recommended)
   ```bash
   npm run db:seed
   ```
   
   This adds the Mathematics subject with 8 concepts.

## Step 6: Configure Authentication

1. **Enable Email Authentication**
   - In Supabase dashboard, go to **Authentication** → **Providers**
   - Find **"Email"** in the list
   - Make sure it's **enabled** (toggle should be ON)
   - Click **"Save"**

2. **Configure Email Settings** (Optional)
   - You can customize email templates
   - For development, you can disable email confirmation:
     - Go to **Authentication** → **Settings**
     - Under **"Email Auth"**, toggle **"Enable email confirmations"** OFF
     - This allows immediate sign-in without email verification

## Step 7: Configure Redirect URLs

1. **Go to Authentication Settings**
   - In Supabase dashboard: **Authentication** → **URL Configuration**

2. **Set Site URL**
   - **Site URL**: `http://localhost:3000`
   - Click **"Save"**

3. **Add Redirect URLs**
   - Under **"Redirect URLs"**, click **"Add URL"**
   - Add these URLs (one at a time):
     ```
     http://localhost:3000/auth/callback
     http://localhost:3000/dashboard
     ```
   - Click **"Save"** after each one

## Step 8: (Optional) Set Up Google OAuth

If you want Google sign-in:

1. **Get Google OAuth Credentials**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a project or select existing
   - Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth client ID**
   - Configure OAuth consent screen (if first time)
   - Create OAuth client:
     - Type: **Web application**
     - Authorized redirect URI: `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback`
       (Replace `YOUR-PROJECT-REF` with your Supabase project reference)
   - Copy **Client ID** and **Client Secret**

2. **Enable Google in Supabase**
   - In Supabase: **Authentication** → **Providers** → **Google**
   - Toggle **"Enable Google provider"** ON
   - Paste **Client ID** and **Client Secret**
   - Click **"Save"**

## Step 9: Test the Connection

1. **Start your development server**
   ```bash
   npm run dev
   ```

2. **Test Database Connection**
   - Open [http://localhost:3000](http://localhost:3000)
   - You should see the homepage (no errors)
   - Try navigating to `/dashboard` - should redirect to sign-in

3. **Test Authentication**
   - Go to [http://localhost:3000/auth/signin](http://localhost:3000/auth/signin)
   - Try signing up with email/password
   - Check Supabase dashboard → **Authentication** → **Users**
   - You should see your new user!

4. **Test Database**
   - In Supabase dashboard, go to **Table Editor**
   - You should see tables like:
     - `users`
     - `subjects`
     - `concepts`
     - `user_profiles`
     - etc.

## Step 10: Verify Everything Works

1. **Check Database Tables**
   ```bash
   npm run db:studio
   ```
   - This opens Prisma Studio
   - You can browse your database tables
   - Verify data was seeded correctly

2. **Test Full Flow**
   - Sign up → Should create user in Supabase
   - Sign in → Should work
   - Go to dashboard → Should show Mathematics subject
   - Click on Mathematics → Should show learning path
   - Try AI tutor chat → Should work (if OpenAI key is set)

## Troubleshooting

### "Invalid API key" Error
- Double-check your `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env`
- Make sure there are no extra spaces or quotes
- Regenerate if needed from Supabase dashboard

### "Database connection failed"
- Verify `DATABASE_URL` is correct
- Check that password doesn't have special characters (may need URL encoding)
- Test connection in Supabase dashboard → **Database** → **Connection string**

### "Table does not exist"
- Run `npm run db:push` again
- Check Supabase dashboard → **Table Editor** to see if tables exist

### "Redirect URI mismatch"
- Check redirect URLs in Supabase: **Authentication** → **URL Configuration**
- Make sure `http://localhost:3000/auth/callback` is added

### Authentication not working
- Check **Authentication** → **Providers** → **Email** is enabled
- Verify redirect URLs are configured
- Check browser console for errors

### Prisma errors
```bash
# Regenerate Prisma client
npm run db:generate

# If schema changed, push again
npm run db:push
```

## Quick Reference: Your Supabase Credentials

After setup, your `.env` should look like:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres?schema=public"
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
OPENAI_API_KEY=sk-xxxxx
```

## Next Steps

Once everything is connected:

1. ✅ Database is set up and seeded
2. ✅ Authentication is working
3. ✅ You can sign up/sign in
4. ✅ Dashboard loads with subjects
5. ✅ Ready to use the platform!

## Production Deployment

When deploying to production (Vercel, etc.):

1. Update Supabase redirect URLs to include your production domain
2. Update Site URL in Supabase to your production domain
3. Add environment variables in your hosting platform
4. Update Google OAuth redirect URI if using Google sign-in

---

**Need Help?**
- Supabase Docs: [https://supabase.com/docs](https://supabase.com/docs)
- Supabase Discord: [https://discord.supabase.com](https://discord.supabase.com)

