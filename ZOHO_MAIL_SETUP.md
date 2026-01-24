# Zoho Mail Setup Guide for Prodsnap.in

## Overview
This guide will help you set up Zoho Mail for professional email hosting and SMTP service for prodsnap.in.

**Benefits:**
- ✅ 500 emails/day per user (vs 2-4/hour with Supabase default)
- ✅ Instant email delivery (vs 5-30 min delays)
- ✅ Professional email addresses (@prodsnap.in)
- ✅ Free for up to 5 users
- ✅ Full email hosting included

---

## Phase 1: Create Zoho Mail Account

### Step 1: Sign Up
1. Visit: https://www.zoho.com/mail/zohomail-pricing.html
2. Click "GET STARTED" under **Free** plan
3. Enter domain: `prodsnap.in`
4. Click "Add Domain"

### Step 2: Create Admin Account
1. **Organization Name**: Prodsnap
2. **Admin Email**: `ravi@prodsnap.in` (recommended)
3. **Password**: [Create strong password - SAVE THIS!]
4. **Mobile**: [Your phone for verification]
5. Verify mobile with OTP

---

## Phase 2: Verify Domain in GoDaddy

### Step 3: Add TXT Verification Record

Zoho will provide a verification code like:
```
zoho-verification=zb12345678.zmverify.zoho.com
```

**Add to GoDaddy DNS:**
1. Go to: https://dcc.godaddy.com/manage/
2. Find **prodsnap.in** → Click **DNS**
3. Click **Add** → Select **TXT**
4. Enter:
   - **Type**: TXT
   - **Name**: @
   - **Value**: [paste verification code from Zoho]
   - **TTL**: 600 seconds
5. Click **Save**
6. Go back to Zoho and click **Verify** (wait 5-10 minutes)

---

## Phase 3: Configure MX Records

### Step 4: Add MX Records in GoDaddy

**IMPORTANT**: Delete any existing MX records first!

**Add these 3 MX records:**

**MX Record 1:**
```
Type:     MX
Name:     @
Value:    mx.zoho.com
Priority: 10
TTL:      1 Hour
```

**MX Record 2:**
```
Type:     MX
Name:     @
Value:    mx2.zoho.com
Priority: 20
TTL:      1 Hour
```

**MX Record 3:**
```
Type:     MX
Name:     @
Value:    mx3.zoho.com
Priority: 50
TTL:      1 Hour
```

---

## Phase 4: Email Authentication (SPF & DKIM)

### Step 5: Add SPF Record

**Add to GoDaddy DNS:**
```
Type:  TXT
Name:  @
Value: v=spf1 include:zoho.com ~all
TTL:   600 seconds
```

### Step 6: Add DKIM Record

1. In Zoho Admin Console: **Email Configuration** → **Domain Settings** → **DKIM**
2. Click **Add DKIM Record**
3. Copy the DKIM details (Name and Value)
4. Add to GoDaddy DNS:
   ```
   Type:  TXT
   Name:  zmail._domainkey
   Value: [paste DKIM value from Zoho]
   TTL:   600 seconds
   ```

---

## Phase 5: Create Email Accounts

### Step 7: Create Users in Zoho

Go to: https://mailadmin.zoho.com/ → **User Details** → **Users** → **Add User**

**Create these 4 accounts:**

### 1. noreply@prodsnap.in
```
Email:     noreply@prodsnap.in
First Name: No
Last Name:  Reply
Password:   [SAVE THIS PASSWORD!]
Purpose:    Automated transactional emails (Supabase auth, notifications)
```

### 2. info@prodsnap.in
```
Email:     info@prodsnap.in
First Name: Prodsnap
Last Name:  Info
Password:   [SAVE THIS PASSWORD!]
Purpose:    Main contact email (check inbox regularly)
```

### 3. support@prodsnap.in
```
Email:     support@prodsnap.in
First Name: Prodsnap
Last Name:  Support
Password:   [SAVE THIS PASSWORD!]
Purpose:    Customer support inquiries
```

### 4. ravi@prodsnap.in
```
Email:     ravi@prodsnap.in
First Name: Ravi
Last Name:  Barnwal
Password:   [SAVE THIS PASSWORD!]
Purpose:    Your personal email
```

**Note**: You have 1 more free slot for future use.

---

## Phase 6: Configure Application

### Step 8: Update Local Environment Variables

Edit `.env.local`:

```bash
# Zoho Mail SMTP Configuration
SMTP_HOST=smtp.zoho.com
SMTP_PORT=587
SMTP_USER=noreply@prodsnap.in
SMTP_PASSWORD=your_noreply_password_here

# Keep Gmail as backup (optional)
GMAIL_USER=ravibarnwal89@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password
```

### Step 9: Update Vercel Environment Variables

1. Go to: https://vercel.com/dashboard
2. Select **Prodsnap** project
3. Go to: **Settings** → **Environment Variables**
4. Add/Update these variables:

```
SMTP_HOST=smtp.zoho.com
SMTP_PORT=587
SMTP_USER=noreply@prodsnap.in
SMTP_PASSWORD=[password for noreply@prodsnap.in]
```

5. Click **Save**

---

## Phase 7: Configure Supabase

### Step 10: Update Supabase SMTP Settings

1. Go to: https://supabase.com/dashboard
2. Select your **Prodsnap** project
3. Navigate to: **Authentication** → **Email Templates**
4. Scroll to: **SMTP Settings**
5. Click: **Enable Custom SMTP**
6. Enter:

