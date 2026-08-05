# Blindly production polish and Explore implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove visible importer markers, make Explore categories demonstrably Postgres-driven, add private detailed-address support, and eliminate consumer phone-width overflow

**Architecture:** Keep stable importer-owned IDs for safe idempotent updates, but store clean public copy and sanitize known legacy markers at presentation boundaries. Extend the current profile contract with a private `address` field, derive Explore categories and counts from active creator-profile rows, and harden the existing responsive components without introducing a second layout system

**Tech Stack:** Next.js 16 App Router, React 19, Prisma 7 with PostgreSQL, Zod, Tailwind CSS 4, Vitest and Testing Library

## Global constraints

- Preserve the public product name `Blindly`
- Never display `[blindly-demo:*]`, `(Blindly Demo)` or an internal demo handle
- Stable importer IDs may retain their private namespace
- Do not rewrite user-created accounts or posts during production cleanup
- Keep detailed address out of directory, search, feed and public creator-profile responses
- Verify widths 320, 360, 390 and 768 CSS pixels
- Do not add paid services or real-money functionality
- Preserve `docs/superpowers/plans/2026-08-04-consumer-core.md`, which contains an unrelated user change

## File structure

- `src/lib/consumer/public-copy.js` owns legacy-marker sanitization for presentation boundaries
- `scripts/import-blindly-demo-content.mjs` owns importer-only clean fixtures and idempotent production cleanup
- `src/lib/consumer/presenters.js` and `src/lib/consumer/workspace.js` sanitize creator, post, story and live copy
- `src/lib/consumer/directory.js` owns creator directory queries and database-derived category counts
- `prisma/schema.prisma` and `prisma/migrations/20260805030000_add_profile_address/migration.sql` own the private address column
- `src/lib/consumer/profile.js`, `src/lib/validators.js` and `src/components/consumer/ProfileEditor.jsx` own the authenticated address contract
- Existing consumer pages and `src/layouts/FanLayout.jsx` own responsive behavior; no parallel mobile pages are created

---

### Task 1: Clean importer-owned public content

**Files:**
- Create: `src/lib/consumer/public-copy.js`
- Modify: `scripts/import-blindly-demo-content.mjs`
- Modify: `src/lib/consumer/presenters.js`
- Modify: `src/lib/consumer/workspace.js`
- Test: `tests/consumer/demo-importer.test.js`
- Test: `tests/consumer/presenters.test.js`
- Test: `tests/consumer/social-launch-data.test.js`

**Interfaces:**
- Produces: `sanitizePublicCopy(value: unknown): unknown`
- Produces: clean importer updates keyed only by existing stable IDs
- Consumed by: creator, post, story and live-session presenters

- [ ] **Step 1: Write failing importer and presenter tests**

Add assertions that independently collect all visible fields:

```js
const visibleCopy = [
  ...users.flatMap((user) => [user.name, user.handle, user.bio, user.roleTitle]),
  ...posts.map((post) => post.content),
  ...stories.map((story) => story.caption),
  ...liveSessions.map((session) => session.title),
  ...[...database.comment.records.values()].map((comment) => comment.content),
].join(" ");

expect(visibleCopy).not.toMatch(/\[blindly-demo:|\(Blindly Demo\)|blindly-demo-/i);
expect(users.map((user) => user.handle)).toEqual(
  expect.arrayContaining(["aisha-bites", "coach-kabir", "tech-with-vihaan"]),
);
```

In `presenters.test.js`, exercise the real presenter:

```js
expect(presentPost({
  ...postRow,
  content: "[blindly-demo:fitness:1] Morning mobility",
  creator: { ...creatorRow, name: "Kabir (Blindly Demo)", handle: "blindly-demo-coach-kabir" },
}, "viewer-1")).toMatchObject({
  content: "Morning mobility",
  creator: { name: "Kabir", handle: "coach-kabir" },
});
```

