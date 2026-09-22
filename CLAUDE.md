# CLAUDE.md

Prodsnap — PM interview-prep platform. Next.js 16 (App Router) · React 19 · TypeScript (strict) · Prisma 5 → Supabase Postgres · Tailwind v4 · Gemini AI · Cashfree payments · Brevo SMTP · Calendly.

## ⚠️ Critical

**The dev database IS production.** `DATABASE_URL` points at the live Supabase instance. Never run `prisma migrate reset`, `migrate dev`, `db push --force-reset`, or `prisma/seed.ts` (it opens with `deleteMany({})` on 12 tables including `user`). Local testing writes real rows.

**`prisma migrate` is broken** — `prisma/migrations/migration_lock.toml` says `sqlite` while the schema says `postgresql`, so any migrate command fails with P3019. This is effectively a safety interlock; leave it. Apply schema changes with `npx prisma db push`, then `npx prisma generate`.

**Never run `npm run build` while `npm run dev` is running.** `next build` rewrites `.next` underneath the dev server, which then serves stale chunks — edits appear to have no effect. Stop dev first; if things get weird, `rm -rf .next` and restart.

**README.md is stale** (claims Next 14, Razorpay, Resend, `tailwind.config.ts`) and its troubleshooting section recommends `prisma migrate reset`. Ignore it. `PRODSNAP_ONE_PAGER.md` is accurate.

## Env

Two files, identical contents, different readers — edit both or they drift:
- `.env.local` → read by Next.js
- `.env` → read by the Prisma CLI and `tsx scripts/*`

Both are gitignored, so **nothing env-related is ever pushed** — production values must be set in Vercel separately. `NEXT_PUBLIC_*` is inlined at build time, so changing one needs a rebuild/redeploy, not just a save.

Local Cashfree is **sandbox**; production keys live only in Vercel. Never test checkout against production keys.

Referenced in code but absent everywhere: `ADMIN_EMAIL`, `CRON_SECRET`. Both fail silently.

## Payments (the most intricate area — read before touching)

**Cashfree is the only payment path.** The old UPI-QR + screenshot-upload flow and Razorpay are gone. `/api/subscription-request` still exists but nothing calls it; the admin review UI reads `/api/admin/subscription-requests` for historical rows.

**Money is server-resolved. Never trust the client.** `MENTORSHIP_SERVICES` and `SUBSCRIPTION_PRICE` in `@/lib/constants` are authoritative. `/api/payment/cashfree-order` looks the amount up by `serviceType` and **does not read `amount` from the request body at all** — this previously allowed anyone to pay ₹1 for a ₹1299 session. Client display must render from the same constants so prices cannot drift.

**Bundled perks are server-resolved too.** Each package carries `aiBonusMonths`; on a confirmed payment `/api/payment/cashfree-verify` calls `grantAiAccessBonus`, which resolves the account by `booking.userId` first (the contact email field is user-editable) and **extends** any existing subscription rather than shortening it.

**Packages are public, buying is not.** The grid renders for everyone so crawlers can index the pricing; the CTA becomes "Sign In to Book" when logged out. The real gate is `/api/payment/cashfree-order`, which returns 401 without a session — never weaken that on the assumption the UI blocks it.

**`/api/payment/cashfree-verify` is intentionally unauthenticated** (the post-payment redirect must reach it) but safe: it asks Cashfree for the real `order_status` and only acts on `PAID`. It deliberately returns no customer name or booking id.

Flow: modal → `cashfree-order` (creates pending row + Cashfree order) → SDK checkout → `cashfree-verify` (confirms booking, grants AI month, sends email) → success screen with a Calendly CTA.

## Known broken

**Confirmation emails do not arrive.** Brevo accepts every message (`250 OK`, nothing rejected) but delivery fails. Cause: `SMTP_SENDER` is a `@gmail.com` address relayed through Brevo, which cannot be DKIM-signed. Fix is to authenticate `prodsnap.in` in Brevo, add its DKIM + `include:spf.sendinblue.com` to Cloudflare DNS, then switch the sender to `info@prodsnap.in`. Do not switch the sender before the DNS work — `prodsnap.in` is `p=quarantine`.

**`/api/cron/*` is bypassable** — it authorizes on the forgeable `x-vercel-cron` header. Tightening it requires `CRON_SECRET` to exist in Vercel first, or live cron breaks.

## Security invariants (non-negotiable)

