# STEP-BY-STEP DEBUGGING GUIDE

## 🎯 Goal
Find EXACTLY where the session is being lost by examining logs at each step.

## 📋 Prerequisites
1. Wait 2-3 minutes for Vercel deployment to complete
2. Have Vercel dashboard open: https://vercel.com/dashboard
3. Have browser DevTools ready (F12)

## 🔍 Step-by-Step Testing

### STEP 1: Access Vercel Logs
1. Go to: https://vercel.com/dashboard
2. Click on your project (Prodsnap)
3. Click on "Logs" or "Runtime Logs"
4. Keep this tab open throughout testing

### STEP 2: Clear Everything
1. Open browser in **Incognito/Private mode**
2. Open DevTools (F12)
3. Go to Application → Cookies
4. Delete ALL cookies for prodsnap-gamma.vercel.app
5. Go to Console tab - keep it open

### STEP 3: Navigate to Login
1. Go to: https://prodsnap-gamma.vercel.app/login
2. **VERCEL LOGS:** Look for:
   ```
   [MIDDLEWARE] /login
   ```
3. **CHECK:** Does middleware allow login page? Should see "ALLOWING REQUEST"

### STEP 4: Submit Login
1. Enter credentials:
   - Email: ravibarnwal89@gmail.com
   - Password: Test@0987
2. Click "Sign In"
3. **VERCEL LOGS:** Look for:
   ```
   [SERVER ACTION] LOGIN STARTED
   [LOGIN] Email: ravibarnwal89@gmail.com
   [LOGIN] ✅ SUCCESS
   [LOGIN] User ID: <some-id>
   [LOGIN] Session exists: true
   [LOGIN] Auth cookies: [...]
   ```
4. **CRITICAL CHECK:** Do you see auth cookies being set?
   - Look for: `[LOGIN] Auth cookies: [{ name: 'sb-...auth-token', hasValue: true, valueLength: XXX }]`
   - If valueLength is 0 or cookies array is empty → **PROBLEM FOUND**

### STEP 5: After Login Redirect
1. You should be redirected to home page
2. **VERCEL LOGS:** Look for:
   ```
   [MIDDLEWARE] /
   [MW] Incoming cookies: X
   [MW] Incoming auth cookies: [...]
   ```
3. **CRITICAL CHECK:** Are auth cookies present in the request?
   - If you see `NO AUTH COOKIES IN REQUEST` → **PROBLEM FOUND: Cookies not sent from browser**
   - If you see auth cookies → Check next step

### STEP 6: Middleware Session Check
1. In the same middleware log for `/`:
   ```
   [MW] Calling supabase.auth.getUser()...
   [MW] ✅ USER FOUND: <id> (<email>)
   ```
2. **CRITICAL CHECK:** Is user found?
   - If you see `NO USER - Session not found` → **PROBLEM FOUND: Cookies present but invalid**
   - If you see USER FOUND → Session is working!

### STEP 7: Navigate to Practice
1. Click "Practice" link
2. **VERCEL LOGS:** Look for:
   ```
   [MIDDLEWARE] /practice
   [MW] Incoming cookies: X
   [MW] Incoming auth cookies: [...]
   [MW] ✅ USER FOUND: <id>
   [MW] ✅ ALLOWING REQUEST
   ```
3. **CRITICAL CHECK:** Are you redirected to login?
   - If YES → Look at the middleware log, check where it fails
   - If NO → SUCCESS! Session is persisting!

### STEP 8: Browser Cookie Inspection
1. In DevTools → Application → Cookies
2. Look for cookie named: `sb-kammcwfteexyaxfvqfit-auth-token`
3. **CHECK ATTRIBUTES:**
   - Domain: Should be `.vercel.app` or `prodsnap-gamma.vercel.app`
   - Path: Should be `/`
   - Secure: Should be ✓ (checked)
   - HttpOnly: Should be ✓ (checked)
   - SameSite: Should be `Lax` or `None`

## 🐛 Common Problems & Solutions

### Problem 1: No auth cookies after login
**Symptoms:**
```
[LOGIN] Auth cookies: []
```
**Cause:** Server-side cookie setting is failing
**Solution:** Check Supabase configuration, check server client setup

### Problem 2: Cookies not sent to middleware
**Symptoms:**
```
[MW] ⚠️  NO AUTH COOKIES IN REQUEST
```
**Cause:** Cookie attributes are wrong (domain, path, sameSite)
**Solution:** Check cookie attributes in browser, might need to adjust cookie settings

### Problem 3: Cookies present but session invalid
**Symptoms:**
```
[MW] Incoming auth cookies: [...]
[MW] ❌ NO USER - Session not found
```
**Cause:** Supabase can't validate the token
**Possible reasons:**
- Token expired
- Supabase URL mismatch
- Database connection issue
**Solution:** Check Supabase dashboard, verify environment variables

### Problem 4: First page works, second fails
**Symptoms:**
- Home page loads fine (user found)
- Practice page redirects to login (no user)
**Cause:** Cookies are being lost between requests
**Solution:** This is the cookie persistence issue - need to check cookie attributes

## 📊 What To Report Back

After testing, please copy and paste:

1. **Login Action Logs** (from Vercel):
```
[Paste the entire login log block here]
```

2. **First Middleware Log** (redirect to home):
```
[Paste the middleware log for / here]
```

3. **Second Middleware Log** (click to Practice):
```
[Paste the middleware log for /practice here]
```

4. **Cookie Screenshot:**
- Take screenshot of DevTools → Application → Cookies showing the auth cookie attributes

This will tell us EXACTLY where the problem is!
