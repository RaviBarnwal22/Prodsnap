# Practice Answer Persistence Feature

## Date: January 13, 2026

## Overview
Implemented a feature to save and display user's previous practice submissions, allowing them to see their past evaluations when revisiting a question and giving them the option to retry.

## Changes Implemented

### 1. **Database Query - Previous Submission Fetch**
**File**: `src/app/practice/[id]/page.tsx`

Fetches user's most recent submission for the question:
```typescript
let previousSubmission = null
if (user) {
    previousSubmission = await prisma.practiceSubmission.findFirst({
        where: {
            userId: user.id,
            questionId: id
        },
        orderBy: {
            createdAt: 'desc'
        }
    })
}
```

### 2. **Props Passing Through Component Chain**

**PracticeQuestionClient Interface** (`src/components/PracticeQuestionClient.tsx`):
```typescript
interface PracticeQuestionClientProps {
    // ... existing props
    previousSubmission?: {
        answerText: string
        aiScore?: string
        createdAt: string
    }
}
```

**AnswerForm Interface** (`src/components/AnswerForm.tsx`):
```typescript
interface AnswerFormProps {
    // ... existing props
    previousSubmission?: {
        answerText: string
        aiScore?: string
        createdAt: string
    }
}
```

### 3. **State Management in AnswerForm**

**Initialize with Previous Data**:
```typescript
// Initialize result with previous submission if it exists
const [result, setResult] = useState<AIEvaluationResponse | null>(() => {
    if (previousSubmission?.aiScore) {
        try {
            return JSON.parse(previousSubmission.aiScore)
        } catch {
            return null
        }
    }
    return null
})

const [previousAnswer, setPreviousAnswer] = useState(previousSubmission?.answerText || '')
```

**Save New Submissions**:
```typescript
if (response.success && response.aiResponse) {
    setPreviousAnswer(data.answer) // Save the answer for display
    setResult(response.aiResponse)
    // ...
}
```

### 4. **UI Enhancements**

#### A. User's Answer Display
Added a prominent section showing the user's submitted answer:

```tsx
{/* User's Answer */}
{(previousAnswer || previousSubmission) && (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
        <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Info size={20} className="text-gray-600 dark:text-gray-400" />
            Your Answer
        </h4>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
            {previousAnswer || previousSubmission?.answerText}
        </p>
        {previousSubmission?.createdAt && (
            <p className="text-xs text-gray-500 mt-3">
                Submitted: {new Date(previousSubmission.createdAt).toLocaleString()}
            </p>
        )}
    </div>
)}
```

#### B. Clear & Retry Button
Updated the button to clearly indicate users can retry:

**Before**: `Try Another Approach` (gray button)
**After**: `Clear & Retry` (blue gradient button)

```tsx
<button
    onClick={() => {
        setResult(null)
        setPreviousAnswer('')
        setValue('answer', '')
    }}
    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-xl font-bold transition-all shadow-xl flex items-center justify-center gap-2"
>
    Clear & Retry
</button>
```

## User Experience Flow

### First Visit (No Previous Submission)
```
1. User opens practice question
2. Sees question details
3. Submits answer
4. Gets AI evaluation
5. See their answer + evaluation
6. Can "Clear & Retry" to submit again
```

### Revisit (Has Previous Submission)
```
1. User opens same practice question
2. Immediately sees:
   - Their previous answer
   - Previous AI evaluation (scores, feedback, etc.)
   - All solution guides
3. Can click "Clear & Retry" to:
   - Clear the form
   - Submit a new answer
   - Get new evaluation
```

## Features

### ✅ **Answer Persistence**
- User's answer is saved in database
- Automatically displayed on page revisit
- Shows submission timestamp

### ✅ **Evaluation Persistence**  
- Full AI evaluation preserved
- All scores, feedback, strengths/weaknesses shown
- Solution guides remain visible

### ✅ **Easy Retry**
- "Clear &Retry" button clears form
- Allows multiple submissions per question
- Each new submission becomes the "latest"

### ✅ **Context Preservation**
- Users can review their previous attempts
- Compare multiple approaches
- Learn from past mistakes

## Benefits