These were each a real vulnerability that got fixed. Breaking one reintroduces a known hole.

1. **A `'use server'` export is a public HTTP endpoint.** Anyone can POST to it by action id — the UI is not a gate, and a page-level or layout-level auth check does NOT protect the actions that page imports. Every exported action calls `getUser()` (or `requireAdmin()`) itself, first line. This is the single easiest mistake to make in this codebase.
2. **Anything that spends money authenticates before spending.** AI calls (Gemini/Groq) and emails (Brevo, 300/day) are billable. An unauthenticated action that reaches either is a free proxy on our keys.
3. **Bound every free-text input before it reaches Prisma, an AI prompt, or an email.** Prisma `String` is Postgres `text` — no ceiling. Use the `MAX_*_CHARS` constants in `@/lib/constants`.
4. **Escape user data in HTML emails** with `esc()` in `@/lib/email`, and `hdr()` for anything in a subject line. Several templates are delivered to the admin, so an unescaped field is a phishing vector against the owner.
5. **Never render model output or user text as HTML unsanitised.** `marked` passes raw HTML through. Every `dangerouslySetInnerHTML` carrying non-static content goes through `DOMPurify.sanitize()`. (JSON-LD built from static `seo-content.ts` is the only exempt case.)
6. **Scope every record lookup to the caller.** Fetch with `where: { id, userId }`, never `where: { id }` alone, unless the record is genuinely public. Ids leak via emailed links.
7. **Enforce quotas server-side.** `/api/start-attempt` is an advisory UI pre-flight only. The real check is `canAttemptCategory()` inside `submitAnswer`, before the AI call, with `incrementCategoryAttempt()` after success.
8. **Keep dependencies patched.** `npm audit --omit=dev` must be clean. Next.js in particular has had repeated critical RCE and middleware-bypass advisories — an outdated Next silently undoes the `/admin` protection.

Not yet fixed — treat as known risk: **there is no rate limiting anywhere**, which amplifies every abuse path (contact form, newsletter signup, AI endpoints, order creation). Adding it is the highest-value remaining security work.

## Conventions

**Identity** — always `getUser()` from `@/lib/auth`. Never call Supabase directly in a page or route. It's request-`cache()`d and creates the Prisma `User` row on first sight.

**Prisma** — always the singleton from `@/lib/prisma`. Never `new PrismaClient()`.

**Admin check** — `isAdmin()` / `requireAdmin()` exist in `@/lib/auth`; use them for new code. **The 15 existing call sites have not been migrated** and still inline `user?.email === 'ravibarnwal89@gmail.com' || user?.role === 'ADMIN'`. Migrating them is outstanding work.

**`src/middleware.ts` excludes `/api`** — it only guards `/admin`, `/feedback`, `/account`, `/dashboard`. Every API route must do its own auth. (`/dashboard` has no route; the guard is kept in case one is added.)

**The signed-in account area is `/account`** (Profile · Orders · Subscription), reached from the header dropdown. It is `noindex`, absent from the sitemap, and server-rendered per user. Queries live in `@/lib/account` and are always scoped to the user resolved by `getUser()` — never to an id supplied by the caller. `AccountLayout` re-checks the session itself rather than trusting middleware.

**Orders are matched on `userId`, then on email only where `userId` is null.** `MentorshipBooking.userId` is a nullable loose column with no Prisma relation, and 4 of 23 live rows have it null. Those 4 are guest bookings with no account at all, so the email branch currently rescues none of them — it exists so a booking is picked up if that person ever signs up with the same (Supabase-verified) address. Do not widen this to match email generally: the contact email on a booking is user-editable.

**Data fetching is inconsistent** — three patterns coexist (server component → Prisma, server actions, client `fetch` → API route). Prefer server actions for new mutations.

**No UI kit.** Tailwind is written inline; there is no `<Button>`, no `cn()`.

**Auth errors are disambiguated.** Supabase returns "Invalid login credentials" for both a missing account and a wrong password; `/api/auth/login` and `AuthModal` check the user table and return `ACCOUNT_NOT_FOUND` or `WRONG_PASSWORD` with a usable message. This is deliberate user enumeration, accepted because the email step already reveals existence.

**Server action IDs change on every rebuild.** A tab open from before a deploy fails with "Failed to find Server Action"; the UI tells the user to refresh. Not a bug — don't chase it.

## Helpers

