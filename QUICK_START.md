# Quick Start Checklist - Supabase Connection

Follow these steps in order. Check off each item as you complete it.

## ✅ Step 1: Create Supabase Project
- [ ] Go to [supabase.com](https://supabase.com) and sign up/login
- [ ] Click "New Project"
- [ ] Fill in:
  - Name: `AI Learning Platform`
  - Database Password: `________________` (SAVE THIS!)
  - Region: Choose closest
- [ ] Click "Create new project"
- [ ] Wait 1-2 minutes for setup

## ✅ Step 2: Get API Credentials
- [ ] In Supabase dashboard, click ⚙️ **Settings** (bottom left)
- [ ] Click **"API"**
- [ ] Copy these two values:
  - **Project URL**: `https://________________.supabase.co`
  - **anon public key**: `eyJ________________` (long string)

## ✅ Step 3: Get Database Connection String
- [ ] Still in Settings → API
- [ ] Scroll to **"Connection string"** section
- [ ] Click **"URI"** tab
- [ ] Copy the connection string
- [ ] Replace `[YOUR-PASSWORD]` with your actual password from Step 1
- [ ] Final string should look like:
  ```
  postgresql://postgres:YourPassword@db.xxxxx.supabase.co:5432/postgres
  ```

## ✅ Step 4: Update .env File
- [ ] Open `.env` file in your project
- [ ] Replace the values:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres?schema=public"
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-full-key...
OPENAI_API_KEY=sk-your-openai-key
```

- [ ] Save the file

## ✅ Step 5: Set Up Database
- [ ] Open terminal in project folder
- [ ] Run: `npm run db:generate`
- [ ] Run: `npm run db:push`
- [ ] Run: `npm run db:seed`
- [ ] ✅ Should see "Seeding completed!"

## ✅ Step 6: Configure Authentication
- [ ] In Supabase: **Authentication** → **Providers**
- [ ] Make sure **Email** is enabled (toggle ON)
- [ ] Go to **Authentication** → **Settings**
- [ ] Under "Email Auth", toggle **"Enable email confirmations"** OFF (for easier testing)
- [ ] Go to **Authentication** → **URL Configuration**
- [ ] Set **Site URL**: `http://localhost:3000`
- [ ] Add **Redirect URLs**:
  - `http://localhost:3000/auth/callback`
  - `http://localhost:3000/dashboard`

## ✅ Step 7: Test Everything
- [ ] Run: `npm run dev`
- [ ] Open: [http://localhost:3000](http://localhost:3000)
- [ ] Click "Get Started"
- [ ] Try signing up with email/password
- [ ] Check Supabase dashboard → **Authentication** → **Users** (should see your user)
- [ ] Check Supabase dashboard → **Table Editor** (should see tables with data)

## ✅ Step 8: (Optional) Google Sign-In
- [ ] Follow instructions in `GOOGLE_AUTH_SETUP.md`
- [ ] Or skip for now and add later

---

## 🎉 You're Done!

If all steps are checked, your app is connected to Supabase!

**What should work now:**
- ✅ Sign up / Sign in
- ✅ Dashboard shows Mathematics subject
- ✅ Can view learning paths
- ✅ AI tutor chat (if OpenAI key is set)

---

## 🆘 Having Issues?

**"Invalid API key"**
→ Check `.env` file, make sure anon key is correct

**"Database connection failed"**
→ Check `DATABASE_URL`, verify password is correct

**"Table does not exist"**
→ Run `npm run db:push` again

**"Redirect URI mismatch"**
→ Check redirect URLs in Supabase settings

**Need more help?**
→ See `SUPABASE_SETUP_GUIDE.md` for detailed instructions

