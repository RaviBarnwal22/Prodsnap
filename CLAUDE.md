# CLAUDE.md

Prodsnap — PM interview-prep platform. Next.js 16 (App Router) · React 19 · TypeScript (strict) · Prisma 5 → Supabase Postgres · Tailwind v4 · Gemini AI · Cashfree payments.

## ⚠️ Critical

**The dev database IS production.** `DATABASE_URL` points at the live Supabase instance. Never run `prisma migrate reset`, `migrate dev`, `db push --force-reset`, or `prisma/seed.ts` (it opens with `deleteMany({})` on 12 tables including `user`).

**`prisma migrate` is broken** — `prisma/migrations/migration_lock.toml` says `sqlite` while the schema says `postgresql`, so any migrate command fails with P3019. Apply schema changes with `npx prisma db push`, then `npx prisma generate`.

**README.md is stale** (claims Next 14, Razorpay, Resend, `tailwind.config.ts` — all wrong) and its troubleshooting section recommends `prisma migrate reset`. Ignore it. `PRODSNAP_ONE_PAGER.md` is accurate.

**Payment keys are live production** (`CASHFREE_ENV=production`). Never exercise a real checkout while testing.

## Env

Two files, identical contents, different readers — edit both or they drift:
- `.env.local` → read by Next.js
- `.env` → read by the Prisma CLI and `tsx scripts/*`

Referenced in code but **missing** from both: `NEXT_PUBLIC_APP_URL`, `ADMIN_EMAIL`, `CRON_SECRET`. They fail silently (broken email links, unguarded cron).

## Conventions

**Identity** — always `getUser()` from `@/lib/auth`. Never call Supabase directly in a page or route. It's request-`cache()`d and creates the Prisma `User` row on first sight.

**Prisma** — always the singleton from `@/lib/prisma`. Never `new PrismaClient()`.

**Admin check** — currently the copy-pasted literal `user?.email === 'ravibarnwal89@gmail.com' || user?.role === 'ADMIN'`, repeated across 14 files. Match it exactly until a `requireAdmin()` helper exists.

**`src/middleware.ts` excludes `/api`** — it only guards `/admin`, `/feedback`, `/dashboard`. Every API route must do its own auth.

**Data fetching is inconsistent** — three patterns coexist (server component → Prisma, server actions, client `fetch` → API route). Prefer server actions for new mutations.

**No UI kit.** Tailwind is written inline; there is no `<Button>`, no `cn()`.

**Money is server-resolved.** Prices live in `MENTORSHIP_SERVICES` / `SUBSCRIPTION_PRICE` in `@/lib/constants`. The order route looks up the amount by `serviceType` and never reads an amount from the request body. Never reintroduce a client-supplied price. Client display must render from the same constants so it cannot drift.

## Helpers

| Need | Use |
|---|---|
| AI evaluation | `evaluateAnswer` from `@/lib/ai/engine` (Gemini→Groq fallback, logs to `ApiUsageLog`) |
| Email | `send*` from `@/lib/email` (nodemailer + Brevo SMTP, logs to `EmailLog`, 300/day cap) |
| Payments | `@/lib/cashfree` |
| Paywall / quotas | `@/lib/subscription` |

## Next.js 16 notes

`params` is a Promise and must be awaited. `cookies()` is async. Turbopack is the default dev bundler. `middleware.ts` is deprecated in favour of `proxy.ts`.

## Token efficiency

Never read these whole — grep for the specific key or function:
`src/lib/seo-content.ts` (906 lines, static data) · `src/lib/email.ts` (908, 13 templates) · `src/app/actions.ts` (751) · `src/app/mentorship/MentorshipClient.tsx` (1066) · `src/components/AnswerForm.tsx` (915)

## Engineering standards

Applies to every change. These are checkable rules, not aspirations — if a rule can't be met, say so rather than quietly skipping it.

**Correctness — verify, don't assume.**
- `npx tsc --noEmit` and `npm run build` must both pass before any change is called done. Never report success on unrun code.
- Trace the full path before editing: who calls this, what breaks downstream. Deleting something requires proving it has zero references first.
- Test the failure path, not just the happy path. A route that "works" is not verified until bad input has been sent to it.
- Never test with live payment credentials. Use `CASHFREE_ENV=sandbox`.

**Security — the client is hostile.**
- Never trust the client for anything that decides money, identity, or access: prices, roles, user ids, quotas. Resolve them server-side from the DB or constants.
- Every API route authenticates itself. `middleware.ts` excludes `/api`, so there is no inherited protection.
- Authorize, don't just authenticate: confirm *this* user may touch *this* record, not merely that someone is logged in.
- Return the minimum. No internal ids, emails, or names in a response the caller doesn't need.
- Secrets stay server-side. `NEXT_PUBLIC_*` is public — never put a key behind that prefix.
- Validate and bound every input before it reaches Prisma or an external API.

**Performance — never make the user wait.**
- Server Components by default; add `'use client'` only for real interactivity.
- Never block first paint on a slow query. Stream with `<Suspense>` and give every async route a `loading.tsx` skeleton.
- Heavy or rarely-used client code (charts, modals, editors) loads via `next/dynamic`.
- Images go through `next/image` with explicit dimensions. Never ship a raw `<img>` for content images.
- Query only the columns needed (`select`), never `findMany()` unbounded — always paginate or `take`.
- Watch the bundle: a new dependency needs a reason. Prefer a few lines over a package.

**SEO — every public page is a landing page.**
- Every route exports `metadata` (or `generateMetadata`) with a unique title, description, canonical URL, and OpenGraph tags.
- One `<h1>` per page, semantic headings in order, descriptive `alt` on every image.
- Content pages render server-side so crawlers see real HTML, never an empty shell hydrated by JS.
- Keep `sitemap.ts` and `robots.ts` current when adding public routes; use `generateStaticParams` for content pages.

**Judgment.** Prefer the small, obvious change. Don't add abstractions for hypothetical needs, don't leave half-finished work, and if a requested change would break something else, say so instead of doing it.

## Commands

```bash
npm run dev              # port 3000, falls back to 3001 if taken
npx prisma db push       # apply schema changes (NOT migrate)
npx prisma generate      # after any schema edit
npx prisma studio        # DB GUI — remember it's production
npm run lint
```

No test framework is configured.
