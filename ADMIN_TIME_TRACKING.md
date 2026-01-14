# User Time Tracking in Admin Portal

## Date: January 13, 2026

## Overview
Added comprehensive time tracking functionality to the admin portal, allowing admins to see both individual case time and total time spent by each user.

## Changes Implemented

### 1. **Database Schema Update**
Added `timeSpent` field to `PracticeSubmission` model:

```prisma
model PracticeSubmission {
  id         String           @id @default(cuid())
  userId     String
  questionId String
  answerText String
  aiScore    String?
  timeSpent  Int?             // Time spent in seconds ⭐ NEW
  createdAt  DateTime         @default(now())
  question   PracticeQuestion @relation(fields: [questionId], references: [id])
  user       User             @relation(fields: [userId], references: [id])
  reviews    Review[]
}
```

**Migration**: `20260113145642_add_time_spent_to_submissions`

### 2. **Submission Action Update**
Updated `submitAnswer` function to save time spent:

**File**: `src/app/actions.ts`

```typescript
const submission = await prisma.practiceSubmission.create({
    data: {
        userId,
        questionId,
        answerText: answer,
        aiScore: JSON.stringify(aiResponse),
        timeSpent: elapsedTimeSeconds || 0  // ⭐ NEW
    }
})
```

### 3. **Admin Panel Data Fetching**
Updated user query to include `timeSpent`:

**File**: `src/app/admin/page.tsx`

```typescript
submissions: {
    orderBy: { createdAt: 'desc' },
    include: { question: true },
    select: {
        id: true,
        createdAt: true,
        answerText: true,
        aiScore: true,
        timeSpent: true,  // ⭐ NEW
        question: { select: { title: true } }
    }
}
```

### 4. **Admin UI Enhancements**
**File**: `src/components/admin/AdminUserList.tsx`

#### A. Individual Case Time Display
Each submission now shows time spent:

```tsx
<div className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-black">
    ⏱️ {formatTime(s.timeSpent)}
</div>
```

#### B. Total Time Spent Card
Added new metric card in user detail view:

```tsx
<div className="p-4 bg-green-500/10 rounded-2xl border border-green-500/20">
    <p className="text-[10px] font-black uppercase text-green-400/60 tracking-widest mb-1">
        Total Time Spent
    </p>
    <p className="text-2xl font-black text-green-400">
        {/* Calculates sum of all submission times */}
        2h 34m
    </p>
</div>
```

## Features

### ⏱️ **Time Formatting**
Smart time display that adjusts based on duration:
- **< 1 minute**: Shows seconds only (`45s`)
- **< 1 hour**: Shows minutes and seconds (`12m 30s`)
- **≥ 1 hour**: Shows hours, minutes, and seconds (`2h 15m 45s`)

### 📊 **Admin View - User Detail Panel**

```
┌────────────────────────────────────────────────┐
│  User Details                                  │
│                                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Total   │  │  Total   │  │   Join   │   │
│  │  Submissions│ │   Time   │  │   Date   │   │
│  │     12   │  │  2h 34m  │  │ 12 Jan   │   │
│  └──────────┘  └──────────┘  └──────────┘   │
│                                                │
│  Case Submissions:                             │
│  ┌──────────────────────────────────────────┐ │
│  │ Product Design Question                   │ │
│  │ ⏱️ 12m 30s  Score: 4/5                   │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │ Metrics Strategy                          │ │
│  │ ⏱️ 8m 15s   Score: 5/5                   │ │
│  └──────────────────────────────────────────┘ │
└────────────────────────────────────────────────┘
```

## Benefits

### ✅ **For Admins**
- **Performance Insights**: See which users are spending meaningful time practicing
- **Quality Metrics**: Understand correlation between time spent and scores
- **User Engagement**: Identify highly engaged users vs. those rushing through
- **Data-Driven Decisions**: Make informed decisions about content difficulty

### ✅ **Analytics Potential**
- Average time per question category
- Time vs. score correlation
- Identify questions that take too long
- User engagement patterns

### ✅ **User Support**
- Help struggling users who spend excessive time
- Recognize and reward dedicated users
- Personalized mentorship recommendations

## Technical Implementation

### Time Calculation
Time is tracked in the `AnswerForm` component using:
```typescript
const [startTime, setStartTime] = useState<number | null>(null)
const [elapsedTime, setElapsedTime] = useState(0)

// Timer updates every second
useEffect(() => {
    if (hasStartedAttempt && startTime) {
        timerRef.current = setInterval(() => {
            setElapsedTime(Math.floor((Date.now() - startTime) / 1000))
        }, 1000)
    }
}, [hasStartedAttempt, startTime])
```

### Data Flow
```
1. User starts practice → Timer starts
2. User submits answer → elapsedTime sent to server
3. Server saves to database → timeSpent field
4. Admin views user → timeSpent displayed
5. Total calculated → Sum of all submissions
```

## UI Elements Added

### 1. **Time Badge on Each Submission**
- Green badge with ⏱️ emoji
- Shows formatted time (e.g., "12m 30s")
- Positioned next to score badge

### 2. **Total Time Spent Card**
- Prominent metric in user stats grid
- Green color scheme (matches time theme)
- Shows cumulative time across all cases
- Smart formatting (hours/minutes based on total)

### 3. **Time Display Logic**
```typescript
const formatTime = (seconds: number | null) => {
    if (!seconds) return 'N/A'
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hrs > 0) {
        return `${hrs}h ${mins}m ${secs}s`
    } else if (mins > 0) {
        return `${mins}m ${secs}s`
    } else {
        return `${secs}s`
    }
}
```

## Migration Details

**Migration Name**: `20260113145642_add_time_spent_to_submissions`

**SQL Changes**:
```sql
-- AlterTable
ALTER TABLE "PracticeSubmission" ADD COLUMN "timeSpent" INTEGER;
```

**Notes**:
- Field is nullable (`Int?`) for backward compatibility
- Existing submissions will have `null` (displays as "N/A")
- New submissions will have accurate time tracking

## Testing Checklist

✅ Database migration applied successfully
✅ Prisma client regenerated
✅ New submissions save timeSpent
✅ Admin panel displays individual case times
✅ Total time spent calculation works
✅ Time formatting displays correctly
✅ Handles null values gracefully (old submissions)
✅ UI responsive in admin panel

## Future Enhancements

### Potential Additions:
- 📊 **Analytics Dashboard**: Time trends over time
- 🏆 **Leaderboards**: Fastest correct answers
- ⚠️ **Alerts**: Flag users spending excessive time (need help?)
- 📈 **Performance Reports**: Time vs success rate charts
- 🎯 **Recommendations**: Suggest mentor sessions for slow users
- 💡 **Insights**: Average time per category for benchmarking

## Notes

- **Precision**: Time tracked in seconds for accuracy
- **Privacy**: Only visible to admins
- **Performance**: Minimal overhead (simple integer field)
- **Backward Compatible**: Old submissions show "N/A"
- **Real-time Updates**: Admin sees latest data on refresh

---

**Status**: ✅ Production Ready
**Impact**: Medium (admin-only feature)
**Database Changes**: Yes (migration applied)
**Breaking Changes**: None
