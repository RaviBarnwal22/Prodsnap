# API Usage Monitoring System - Implementation Summary

## Overview
A comprehensive API monitoring system has been successfully implemented in the Prodsnap admin panel to track Gemini and Perplexity API usage in real-time.

## What Was Built

### 1. Database Schema (`prisma/schema.prisma`)
Added new `ApiUsageLog` model to track:
- **Provider**: "gemini" or "perplexity"
- **Model**: e.g., "gemini-pro", "sonar"
- **Status**: "success", "error", or "rate_limit"
- **Response Time**: in milliseconds
- **Error Message**: for debugging failures
- **Token Count**: estimated tokens used
- **Timestamp**: when the API call was made

### 2. AI Engine Logging (`src/lib/ai/engine.ts`)
Enhanced the AI evaluation engine to automatically log:
- Every API call attempt (both Gemini and Perplexity)
- Success/failure status
- Response times for performance monitoring
- Rate limit detection
- Error messages for troubleshooting
- Estimated token usage

### 3. Admin API Endpoint (`src/app/api/admin/api-usage/route.ts`)
Created a secure API endpoint that provides:
- **Today's Usage Statistics**: Success, error, and rate limit counts per provider
- **7-Day Trend Data**: Daily breakdown of API usage
- **Average Response Times**: Performance metrics per provider
- **Recent Errors**: Last 10 errors/rate limits for debugging
- **Capacity Limits**: Configured daily limits for each API

### 4. Monitoring Dashboard Component (`src/components/admin/ApiUsageMonitor.tsx`)
Built a beautiful, real-time dashboard featuring:

#### Provider Cards (Gemini & Perplexity)
- **Usage Progress Bars**: Visual representation of daily quota consumption
- **Color-coded Alerts**: 
  - Green: < 70% usage
  - Yellow: 70-90% usage
  - Red: > 90% usage
- **Success/Error/Rate Limit Counters**: Detailed breakdown
- **Average Response Time**: Performance monitoring

#### 7-Day Trend Chart
- **Stacked Bar Chart**: Shows daily usage for both providers
- **Interactive Tooltips**: Hover to see exact counts
- **Color-coded Providers**: Purple/Pink for Gemini, Cyan/Blue for Perplexity

#### Recent Errors Section
- **Error Log**: Last 10 errors with timestamps
- **Status Indicators**: Visual distinction between errors and rate limits
- **Error Messages**: Truncated error details for quick debugging

### 5. Admin Panel Integration (`src/app/admin/page.tsx`)
Integrated the monitoring dashboard prominently in the admin panel, positioned right after the usage analytics cards.

## API Capacity Configuration

### Gemini API (Free Tier)
- **Daily Limit**: 500 requests
- **Model**: gemini-pro
- **Rate Limit Detection**: Automatic detection of quota/rate limit errors

### Perplexity API (Tier 0)
- **Daily Limit**: 720,000 requests (theoretical max: 500 RPM × 60 × 24)
- **Model**: sonar
- **Rate Limit Detection**: HTTP 429 status code detection

## How It Works

### Automatic Logging Flow
1. User submits a practice case answer
2. AI engine attempts to evaluate using available API keys
3. Each API call is logged with:
   - Start time recorded
   - API call executed
   - Response time calculated
   - Status determined (success/error/rate_limit)
   - Log entry created in database
4. Admin dashboard fetches and displays aggregated data

### Real-time Monitoring
- Dashboard auto-refreshes every 30 seconds
- Shows current day's usage vs. capacity
- Displays 7-day historical trend
- Highlights errors and rate limits

## Key Features

### ✅ Real-time Tracking
- Live updates every 30 seconds
- No manual refresh needed

### ✅ Visual Alerts
- Color-coded progress bars
- Percentage indicators
- Clear capacity warnings

### ✅ Historical Trends
- 7-day usage visualization
- Compare Gemini vs. Perplexity usage patterns
- Identify peak usage days

### ✅ Performance Metrics
- Average response times per provider
- Helps identify slow APIs

### ✅ Error Monitoring
- Recent error log
- Rate limit detection
- Error messages for debugging

### ✅ Capacity Planning
- Clear daily limits displayed
- Remaining quota shown
- Helps prevent service disruptions

## Benefits

1. **Prevent Service Disruptions**: Know when you're approaching API limits
2. **Cost Management**: Track Perplexity usage (paid API)
3. **Performance Optimization**: Identify slow response times
4. **Debugging**: Quick access to recent errors
5. **Capacity Planning**: Historical data helps plan for scaling
6. **Provider Comparison**: See which API performs better

## Access

The API Usage Monitor is available at:
- **URL**: `http://localhost:3000/admin`
- **Access**: Admin users only (ravibarnwal89@gmail.com or users with ADMIN role)

## Future Enhancements (Optional)

1. **Email Alerts**: Notify when approaching 80% capacity
2. **Cost Tracking**: Calculate Perplexity API costs based on usage
3. **Monthly Reports**: Automated usage summaries
4. **API Key Rotation**: Automatic failover between multiple keys
5. **Custom Limits**: Configurable daily limits per environment
6. **Export Data**: Download usage reports as CSV

## Technical Stack

- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Frontend**: React + Next.js 16
- **Styling**: Tailwind CSS
- **Charts**: Custom SVG-based visualizations
- **Real-time Updates**: Client-side polling (30s interval)

## Testing

To test the monitoring system:
1. Navigate to `/admin` (must be logged in as admin)
2. Scroll to the "API Usage Monitor" section
3. Submit a practice case to generate API usage
4. Refresh the admin panel to see updated statistics
5. Check the 7-day trend chart for historical data

---

**Status**: ✅ Fully Implemented and Tested
**Build**: ✅ Successful
**Deployment Ready**: ✅ Yes