```
SMTP Host:     smtp.zoho.com
SMTP Port:     587
SMTP User:     noreply@prodsnap.in
Sender Name:   Prodsnap
Sender Email:  noreply@prodsnap.in
SMTP Password: [password for noreply@prodsnap.in]
```

7. Click **Save**
8. Click **Send Test Email** to verify

---

## Phase 8: Test & Verify

### Step 11: Test Email Delivery

**Test 1: Supabase Authentication**
- Try signing up with a test email
- Should receive verification email instantly (< 5 seconds)

**Test 2: Custom Emails**
- Submit a contact form
- Check payment notification
- All should be instant

**Test 3: Check Inbox**
- Log into `info@prodsnap.in` at https://mail.zoho.com
- Verify you can send/receive emails

**Test 4: Spam Check**
- Send test emails to Gmail, Outlook, Yahoo
- Check if they land in inbox (not spam)
- If in spam, mark as "Not Spam"

---

## Phase 9: Deploy Changes

### Step 12: Redeploy Application

The code changes have been pushed to GitHub. Vercel will auto-deploy.

**Monitor deployment:**
1. Go to: https://vercel.com/dashboard
2. Check **Deployments** tab
3. Wait for deployment to complete
4. Test emails on production

---

## DNS Records Summary

Here's what your GoDaddy DNS should look like after setup:

| Type | Name | Value | Priority | TTL |
|------|------|-------|----------|-----|
| A | @ | 76.76.21.21 | - | 600 |
| CNAME | www | cname.vercel-dns.com | - | 600 |
| MX | @ | mx.zoho.com | 10 | 3600 |
| MX | @ | mx2.zoho.com | 20 | 3600 |
| MX | @ | mx3.zoho.com | 50 | 3600 |
| TXT | @ | zoho-verification=... | - | 600 |
| TXT | @ | v=spf1 include:zoho.com ~all | - | 600 |
| TXT | zmail._domainkey | v=DKIM1; k=rsa; p=... | - | 600 |

---

## Email Capacity

### Per Account Limits
- **500 emails/day** per user
- **~20 emails/hour** per user
- **~15,000 emails/month** per user

### Total Capacity (4 active accounts)
- **2,000 emails/day**
- **~80 emails/hour**
- **~60,000 emails/month**

### Comparison with Supabase Default
- **1,000x faster** delivery (instant vs 5-30 min)
- **40x more capacity** (2,000/day vs 50/day)
- **Professional branding** (@prodsnap.in vs Supabase)

---

## Troubleshooting

### Emails Not Sending
1. Check SMTP credentials in Vercel environment variables
2. Verify DNS records are properly configured
3. Check Zoho Mail account is active
4. Test SMTP connection manually

### Emails Going to Spam
1. Verify SPF and DKIM records are added
2. Send a few emails and mark as "Not Spam"
3. Warm up the domain (send gradually increasing volume)
4. Add DMARC record (optional, advanced)

### DNS Not Propagating
1. Wait 24-48 hours for full propagation
2. Check DNS at: https://www.whatsmydns.net/
3. Clear browser cache
4. Try incognito mode

### Verification Failed
1. Double-check TXT record value (no typos)
2. Wait 10-15 minutes after adding record
3. Use @ for Name (not prodsnap.in)
4. Check TTL is set correctly

---

## Access Your Emails

### Webmail
- URL: https://mail.zoho.com
- Login with any of your @prodsnap.in accounts

### Mobile App
- Download: Zoho Mail app (iOS/Android)
- Add account: [email]@prodsnap.in

### Desktop Client (Outlook, Apple Mail, etc.)
**IMAP Settings:**
```
Server:   imap.zoho.com
Port:     993
Security: SSL/TLS
```

**SMTP Settings:**
```
Server:   smtp.zoho.com
Port:     587
Security: TLS
```

---

## Next Steps After Setup

1. ✅ Test all email functionality
2. ✅ Update email signatures in Zoho Mail
3. ✅ Set up email forwarding (if needed)
4. ✅ Configure auto-responders (optional)
5. ✅ Monitor email delivery rates
6. ✅ Update website footer with new contact email

---

## Support

**Zoho Support:**
- Help: https://help.zoho.com/portal/en/home
- Community: https://help.zoho.com/portal/en/community

**Prodsnap Email Issues:**
- Check logs in Vercel
- Test SMTP connection
- Verify environment variables

---

## Checklist

Use this checklist to track your progress:

- [ ] Created Zoho Mail account
- [ ] Added TXT verification record in GoDaddy
- [ ] Verified domain in Zoho
- [ ] Added 3 MX records in GoDaddy
- [ ] Added SPF record in GoDaddy
- [ ] Added DKIM record in GoDaddy
- [ ] Created noreply@prodsnap.in account
- [ ] Created info@prodsnap.in account
- [ ] Created support@prodsnap.in account
- [ ] Created ravi@prodsnap.in account
- [ ] Updated .env.local with Zoho SMTP
- [ ] Updated Vercel environment variables
- [ ] Configured Supabase SMTP settings
- [ ] Tested Supabase auth emails
- [ ] Tested custom notification emails
- [ ] Verified emails land in inbox (not spam)
- [ ] Logged into webmail successfully
- [ ] Deployment completed on Vercel
- [ ] Production emails working

---

**Setup Date**: January 24, 2026
**Domain**: prodsnap.in
**Service**: Zoho Mail Free (5 users)
**Capacity**: 2,000 emails/day