### 📚 **For Learning**
- Review past attempts any time
- Track improvement over time
- Reference previous feedback

### 🎯 **For Practice**
- No pressure to get it perfect first time
- Experiment with different approaches
- Build on previous attempts

### 💡 **For Understanding**
- See how different answers score
- Learn from AI feedback comparisons
- Identify patterns in high-scoring answers

## Technical Implementation

### Data Flow

```
┌─────────────────────────────────────┐
│  Practice Question Page              │
│  (Server Component)                  │
│                                      │
│  1. Fetch question                   │
│  2. Fetch user's latest submission   │
│     (if exists)                      │
│  3. Pass to PracticeQuestionClient  │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  PracticeQuestionClient              │
│  (Client Component)                  │
│                                      │
│  - Receives previousSubmission       │
│  - Passes to AnswerForm              │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  AnswerForm                          │
│  (Client Component)                  │
│                                      │
│  1. Initialize state with previous   │
│     data (if exists)                 │
│  2. Display evaluation immediately   │
│  3. On new submission:               │
│     - Save answer to previousAnswer  │
│     - Update result state            │
│  4. On "Clear & Retry":              │
│     - Clear all states               │
│     - Reset form                     │
└─────────────────────────────────────┘
```

### Database Query
- **Optimized**: Only fetches latest submission
- **Efficient**: Uses `findFirst` with `orderBy`
- **Fast**: Indexed on userId + questionId

### State Management
- **React State**: Manages UI state client-side
- **Lazy Initialization**: Parses aiScore only once
- **Clean Reset**: Properly clears on retry

## UI/UX Design

### Your Answer Section
```
┌─────────────────────────────────────────┐
│ 📄 Your Answer                          │
│                                         │
│ "I would prioritize the features based  │
│  on user impact and technical          │
│  feasibility..."                        │
│                                         │
│ Submitted: Jan 13, 2026, 8:30 PM       │
└─────────────────────────────────────────┘
```

**Design Notes**:
- Gradient gray background (subtle, not distracting)
- Info icon for clarity
- Timestamp shows when submitted
- Preserves formatting with `whitespace-pre-wrap`

### Clear & Retry Button
```
┌─────────────────────────────────────────┐
│        Clear & Retry                    │
│  (Blue gradient, full width, prominent) │
└─────────────────────────────────────────┘
```

**Design Notes**:
- Blue gradient matches primary brand color
- Clear action label (not ambiguous)
- Full width for easy clicking
- Smooth hover effect

## Edge Cases Handled

### ✅ **No Previous Submission**
- Form shows normally
- No answer section displayed
- Standard submission flow

### ✅ **Corrupted aiScore**
- Try/catch prevents crashes
- Falls back to null result
- User can still retry

### ✅ **Multiple Submissions**
- Always shows latest
- Database handles via `orderBy`
- Previous submissions preserved but not shown

### ✅ **Concurrent Users**
- Each user sees their own submissions
- User ID filter in query
- No cross-user data leakage

## Future Enhancements

### Potential Features:
- 📊 **Attempt History**: Show all attempts, not just latest
- 📈 **Progress Tracking**: Visualize score improvement over time
- 🔄 **Compare Attempts**: Side-by-side comparison of answers
- ⭐ **Favorite Answers**: Mark and save best attempts
- 📝 **Notes**: Add personal notes to submissions
- 🎯 **Goals**: Set target scores and track progress

## Testing Checklist

✅ First-time visit shows empty form
✅ After submission, evaluation displays
✅ Revisit shows previous answer and evaluation
✅ "Clear & Retry" clears form properly
✅ New submission updates the display
✅ Timestamp shows correctly
✅ Answer text preserves formatting
✅ No data shows for unauthenticated users

## Migration Notes

**No Database Migration Required**
- Uses existing `practiceSubmission` table
- No schema changes needed
- Backward compatible

**Deployment Notes**:
- Zero downtime deployment
- No data migration scripts needed
- Works with existing data

---

**Status**: ✅ Production Ready
**Impact**: High (improves learning experience)
**User Benefit**: Can review and retry practice questions
**Breaking Changes**: None
