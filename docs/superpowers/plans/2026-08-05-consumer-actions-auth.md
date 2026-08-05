# Blindly Consumer Actions And Authentication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the remaining static consumer surfaces into real searchable, subscribable, messageable, and secure authentication workflows.

**Architecture:** Extend existing consumer route factories and presenters rather than introducing a second API layer. Persist only real user actions; use database recommendations for empty states. Add small OAuth and password-reset services behind configuration-aware routes.

**Tech Stack:** Next.js App Router, React 19, Prisma 7/PostgreSQL, Zod, Vitest, Google OAuth 2.0, Resend HTTP API

## Global Constraints

- Brand is `Blindly`; no public `Blindly Demo`, Creavora, rocket, or emoji copy.
- Subscription/message records are created only by explicit user actions; no synthetic records.
- Community access is honestly labelled free and persists as `price: 0`, `method: FREE`, `tier: Community access`, `renewsOn: No renewal`.
- Google and email recovery must report unavailable until their production credentials exist.
- Preserve the user's modified `docs/superpowers/plans/2026-08-04-consumer-core.md` file.

---

### Task 1: Profile stacking, Home terminology, and database search

**Files:**
- Modify: `src/app/(fan)/creator/[handle]/page.jsx`
- Modify: `src/components/consumer/HomeDashboard.jsx`
- Modify: `src/lib/consumer/search.js`
- Modify: `src/app/(fan)/explore/page.jsx`
- Test: `tests/components/consumer-workspace.test.jsx`
- Test: `tests/components/explore-search.test.jsx`
- Test: `tests/api/consumer-routes.test.js`

**Interfaces:**
- Consumes: current creator presenter and `/api/search` response `{ creators, posts, communities }`
- Produces: a foreground avatar stack, `Hangout rooms` copy, and category/role/location-aware search

- [ ] **Step 1: Write failing component and API tests**

Assert the creator avatar wrapper has `relative z-10`, Home exposes `Hangout rooms`, search submits via Enter/button, and a category-only creator is returned by `searchConsumer`.

- [ ] **Step 2: Run focused tests and confirm expected failures**

Run: `npm test -- tests/components/consumer-workspace.test.jsx tests/components/explore-search.test.jsx tests/api/consumer-routes.test.js`

- [ ] **Step 3: Implement the minimal presentation and search changes**

Use Prisma relation filtering `creatorProfile: { is: { category: contains } }` as another creator-search branch and synchronize the submitted query to `?q=` without a full page reload.

- [ ] **Step 4: Run focused tests and commit**

Expected: all selected files pass with no React warnings.

### Task 2: Real free community subscriptions and recommendations

**Files:**
- Modify: `src/app/api/subscriptions/route.js`
- Modify: `src/app/api/subscriptions/cancel/route.js`
- Modify: `src/app/(fan)/subscriptions/page.jsx`
- Modify: `src/services/consumer-api.js`
- Test: `tests/api/consumer-workspace-routes.test.js`
- Test: `tests/components/consumer-workspace.test.jsx`

**Interfaces:**
- Produces: `GET { items, recommendations }`, `POST { subscription, created }`, cancellation `{ subscription }`

- [ ] **Step 1: Write failing route tests**

Cover recommendation exclusion, active-creator filtering, idempotent create/reactivate, self-subscription rejection, and cancellation without deletion.

- [ ] **Step 2: Run focused API tests and confirm expected failures**

Run: `npm test -- tests/api/consumer-workspace-routes.test.js`

- [ ] **Step 3: Implement route transactions and UI actions**

Persist `Community access`, `0`, `FREE`, `ACTIVE`, `No renewal`; expose `joinFreeSubscription` and `cancelSubscription` service functions; render recommendation cards and action feedback.

- [ ] **Step 4: Run focused API/component tests and commit**

Run: `npm test -- tests/api/consumer-workspace-routes.test.js tests/components/consumer-workspace.test.jsx`

### Task 3: Follow-based conversation starters

**Files:**
- Modify: `src/app/api/messages/route.js`
- Modify: `src/app/(fan)/messages/page.jsx`
- Test: `tests/api/consumer-workspace-routes.test.js`
- Test: `tests/components/messages-responsive.test.jsx`

**Interfaces:**
- Produces: conversation response `{ items, suggestions }`; suggestions use the existing participant presenter

- [ ] **Step 1: Write failing route and UI tests**

Cover followed creators without messages, exclude self/deleted/already-conversed creators, open an empty thread locally, and create the first real message only on submit.

