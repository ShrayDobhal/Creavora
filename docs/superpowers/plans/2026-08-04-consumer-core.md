# Creavora Consumer Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Creavora’s static consumer screens with a production-ready, API-backed feed, discovery, creator profile, and social-interaction experience.

**Architecture:** Keep the deployed Next.js route-handler architecture and Prisma Postgres database. Introduce small feature modules that translate Prisma records into stable consumer view models, then have client screens consume those HTTP contracts. Existing auth middleware remains the single source of identity and role enforcement.

**Tech Stack:** Next.js 16, React 19, JavaScript, Prisma 7 with PostgreSQL, Zod, Vitest, React Testing Library, Lucide, Tailwind CSS 4.

## Global Constraints

- Normal user JWT role is `USER`; creator JWT role is `CREATOR`; authorization happens in routes and APIs, not hidden CSS.
- Every query filters `deletedAt: null` when the model has soft deletion.
- Production returns only database records; populated demo records are created exclusively by `prisma/seed.mjs`.
- Use INR notation and Indian creator categories without emoji-led product copy.
- All mutation bodies are validated with Zod and use explicit `400`, `401`, `403`, `404`, or `500` responses.
- Preserve mobile-compatible HTTP APIs; no browser-only authorization state.
- Respect `prefers-reduced-motion`; use `next/image` for known image assets.

---

## Planned file structure

| File | Responsibility |
| --- | --- |
| `src/lib/consumer/constants.js` | Shared categories, feed modes, limits, and INR formatting. |
| `src/lib/consumer/presenters.js` | Converts Prisma user/post rows into browser-safe consumer view models. |
| `src/lib/consumer/feed.js` | Builds deterministic `(publishedAt, id)` cursor queries and feed filters. |
| `src/lib/consumer/social.js` | Transactional like, bookmark, follow, comment, and notification rules. |
| `src/app/api/posts/route.js` | Validated cursor feed read and creator-only post creation. |
| `src/app/api/creators/route.js` | Paginated creator directory with category filtering. |
| `src/app/api/creators/[handle]/route.js` | Public creator-profile contract. |
| `src/app/api/search/route.js` | Validated search plus explicit history persistence. |
| `src/app/api/discovery/route.js` | One request for category, recommended, and trending creator rails. |
| `src/services/consumer-api.js` | Browser fetch client, response parsing, and mutation calls. |
| `src/components/consumer/*` | Feed cards, creator cards, empty/loading/error states, and search controls. |
| `src/app/(fan)/feed/page.jsx` | Real feed UI. |
| `src/app/(fan)/explore/page.jsx` | Real discovery/search UI. |
| `src/app/(fan)/creator/[handle]/page.jsx` | Real creator profile UI. |
| `prisma/seed.mjs` | Development-only Indian-market data graph. |
| `tests/*` | Unit/API/component regression coverage. |

### Task 1: Establish consumer contracts and test runner

**Files:**
- Create: `src/lib/consumer/constants.js`
- Create: `src/lib/consumer/presenters.js`
- Create: `tests/consumer/presenters.test.js`
- Create: `vitest.config.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces `CATEGORY_OPTIONS`, `FEED_MODES`, `formatInr(amount)`, `presentCreator(row, viewerId)`, and `presentPost(row, viewerId, entitlementSet)`.
- `presentPost` returns `{ id, content, mediaUrl, mediaType, isPremium, price, publishedAt, counts, creator, viewer, isLocked }`.

- [ ] **Step 1: Write the failing presenter test**

```js
import { describe, expect, it } from "vitest";
import { presentPost } from "@/lib/consumer/presenters";

