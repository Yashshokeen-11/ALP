# Complete Supabase Connection Guide

Your Supabase credentials are already in `.env`! Now let's complete the setup.

## ✅ What's Already Done

- ✅ Supabase credentials in `.env`
- ✅ Database schema created
- ✅ Sample data seeded

## 🔧 What You Need to Do Now

### Step 1: Configure Authentication in Supabase Dashboard

1. **Go to your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard/project/gqurlrvuasidicpzjsft
   - Or go to https://supabase.com → Your Project

2. **Enable Email Authentication**
   - Click **"Authentication"** in the left sidebar
   - Click **"Providers"**
   - Find **"Email"** in the list
   - Make sure the toggle is **ON** (enabled)
   - Click **"Save"** if you made changes

3. **Configure Email Settings (Optional - for easier testing)**
   - Still in **Authentication** → Click **"Settings"**
   - Under **"Email Auth"** section
   - Toggle **"Enable email confirmations"** to **OFF**
   - This allows immediate sign-in without email verification
   - Click **"Save"**

4. **Set Up Redirect URLs**
   - In **Authentication** → Click **"URL Configuration"**
   - Set **Site URL**: `http://localhost:3000`
   - Under **Redirect URLs**, click **"Add URL"**
   - Add these URLs one by one:
     ```
     http://localhost:3000/auth/callback
     http://localhost:3000/dashboard
     ```
   - Click **"Save"** after each one

### Step 2: Verify Database Tables

1. **Check Tables in Supabase**
   - In Supabase dashboard, click **"Table Editor"** (left sidebar)
   - You should see tables like:
     - `users`
     - `subjects`
     - `concepts`
     - `user_profiles`
     - `learning_sessions`
     - etc.

2. **Verify Sample Data**
   - Click on **"subjects"** table
   - You should see "Mathematics" subject
   - Click on **"concepts"** table
   - You should see 8 math concepts

### Step 3: Test Authentication

1. **Start Your App** (if not running)
   ```bash
   pnpm dev
   ```

2. **Test Sign Up**
   - Go to http://localhost:3000
   - Click "Get Started"
   - Try signing up with email/password
   - You should be redirected to dashboard

3. **Verify User Created**
   - In Supabase dashboard → **Authentication** → **Users**
   - You should see your new user!

### Step 4: (Optional) Set Up Google Sign-In

If you want Google sign-in:

1. **Get Google OAuth Credentials**
   - Go to https://console.cloud.google.com
   - Create OAuth 2.0 Client ID
   - Add redirect URI: `https://gqurlrvuasidicpzjsft.supabase.co/auth/v1/callback`

2. **Enable in Supabase**
   - Supabase → **Authentication** → **Providers** → **Google**
   - Toggle ON
   - Add Client ID and Client Secret
   - Save

## 🎯 Quick Checklist

- [ ] Email authentication enabled in Supabase
- [ ] Email confirmations disabled (for testing)
- [ ] Site URL set to `http://localhost:3000`
- [ ] Redirect URLs added (`/auth/callback` and `/dashboard`)
- [ ] Database tables visible in Table Editor
- [ ] Sample data (Mathematics subject) exists
- [ ] Can sign up and create account
- [ ] User appears in Supabase Users table

## 🆘 Troubleshooting

### "Invalid API key" Error
- Check `.env` file - make sure anon key is correct
- No extra spaces or quotes

### "Redirect URI mismatch"
- Make sure redirect URLs are added in Supabase
- Check for typos in URLs

### "Email not confirmed"
- Disable email confirmations in Supabase settings
- Or check your email for confirmation link

### Can't see tables
- Run `pnpm db:push` again
- Check database connection string in `.env`

### Authentication not working
- Verify Email provider is enabled
- Check redirect URLs are configured
- Make sure Site URL is set

## 📝 Your Current Setup

- **Project URL**: https://gqurlrvuasidicpzjsft.supabase.co
- **Database**: Connected ✅
- **Schema**: Created ✅
- **Sample Data**: Seeded ✅
- **Authentication**: Needs configuration ⚠️

## 🚀 Next Steps

1. **Configure Authentication** (Step 1 above) - Most Important!
2. **Test Sign Up** (Step 3 above)
3. **Start Using the App!**

---

**Need Help?**
- Supabase Docs: https://supabase.com/docs
- Your project: https://supabase.com/dashboard/project/gqurlrvuasidicpzjsft

