# Prodsnap Expert Review & Training System

## Date: January 13, 2026

## Overview
This system allows admins and experts to review AI-generated evaluations of user practice submissions. It serves two purposes:
1.  **Human-in-the-Loop Feedback**: Providing users with expert corrections to AI responses.
2.  **Dataset Curation**: Marking high-quality "Gold Standard" responses to train or fine-tune future AI models.

## New Database Fields

### `PracticeSubmission`
- `isGoldStandard` (Boolean): Flag to identify high-quality submission-evaluation pairs for model training.

### `Review`
- `aiAccuracy` (Int: 1-5): Expert rating of how accurate the AI evaluation was.
- `type`: Set to `"EXPERT"` for evaluations submitted through this system.

## Features

### 1. Expert Evaluation Modal
Admins can now open an evaluation modal for any user submission in the Admin Portal.
*   **User's Answer**: Viewed alongside AI feedback for context.
*   **Expert Score**: Admin provides their own 1-5 star rating.
*   **AI Accuracy Rating**: Admin rates the AI's performance (1-5).
*   **Expert Feedback**: A text area to provide detailed corrections or additional insights.
*   **Gold Standard Toggle**: Mark the submission as a "Gold Standard" example for future model training.

### 2. Admin Dashboard Integration
The User Detail view in the Admin Portal now includes:
*   **Expert Review Button**: Located on each submission card.
*   **Expert Score Badge**: Displays the human score next to the AI score if a review exists.
*   **Gold Standard Badge**: A prominent crown icon for curated data.
*   **Expert Correction Snippet**: Shows the expert's feedback directly on the card for quick review.

### 3. Training Flywheel
By marking submissions as "Gold Standard" and providing "Expert Corrections," you are building a dataset that can be exported (as JSONL) to:
- Fine-tune Gemini 1.5 Flash/Pro.
- Improve prompting via few-shot learning (using historical 5/5 examples).
- Benchmark AI accuracy improvements over time.

## User Flow (Admin)
1.  **Navigate** to Admin Dashboard → User Management.
2.  **Select** a user to view their detailed activity.
3.  **Review** a submission by clicking the "Expert Review" button.
4.  **Evaluate**: Compare AI response with user answer, provide expert feedback.
5.  **Save**: Click "Submit Evaluation" to persist the review and update the Gold Standard status.

## Technical Details

### Server Action: `submitExpertReview`
Located in `src/app/actions.ts`, this action:
- Validates admin permissions.
- Creates a new `Review` record of type `EXPERT`.
- Updates the `isGoldStandard` flag on the `PracticeSubmission`.
- Revalidates the Admin path to show updated data.

### Data Fetching
Modified `src/app/admin/page.tsx` to include:
- `isGoldStandard` in the submission selection.
- The latest `EXPERT` review for each submission.

## Benefits
*   **Quality Control**: Monitor and improve the accuracy of the AI engine.
*   **Future-Proofing**: Collect structured data today to build the best PM AI coach tomorrow.
*   **Expert Credibility**: Supplementing AI with human expertise builds trust with premium users.
