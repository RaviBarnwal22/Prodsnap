# Mentor Session Suggestion Feature

## Overview
Implemented a feature that suggests users to book a mentor session after completing 5 practice sessions.

## Implementation Details

### 1. **MentorSuggestionModal Component** (`src/components/MentorSuggestionModal.tsx`)
A beautiful, animated modal that:
- Appears after users complete 5 practice sessions
- Features celebration animations with stars and a trophy icon
- Displays clear benefits of mentorship:
  - Accelerate Your Growth
  - Personalized Feedback
  - Real Interview Prep
- Has two action buttons:
  - "Book a Mentor Session" - redirects to `/mentorship` page
  - "Remind me later" - stores dismissal in localStorage
- Auto-dismissal tracking: Won't show again for 7 days after user clicks "Remind me later"

### 2. **API Endpoint** (`src/app/api/submission-count/route.ts`)
- **Route**: `GET /api/submission-count`
- **Authentication**: Uses Supabase auth via `getUser()`
- **Functionality**: 
  - Counts total practice submissions for the logged-in user
  - Returns:
    ```json
    {
      "success": true,
      "count": 5,
      "shouldShowMentorSuggestion": true
    }
    ```
  - Shows suggestion when `count >= 5`

### 3. **AnswerForm Integration** (`src/components/AnswerForm.tsx`)
Modified the practice submission flow to:
1. After successful practice submission and AI feedback
2. Fetch the user's total submission count
3. Check if user should see mentor suggestion (>= 5 submissions)
4. Verify user hasn't dismissed the reminder recently (within 7 days)
5. Show mentor suggestion modal 5 seconds after feedback modal

### Flow Diagram
```
User submits answer
  ↓
AI feedback generated (2s delay)
  ↓
Feedback modal appears
  ↓
Check submission count (API call)
  ↓
If count >= 5 AND not dismissed recently
  ↓
Mentor suggestion modal appears (5s delay)
```

### User Experience
1. **Practice Session**: User practices and gets AI feedback
2. **Feedback Modal**: Shows after 2 seconds
3. **Mentor Suggestion Modal**: Shows 5 seconds after feedback modal (total 7s after submission)
4. **Actions**:
   - Click "Book a Mentor Session" → Redirects to mentorship page
   - Click "Remind me later" → Modal closes, won't show for 7 days

### Features
✅ Automatic trigger after 5 sessions
✅ Beautiful celebration UI with animations
✅ Smart dismissal tracking (7-day cooldown)
✅ Clear call-to-action buttons
✅ Mobile-responsive design
✅ Dark mode support
✅ Smooth transitions and animations

### Technical Stack
- **Frontend**: React, TypeScript, TailwindCSS
- **Icons**: Lucide React
- **Routing**: Next.js App Router
- **Storage**: LocalStorage (for dismissal tracking)
- **Database**: Prisma + SQLite
- **Auth**: Supabase Auth

## Testing
To test the feature:
1. Login to the application
2. Complete 5 practice questions
3. After the 5th submission, the mentor suggestion modal should appear
4. Test the "Book a Mentor Session" button (should redirect to `/mentorship`)
5. Test the "Remind me later" button (should close and not show again for 7 days)

## Future Enhancements
- Add analytics tracking for modal views, clicks, and conversions
- A/B test different messaging and timing
- Show different messages based on user performance
- Add special incentives for first-time mentor bookings
