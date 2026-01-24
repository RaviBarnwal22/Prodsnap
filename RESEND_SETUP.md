# Resend Setup Guide for Prodsnap.in

## Why Resend?

**Resend is the best free email service for developers in 2026:**
- ✅ **3,000 emails/month FREE** (100/day)
- ✅ **Custom domain**: noreply@prodsnap.in
- ✅ **Best deliverability**: 99%+ inbox rate
- ✅ **Instant delivery**: < 1 second
- ✅ **Modern API**: Developer-friendly
- ✅ **No credit card required**

**vs Zoho Mail**: No free plan anymore  
**vs Gmail**: Not professional (@gmail.com)  
**vs SendGrid**: Only 100/day free  

---

## Setup Guide (10 minutes)

### Step 1: Create Resend Account

1. **Go to**: https://resend.com/signup
2. **Sign up** with your email (ravibarnwal89@gmail.com)
3. **Verify your email**
4. **Log in** to dashboard

---

### Step 2: Add Your Domain

1. **In Resend Dashboard**, click **"Domains"**
2. **Click**: "Add Domain"
3. **Enter**: `prodsnap.in`
4. **Click**: "Add Domain"

---

### Step 3: Configure DNS in GoDaddy

Resend will show you DNS records to add. Add these to GoDaddy:

#### **SPF Record (TXT)**
```
Type:  TXT
Name:  @
Value: v=spf1 include:resend.com ~all
TTL:   600
```

#### **DKIM Record (TXT)**
```
Type:  TXT
Name:  resend._domainkey
Value: [Resend will provide this - copy from dashboard]
TTL:   600
```

#### **DMARC Record (TXT)** - Optional but recommended
```
Type:  TXT
Name:  _dmarc
Value: v=DMARC1; p=none; rua=mailto:info@prodsnap.in
TTL:   600
```

**How to add in GoDaddy:**
1. Go to: https://dcc.godaddy.com/manage/
2. Find **prodsnap.in** → Click **DNS**
3. Click **Add** → Select **TXT**
4. Enter the values above
5. Click **Save**

---

### Step 4: Verify Domain in Resend

1. **Wait 5-10 minutes** for DNS propagation
2. **Go back to Resend Dashboard**
3. **Click**: "Verify Domain"
4. **Status should change to**: ✅ Verified

---

### Step 5: Get API Key

1. **In Resend Dashboard**, click **"API Keys"**
2. **Click**: "Create API Key"
3. **Name**: "Prodsnap Production"
4. **Permission**: "Sending access"
5. **Click**: "Create"
6. **Copy the API key** (starts with `re_...`)
7. **SAVE THIS KEY** - you won't see it again!

---

### Step 6: Update Application Code

#### Update `src/lib/email.ts`:

Replace the transporter configuration with Resend:

```typescript
import nodemailer from 'nodemailer'

// Create transporter using Resend SMTP
const transporter = nodemailer.createTransport({
    host: 'smtp.resend.com',
    port: 465,
    secure: true,
    auth: {
        user: 'resend',
        pass: process.env.RESEND_API_KEY
    }
})

// Update sender email
const SENDER_EMAIL = process.env.SMTP_USER || 'noreply@prodsnap.in'

export async function sendEmail({ to, subject, html }: EmailOptions) {
    try {
        console.log(`[Email] Attempting to send email to: ${to} | Subject: ${subject}`)
        const info = await transporter.sendMail({
            from: `"Prodsnap" <${SENDER_EMAIL}>`,
            to,
            subject,
            html
        })
        console.log('[Email] SUCCESS:', info.messageId)
        return { success: true, messageId: info.messageId }
    } catch (error) {
        console.error('[Email] FAILED to send email:', error)
        return { success: false, error }
    }
}
```

---

### Step 7: Update Environment Variables

#### Local (`.env.local`):
```bash
# Resend Configuration
RESEND_API_KEY=re_your_api_key_here
SMTP_USER=noreply@prodsnap.in

# Keep Gmail as backup
GMAIL_USER=ravibarnwal89@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password
```

#### Vercel:
1. Go to: https://vercel.com/dashboard
2. Select **Prodsnap** project
3. **Settings** → **Environment Variables**
4. Add:
   ```
   RESEND_API_KEY=re_your_api_key_here
   SMTP_USER=noreply@prodsnap.in
   ```
5. **Save**

---

### Step 8: Configure Supabase

