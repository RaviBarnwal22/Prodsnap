# Session Logout Bug - Vercel-Specific Issue

## Problem
- ✅ Login works perfectly on **localhost**
- ❌ Login fails on **Vercel** (prodsnap-gamma.vercel.app)
- Session is lost immediately after any navigation

## Root Cause
The issue is **Vercel environment-specific**, not a code issue. Most likely causes:

### 1. **Supabase Site URL Configuration** (MOST LIKELY)
Your Supabase project needs to have the Vercel domain whitelisted.

**FIX STEPS:**
1. Go to https://supabase.com/dashboard
2. Select your project (`kammcwfteexyaxfvqfit`)
3. Go to **Authentication** → **URL Configuration**
4. Add these URLs:
   - **Site URL**: `https://prodsnap-gamma.vercel.app`
   - **Redirect URLs**: 
     - `https://prodsnap-gamma.vercel.app/**`
     - `https://prodsnap-gamma.vercel.app/auth/callback`
5. Save changes

### 2. **Cookie Domain Issue**
Supabase cookies might be set with the wrong domain.

**CHECK:**
- Cookies should be set for `.vercel.app` or `prodsnap-gamma.vercel.app`
- NOT for `localhost` or a different domain

### 3. **Environment Variables on Vercel**
Verify these are set correctly in Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `DATABASE_URL`
- `DIRECT_URL`

**CHECK:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Verify all variables match your `.env` file
3. Redeploy if you made changes

## Testing
After making changes to Supabase:
1. Wait 1-2 minutes for Supabase to propagate changes
2. Clear browser cookies
3. Try logging in again on prodsnap-gamma.vercel.app

## Diagnostic Endpoint
Visit: `https://prodsnap-gamma.vercel.app/api/debug-env`
This will show:
- Environment variables (sanitized)
- Whether user session is detected
- Any auth errors

## Next Steps
1. **FIRST**: Fix Supabase Site URL configuration (most likely cause)
2. **THEN**: Test login on Vercel
3. **IF STILL FAILS**: Check Vercel environment variables
4. **IF STILL FAILS**: Check cookie attributes in browser DevTools
