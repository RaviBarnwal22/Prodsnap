# Password Reset Rate Limit Fix

## Problem
When attempting to reset a password, users were encountering an "email rate limit exceeded" error. This is caused by Supabase's built-in email rate limiting, which prevents spam and abuse by limiting how many emails can be sent within a certain timeframe.

## Supabase Rate Limits Explained

### 📧 Email Authentication Rate Limits

Supabase enforces strict rate limits on email-sending functions to prevent abuse:

**Default Email Service (Built-in SMTP):**
- **2 emails per hour** per user for authentication endpoints (as of October 2023)
  - This was reduced from 4 emails per hour
  - Applies to: `/auth/v1/signup`, `/auth/v1/recover` (password reset), `/auth/v1/user`
- **60-second window** between requests for the same user
- **~1,000 signup emails per month** on Free tier

**Important Notes:**
- The default email service is provided for **trialing purposes only** and operates on a "best-effort basis"
- Rate limit errors can trigger even if the email isn't successfully sent
- For production apps, Supabase **strongly recommends** using a custom SMTP server

### 🎯 Other Authentication Rate Limits

- **OTP (One-Time Passwords):** 30 OTPs per hour per user
- **API Gateway:** 50 requests per second (RPS) on Free tier
- **Monthly Active Users (MAUs):**
  - Free tier: 10,000 MAUs
  - Team/Pro tier: 100,000 MAUs

### 💰 Tier Comparison

| Feature | Free Tier | Team/Pro Tier |
|---------|-----------|---------------|
| Email Rate Limit | 2/hour per user | 2/hour (customizable with SMTP) |
| API Requests | 50 RPS | Higher (dedicated resources) |
| MAUs | 10,000 | 100,000 |
| Email Volume | ~1,000/month | Unlimited with custom SMTP |
| Database Storage | 500 MB | Higher quotas |
| Edge Functions | 1,000/day | 2M/month |

## Solution Implemented

### 1. **Client-Side Rate Limiting** ✅
We've implemented a 60-second cooldown mechanism that prevents users from requesting multiple password reset emails in quick succession.

**Why 60 seconds?**
- Matches Supabase's documented **60-second window** between authentication requests
- Prevents hitting the **2 emails per hour** limit (with buffer)
- Provides reasonable UX - not too long, not too short
- Aligns with industry best practices for password reset flows

**Key Features:**
- **60-second cooldown timer** after each password reset request
- **localStorage persistence** - cooldown persists even if the user refreshes the page
- **Visual feedback** - countdown timer displayed on the button and in a warning message
- **Disabled button state** - button is disabled during cooldown period
- **Better error messages** - user-friendly messages explaining the wait time

### 2. **Code Changes Made**

#### Added State Management:
```typescript
const [resetPasswordCountdown, setResetPasswordCountdown] = useState(0)
```

#### Added Countdown Timer Effect:
```typescript
useEffect(() => {
    if (resetPasswordCountdown > 0) {
        const timer = setTimeout(() => setResetPasswordCountdown(resetPasswordCountdown - 1), 1000)
        return () => clearTimeout(timer)
    }
}, [resetPasswordCountdown])
```

#### Enhanced Password Reset Handler:
- Checks if cooldown is active before making request
- Stores timestamp in localStorage per email address
- Validates time since last reset attempt
- Sets 60-second cooldown after successful or rate-limited requests
- Provides specific error messages for rate limit errors

#### Updated UI:
- Button shows "Wait Xs" during cooldown
- Button is disabled during cooldown
- Warning message displays remaining time
- Improved visual feedback

## How It Works

1. **First Request**: User enters email and clicks "Send Reset Link"
   - Email is sent via Supabase
   - Timestamp is stored in localStorage as `last_reset_<email>`
   - 60-second countdown begins

2. **During Cooldown**: User tries to request another reset
   - Button is disabled
   - Shows "Wait Xs" message
   - Warning message displays remaining time

3. **After Cooldown**: Timer reaches 0
   - Button becomes enabled again
   - User can request another reset link

4. **Page Refresh**: User refreshes the page during cooldown
   - Cooldown is restored from localStorage
   - Remaining time is calculated and displayed

## Testing the Fix

1. Navigate to the login page
2. Click "Forgot password?"
3. Enter an email address
4. Click "Send Reset Link"
5. Observe the 60-second countdown
6. Try clicking the button again (should be disabled)
7. Refresh the page (countdown should persist)
8. Wait for countdown to complete
9. Button should become enabled again

## Additional Recommendations

### Option 2: Configure Supabase Email Rate Limits (Long-term)
You can adjust Supabase's email rate limits in your Supabase dashboard:

1. Go to **Authentication** → **Email Templates**
2. Check the rate limit settings
3. Consider implementing custom email sending via your own SMTP server for more control

### Option 3: Implement Server-Side Rate Limiting
For production applications, consider adding server-side rate limiting:

```typescript
// Example: Create /src/app/api/auth/reset-password/route.ts
import { ratelimit } from '@/lib/ratelimit' // Use Upstash Redis or similar

export async function POST(request: Request) {
    const { email } = await request.json()
    
    // Rate limit: 3 requests per hour per email
    const { success } = await ratelimit.limit(`reset_${email}`)
    
    if (!success) {
        return Response.json(
            { error: 'Too many reset attempts. Please try again later.' },
            { status: 429 }
        )
    }
    
    // Proceed with password reset...
}
```

### Option 4: Add CAPTCHA Protection
For additional security, consider adding reCAPTCHA or similar protection to the password reset form to prevent automated abuse.

## Environment Variables to Check

Make sure these Supabase environment variables are properly set:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Monitoring

Consider adding analytics to track:
- Number of password reset requests
- Rate limit hits
- User experience metrics

## Summary

The immediate fix has been implemented with client-side rate limiting. This will prevent most users from hitting Supabase's rate limits while providing a good user experience. For production, consider implementing the additional recommendations above for a more robust solution.