| Need | Use |
|---|---|
| AI evaluation | `evaluateAnswer` from `@/lib/ai/engine` (Gemini→Groq fallback, logs to `ApiUsageLog`) |
| Email | `send*` from `@/lib/email` (nodemailer + Brevo SMTP, logs to `EmailLog`, 300/day cap) |
| Payments | `@/lib/cashfree` |
| Prices & packages | `@/lib/constants` |
| Paywall / quotas | `@/lib/subscription` |
| Scheduling | `NEXT_PUBLIC_CALENDLY_URL`; UI hides the scheduler entirely when unset |

## Next.js 16 notes

`params` is a Promise and must be awaited. `cookies()` is async. Turbopack is the default dev bundler. `middleware.ts` is deprecated in favour of `proxy.ts`.

## Token efficiency

Never read these whole — grep for the specific key or function:
`src/lib/email.ts` (908, 13 templates) · `src/lib/seo-content.ts` (906, static data) · `src/components/AnswerForm.tsx` (915) · `src/app/mentorship/MentorshipClient.tsx` (1082) · `src/app/actions.ts` (738)

## Engineering standards

Applies to every change. These are checkable rules, not aspirations — if a rule can't be met, say so rather than quietly skipping it.

**Correctness — verify, don't assume.**
- `npx tsc --noEmit` and `npm run build` must both pass before any change is called done. Never report success on unrun code.
- Trace the full path before editing: who calls this, what breaks downstream. Deleting something requires proving it has zero references first.
- Test the failure path, not just the happy path. A route that "works" is not verified until bad input has been sent to it.
- Client-rendered UI can't be verified with `curl` — say so rather than implying it was checked.
- Never test with live payment credentials. Use `CASHFREE_ENV=sandbox`.

**Security — the client is hostile.** (See "Security invariants" above for the non-negotiables.)
- Never trust the client for anything that decides money, identity, or access: prices, perks, roles, user ids, quotas. Resolve them server-side from the DB or constants.
- Every API route AND every server action authenticates itself. `middleware.ts` excludes `/api`, so there is no inherited protection.
- Authorize, don't just authenticate: confirm *this* user may touch *this* record, not merely that someone is logged in.
- Return the minimum. No internal ids, emails, or names in a response the caller doesn't need.
- Secrets stay server-side. `NEXT_PUBLIC_*` is public — never put a key behind that prefix.
- Validate and bound every input before it reaches Prisma, an email body, or an AI prompt.

**Performance — never make the user wait.**
- Server Components by default; add `'use client'` only for real interactivity.
- Never block first paint on a slow query. Stream with `<Suspense>` and give every async route a `loading.tsx` skeleton.
- Heavy or rarely-used client code (charts, modals, editors) loads via `next/dynamic`.
- Images go through `next/image` with explicit dimensions. Never ship a raw `<img>` for content images.
- Query only the columns needed (`select`), never `findMany()` unbounded — always paginate or `take`.
- Watch the bundle: a new dependency needs a reason. Prefer a few lines over a package.
- Modals need `max-h` plus an `overflow-y-auto` body, or they clip their own submit button.