- [ ] **Step 2: Run the focused tests and verify RED**

Run: `npm test -- tests/consumer/demo-importer.test.js tests/consumer/presenters.test.js tests/consumer/social-launch-data.test.js`

Expected: FAIL because importer fields and presenter output still contain the internal namespace

- [ ] **Step 3: Add the sanitizer and clean importer fixtures**

Implement one narrow presentation helper:

```js
const PREFIX = /^\[blindly-demo:[^\]]+\]\s*/i;
const SUFFIX = /\s*\(Blindly Demo\)\s*$/i;
const HANDLE_PREFIX = /^blindly-demo-/i;

export function sanitizePublicCopy(value) {
  if (typeof value !== "string") return value;
  return value.replace(PREFIX, "").replace(SUFFIX, "").replace(HANDLE_PREFIX, "").trim();
}
```

Update importer-visible values to use `fixture.name`, `fixture.handle`, `fixture.bio`, `${fixture.category} Creator`, `fixture.content`, clean story/live copy and category-specific comments without the words demo or fictional. Retain `DEMO_ID_PREFIX` only for IDs and the private importer email domain. Because user upserts use stable IDs, the next production run updates existing records in place

- [ ] **Step 4: Apply defense in depth at presentation boundaries**

Use `sanitizePublicCopy` for creator `name`, `handle`, `roleTitle`, post `content`, story `caption` and live-session `title`. Do not sanitize IDs, media URLs or user-created metadata fields

- [ ] **Step 5: Run focused tests and verify GREEN**

Run: `npm test -- tests/consumer/demo-importer.test.js tests/consumer/presenters.test.js tests/consumer/social-launch-data.test.js`

Expected: all focused tests pass and importer record counts remain 12 creators, 36 posts, 12 stories, 4 live sessions, 12 follows, 36 likes and 12 comments

- [ ] **Step 6: Commit**

```powershell
git add -- scripts/import-blindly-demo-content.mjs src/lib/consumer/public-copy.js src/lib/consumer/presenters.js src/lib/consumer/workspace.js tests/consumer/demo-importer.test.js tests/consumer/presenters.test.js tests/consumer/social-launch-data.test.js
git commit -m "fix: remove importer markers from public content"
```

---

### Task 2: Add owner-only detailed address support

**Files:**
- Create: `prisma/migrations/20260805030000_add_profile_address/migration.sql`
- Modify: `prisma/schema.prisma`
- Modify: `src/lib/validators.js`
- Modify: `src/lib/consumer/profile.js`
- Modify: `src/components/consumer/ProfileEditor.jsx`
- Test: `tests/consumer/social-launch-data.test.js`
- Test: `tests/api/social-launch-routes.test.js`
- Test: `tests/components/social-launch-ui.test.jsx`

**Interfaces:**
- Produces: `User.address: String?`
- Produces: authenticated profile JSON with `location` and `address`
- Preserves: public creator presenters without `address`

- [ ] **Step 1: Write failing profile contract tests**

Add API/service assertions:

```js
expect(await getCurrentProfile(database, "user-1")).toMatchObject({
  location: "Mumbai, Maharashtra",
  address: "Bandra West, Mumbai 400050",
});

await updateCurrentProfile(database, "user-1", { address: "Indiranagar, Bengaluru 560038" });
expect(database.user.updateMany).toHaveBeenCalledWith(expect.objectContaining({
  data: { address: "Indiranagar, Bengaluru 560038" },
}));
expect(presentCreator({ ...creatorRow, address: "private" }, "viewer-1")).not.toHaveProperty("address");
```

Add UI assertions:

```jsx
expect(screen.getByLabelText("City / State")).toHaveValue("Mumbai, Maharashtra");
expect(screen.getByLabelText("Address")).toHaveValue("Bandra West, Mumbai 400050");
expect(screen.queryByLabelText("Website")).not.toBeInTheDocument();
```

- [ ] **Step 2: Run focused tests and verify RED**