- [ ] **Step 2: Run focused tests and confirm expected failures**

Run: `npm test -- tests/api/consumer-workspace-routes.test.js tests/components/messages-responsive.test.jsx`

- [ ] **Step 3: Implement suggestions and start-conversation UI**

Query `Follow` records for the viewer, return up to 12 suggestions, and initialize `{ participant, items: [] }` without writing a message.

- [ ] **Step 4: Run focused tests and commit**

Expected: selected tests pass and mobile back behavior remains intact.

### Task 4: Configuration-aware Google OAuth and password reset

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20260805170000_add_auth_recovery/migration.sql`
- Modify: `src/proxy.js`
- Modify: `src/lib/auth.js`
- Modify: `src/lib/validators.js`
- Create: `src/lib/auth-providers.js`
- Create: `src/lib/password-reset.js`
- Create: `src/app/api/auth/providers/route.js`
- Create: `src/app/api/auth/google/start/route.js`
- Create: `src/app/api/auth/google/callback/route.js`
- Create: `src/app/api/auth/forgot-password/route.js`
- Create: `src/app/api/auth/reset-password/route.js`
- Create: `src/app/(auth)/forgot-password/page.jsx`
- Create: `src/app/(auth)/reset-password/page.jsx`
- Modify: `src/app/(auth)/login/page.jsx`
- Modify: `src/app/(auth)/creator-login/page.jsx`
- Modify: `.env.example`
- Modify: `README.md`
- Test: `tests/api/auth-providers.test.js`
- Test: `tests/api/auth-recovery.test.js`
- Test: `tests/api/proxy-auth.test.js`
- Test: `tests/components/auth-entry.test.jsx`
- Test: `tests/components/auth-ui.test.jsx`

**Interfaces:**
- Produces: provider status `{ google, passwordReset }`, OAuth start/callback routes, forgot request, and reset submission

- [ ] **Step 1: Write failing service, route, and UI tests**

Cover unavailable providers, state/PKCE cookies, callback rejection, verified-email linking, token hashing/expiry/single use, refresh-token revocation, generic forgot responses, public proxy access, and visible auth controls.

- [ ] **Step 2: Run focused tests and confirm expected failures**

Run: `npm test -- tests/api/auth-providers.test.js tests/api/auth-recovery.test.js tests/components/auth-ui.test.jsx`

- [ ] **Step 3: Add Prisma fields and migration**

Add nullable unique `User.googleSubject`, `User.passwordResetTokens`, and `PasswordResetToken { id, userId, tokenHash @unique, expiresAt, usedAt, createdAt }` with cascade relation and indexes.

- [ ] **Step 4: Implement provider services, routes, and pages**

Use random state plus PKCE S256 cookies, Google token/userinfo endpoints, safe redirects, SHA-256 reset tokens, 30-minute expiry, bcrypt password hashing, Resend HTTP delivery, and explicit unavailable UI. Reuse the current Blindly session cookie/refresh-token path. Google from `/login` may link or create a `USER` with a collision-safe handle; Google from `/creator-login` may authenticate only an existing active `CREATOR` and must never create or elevate one. Exact provider/recovery pages and APIs must be anonymously reachable through the proxy while neighboring auth APIs stay protected.

- [ ] **Step 5: Run focused tests, Prisma validation, and commit**

Run: `npm test -- tests/api/auth-providers.test.js tests/api/auth-recovery.test.js tests/api/proxy-auth.test.js tests/components/auth-entry.test.jsx tests/components/auth-ui.test.jsx && npx prisma validate`

### Task 5: Full release verification

**Files:**
- Verify all files changed by Tasks 1-4

- [ ] **Step 1: Run complete local gates**

Run: `npm test`, `npm run lint`, `npx prisma validate`, `npm run build`, and `git diff --check`.

- [ ] **Step 2: Review the whole branch**

Require no open Critical or Important findings and verify no credentials are committed.

- [ ] **Step 3: Merge and deploy**

Apply the additive production migration while the current application is still serving, then fast-forward `main`, push GitHub, wait for Vercel Ready, and preserve current imported content. Do not route the new Prisma client to an unmigrated production schema.

- [ ] **Step 4: Run live authenticated smoke checks**

Verify search, free join/cancel, followed-creator conversation start, first message persistence, provider availability reporting, profile stacking, `Hangout rooms`, and phone widths 320/360/390/768. Clean temporary verification users and records.

