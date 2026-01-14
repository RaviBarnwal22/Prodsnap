# Practice Questions Sequencing & Masking

## Date: January 13, 2026

## Overview
Updated the practice questions system to mask question content and present them in a sequenced order based on difficulty levels.

## Changes Implemented

### 1. **Difficulty-Based Sequencing**
Questions are now automatically sorted by difficulty level:
- **Easy** → **Medium** → **Hard**

#### Implementation Details:
```typescript
const difficultyOrder: Record<string, number> = {
    'easy': 1,
    'Easy': 1,
    'medium': 2,
    'Medium': 2,
    'hard': 3,
    'Hard': 3
}

// Sort each category's questions by difficulty
Object.keys(groupedQuestions).forEach(category => {
    groupedQuestions[category].sort((a, b) => {
        const orderA = difficultyOrder[a.difficulty] || 999
        const orderB = difficultyOrder[b.difficulty] || 999
        return orderA - orderB
    })
})
```

### 2. **Question Masking**
Question titles and descriptions are now hidden on the practice page:

#### Before:
- **Title**: "Design a food delivery app for Tier-2 cities"
- **Description**: "PhonePe wants to enter the food delivery market..."

#### After:
- **Title**: "Question #1"
- **Description**: "Easy level challenge • Click to reveal and practice"

### 3. **Sequential Numbering**
Questions are numbered sequentially within each category:
- Question #1 (Easy)
- Question #2 (Easy)
- Question #3 (Medium)
- Question #4 (Medium)
- Question #5 (Hard)
- etc.

## User Experience Flow

### 1. **Category Selection**
Users select a category (e.g., "Product Design", "Metrics")

### 2. **Sequenced View**
Users see masked questions in difficulty order:
```
┌─────────────────────────────┐
│  #1        [EASY]           │
│  Question #1                 │
│  Easy level challenge •      │
│  Click to reveal            │
│  [Start Challenge →]        │
└─────────────────────────────┘

┌─────────────────────────────┐
│  #2        [EASY]           │
│  Question #2                 │
│  Easy level challenge •      │
│  Click to reveal            │
│  [Start Challenge →]        │
└─────────────────────────────┘

┌─────────────────────────────┐
│  #3        [MEDIUM]         │
│  Question #3                 │
│  Medium level challenge •    │
│  Click to reveal            │
│  [Start Challenge →]        │
└─────────────────────────────┘
```

### 3. **Progressive Difficulty**
Users naturally progress from easier to harder questions:
- Builds confidence with easy questions
- Gradually increases challenge level
- Clear progression path

## Benefits

### ✅ **Prevents Question Bias**
- Users can't pre-judge questions by title
- Forces engagement with all difficulty levels
- Eliminates cherry-picking behavior

### ✅ **Creates Structure**
- Clear learning progression
- Easy → Medium → Hard flow
- Numbered sequence creates a sense of completion

### ✅ **Improves Practice Quality**
- Users tackle questions in optimal order
- Better skill development through progressive difficulty
- Encourages systematic practice

### ✅ **Gamification**
- Numbered challenges feel like levels
- Clear progress tracking
- Motivation to complete sequences

## Visual Changes

### Question Card Components:

**Icon Badge**: Changed from sparkle icon to numbered badge
```tsx
// Before: <Sparkles size={18} />
// After:  #{index + 1}
```

**Title**: Masked with sequential number
```tsx
// Before: {q.title}
// After:  Question #{index + 1}
```

**Description**: Generic placeholder text
```tsx
// Before: {q.description}
// After:  {q.difficulty} level challenge • Click to reveal and practice
```

**CTA Text**: Updated for clarity
```tsx
// Before: Begin Training
// After:  Start Challenge
```

## Technical Details

### Files Modified:
- `src/app/practice/page.tsx`

### Key Functions:
1. **Difficulty Sorting**: Sorts questions within each category by difficulty
2. **Sequential Indexing**: Uses array index for numbering (0-based → 1-based)
3. **Masked Display**: Shows generic titles instead of actual content

### Difficulty Order:
```
Easy (1) → Medium (2) → Hard (3)
```

Any unknown difficulty defaults to 999 (appears last)

## Future Enhancements

### Potential Additions:
- 🔒 Lock harder questions until easier ones are completed
- ⭐ Show completion status (✓ for completed questions)
- 📊 Progress bar showing "X of Y completed in this category"
- 🏆 Unlock badges for completing all questions in a category
- 💡 Recommended next question based on performance

## Testing Checklist

✅ Questions appear in Easy → Medium → Hard order
✅ Question titles show as "Question #1", "Question #2", etc.
✅ Descriptions are masked with generic text
✅ Difficulty badges still display correctly
✅ Sequential numbering starts at 1 for each category
✅ Clicking a question reveals full content on detail page
✅ All categories maintain proper sorting

---

**Migration Required**: No database changes needed
**Backwards Compatible**: Yes, existing questions work as-is
**User Impact**: Improved practice experience with structured progression
