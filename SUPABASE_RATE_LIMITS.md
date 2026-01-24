# Supabase Rate Limits - Quick Reference

## 📧 Email Authentication Limits

### Password Reset (`resetPasswordForEmail`)
- **Rate Limit:** 2 emails per hour per user
- **Minimum Window:** 60 seconds between requests
- **Monthly Limit:** ~1,000 signup emails (Free tier)
- **Service Type:** Best-effort (for trialing only)

### Why You Hit the Limit
If you tried to reset your password more than twice within an hour, or attempted multiple resets within 60 seconds, you would hit Supabase's rate limit.

## 🔢 All Supabase Rate Limits

### Free Tier
| Resource | Limit |
|----------|-------|
| **Email (Password Reset)** | 2/hour per user |
| **Email (Signups)** | ~1,000/month |
| **OTP Requests** | 30/hour per user |
| **API Gateway** | 50 requests/second |
| **Monthly Active Users** | 10,000 MAUs |
| **Database Storage** | 500 MB |
| **File Storage** | 1 GB |
| **Database Egress** | 50 MB/day |
| **Edge Functions** | 1,000 invocations/day |
| **Realtime Connections** | ~500 concurrent |

### Team/Pro Tier
| Resource | Limit |
|----------|-------|
| **Email (Password Reset)** | 2/hour (customizable with SMTP) |
| **Monthly Active Users** | 100,000 MAUs |
| **Edge Functions** | 2M invocations/month |
| **Database Storage** | Higher quotas |
| **API Gateway** | Dedicated resources |

## 🚀 How to Bypass Email Limits

### 1. Use Custom SMTP (Recommended for Production)
Configure your own email service:
- **Gmail SMTP**
- **SendGrid**
- **AWS SES**
- **Mailgun**
- **Postmark**

**Benefits:**
- Unlimited email sending (within your provider's limits)
- Better deliverability
- Custom email templates
- Full control over email infrastructure

### 2. Upgrade to Team/Pro Tier
- Higher quotas across all resources
- Dedicated infrastructure
- Better support
- Production-ready features

### 3. Implement Client-Side Rate Limiting
- Prevent users from spamming requests
- Better UX with countdown timers
- Reduces load on Supabase
- **Already implemented in our fix!** ✅

## 📝 Important Notes

1. **Default Email Service = Trial Only**
   - Supabase's built-in email is NOT meant for production
   - Operates on "best-effort" basis
   - Can be unreliable at scale

2. **Rate Limits Apply Even on Errors**
   - Failed requests still count toward limits
   - Validation errors trigger rate limiting

3. **Per-User Limits**
   - Limits are tracked per email address
   - Different users don't affect each other's limits

4. **Customizable via Management API**
   - Some limits can be adjusted programmatically
   - Requires Team/Pro tier for most customizations

## 🔗 Official Documentation
- [Supabase Auth Rate Limits](https://supabase.com/docs/guides/auth/auth-rate-limits)
- [Supabase Pricing & Quotas](https://supabase.com/pricing)
- [Custom SMTP Setup](https://supabase.com/docs/guides/auth/auth-smtp)

---

**Last Updated:** January 24, 2026  
**Source:** Official Supabase documentation and web search results