Run: `npm test -- tests/consumer/social-launch-data.test.js tests/api/social-launch-routes.test.js tests/components/social-launch-ui.test.jsx`

Expected: FAIL because `address` is absent and the editor still renders Website

- [ ] **Step 3: Add the nullable database column**

Migration content:

```sql
ALTER TABLE "User" ADD COLUMN "address" TEXT;
```

Add `address String?` next to `location` in `prisma/schema.prisma`, then run `npx prisma generate`

- [ ] **Step 4: Extend validation and the owner profile service**

Extend `updateProfileSchema` with:

```js
address: z.string().trim().max(240).nullable().optional(),
```

Return `address` only from `getCurrentProfile`. Keep `presentCreator`, directory results, search results, feed data and public creator profiles unchanged. Normalize `""` to `null` in the editor payload

- [ ] **Step 5: Replace Website with Address in the editor**

Store `address` in `initialValues`, rename Location to `City / State`, remove Website from the submitted payload, and render:

```jsx
<Field label="City / State" value={values.location} onChange={(value) => updateValue("location", value)} />
<Field label="Address" value={values.address} maxLength={240} onChange={(value) => updateValue("address", value)} />
```

Extend `Field` with an explicit `maxLength` prop so Address does not inherit the URL-specific limit

- [ ] **Step 6: Run focused tests and verify GREEN**

Run: `npm test -- tests/consumer/social-launch-data.test.js tests/api/social-launch-routes.test.js tests/components/social-launch-ui.test.jsx`

Expected: all focused tests pass and no public presenter contains `address`

- [ ] **Step 7: Validate Prisma and commit**

Run: `npx prisma validate`

Expected: schema is valid

```powershell
git add -- prisma/schema.prisma prisma/migrations/20260805030000_add_profile_address/migration.sql src/lib/validators.js src/lib/consumer/profile.js src/components/consumer/ProfileEditor.jsx tests/consumer/social-launch-data.test.js tests/api/social-launch-routes.test.js tests/components/social-launch-ui.test.jsx
git commit -m "feat: add private profile address"
```

---

### Task 3: Derive Explore categories and counts from Postgres

**Files:**
- Modify: `src/lib/consumer/directory.js`
- Modify: `src/app/(fan)/explore/page.jsx`
- Modify: `src/services/consumer-api.js`
- Test: `tests/api/consumer-routes.test.js`
- Test: `tests/components/explore-search.test.jsx`

**Interfaces:**
- Produces: `getDiscovery(database, viewerId) -> { categories: Array<{ name, creatorCount }>, creators }`
- Consumes: `GET /api/discovery` before the directory request
- Preserves: `GET /api/creators?category=&q=&cursor=&limit=`

- [ ] **Step 1: Write failing database-category tests**

Configure a `creatorProfile.groupBy` fixture and assert the query excludes deleted creators:

```js
const groupBy = vi.fn().mockResolvedValue([
  { category: "Fitness", _count: { _all: 4 } },
  { category: "Technology", _count: { _all: 2 } },
]);
const result = await getDiscovery({
  creatorProfile: { groupBy },
  user: { findMany: vi.fn().mockResolvedValue([creatorRow()]) },
}, "viewer-1");

expect(result.categories).toEqual([
  { name: "Fitness", creatorCount: 4 },
  { name: "Technology", creatorCount: 2 },
]);
expect(groupBy).toHaveBeenCalledWith(expect.objectContaining({
  where: { user: { is: { role: "CREATOR", deletedAt: null } } },
}));
```

In the component test, mock `/api/discovery` with only Fitness and Technology and assert Art is absent. Assert clicking Fitness requests `/api/creators?category=Fitness&limit=12`

- [ ] **Step 2: Run focused tests and verify RED**

Run: `npm test -- tests/api/consumer-routes.test.js tests/components/explore-search.test.jsx`