1. **Go to**: https://supabase.com/dashboard
2. **Select**: Prodsnap project
3. **Authentication** → **Email Templates** → **SMTP Settings**
4. **Enable Custom SMTP**
5. **Enter**:

```
SMTP Host:     smtp.resend.com
SMTP Port:     465
SMTP User:     resend
Sender Name:   Prodsnap
Sender Email:  noreply@prodsnap.in
SMTP Password: [Your Resend API Key]
```

6. **Save**
7. **Send Test Email**

---

### Step 9: Test Everything

1. **Test Supabase Auth**:
   - Try signup with test email
   - Should receive email instantly

2. **Test Custom Emails**:
   - Submit contact form
   - Check payment notification

3. **Check Deliverability**:
   - Send to Gmail, Outlook, Yahoo
   - Verify emails land in inbox (not spam)

4. **Monitor Dashboard**:
   - Check Resend dashboard for delivery stats
   - View email logs and analytics

---

## Resend SMTP Settings Summary

```
Host:     smtp.resend.com
Port:     465 (SSL) or 587 (TLS)
User:     resend
Password: [Your API Key]
From:     noreply@prodsnap.in
```

---

## Email Limits

### Free Tier
- **100 emails/day**
- **3,000 emails/month**
- **Unlimited domains**
- **Full API access**
- **Email analytics**

### Paid Tier ($20/month)
- **50,000 emails/month**
- **~1,600 emails/day**
- **Priority support**
- **Advanced analytics**

---

## Comparison

| Feature | Resend Free | Gmail | Supabase Default |
|---------|-------------|-------|------------------|
| Emails/Day | 100 | 500 | ~50 |
| Emails/Month | 3,000 | ~15,000 | ~1,500 |
| Delivery Time | < 1 sec | < 5 sec | 5-30 min |
| Custom Domain | ✅ @prodsnap.in | ❌ @gmail.com | ❌ |
| Deliverability | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| Analytics | ✅ | ❌ | ❌ |
| Cost | FREE | FREE | FREE |

---

## Troubleshooting

### Domain Not Verifying
- Wait 15-30 minutes for DNS propagation
- Check DNS records at: https://www.whatsmydns.net/
- Ensure TXT records are added correctly
- Use `@` for Name (not `prodsnap.in`)

### Emails Going to Spam
- Verify SPF and DKIM records are added
- Add DMARC record
- Send a few test emails and mark as "Not Spam"
- Warm up domain gradually

### API Key Not Working
- Ensure you copied the full key (starts with `re_`)
- Check for extra spaces in environment variables
- Regenerate key if needed

---

## Alternative: Use Resend SDK (Optional)

Instead of SMTP, you can use Resend's native SDK:

```bash
npm install resend
```

```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail({ to, subject, html }: EmailOptions) {
    try {
        const { data, error } = await resend.emails.send({
            from: 'Prodsnap <noreply@prodsnap.in>',
            to,
            subject,
            html
        })
        
        if (error) {
            console.error('[Email] FAILED:', error)
            return { success: false, error }
        }
        
        console.log('[Email] SUCCESS:', data.id)
        return { success: true, messageId: data.id }
    } catch (error) {
        console.error('[Email] FAILED:', error)
        return { success: false, error }
    }
}
```

**Benefits of SDK:**
- Cleaner API
- Better error handling
- React Email support
- Email templates

---

## Checklist

- [ ] Created Resend account
- [ ] Added prodsnap.in domain
- [ ] Added SPF record in GoDaddy
- [ ] Added DKIM record in GoDaddy
- [ ] Added DMARC record in GoDaddy (optional)
- [ ] Verified domain in Resend
- [ ] Created API key
- [ ] Updated .env.local with RESEND_API_KEY
- [ ] Updated Vercel environment variables
- [ ] Updated Supabase SMTP settings
- [ ] Tested Supabase auth emails
- [ ] Tested custom notification emails
- [ ] Verified emails land in inbox
- [ ] Checked Resend dashboard analytics

---

## Resources

- **Resend Dashboard**: https://resend.com/dashboard
- **Documentation**: https://resend.com/docs
- **API Reference**: https://resend.com/docs/api-reference
- **React Email**: https://react.email

---

**Setup Date**: January 24, 2026  
**Domain**: prodsnap.in  
**Service**: Resend  
**Capacity**: 3,000 emails/month (FREE)
