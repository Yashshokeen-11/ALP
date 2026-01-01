# Supabase Setup - Updated Instructions

Based on the current Supabase interface, here's how to configure authentication:

## Step 1: Enable Email Provider

1. **In Authentication page** (you're already here!)
2. **Click "Sign In / Providers"** (under CONFIGURATION section)
3. **Find "Email"** in the providers list
4. **Toggle it ON** (enable it)
5. **Click "Save"**

## Step 2: Configure Email Settings

1. **Still in "Sign In / Providers"**
2. **Look for email-related settings** like:
   - "Enable email confirmations" - Toggle this **OFF** for easier testing
   - Or check the "Email" option under NOTIFICATIONS section
3. **Save changes**

## Step 3: Set Redirect URLs

1. **Click "URL Configuration"** (under CONFIGURATION section)
2. **Set Site URL**: `http://localhost:3000`
3. **Add Redirect URLs**:
   - Click "Add URL" or the "+" button
   - Add: `http://localhost:3000/auth/callback`
   - Add: `http://localhost:3000/dashboard`
4. **Save** after each addition

## Step 4: Test Authentication

1. Go to http://localhost:3000
2. Click "Get Started"
3. Try signing up with email/password
4. Should work now!

---

**Quick Navigation:**
- **Sign In / Providers** → Enable Email authentication
- **URL Configuration** → Set redirect URLs
- **Users** → View created users (after sign up)

