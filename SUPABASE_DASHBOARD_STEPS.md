# Supabase Dashboard Setup - Step by Step

Follow these exact steps in your Supabase dashboard.

## 🎯 Your Supabase Project

**Project URL**: https://gqurlrvuasidicpzjsft.supabase.co  
**Dashboard**: https://supabase.com/dashboard/project/gqurlrvuasidicpzjsft

---

## Step 1: Enable Email Authentication

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard/project/gqurlrvuasidicpzjsft
   - Sign in if needed

2. **Go to Authentication**
   - Click **"Authentication"** in the left sidebar (🔐 icon)

3. **Enable Email Provider**
   - Click **"Providers"** tab
   - Find **"Email"** in the list
   - Make sure the toggle switch is **ON** (green/blue)
   - If it's OFF, click it to turn it ON
   - Click **"Save"** button at the bottom

---

## Step 2: Disable Email Confirmation (For Testing)

1. **Still in Authentication**
   - Click **"Settings"** tab (next to Providers)

2. **Find Email Auth Section**
   - Scroll down to **"Email Auth"** section

3. **Disable Email Confirmations**
   - Find **"Enable email confirmations"**
   - Toggle it to **OFF** (gray)
   - This lets you sign in immediately without checking email
   - Click **"Save"** button

---

## Step 3: Configure Redirect URLs

1. **Still in Authentication → Settings**
   - Scroll to **"URL Configuration"** section

2. **Set Site URL**
   - Find **"Site URL"** field
   - Enter: `http://localhost:3000`
   - Click **"Save"**

3. **Add Redirect URLs**
   - Scroll to **"Redirect URLs"** section
   - Click **"Add URL"** button
   - Enter: `http://localhost:3000/auth/callback`
   - Click **"Add URL"** again
   - Enter: `http://localhost:3000/dashboard`
   - Click **"Save"** after adding each URL

---

## Step 4: Verify Database

1. **Check Tables**
   - Click **"Table Editor"** in left sidebar (📊 icon)
   - You should see tables like:
     - `users`
     - `subjects`
     - `concepts`
     - `user_profiles`
     - etc.

2. **Check Sample Data**
   - Click on **"subjects"** table
   - Should see "Mathematics" subject
   - Click on **"concepts"** table
   - Should see 8 math concepts

---

## Step 5: Test It!

1. **Go to Your App**
   - Open: http://localhost:3000

2. **Try Sign Up**
   - Click "Get Started"
   - Enter email and password
   - Click "Sign Up"
   - Should redirect to dashboard!

3. **Verify in Supabase**
   - Go back to Supabase dashboard
   - **Authentication** → **Users**
   - You should see your new user! 🎉

---

## ✅ Checklist

- [ ] Email provider enabled (toggle ON)
- [ ] Email confirmations disabled (toggle OFF)
- [ ] Site URL set to `http://localhost:3000`
- [ ] Redirect URL added: `http://localhost:3000/auth/callback`
- [ ] Redirect URL added: `http://localhost:3000/dashboard`
- [ ] Can see database tables
- [ ] Can sign up successfully
- [ ] User appears in Users table

---

## 🆘 Quick Fixes

**"Redirect URI mismatch"**
→ Make sure both redirect URLs are added in Step 3

**"Email not confirmed"**
→ Make sure email confirmations are OFF in Step 2

**"Invalid API key"**
→ Your .env file already has the correct keys, no need to change

**Can't sign up**
→ Check that Email provider is ON in Step 1

---

**That's it! Once you complete these steps, your app will be fully connected to Supabase!** 🚀

