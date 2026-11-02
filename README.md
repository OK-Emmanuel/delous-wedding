# 💍 DELOUS '26 — Wedding Experience & Guest Management Platform

The digital home of **Olasubulumi Adesola & Dare Samuel**'s wedding —
Saturday, **28 November 2026**, Lagos, Nigeria.

A royal, culturally expressive public wedding website combined with an open
individual-registration platform, secure QR admission tickets and a private
administrative command centre with a mobile check-in system.

Built to the specification in [`docs/delous26-prd.md`](docs/delous26-prd.md),
with the proven check-in features (live search, optimistic check-in, undo,
on-spot registration, multi-device polling sync) lifted from the Tosin & Kenny
wedding system.

---

## Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 (DELOUS brand tokens) |
| Animation | Framer Motion + ambient CSS effects |
| Database | Neon PostgreSQL via Drizzle ORM (`pg` pool, real transactions) |
| Auth | Signed JWT session cookie (jose) + server-enforced RBAC |
| Validation | Zod (shared client/server schemas) + React Hook Form |
| Email | Resend behind a durable transactional outbox |
| QR | `qrcode` (ticket generation) + `html5-qrcode` (entrance scanning) |
| Charts | Recharts (admin analytics) |

## Feature map

### Public experience (`/`)
- Cinematic opening animation with skip (session-aware for returning visitors)
- Animated hero, live countdown in Lagos time, Yoruba expressions throughout
- Our story, wedding programme, dress code (**White & Ofi**) — all editable
  from admin Settings without redeploying
- Open registration (`/register`): one person → one attendee record → one
  unique QR ticket; preloaded guests are matched by verified email/normalised
  phone (never by name) and update their existing record
- Digital invitation (`/invitation/<token>`): branded ticket card with QR code,
  attendee ID (`DELOUS-26-000001`), event details, print/share
- Secure ticket recovery (`/invitation`): OTP via email, never reveals whether
  a contact exists; recovered tickets are rotated so lost links die
- Masonry gallery with full-screen lightbox + swipe (`/gallery`)
- Accessible FAQ accordion (`/faqs`)
- Guest-controlled music player scaffold — drop the licensed track at
  `public/audio/delous.mp3` and it activates automatically

### Admin (`/admin`) — login at `/admin/login`
- **Overview** — stat cards, registration trend, attendance-certainty pie,
  guest distribution by group (public registrations reported separately from
  preloaded conversion)
- **Guests** — search (name/ID/email/phone), filters (group, status,
  attendance, check-in), pagination, CSV export, guest profile with edit,
  group assignment, resend invitation (rotates ticket), deactivate/reactivate,
  undo check-in, email + activity history
- **CSV Import** — header auto-detection, inline-editable preview, in-file
  duplicate detection, existing-guest dedupe, import summary
- **Invitation Groups** — admin-only CRUD with per-group registration and
  check-in counts; deleting a group never deletes guests
- **Registrations / Digital Tickets** — lifecycle views; tokens stored hashed
- **Check-in** — mobile-first unified station: camera QR scanner, manual
  search with optimistic check-in + rollback, recent stream with Undo,
  "Register on Spot" for walk-ins, 10-second multi-device polling sync.
  Admission is atomic (row lock + unique constraint) — simultaneous scans
  cannot admit the same ticket twice
- **Gallery / FAQs** — draft/published states, ordering, captions, alt text
- **Emails** — durable outbox with idempotency keys, retry for pending/failed
- **Reports** — registration & check-in rates, CSV downloads, audit trail
- **Staff & Permissions** — four roles (Super Admin, Wedding Admin, Check-in
  Officer, Content Manager) enforced server-side on every action and API route
- **Settings** — all event information editable live

## Getting started

```bash
npm install
cp .env.example .env          # fill in DATABASE_URL, AUTH_SECRET
npm run db:push               # create schema on Neon
npm run db:seed               # super admin, groups, settings, starter FAQs
npm run dev
```

Seeded super admin: `admin@delous26.com` / `Delous26!Royal`
(override with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`; change after first login).

### Environment

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `AUTH_SECRET` | HS256 secret for admin session JWTs |
| `NEXT_PUBLIC_APP_URL` | Public URL used in invitation links/emails |
| `RESEND_API_KEY` | Optional — without it, emails stay queued in the outbox |
| `RESEND_FROM` | Verified sender, e.g. `DELOUS '26 <invites@domain>` |

## Operational notes (wedding day)

- Check-in requires internet — ticket validation always hits the central
  database by design (no offline admission; see PRD §13)
- Keep a manual-search station available for damaged phones/lost emails
- Print the "All guests" CSV from Reports as the emergency list
- Attendee IDs are for convenience only; the QR token (random, hashed at rest)
  is the sole admission credential

## Implementation deviations from the PRD

- **Auth.js → custom jose JWT sessions**: same security posture (HttpOnly
  signed cookie, middleware guard), fewer moving parts; swappable later
- **Roles**: single `role` enum on `users` instead of `roles`/`user_roles`
  join tables — the four PRD roles are fixed and enforced by one matrix
- **shadcn/ui**: hand-rolled Tailwind components in the same spirit
- **Cloudinary/Sentry**: gallery stores image URLs (Cloudinary-ready);
  monitoring not yet wired
- Email reminder campaigns (7/3/1-day) and the Resend webhook are scaffolded
  by the outbox design but not yet implemented