**SEO — every public page is a landing page.** Organic search is the growth channel; a change that costs rankings costs revenue. The full standard is in [SEO standard](#seo-standard) below — it is mandatory for every public route, not optional polish.

**Copy must match reality.** Never promise something the product doesn't deliver — a free month has to be granted in code, a "book a slot" link has to exist. Removing a feature means removing its marketing copy too.

**Judgment.** Prefer the small, obvious change. Don't add abstractions for hypothetical needs, don't leave half-finished work, and if a requested change would break something else, say so instead of doing it.

## SEO standard

Organic search is how Prodsnap is found. Treat every rule here as a build-blocker, the same as a type error: if a change can't meet one, say so rather than shipping past it.

### The rule that outranks all the others

**Nothing that wraps `{children}` may be loaded with `next/dynamic` + `ssr: false`.**

A component loaded that way renders a `BailoutToCSR` boundary. If it is an *ancestor* of the page, Next abandons server rendering for the whole route and the crawler receives an empty shell. This is exactly what `ClientProviders` did by lazy-loading `AuthProvider` — for a long stretch **every page on the site served zero `<h1>` and zero content to Google**, while looking perfect in a browser. All the metadata, sitemaps and schema in the world are worthless underneath this bug.

`ssr: false` is still fine for a component that renders **no visible markup and wraps nothing** (analytics, session timers). Wrap each one in its own `<Suspense>` so its bailout stays contained.

**The header must stay cookie-free.** `<Header />` is a static shell; the account state is resolved in the browser by `HeaderAuth` via `/api/auth/me`. That is what allows the homepage, the six pillar pages and every content page to be statically generated. Re-introducing `getUser()` (or anything reading `cookies()`) into `Header` would quietly drag all of them back to dynamic rendering — the build output is the tell: `○` and `●` are good, `ƒ` on a content route means something started reading cookies.

Catching it is one command — it must print `0`:

```bash
curl -s http://localhost:3000/ | grep -c "BAILOUT_TO_CLIENT_SIDE_RENDERING"
```

### Per-route checklist

Every new or edited **public** route satisfies all of these before it is called done:

- **Metadata.** Exports `metadata` or `generateMetadata` with a unique `title`, a unique `description` (~150–160 chars, written to earn a click, not to repeat the title), `alternates.canonical`, and `openGraph`. A client-component page can't export metadata — give it a sibling `layout.tsx` that does.
- **Canonical on every page.** Self-referencing, absolute via `metadataBase`, no trailing slash, no query string. Duplicate or missing canonicals split ranking signals.
- **One `<h1>`.** Exactly one, containing the page's target keyword phrasing in natural language. Headings descend in order — never skip a level for styling.
- **Server-rendered content.** The crawler must receive the real copy in the HTML response. Anything gated behind `useState`/`useEffect`/login is invisible to Google.
- **Never hide commercial content behind auth.** Prices, package names and features render for logged-out visitors; put the login gate on the *action* (the CTA opens the auth modal), never on the information. Hiding prices costs both rankings and conversions.
- **Images.** `next/image` with explicit dimensions and a descriptive `alt` that reads as a sentence, not a keyword list. Decorative images get `alt=""` plus `aria-hidden`.
- **Sitemap + robots.** Add the route to `src/app/sitemap.ts` with an honest `changeFrequency` and `priority`. Private or transactional routes get `robots: { index: false }` in their layout — **not** a `robots.txt` Disallow, because a disallowed URL can still be indexed from an inbound link while Google is blocked from seeing the `noindex`.
- **Content pages are static.** Anything rendered from `SEOContentData` uses `generateStaticParams` + `force-static`.

### Metadata contract

- `metadataBase` is set once in `src/app/layout.tsx`; every canonical below it is a root-relative path (`"/mentorship"`), never a hardcoded absolute URL.
- **`alternates` is inherited, and that is a trap.** The root layout sets `canonical: "/"`, so any page that does not set its own `alternates` silently declares itself a duplicate of the homepage. This actually shipped: six pillar pages and `/practice` all pointed at `https://prodsnap.in`. Every indexable route must set its own canonical — a missing one is worse than no canonical at all.
- Titles: `Primary Keyword | Qualifier | Prodsnap`, under ~60 characters so they don't truncate in the SERP. Every title on the site is unique.
- The root layout's metadata *is* the homepage's metadata. Changing it changes the homepage.
- `keywords` has near-zero ranking value — keep it short and honest, and never treat it as a substitute for the keyword actually appearing in the `h1`, body copy and internal anchors.

### Structured data

- `Organization` + `WebSite` ship site-wide from `SiteStructuredData` in the root layout. Page-level schema is additive — never re-declare those two on a page.
- Content pages emit `Article` + `FAQPage` + `BreadcrumbList` via `SEODetailPage`. `/mentorship` emits `Service` with an `Offer` per package.
- **Offers are generated from `MENTORSHIP_SERVICES` in `@/lib/constants`, never retyped.** A price in a rich result that disagrees with the price at checkout is a compliance problem, not a typo.
- Only mark up what is **visible on the page**. Schema describing content a user can't see is a manual-action risk.
- Every block must be valid JSON. Verify with the JSON-LD parse check below before shipping.

### Content and keyword strategy

Ranking for head terms like "product management" is a domain-authority contest against Product School, Atlassian, Reforge and Lenny's — it is not winnable with on-page work alone, and pretending otherwise wastes effort. Prodsnap wins on **specific, high-intent, long-tail queries** and compounds authority from there:

- Target the question a candidate actually types: *"design Uber for kids product sense answer"*, *"Swiggy delivery time RCA case"*, *"RICE vs ICE prioritization"*, *"PM interview questions India"*.
- Prefer India-context and named-company cases — far less competition, and they match the product's real differentiator.
- One page per query intent. Two pages chasing the same intent cannibalise each other; consolidate and redirect instead.
- Depth beats volume. A thin page on a competitive term ranks for nothing and drags sitewide quality signals down.
- **E-E-A-T is the moat.** Ravi is a practising PM — every content page carries a real author with a real LinkedIn. Keep it that way.
- New content lives in `src/lib/seo-content.ts` so it inherits the static rendering, schema, breadcrumbs and sitemap entry automatically. Adding a route by hand means re-earning all of that.

### Internal linking

- Every new content page is linked from its pillar page **and** from at least one sibling. An orphan page is a page Google discovers late and trusts less.
- Anchor text is the target's keyword, never "click here" or a bare URL.
- Links to money pages (`/mentorship`, `/practice`) belong in the body copy of relevant content pages, not only in the nav.

### Performance is a ranking factor

Core Web Vitals are measured on real users. The rules in **Performance** above are SEO rules too — in particular: no layout shift from late-loading images, no render-blocking work before the LCP element, and never block first paint on a slow query.

### Verification — run these, don't assume

`npm run build` must pass, then against a running server:

```bash
# 1. No route may bail out of server rendering — every line must print 0
for p in "" about mentorship community practice frameworks glossary; do
  echo -n "/$p "; curl -s "http://localhost:3000/$p" | grep -c "BAILOUT_TO_CLIENT_SIDE_RENDERING"
done

# 2. Exactly one <h1> per page, and a unique <title>
for p in "" about mentorship; do
  echo -n "/$p h1="; curl -s "http://localhost:3000/$p" | grep -o "<h1" | wc -l
  curl -s "http://localhost:3000/$p" | grep -o "<title>[^<]*</title>"
done

# 3. Canonical present and correct
curl -s http://localhost:3000/mentorship | grep -o 'rel="canonical" href="[^"]*"'

# 4. Commercial content is in the HTML a logged-out crawler receives
curl -s http://localhost:3000/mentorship | grep -c "PM Career Accelerator"

# 5. OG image resolves (generated by src/app/og-image.png/route.tsx)
curl -s -o /dev/null -w "%{http_code} %{content_type}\n" http://localhost:3000/og-image.png
```

Every JSON-LD block must also parse. Save this as a scratch file and run it with `node`:

```js
// node check-jsonld.js http://localhost:3000/frameworks/rice
const url = process.argv[2]
const html = await (await fetch(url)).text()
const re = /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g
let m, i = 0
while ((m = re.exec(html))) {
  i++
  try { console.log(i, "VALID", JSON.parse(m[1])["@type"]) }
  catch (e) { console.log(i, "INVALID", e.message) }
}
if (!i) console.log("no JSON-LD found")
```

Client-rendered UI still can't be verified by `curl` alone — but if `curl` can't see the content, **neither can Google**, which is the point of every check above.

### Things that will get the site penalised — never do them

Keyword stuffing, doorway pages spun from a template with swapped nouns, schema describing invisible content, hidden text, auto-generated filler, cloaking (serving crawlers different HTML), or buying links. Prodsnap's ranking case rests on genuinely useful PM content written by a practitioner; anything that trades that for a short-term signal is not worth shipping.

### Known gaps — not yet fixed

- **The free-attempt limit disagrees with itself.** `@/lib/constants` exports `FREE_ATTEMPT_LIMIT = 5` and the practice page shows that number, but `src/app/api/start-attempt/route.ts` redeclares its own `const FREE_ATTEMPT_LIMIT = 3` and enforces it. Users are cut off two attempts before the UI says they will be. Unifying it is a revenue decision (3 → 5 gives away more free AI calls), so it needs the founder's call, not a silent fix.
- **Jobs feature is recoverable, not rebuildable.** The `Job` model is still in the schema and the table exists but holds **0 rows**. The six deleted files (~1,260 lines) are in commit `8cd6977`. Restoring the UI without wiring a data source ships an empty page.
- **`/blog` is a bare redirect to `/community`.** Fine as a redirect; it is deliberately excluded from the sitemap.
- Confirmation-email deliverability (see **Known broken**) indirectly hurts conversion from organic traffic.

## Commands

```bash
npm run dev              # port 3000, falls back to 3001 if taken
npx prisma db push       # apply schema changes (NOT migrate)
npx prisma generate      # after any schema edit
npx prisma studio        # DB GUI — remember it's production
npm run lint
```

No test framework is configured.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