Expected: FAIL because discovery returns a static string array and Explore renders `CATEGORY_OPTIONS`

- [ ] **Step 3: Implement database-derived categories**

Query active creator profiles with `groupBy`, order the result by creator count descending then category name in application code, and return objects:

```js
const categories = categoryRows
  .map((row) => ({ name: row.category, creatorCount: row._count._all }))
  .filter(({ name, creatorCount }) => name && creatorCount > 0)
  .sort((a, b) => b.creatorCount - a.creatorCount || a.name.localeCompare(b.name));
```

Keep `parseCreatorQuery` constrained to supported launch categories so arbitrary query text cannot become an unindexed filter

- [ ] **Step 4: Load discovery metadata in Explore**

Call `getDiscovery()` on mount alongside the first creator-page request. Render `All` plus returned category objects, include counts in accessible labels such as `Fitness, 4 creators`, and keep truthful loading/error states. Never fall back to a static card list when discovery fails

- [ ] **Step 5: Verify search, pagination and follow state remain persisted**

Run: `npm test -- tests/api/consumer-routes.test.js tests/components/explore-search.test.jsx tests/consumer/social.test.js`

Expected: all focused tests pass, including creator search, category filtering, cursor pagination and follow toggling

- [ ] **Step 6: Commit**

```powershell
git add -- src/lib/consumer/directory.js 'src/app/(fan)/explore/page.jsx' src/services/consumer-api.js tests/api/consumer-routes.test.js tests/components/explore-search.test.jsx
git commit -m "feat: drive Explore categories from Postgres"
```

---

### Task 4: Harden consumer phone layouts

**Files:**
- Modify: `src/layouts/FanLayout.jsx`
- Modify: `src/components/consumer/ProfileEditor.jsx`
- Modify: `src/components/consumer/SearchPanel.jsx`
- Modify: `src/app/(fan)/settings/page.jsx`
- Modify: `src/app/(fan)/collections/page.jsx`
- Modify: `src/app/(fan)/saved/page.jsx`
- Modify: `src/app/(fan)/subscriptions/page.jsx`
- Test: `tests/components/consumer-workspace.test.jsx`
- Test: `tests/components/social-launch-ui.test.jsx`
- Test: `tests/components/messages-responsive.test.jsx`

**Interfaces:**
- Preserves: one responsive component tree for desktop and phone
- Produces: reachable header/account controls and document-width-safe consumer pages

- [ ] **Step 1: Write failing responsive-contract tests**

Assert the actual components expose phone-safe structure rather than a mocked layout:

```jsx
const settings = render(<SettingsPage />);
expect(await settings.findByRole("navigation", { name: "Settings sections" })).toHaveClass("max-w-full", "overflow-x-auto");
expect(settings.getByRole("main")).toHaveClass("min-w-0", "overflow-x-hidden");

const editor = screen.getByRole("form", { name: "Profile editor" });
expect(editor).toHaveClass("min-w-0");
expect(screen.getByLabelText("Address")).toHaveClass("w-full");
```

Extend existing message assertions to retain the single-pane Back behavior at phone widths

- [ ] **Step 2: Run focused component tests and verify RED**

Run: `npm test -- tests/components/consumer-workspace.test.jsx tests/components/social-launch-ui.test.jsx tests/components/messages-responsive.test.jsx`

Expected: FAIL on the new overflow and reachability contracts

- [ ] **Step 3: Apply the responsive fixes**

Use `min-w-0`, `max-w-full` and `overflow-x-hidden` at page boundaries. Change unconditional `px-6` page padding to `px-3 sm:px-6`. Keep settings tabs horizontal below `md`, make header search collapse to an icon/label where necessary, ensure account controls remain visible, and use `min-h-11` for primary phone actions. Do not hide functionality on phone

- [ ] **Step 4: Add browser viewport smoke coverage**

