# Prodsnap

Prodsnap is an AI-powered platform for practicing product management case studies with adaptive frameworks and instant feedback.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database**: [PostgreSQL](https://postgresql.org/) (via [Supabase](https://supabase.com/))
- **ORM**: [Prisma](https://www.prisma.io/)
- **AI**: Google Gemini API
- **Deployment**: [Vercel](https://vercel.com/)

## Repository & Deployment Strategy

This project follows a professional two-branch deployment strategy to ensure stability and reliable testing.

### Branches

- **`main` (Production)**
  - Represents the live, stable version of the application.
  - Automatically deployed to the production domain (e.g., `prodsnap.ai`).
  - **Rule**: Direct commits are discouraged. Changes should be merged from `develop`.

- **`develop` (Staging)**
  - The integration branch for testing new features.
  - Automatically deployed to the staging URL (e.g., `https://prodsnap-git-develop.vercel.app/`).
  - **Rule**: All feature branches should merge into `develop` first.

- **Feature Branches**
  - Created for individual tasks or features (e.g., `feature/login-redesign`).
  - Deployed to unique Preview URLs on Vercel for isolated testing.

### Deployment Workflow

1.  Create a feature branch from `develop`.
2.  Push changes and open a Pull Request (PR) to `develop`.
3.  Vercel automatically builds a Preview URL.
4.  Once verified, merge to `develop` (deploys to Staging).
5.  Perform final verification on Staging.
6.  Merge `develop` into `main` (deploys to Production).

## Health Check & Monitoring

A health check endpoint is available to verify application status and database connectivity:

- **Endpoint**: `/api/health`
- **Response**: JSON object with status, timestamp, and database connection state.

## Getting Started

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/RaviBarnwal22/Prodsnap.git
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Copy `.env.example` to `.env` (if available) or ensure the following variables are set:
    - `DATABASE_URL`
    - `DIRECT_URL`
    - `GEMINI_API_KEY_1`
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4.  **Run Development Server**:
    ```bash
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) with your browser.
