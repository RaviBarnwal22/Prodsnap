# Prodsnap - Tech Documentation (One-Pager)

Welcome to **Prodsnap**. This document is designed to give you a 360-degree view of the project, its architecture, and how it functions. Prodsnap is an AI-powered PM interview preparation platform where users practice real-world cases and receive instant, expert-level feedback.

---

## 🚀 1. The Tech Stack
*   **Framework**: Next.js 16 (App Router)
*   **Language**: TypeScript
*   **Database**: PostgreSQL (hosted on Supabase)
*   **ORM**: Prisma
*   **AI Engine**: Google Gemini Pro & Perplexity Sonar
*   **Emails**: Brevo (via Nodemailer)
*   **Styling**: TailwindCSS & Framer Motion (Animations)
*   **Auth**: Supabase Auth (OTP & Social)

---

## 📂 2. Project Architecture (Folder Map)

### **/src/app**
This contains the **UI Routes**.
*   `/practice`: The core experience. Users select categories and solve problems.
*   `/admin`: Protected dashboard for managing users, payments, and monitoring logs.
*   `/api`: Backend endpoints for internal logic (API usage, mentorship, etc.).

### **/src/lib**
The "Brain" of the application.
*   `ai/engine.ts`: Handles all AI logic. Implements the **Gemini-First with Perplexity Fallback** pattern.
*   `ai/prompts.ts`: Contains the system instructions for the AI (The "Interviewer persona").
*   `email.ts`: Central hub for all outgoing emails with automatic DB logging.
*   `prisma.ts`: Database client initialization.
*   `auth.ts`: Helper functions to retrieve and validate sessions.

### **/src/components**
Reusable UI pieces.
*   `AnswerForm.tsx`: THE most critical component. It handles user input, the **Interviewer Hub** chat, and submission logic.
*   `admin/ApiUsageMonitor.tsx`: Real-time dashboard for tracking AI and Email limits.

---

## 💾 3. The Database Schema (Prisma)
Key models to understand:
*   **User**: Profiles, roles (Admin/Student), and subscription linkage.
*   **PracticeQuestion**: The case library (Categories: Product Sense, Metrics, etc.).
*   **PracticeSubmission**: Stores user answers and the JSON feedback returned by the AI.
*   **ApiUsageLog**: Tracks every AI call (Gemini/Perplexity) to monitor API health/costs.
*   **EmailLog**: Tracks every outgoing email to stay within Brevo's 300/day limit.
*   **SubscriptionRequest**: Manual payment proof verification system.

---

## 🤖 4. Core AI Logic (The "Magic")
*   **Interviewer Hub**: A live chat mode inside cases. It uses a **"Firm Persona"**—it will never give the answer. It only asks clarifying questions to help the user frame their solution.
*   **Evaluation Engine**: When a user submits, the engine scores them on 6 key PM dimensions (Goal, Users, Tradeoffs, etc.).
*   **The Fail-Safe**:
    *   Attempt 1: Try **Gemini Pro**.
    *   Failure/Rate Limit: Automatically switch to **Perplexity Sonar**.
    *   Formatting: A recursive regex filter strips out all "AI-isms" (Dashes, bullets, citations) to make feedback feel like it's from a human mentor.

---

## 🛠️ 5. Admin & Monitoring
Access the admin panel at `/admin`.
*   **API Usage Tab**: Monitor Gemini, Perplexity, and Brevo limits in real-time histograms.
*   **Requests Tab**: Review payment screenshots and toggle **Premium Access** for users.
*   **Questions Tab**: Add/Edit the case library.

---

## 🏁 6. Getting Started
1.  Verify `.env` has: `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `GEMINI_API_KEY`, `PERPLEXITY_API_KEY`, `SMTP_PASSWORD`.
2.  `npm install`
3.  `npx prisma db push` (Sync local schema with live DB).
4.  `npm run dev`

---
*Created by Ravi Barnwal & Antigravity AI*