it("locks premium media for an unsubscribed viewer without changing aggregate counts", () => {
  const post = { id: "p1", creatorId: "c1", content: "Members note", mediaUrl: "https://cdn.test/a.jpg", mediaType: "image", isPremium: true, price: 399, likesCount: 8, commentsCount: 2, viewsCount: 20, sharesCount: 1, publishedAt: new Date("2026-08-01"), creator: { id: "c1", name: "Asha", handle: "asha", avatar: null, roleTitle: "Fashion", verified: true, creatorProfile: { subscriberCount: 4 } }, likes: [], bookmarks: [], creatorFollowers: [] };
  expect(presentPost(post, "u1", new Set())).toMatchObject({ mediaUrl: null, isLocked: true, counts: { likes: 8, comments: 2, views: 20, shares: 1 } });
});
```

- [ ] **Step 2: Run the test to confirm the missing module fails**

Run: `npm run test -- tests/consumer/presenters.test.js`

Expected: FAIL because the presenter module and test script do not exist.

- [ ] **Step 3: Add the smallest contract implementation and Vitest configuration**

```js
export const CATEGORY_OPTIONS = ["Fashion", "Fitness", "Gaming", "Food", "Music", "Travel", "Education", "Comedy", "Art", "Technology", "Lifestyle"];
export const FEED_MODES = new Set(["latest", "following", "trending"]);
export const formatInr = (amount) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
```

Implement `presentPost` so it preserves aggregate counts, exposes viewer flags from relation arrays, and hides only premium content/media for viewers without entitlement. Add `"test": "vitest run"` and install `vitest` as a development dependency.

- [ ] **Step 4: Run the focused test and full unit suite**

Run: `npm run test -- tests/consumer/presenters.test.js && npm run test`

Expected: PASS with the premium-lock assertion passing.

- [ ] **Step 5: Commit the contract foundation**

```bash
git add package.json package-lock.json vitest.config.mjs src/lib/consumer tests/consumer
git commit -m "test: add consumer contract coverage"
```

### Task 2: Build deterministic feed and social mutation services

**Files:**
- Create: `src/lib/consumer/feed.js`
- Create: `src/lib/consumer/social.js`
- Create: `tests/consumer/feed.test.js`
- Create: `tests/consumer/social.test.js`
- Modify: `src/lib/validators.js`

**Interfaces:**
- Consumes `presentPost` and `FEED_MODES` from Task 1 plus Prisma transaction clients.
- Produces `parseFeedQuery(searchParams)`, `getFeedPage(db, viewerId, query)`, `toggleLike(db, user, postId)`, `toggleBookmark(db, userId, postId)`, `toggleFollow(db, user, handle)`, and `createComment(db, user, postId, input)`.

- [ ] **Step 1: Write failing unit tests for cursor and ownership rules**

```js
it("rejects an unsupported feed mode", () => {
  expect(() => parseFeedQuery(new URLSearchParams("mode=nearby"))).toThrow("Unsupported feed mode");
});

it("does not create a self-like notification", async () => {
  const tx = makeTransactionFixture();
  await toggleLike(tx.db, { id: "creator-1", name: "Asha" }, "post-1");
  expect(tx.notifications).toHaveLength(0);
});
```

- [ ] **Step 2: Run the focused service tests to confirm failure**

Run: `npm run test -- tests/consumer/feed.test.js tests/consumer/social.test.js`

Expected: FAIL because the service exports do not exist.

- [ ] **Step 3: Implement cursor query and transactional mutations**

```js
export function parseFeedQuery(params) {
  const mode = params.get("mode") || "latest";
  const limit = Number(params.get("limit") || 12);
  if (!FEED_MODES.has(mode)) throw new Error("Unsupported feed mode");
  if (!Number.isInteger(limit) || limit < 1 || limit > 30) throw new Error("Invalid feed limit");
  return { mode, limit, cursor: params.get("cursor") || null };
}
```

Use a base `Post` predicate of `{ deletedAt: null, publishedAt: { lte: new Date() } }`. For `following`, add followed creator IDs. Sort by `[{ publishedAt: "desc" }, { id: "desc" }]`, use an encoded cursor containing both values, request `limit + 1`, and return `{ items, nextCursor }`. Each social toggle must load a non-deleted target, perform its create/delete and count change within `db.$transaction`, prevent self notifications, and return final state plus the updated count.

- [ ] **Step 4: Run services and Prisma validation**

Run: `npm run test -- tests/consumer/feed.test.js tests/consumer/social.test.js && npx prisma validate`

Expected: PASS; the schema remains valid.

- [ ] **Step 5: Commit service logic**

```bash
git add src/lib/consumer src/lib/validators.js tests/consumer
git commit -m "feat: add cursor feed and social services"
```

### Task 3: Replace consumer APIs with validated contracts

**Files:**
- Modify: `src/app/api/posts/route.js`
- Modify: `src/app/api/posts/[id]/like/route.js`
- Modify: `src/app/api/posts/[id]/bookmark/route.js`
- Modify: `src/app/api/posts/[id]/comment/route.js`
- Modify: `src/app/api/creators/route.js`
- Create: `src/app/api/creators/[handle]/route.js`
- Modify: `src/app/api/creators/[handle]/follow/route.js`
- Modify: `src/app/api/search/route.js`
- Modify: `src/app/api/search/history/route.js`
- Create: `src/app/api/discovery/route.js`
- Create: `tests/api/consumer-routes.test.js`

**Interfaces:**
- Consumes Task 2 services and shared `withAuth`/`withCreatorAuth` wrappers.
- Produces `/api/posts?mode=latest&limit=12&cursor=...`, `/api/creators`, `/api/creators/:handle`, `/api/discovery`, and stable social-action JSON responses.

- [ ] **Step 1: Write failing API contract tests using mocked auth and Prisma services**

```js
it("returns 400 for an invalid feed limit", async () => {
  const response = await GET(new Request("http://localhost/api/posts?limit=100"), { params: Promise.resolve({}) });
  expect(response.status).toBe(400);
});

