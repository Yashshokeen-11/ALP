# Google Sign-In Setup Guide

This guide explains how to configure Google OAuth authentication in your Supabase project.

## Step 1: Enable Google Provider in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Providers**
3. Find **Google** in the list and click on it
4. Toggle **Enable Google provider** to ON

## Step 2: Get Google OAuth Credentials

### Option A: Using Google Cloud Console (Recommended)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Configure the OAuth consent screen if prompted:
   - User Type: External (for public use)
   - App name: Your app name
   - User support email: Your email
   - Developer contact: Your email
6. Create OAuth client ID:
   - Application type: **Web application**
   - Name: Your app name
   - **Authorized redirect URIs**: 
     ```
     https://your-project-ref.supabase.co/auth/v1/callback
     ```
     Replace `your-project-ref` with your Supabase project reference (found in your Supabase URL)
7. Copy the **Client ID** and **Client Secret**

### Option B: Quick Setup (For Development)

For local development, you can use:
- **Authorized redirect URIs**: 
  ```
  http://localhost:3000/auth/callback
  https://your-project-ref.supabase.co/auth/v1/callback
  ```

## Step 3: Configure Supabase

1. In Supabase dashboard, go to **Authentication** → **Providers** → **Google**
2. Paste your **Client ID** and **Client Secret** from Google Cloud Console
3. Click **Save**

## Step 4: Update Redirect URLs

In Supabase dashboard:
1. Go to **Authentication** → **URL Configuration**
2. Add your site URL:
   - **Site URL**: `http://localhost:3000` (for development)
   - **Redirect URLs**: 
     ```
     http://localhost:3000/auth/callback
     http://localhost:3000/dashboard
     ```

For production, add:
```
https://yourdomain.com/auth/callback
https://yourdomain.com/dashboard
```

## Step 5: Test Google Sign-In

1. Start your development server: `npm run dev`
2. Go to http://localhost:3000/auth/signin
3. Click **Sign in with Google**
4. You should be redirected to Google's sign-in page
5. After signing in, you'll be redirected back to your dashboard

## Troubleshooting

### "Redirect URI mismatch" Error

- Make sure the redirect URI in Google Cloud Console matches exactly:
  ```
  https://your-project-ref.supabase.co/auth/v1/callback
  ```
- Check for trailing slashes or typos

### "Invalid client" Error

- Verify Client ID and Client Secret are correct in Supabase
- Make sure Google provider is enabled in Supabase

### Not Redirecting After Sign-In

- Check that redirect URLs are configured in Supabase
- Verify the callback route exists: `/app/auth/callback/route.ts`

### User Not Created in Database

- The user will be created in Supabase Auth automatically
- Make sure your app creates a corresponding User record in your database (this should happen automatically in the dashboard page)

## Production Deployment

When deploying to production:

1. Update Google OAuth redirect URI to include your production domain
2. Update Supabase redirect URLs to include production domain
3. Update Site URL in Supabase to your production domain

## Security Notes

- Never commit Client Secret to version control
- Use environment variables for sensitive data
- Enable 2FA on your Google Cloud account
- Regularly rotate OAuth credentials

---

That's it! Google sign-in should now work. Users can click "Sign in with Google" and authenticate using their Google account.

