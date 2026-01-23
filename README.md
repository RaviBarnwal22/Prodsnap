# ProdSnap - Quick Reference Guide

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables (copy .env.example to .env.local)
cp .env.example .env.local

# Run database migrations
npx prisma migrate dev

# Seed the database
npx prisma db seed

# Start development server
npm run dev
```

## 📁 Important Files & Folders

### Configuration
- `/.env.local` - Environment variables (secrets, API keys)
- `/prisma/schema.prisma` - Database schema
- `/tailwind.config.ts` - Tailwind CSS configuration
- `/next.config.ts` - Next.js configuration

### Core Application
- `/src/app/**` - All pages and routes (Next.js App Router)
- `/src/components/**` - Reusable React components
- `/src/lib/**` - Shared utilities, helpers, and configurations
- `/src/middleware.ts` - Route protection and authentication

### Database & Scripts
- `/prisma/seed.ts` - Database seeding script
- `/scripts/make-admin.ts` - Promote user to admin

## 🛠️ Common Commands

```bash
# Development
npm run dev                    # Start dev server (localhost:3000)
npm run build                  # Build for production
npm start                      # Start production server

# Database
npx prisma studio              # Open Prisma Studio (DB GUI)
npx prisma migrate dev         # Create & run migrations
npx prisma db seed             # Seed database with sample data
npx prisma generate            # Regenerate Prisma Client

# Admin Operations
npx tsx scripts/make-admin.ts  # Promote user to admin role

# Code Quality
npm run lint                   # Run ESLint
```

## 📂 Project Structure at a Glance

```
prodsnap/
├── src/
│   ├── app/                # Pages & API routes
│   │   ├── (pages)/       # Public pages
│   │   ├── admin/         # Admin dashboard
│   │   ├── api/           # Backend endpoints
│   │   └── login/         # Authentication
│   ├── components/        # Reusable UI components
│   └── lib/               # Utilities & configs
├── prisma/                # Database schema & seeds
├── public/                # Static assets
└── scripts/               # Utility scripts
```

## 🔑 Key Features

### 1. Interview Practice (`/practice`)
- Browse PM interview questions
- Submit timed answers
- Get AI-powered feedback
- Track your progress

### 2. Product Puzzles (`/prodsense`)
- Daily product management puzzles
- Leaderboard & streaks
- Build product thinking skills

### 3. Expert Mentorship (`/mentorship`)
- View mentor credentials
- Book 1:1 sessions
- Payment via UPI
- Upload payment proof

### 4. Admin Dashboard (`/admin`)
- User management
- Premium access control
- Mentorship booking reviews
- Support ticket queue
- Training data export

## 🔐 Authentication Flow

1. User signs up/logs in via Supabase Auth
2. Middleware checks session on protected routes
3. User record synced in Prisma database
4. Role-based access control (STUDENT/EXPERT/ADMIN)

## 🗄️ Database Models

Key models in Prisma schema:
- **User** - User accounts & profiles
- **PracticeQuestion** - Interview questions
- **PracticeSubmission** - User answers & AI scores
- **Subscription** - Premium access tracking
- **Booking** - Mentorship session bookings
- **Review** - Expert feedback on submissions

## 🎨 Styling

- **Framework**: Tailwind CSS
- **Dark Mode**: Supported via `dark:` prefix
- **Global Styles**: `/src/app/globals.css`
- **Icons**: Lucide React

## 🧪 Environment Variables

Required in `.env.local`:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Database
DATABASE_URL=

# AI (Google Gemini)
GEMINI_API_KEY=

# Email (Resend)
RESEND_API_KEY=

# Payment (Razorpay)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

## 📝 Adding New Features

### Add a new page:
1. Create file in `/src/app/[page-name]/page.tsx`
2. Add route protection in `/src/middleware.ts` if needed
3. Update navigation in `/src/components/Header.tsx`

### Add a new API endpoint:
1. Create file in `/src/app/api/[endpoint]/route.ts`
2. Use `export async function GET/POST()` format
3. Handle authentication if required

### Add a new database table:
1. Edit `/prisma/schema.prisma`
2. Run `npx prisma migrate dev --name [migration-name]`
3. Update `/prisma/seed.ts` if needed

## 🐛 Troubleshooting

### Port already in use
```bash
lsof -ti:3000 | xargs kill -9
npm run dev
```

### Database issues
```bash
npx prisma migrate reset  # Warning: Deletes all data!
npx prisma db push        # Push schema without migration
```

### Build errors
```bash
rm -rf .next node_modules
npm install
npm run dev
```

## 📚 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL via Prisma
- **Auth**: Supabase Auth
- **Styling**: Tailwind CSS
- **AI**: Google Gemini API
- **Email**: Resend
- **Payments**: Razorpay
- **Deployment**: Vercel

## 🤝 Contributing

1. Create a new branch: `git checkout -b feature/your-feature`
2. Make changes and test locally
3. Commit: `git commit -m "feat: your feature"`
4. Push: `git push origin feature/your-feature`
5. Create Pull Request

## 📄 License

Proprietary - All rights reserved

---

**Need help?** Contact: ravibarnwal89@gmail.com