it("does not write search history while the user is typing an empty query", async () => {
  const response = await searchGET(new Request("http://localhost/api/search?q="), authContext);
  expect(response.status).toBe(200);
  expect(mockDb.searchHistory.create).not.toHaveBeenCalled();
});
```

- [ ] **Step 2: Run API tests to confirm failure**

Run: `npm run test -- tests/api/consumer-routes.test.js`

Expected: FAIL because the existing routes do not return these contracts.

- [ ] **Step 3: Wire each route to a single service contract**

```js
export const GET = withAuth(async (req, { user }) => {
  try {
    return NextResponse.json(await getFeedPage(db, user.id, parseFeedQuery(new URL(req.url).searchParams)));
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
});
```

Make `/api/creators` return `{ items, nextCursor }` with `category`, `q`, and cursor validation. Make `/api/creators/[handle]` public only if the page is public; otherwise explicitly use `withAuth` and return viewer following state. Make `/api/discovery` return category options plus creator rails built from real database rows. Split search into `GET` for reads and a dedicated validated history mutation for persistence so debounced keystrokes do not create rows.

- [ ] **Step 4: Run API suite, lint, and production build**

Run: `npm run test -- tests/api/consumer-routes.test.js && npm run lint && npm run build`

Expected: PASS with no ESLint errors and a successful Next production build.

- [ ] **Step 5: Commit API contracts**

```bash
git add src/app/api src/lib/consumer tests/api
git commit -m "feat: expose consumer data APIs"
```

### Task 4: Seed a development-only India-focused content graph

**Files:**
- Modify: `prisma/seed.mjs`
- Modify: `package.json`
- Create: `tests/seed/seed-shape.test.js`
- Modify: `.env.example`

**Interfaces:**
- Produces a repeatable `npm run db:seed` command for a configured local/development database.
- Creates user, creator profile, posts, follows, likes, comments, bookmarks, communities, and notifications without production request-time fabrication.

- [ ] **Step 1: Write a failing seed-shape test**

```js
it("defines Indian-market creator categories and never runs when NODE_ENV is production", async () => {
  expect(CATEGORY_OPTIONS).toContain("Food");
  await expect(runSeed({ NODE_ENV: "production" })).rejects.toThrow("Seed data is disabled in production");
});
```

- [ ] **Step 2: Run the seed test to confirm failure**

Run: `npm run test -- tests/seed/seed-shape.test.js`

Expected: FAIL because the seed guard/export does not exist.

- [ ] **Step 3: Implement idempotent development seeding**

```js
if (process.env.NODE_ENV === "production") {
  throw new Error("Seed data is disabled in production");
}
await db.user.upsert({ where: { email: creator.email }, update: creator, create: creator });
```

Use stable handles and `upsert` records for an editorially varied set of Indian creators across food, fashion, fitness, gaming, education, music, travel, art, comedy, and technology. Use image URLs only as seed values, keep credentials in environment variables or documented defaults for local development, and add `"db:seed": "prisma db seed"` plus Prisma seed configuration.

- [ ] **Step 4: Run seed verification against a non-production local database**

Run: `npm run test -- tests/seed/seed-shape.test.js && npx prisma validate && npm run db:seed`

Expected: PASS; seed exits without duplicate-record errors.

- [ ] **Step 5: Commit seed data**

```bash
git add prisma/seed.mjs package.json package-lock.json .env.example tests/seed
git commit -m "feat: add development consumer seed data"
```

### Task 5: Build the real feed, explore, and creator-profile screens

**Files:**
- Create: `src/services/consumer-api.js`
- Create: `src/components/consumer/FeedCard.jsx`
- Create: `src/components/consumer/CreatorCard.jsx`
- Create: `src/components/consumer/AsyncState.jsx`
- Create: `src/components/consumer/SearchPanel.jsx`
- Modify: `src/app/(fan)/feed/page.jsx`
- Modify: `src/app/(fan)/explore/page.jsx`
- Modify: `src/app/(fan)/creator/[handle]/page.jsx`
- Create: `tests/components/feed-card.test.jsx`
- Create: `tests/components/explore-search.test.jsx`

**Interfaces:**
- Consumes Task 3 HTTP responses via `getFeed`, `getDiscovery`, `search`, `getCreator`, `toggleLike`, `toggleBookmark`, and `toggleFollow`.
- Produces accessible, responsive consumer pages that do not import `src/data.js`.

- [ ] **Step 1: Write failing interaction tests**

```jsx
it("rolls back the heart count when a like request fails", async () => {
  render(<FeedCard post={post} onLike={vi.fn().mockRejectedValue(new Error("Network error"))} />);
  await userEvent.click(screen.getByRole("button", { name: /like/i }));
  expect(await screen.findByText("Network error")).toBeVisible();
  expect(screen.getByRole("button", { name: /like/i })).toHaveTextContent("8");
});
```

- [ ] **Step 2: Run UI tests to confirm failure**

Run: `npm run test -- tests/components/feed-card.test.jsx tests/components/explore-search.test.jsx`

Expected: FAIL because the reusable components and API client are absent.

- [ ] **Step 3: Implement feature components and replace all static page data**

```js
export async function getFeed({ mode, cursor }) {
  const query = new URLSearchParams({ mode, limit: "12", ...(cursor ? { cursor } : {}) });
  return request(`/api/posts?${query}`);
}
```

Use a data-fetching effect with `AbortController`, loading/empty/error states, and a keyboard-accessible Load more button that appends `items` only when `nextCursor` exists. Feed filters are `Latest`, `Following`, and `Trending`. Explore loads `/api/discovery`, debounces search input, submits non-empty searches explicitly, uses category chips, and renders returned creator/post/community cards. Creator profile loads the handle route, exposes follow and content actions, and renders only database-derived profile information. Remove imports from `src/data.js` in these three routes and replace decorative emoji copy with Lucide icons or text.

- [ ] **Step 4: Run component coverage, lint, and build**

Run: `npm run test -- tests/components/feed-card.test.jsx tests/components/explore-search.test.jsx && npm run lint && npm run build`

Expected: PASS with working client production compilation.

- [ ] **Step 5: Commit consumer screens**

```bash
git add src/services src/components/consumer src/app/(fan)/feed src/app/(fan)/explore src/app/(fan)/creator tests/components
git commit -m "feat: connect consumer experience to live APIs"
```

### Task 6: Finish landing/onboarding polish and release verification

**Files:**
- Modify: `src/app/landing/page.jsx`
- Modify: `src/app/(auth)/login/page.jsx`
- Modify: `src/app/(auth)/creator-login/page.jsx`
- Modify: `src/app/globals.css`
- Modify: `README.md`
- Create: `.github/workflows/consumer-smoke.yml`

**Interfaces:**
- Consumes role-aware auth endpoints and consumer route URLs from earlier tasks.
- Produces a scrollable public landing page with distinct User Login and Creator Login paths plus documented local/deployment verification.

- [ ] **Step 1: Write a failing route smoke test**

```js
it("renders separate normal-user and creator login entry points", async () => {
  render(<Landing />);
  expect(screen.getByRole("link", { name: /join creavora/i })).toHaveAttribute("href", "/register");
  expect(screen.getByRole("link", { name: /creator login/i })).toHaveAttribute("href", "/creator-login");
});
```

- [ ] **Step 2: Run the smoke test to confirm failure**

Run: `npm run test -- tests/components/landing-auth.test.jsx`

Expected: FAIL if either role entry path or accessible label is absent.

- [ ] **Step 3: Apply restrained editorial polish and release documentation**

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; }
}
```

Keep landing sections image-led and scroll-worthy: purpose, categories, creator stories, community proof, and role-aware calls to action. Remove non-functional controls from landing and consumer navigation. Document environment variables, `npm run db:seed`, local setup, test commands, Vercel configuration, and the direct production health smoke check. Make CI run `npm ci`, `npx prisma validate`, `npm run test`, `npm run lint`, and `npm run build`.

- [ ] **Step 4: Perform complete pre-deploy verification**

Run: `npm run test && npm run lint && npx prisma validate && npm run build && git diff --check`

Expected: all commands exit `0` and `git diff --check` prints no whitespace errors.

- [ ] **Step 5: Commit, push, deploy, and prove the public release**

```bash
git add src/app/landing src/app/(auth) src/app/globals.css README.md .github/workflows tests/components
git commit -m "feat: complete consumer release experience"
git push origin main
npx vercel --prod --yes --scope shan20052006-gmailcoms-projects
curl.exe -fsS -o NUL -w "%{http_code}" https://creavora.vercel.app/landing
```

Expected: GitHub accepts `main`, Vercel reports `Ready`, and the direct landing request returns `200`.

## Self-review

- Spec coverage: Tasks 1-6 cover real consumer data contracts, cursor feed, discovery/search, creator profiles, social actions, development-only data, role-aware onboarding, testing, CI, GitHub, and Vercel release verification. Payments, uploads, messaging, live video, and creator tooling remain intentionally deferred to the next specification.
- Placeholder scan: the required executable steps, file paths, commands, interfaces, and expected outcomes are present throughout the plan.
- Type and contract consistency: `presentPost` supplies the feed card shape; Task 2 supplies services used by Task 3; Task 3 exposes the endpoints consumed by Task 5; Task 6 verifies the assembled release.