Start the production build locally and inspect `/settings`, `/explore`, `/feed`, `/messages`, `/collections`, `/saved` and `/subscriptions` at 320, 360, 390 and 768 CSS pixels. For each route assert:

```js
document.documentElement.scrollWidth <= document.documentElement.clientWidth
```

Also verify the account menu, bottom navigation, category controls and primary page action remain clickable. Record no screenshots in Git

- [ ] **Step 5: Run focused tests and commit**

Run: `npm test -- tests/components/consumer-workspace.test.jsx tests/components/social-launch-ui.test.jsx tests/components/messages-responsive.test.jsx`

Expected: all focused tests pass

```powershell
git add -- src/layouts/FanLayout.jsx src/components/consumer/ProfileEditor.jsx src/components/consumer/SearchPanel.jsx 'src/app/(fan)/settings/page.jsx' 'src/app/(fan)/collections/page.jsx' 'src/app/(fan)/saved/page.jsx' 'src/app/(fan)/subscriptions/page.jsx' tests/components/consumer-workspace.test.jsx tests/components/social-launch-ui.test.jsx tests/components/messages-responsive.test.jsx
git commit -m "fix: harden consumer phone layouts"
```

---

### Task 5: Verify, migrate and release

**Files:**
- Modify only if verification exposes a scoped defect
- Preserve: `docs/superpowers/plans/2026-08-04-consumer-core.md`

**Interfaces:**
- Consumes: the four completed tasks and the existing Vercel production project
- Produces: deployed schema, cleaned production content and evidence-backed working-feature list

- [ ] **Step 1: Run the complete local verification suite**

Run in separate commands and require exit code 0 from each:

```powershell
npm test
npm run lint
npx prisma validate
npm run build
```

Expected: every test passes, ESLint reports no errors, Prisma reports a valid schema and Next.js completes all routes

- [ ] **Step 2: Inspect the release diff and migration**

Run:

```powershell
git diff origin/main...HEAD --check
git status --short
git log --oneline origin/main..HEAD
```

Expected: only scoped release files differ; the unrelated consumer-core plan remains unstaged

- [ ] **Step 3: Push the reviewed branch to GitHub main through the chosen integration workflow**

After the implementation branch is reviewed and merged, run `git push origin main` and verify the remote commit equals local main

- [ ] **Step 4: Apply the production migration**

Pull Vercel production environment variables into a temporary directory without printing secrets, set `DATABASE_URL` from that file, and run:

```powershell
npx prisma migrate deploy
```

Expected: migration `20260805030000_add_profile_address` is applied successfully

- [ ] **Step 5: Run the gated idempotent production importer**

Set `BLINDLY_DEMO_CONTENT_CONFIRMATION=blindly-production-demo-content` only for the importer process and run `npm run db:import-demo-content`

Expected counts: `users=12`, `creatorProfiles=12`, `posts=36`, `stories=12`, `liveSessions=4`, `follows=12`, `likes=36`, `comments=12`

- [ ] **Step 6: Wait for Vercel Ready and smoke test production**

Verify the same alias `https://creavora.vercel.app` and require:

- `/landing`, `/login` and `/explore` route correctly
- Unknown valid-shape login returns 401
- Malformed login JSON returns 400
- A temporary account can register, log in, call `/api/auth/me`, update city/state and address, log out, and be removed
- Authenticated Explore returns database categories and creator pages
- No presented API payload contains `[blindly-demo:`, `(Blindly Demo)` or `blindly-demo-`
- Vercel reports the production deployment as Ready

- [ ] **Step 7: Remove temporary production environment files**

Delete only the exact verified temporary directory containing the pulled environment file and smoke logs. Confirm the path is under `C:\tmp` before deletion and confirm it no longer exists

- [ ] **Step 8: Report the verified working feature list**

List only behaviors demonstrated by automated tests or the production smoke run, including authentication, profile editing and images, database Explore, feed/social actions, messages, notifications, collections, saved posts, subscriptions read state, live discovery and responsive navigation
