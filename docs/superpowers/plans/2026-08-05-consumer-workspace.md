# Blindly Consumer Workspace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Deliver an image-led, responsive Blindly consumer workspace with real social data, full user navigation, and safely imported production demo content.

**Architecture:** Add a consumer workspace query layer and authenticated Home endpoint over existing Prisma relations. Compose Home, Feed, and user routes from API-backed React components. Replace legacy static screens with real data or clear unavailable states, and use a separately invoked idempotent importer for demo creators and activity.

**Tech Stack:** Next.js App Router, React, Tailwind CSS, Lucide React, Prisma PostgreSQL, Vitest, Testing Library.

## Global Constraints

- Visible product name is Blindly and public URLs remain compatible
- No trailing full stops in titles, headings, buttons, labels, or metadata titles
- Use curated editorial photography, never generated people, and provide accessible failed-image fallback
- Do not fabricate balances, payment completion, rewards, subscriptions, messages, or live status
- Browser pages use authenticated HTTP APIs and never query Prisma directly
- Production import requires exactly BLINDLY_DEMO_CONTENT_CONFIRMATION=blindly-production-demo-content
- Importer updates only its own Blindly demo namespace and never runs as a build lifecycle hook
- Preserve docs/superpowers/plans/2026-08-04-consumer-core.md because it is user-owned and dirty

---

## File Structure

| Path | Responsibility |
| --- | --- |
| src/lib/consumer/workspace.js | Bounded Home dashboard queries and view models |
| src/app/api/consumer/home/route.js | Authenticated Home endpoint |
| src/components/consumer/EditorialImage.jsx | Photo crop, alt text, and accessible failure state |
| src/components/consumer/ConsumerWorkspaceNav.jsx | Full desktop, mobile, and account navigation |
| src/components/consumer/HomeDashboard.jsx | Home composition from API data |
| src/components/consumer/FeedRail.jsx | Reusable creator, topic, and live contextual rail |
| src/components/consumer/StoryStrip.jsx | Real story row and empty state |
| src/app/(fan)/home/page.jsx | API-backed consumer Home |
| src/app/(fan)/feed/page.jsx | Image-led feed with latest, following, trending controls |
| src/app/api/messages/route.js | Persisted conversation-list, thread, and send contracts |
| src/app/api/bookmarks/route.js | Saved-posts query |
| src/app/api/live/route.js | Read-only scheduled/live-session query |
| scripts/import-blindly-demo-content.mjs | Explicit production-safe demo importer |
| tests/components/consumer-workspace.test.jsx | Navigation, responsive composition, and image-fallback checks |
| tests/api/consumer-workspace-routes.test.js | HTTP route and disabled-mutation checks |
| tests/consumer/demo-importer.test.js | Confirmation, namespace, and idempotence checks |

### Task 1: Restore the full consumer frame and resilient media

**Files:**
- Create: src/components/consumer/EditorialImage.jsx
- Create: src/components/consumer/ConsumerWorkspaceNav.jsx
- Modify: src/components/consumer/ResponsiveNav.jsx
- Modify: src/layouts/FanLayout.jsx
- Modify: src/app/(fan)/page.jsx
- Create: src/app/(fan)/home/page.jsx
- Modify: src/app/(fan)/wallet/page.jsx
- Modify: src/app/(fan)/rewards/page.jsx
- Modify: src/app/(fan)/explore/page.jsx
- Modify: src/app/(fan)/creator/[handle]/page.jsx
- Test: tests/components/consumer-workspace.test.jsx

**Interfaces:**
- consumerNavigation contains href, label, icon entries for Home, Feed, Explore, Live, Subscriptions, Messages, Notifications, Collections, Wallet, Rewards, Saved Posts, Settings
- EditorialImage accepts src, alt, className, fallbackLabel; it preserves card footprint and shows an accessible fallback after image error
- Signed-in root and every exposed navigation href resolves without a 404
- Wallet and Rewards may never expose a fabricated balance, payment, reward, or claim action while their real data task remains pending

- [ ] **Step 1: Write failing navigation and image-fallback tests**

~~~jsx
it("shows the complete desktop user navigation", () => {
  render(<ConsumerWorkspaceNav pathname="/home" variant="desktop" />);
  expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/home");
  expect(screen.getByRole("link", { name: "Saved Posts" })).toHaveAttribute("href", "/saved");
});

it("replaces failed editorial media with an accessible fallback", async () => {
  render(<EditorialImage src="https://invalid.example/photo.jpg" alt="Studio portrait" fallbackLabel="Photo unavailable" />);
  fireEvent.error(screen.getByRole("img", { name: "Studio portrait" }));
  expect(await screen.findByText("Photo unavailable")).toBeInTheDocument();
});
~~~

- [ ] **Step 2: Run test to verify it fails**

Run: npm test -- tests/components/consumer-workspace.test.jsx

Expected: FAIL because the components do not exist.

- [ ] **Step 3: Write minimal implementation**

~~~jsx
export const consumerNavigation = [
  { href: "/home", label: "Home", icon: House },
  { href: "/feed", label: "Feed", icon: LayoutGrid },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/live", label: "Live", icon: Radio },
  { href: "/subscriptions", label: "Subscriptions", icon: BadgeCheck },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/collections", label: "Collections", icon: FolderHeart },
  { href: "/wallet", label: "Wallet", icon: WalletCards },
  { href: "/rewards", label: "Rewards", icon: Award },
  { href: "/saved", label: "Saved Posts", icon: Bookmark },
  { href: "/settings", label: "Settings", icon: Settings },
];
~~~

Implement image failure state with onError and apply it to consumer editorial image cards already reached by the new navigation. Use ConsumerWorkspaceNav in FanLayout and use Home, Feed, Explore, Notifications, Profile for mobile. Keep all remaining destinations in the account menu. Redirect root to a safe /home route that delegates to Feed until Task 2 replaces it with the Home dashboard. Replace Wallet and Rewards legacy placeholders with concise unavailable states that have no mutation controls, fixed balances, leaderboard, badges, or reward claims.

- [ ] **Step 4: Run test to verify it passes**

Run: npm test -- tests/components/consumer-workspace.test.jsx && npm run lint

Expected: PASS with no lint warnings.

- [ ] **Step 5: Commit**

~~~bash
git add src/components/consumer/EditorialImage.jsx src/components/consumer/ConsumerWorkspaceNav.jsx src/components/consumer/ResponsiveNav.jsx src/layouts/FanLayout.jsx src/app/(fan)/page.jsx src/app/(fan)/home/page.jsx src/app/(fan)/wallet/page.jsx src/app/(fan)/rewards/page.jsx src/app/(fan)/explore/page.jsx src/app/(fan)/creator/[handle]/page.jsx tests/components/consumer-workspace.test.jsx
git commit -m "feat: restore Blindly consumer navigation"
~~~

### Task 2: Create Home dashboard data and composition

**Files:**
- Create: src/lib/consumer/workspace.js
- Create: src/app/api/consumer/home/route.js
- Create: src/components/consumer/FeedRail.jsx
- Create: src/components/consumer/HomeDashboard.jsx
- Create: src/app/(fan)/home/page.jsx
- Create: src/app/api/live/route.js
- Modify: src/app/(fan)/live/page.jsx
- Modify: src/lib/consumer/constants.js
- Modify: src/lib/consumer/feed.js
- Modify: src/services/consumer-api.js
- Test: tests/api/consumer-workspace-routes.test.js
- Test: tests/consumer/feed.test.js
- Test: tests/components/consumer-workspace.test.jsx

**Interfaces:**
- getConsumerHome(database, viewerId) returns viewer, categories, creators, featuredPosts, stories, liveSessions, subscriptions, unreadNotifications
- Feed modes include latest, following, trending before Home requests featured trending posts
- GET /api/consumer/home returns that view model through withAuth
- getConsumerHome in consumer-api requests the endpoint
- HomeDashboard accepts data and onFollow and has no fixed people, money, or activity
- GET /api/live returns real scheduled/live-session data before Home links a card to /live

**Reference visual contract:** Desktop Home follows the supplied reference hierarchy: existing left rail; broad centre column with welcome, dark editorial hero collage, category-action strip, creator card row, and live row; 300px right column with subscriptions, upcoming sessions, and account activity. The hero renders 3-5 real creator images returned by the Home API, never fixed people. Creator cards use photo-first covers, identity, real metrics, and follow actions rather than static price claims. Right-rail panels retain their shape with truthful empty copy when data is absent. Categories link to Explore with category query, featured Like and Bookmark controls call their real APIs, video stories render as video, and no Home card links to a static/fabricated destination.

- [ ] **Step 1: Write failing endpoint and empty-dashboard tests**

~~~js
it("returns bounded viewer-safe Home data", async () => {
  const response = await createConsumerHomeGet({ database: fixtureDatabase })(request, { user: fixtureUser });
  expect(await response.json()).toMatchObject({
    categories: expect.arrayContaining(["Fitness", "Technology"]),
    creators: expect.any(Array),
    featuredPosts: expect.any(Array),
  });
});
~~~

~~~jsx
it("uses an honest Home empty state", () => {
  render(<HomeDashboard data={{ viewer: { name: "Riya" }, categories: [], creators: [], featuredPosts: [], stories: [], liveSessions: [], subscriptions: [], unreadNotifications: 0 }} />);
  expect(screen.getByText("Your Blindly workspace is ready for new connections")).toBeInTheDocument();
  expect(screen.queryByText("Ananya Sharma")).not.toBeInTheDocument();
});
~~~

- [ ] **Step 2: Run test to verify it fails**

Run: npm test -- tests/api/consumer-workspace-routes.test.js tests/consumer/feed.test.js tests/components/consumer-workspace.test.jsx

Expected: FAIL because the Home query, endpoint, and UI do not exist.

- [ ] **Step 3: Write minimal implementation**

~~~js
export async function getConsumerHome(database, viewerId) {
  const results = await Promise.all([
    loadViewer(database, viewerId),
    getDiscovery(database, viewerId),
    getFeedPage(database, viewerId, { mode: "trending", limit: 4, cursor: null }),
    loadStories(database, viewerId),
    loadLiveSessions(database),
    loadSubscriptions(database, viewerId),
    countUnreadNotifications(database, viewerId),
  ]);
  return presentConsumerHome(results);
}
~~~

Add trending to the feed mode set and order it by likesCount, commentsCount, publishedAt, id. Encode and validate a mode-specific opaque cursor before Home requests featured trending posts. Use existing presentCreator and presentPost helpers, filter deleted records, and cap every query. Add the read-only Live API/page in this task. HomeDashboard uses EditorialImage, CreatorCard, FeedCard, and FeedRail in the reference visual hierarchy. Every visual card links to a real route; unavailable lists show concise empty states. Wire featured Like/Bookmark controls to their existing APIs, render video stories with video-capable media, and generate Explore category href values with category query.

- [ ] **Step 4: Run test to verify it passes**

Run: npm test -- tests/api/consumer-workspace-routes.test.js tests/consumer/feed.test.js tests/components/consumer-workspace.test.jsx && npm run lint

Expected: PASS with no Home overflow at 375px and 1440px.

- [ ] **Step 5: Commit**

~~~bash
git add src/lib/consumer/workspace.js src/app/api/consumer/home/route.js src/app/api/live/route.js src/components/consumer/FeedRail.jsx src/components/consumer/HomeDashboard.jsx src/app/(fan)/home/page.jsx src/app/(fan)/live/page.jsx src/lib/consumer/constants.js src/lib/consumer/feed.js src/services/consumer-api.js tests/api/consumer-workspace-routes.test.js tests/consumer/feed.test.js tests/components/consumer-workspace.test.jsx
git commit -m "feat: add Blindly consumer home dashboard"
~~~

### Task 3: Upgrade Feed and Explore with real stories and contextual discovery

**Files:**
- Create: src/components/consumer/StoryStrip.jsx
- Modify: src/app/(fan)/feed/page.jsx
- Modify: src/app/(fan)/explore/page.jsx
- Modify: src/components/consumer/FeedCard.jsx
- Modify: src/components/consumer/FeedRail.jsx
- Modify: src/components/consumer/CreatorCard.jsx
- Test: tests/consumer/feed.test.js
- Test: tests/components/consumer-workspace.test.jsx
- Test: tests/components/feed-card.test.jsx
- Test: tests/components/explore-search.test.jsx

**Interfaces:**
- Feed uses the completed latest, following, trending mode contract from Task 2
- StoryStrip accepts only real stories and has a no-stories state
- FeedRail accepts real creators, topics, live sessions

- [ ] **Step 1: Write failing composition, failed-media, and discovery-cover tests**

~~~jsx
it("keeps Feed actions usable after media failure", () => {
  render(<FeedCard post={postWithImage} onLike={vi.fn()} onBookmark={vi.fn()} />);
  fireEvent.error(screen.getByRole("img", { name: postWithImage.content }));
  expect(screen.getByRole("button", { name: /Like post by/i })).toBeEnabled();
});
~~~

- [ ] **Step 2: Run test to verify it fails**

Run: npm test -- tests/consumer/feed.test.js tests/components/consumer-workspace.test.jsx tests/components/feed-card.test.jsx tests/components/explore-search.test.jsx

Expected: FAIL because Feed has no story or contextual-rail composition.

- [ ] **Step 3: Write minimal implementation**

Render the completed Trending mode in Feed, then add StoryStrip and FeedRail. FeedRail receives creator/topic/live data from the Home API. Explore renders API photo URLs through EditorialImage while retaining its search/history behavior.

- [ ] **Step 4: Run test to verify it passes**

Run: npm test -- tests/consumer/feed.test.js tests/components/feed-card.test.jsx tests/components/explore-search.test.jsx tests/components/consumer-workspace.test.jsx && npm run lint

Expected: PASS with no blank media rectangle after error event.

- [ ] **Step 5: Commit**

~~~bash
git add src/components/consumer/StoryStrip.jsx src/components/consumer/FeedRail.jsx src/components/consumer/CreatorCard.jsx src/app/(fan)/feed/page.jsx src/app/(fan)/explore/page.jsx src/components/consumer/FeedCard.jsx tests/consumer/feed.test.js tests/components/consumer-workspace.test.jsx tests/components/feed-card.test.jsx tests/components/explore-search.test.jsx
git commit -m "feat: enrich Blindly feed and discovery"
~~~

### Task 4: Replace static user destinations and unsafe money/XP mutations

**Files:**
- Modify: src/app/api/messages/route.js
- Create: src/app/api/bookmarks/route.js
- Modify: src/app/(fan)/messages/page.jsx
- Modify: src/app/(fan)/collections/page.jsx
- Modify: src/app/(fan)/saved/page.jsx
- Modify: src/app/(fan)/subscriptions/page.jsx
- Modify: src/app/api/subscriptions/route.js
- Modify: src/app/api/subscriptions/cancel/route.js
- Modify: src/app/api/wallet/deposit/route.js
- Modify: src/app/api/rewards/route.js
- Modify: src/app/api/payments/create-order/route.js
- Modify: src/app/api/payments/verify/route.js
- Modify: src/services/consumer-api.js
- Test: tests/api/consumer-workspace-routes.test.js
- Test: tests/components/consumer-workspace.test.jsx

**Interfaces:**
- GET /api/messages returns conversation summaries; GET /api/messages?userId=uuid returns participant and MessageView items; POST accepts receiverId and content
- GET /api/bookmarks returns presented post items for current user
- Subscription purchase/cancellation, payment order/verification, wallet deposit, reward claim each return 501 with error This feature is not available yet before reading request body or mutating data

- [ ] **Step 1: Write failing persisted-data and disabled-mutation tests**

~~~js
it("lists persisted conversations and sends by receiver id", async () => {
  const response = await createMessagesGet({ database })(request, { user });
  expect((await response.json()).items[0].participant.id).toBe(recipient.id);
  expect((await createMessagesPost({ database })(postRequest({ receiverId: recipient.id, content: "Hello" }), { user })).status).toBe(201);
});

it.each([createSubscriptionPost, createWalletDepositPost, createRewardPost])("rejects unconfigured money or XP mutation", async (handler) => {
  expect((await handler(postRequest({}), { user })).status).toBe(501);
});
~~~

- [ ] **Step 2: Run test to verify it fails**

Run: npm test -- tests/api/consumer-workspace-routes.test.js tests/components/consumer-workspace.test.jsx

Expected: FAIL because legacy screens use static arrays and unsafe mutations succeed.

- [ ] **Step 3: Write minimal implementation**

~~~js
const rows = await database.message.findMany({
  where: { OR: [{ senderId: user.id }, { receiverId: user.id }], deletedAt: null },
  orderBy: { createdAt: "desc" },
  include: { sender: participantSelect, receiver: participantSelect },
});
~~~

Deduplicate threads by participant ID. Collections use existing create/delete API. Saved Posts uses bookmarks endpoint. Replace arrays, alert, confirm, and silent fallback chats with accessible loading, error, pending, and empty states. Error and empty states are mutually exclusive; an active collection modal exposes its own mutation error. A thread request clears pending state only while it is still the selected request. Subscription displays actual read-only data only and removes purchase actions. Wallet and Rewards remain the safe unavailable pages completed in Task 1 until a separate provider and eligibility release is approved.

- [ ] **Step 4: Run test to verify it passes**

Run: npm test -- tests/api/consumer-workspace-routes.test.js tests/components/consumer-workspace.test.jsx && npm run lint

Expected: PASS; static user names and payment-success copy are absent from user route source.

- [ ] **Step 5: Commit**

~~~bash
git add src/app/api/messages/route.js src/app/api/bookmarks/route.js src/app/(fan)/messages/page.jsx src/app/(fan)/collections/page.jsx src/app/(fan)/saved/page.jsx src/app/(fan)/subscriptions/page.jsx src/app/api/subscriptions/route.js src/app/api/subscriptions/cancel/route.js src/app/api/wallet/deposit/route.js src/app/api/rewards/route.js src/app/api/payments/create-order/route.js src/app/api/payments/verify/route.js src/services/consumer-api.js tests/api/consumer-workspace-routes.test.js tests/components/consumer-workspace.test.jsx
git commit -m "feat: connect Blindly consumer destinations"
~~~

### Task 5: Add safe and idempotent demo import

**Files:**
- Create: scripts/import-blindly-demo-content.mjs
- Modify: package.json
- Modify: prisma/seed.mjs
- Test: tests/consumer/demo-importer.test.js
- Test: tests/seed/seed-shape.test.js

**Interfaces:**
- assertDemoImportEnvironment rejects non-PostgreSQL URLs and missing/wrong literal confirmation
- importBlindlyDemoContent accepts database and now, upserts importer-namespace users/posts/stories/lives/social relationships, and returns counts
- npm run db:import-demo-content invokes only the importer and no build hook

- [ ] **Step 1: Write failing guard and idempotence tests**

~~~js
it("requires exact production confirmation", () => {
  expect(() => assertDemoImportEnvironment({ DATABASE_URL: "postgresql://host/db" })).toThrow("BLINDLY_DEMO_CONTENT_CONFIRMATION");
});

it("does not duplicate importer-owned records", async () => {
  await importBlindlyDemoContent({ database, now: new Date("2026-08-05T09:00:00.000Z") });
  await importBlindlyDemoContent({ database, now: new Date("2026-08-05T09:00:00.000Z") });
  expect(database.post.upsert).toHaveBeenCalled();
});
~~~

- [ ] **Step 2: Run test to verify it fails**

Run: npm test -- tests/consumer/demo-importer.test.js tests/seed/seed-shape.test.js

Expected: FAIL because production importer does not exist.

- [ ] **Step 3: Write minimal implementation**

~~~js
const DEMO_EMAIL_DOMAIN = "blindly.demo";
const DEMO_POST_PREFIX = "[blindly-demo:";

export function assertDemoImportEnvironment(env) {
  if (env.BLINDLY_DEMO_CONTENT_CONFIRMATION !== "blindly-production-demo-content") {
    throw new Error("Set BLINDLY_DEMO_CONTENT_CONFIRMATION=blindly-production-demo-content to import demo content");
  }
  if (!env.DATABASE_URL || !env.DATABASE_URL.startsWith("postgres")) {
    throw new Error("DATABASE_URL must be a PostgreSQL URL");
  }
}
~~~

Upsert twelve India-relevant creators and thirty-six image-led posts across Fitness, Sports, Technology, Fashion, Food, Travel, Education, Music, Art, Comedy, Gaming, Lifestyle. Create stable follows, likes, comments, unexpired stories, scheduled LiveSession rows. Use fixed real editorial photo URLs and stable post markers. Do not delete records. Keep local-only runSeed production guard unchanged.

- [ ] **Step 4: Run test to verify it passes**

Run: npm test -- tests/consumer/demo-importer.test.js tests/seed/seed-shape.test.js tests/consumer/social-launch-data.test.js && npm run lint

Expected: PASS and no import runs during tests/build.

- [ ] **Step 5: Commit**

~~~bash
git add scripts/import-blindly-demo-content.mjs package.json prisma/seed.mjs tests/consumer/demo-importer.test.js tests/seed/seed-shape.test.js
git commit -m "feat: add guarded Blindly demo content importer"
~~~

### Task 6: Document, verify, deploy, and import demo data

**Files:**
- Modify: README.md
- Modify: .env.example
- Modify: tests/consumer/demo-importer.test.js

**Interfaces:**
- README gives literal confirmation variable, one-time command, and explains it is not part of Vercel build
- .env.example contains only safe variable names and comments

- [ ] **Step 1: Write failing documentation assertion**

~~~js
it("documents the explicit importer guard", () => {
  const readme = readFileSync("README.md", "utf8");
  expect(readme).toContain("BLINDLY_DEMO_CONTENT_CONFIRMATION=blindly-production-demo-content");
  expect(readme).toContain("not part of the Vercel build");
});
~~~

- [ ] **Step 2: Run test to verify it fails**

Run: npm test -- tests/consumer/demo-importer.test.js

Expected: FAIL until operation documentation is added.

- [ ] **Step 3: Document release operation and run verification**

~~~bash
npm test
npm run lint
npx prisma validate
npm run build
git status --short
git push origin main
~~~

Document that Vercel environment pulls are operator-only and never committed. After GitHub/Vercel deploy is Ready, run importer once against production database, capture import counts, and verify /home, /feed, /explore, /live, /messages, /saved, /collections, /notifications, /profile, /settings.

- [ ] **Step 4: Run final verification**

Run: npm test && npm run lint && npx prisma validate && npm run build

Expected: all tests pass, lint has zero warnings, Prisma validates, and build exits 0. At 375px, 768px, 1440px every authenticated page keeps controls visible; photos render or show labelled fallback; exposed actions complete or show documented unavailable state.

- [ ] **Step 5: Commit, push, import, report evidence**

~~~bash
git add README.md .env.example tests/consumer/demo-importer.test.js
git commit -m "docs: document Blindly consumer release operations"
git push origin main
~~~

After production deploy is Ready, execute explicitly confirmed importer and report deployed URL, commit SHA, importer counts, route checks, and verification results.

## Plan Self-Review

- **Spec coverage:** Tasks 1-4 cover responsive navigation, Home, Feed, Explore, messages, collections, saves, live, and safe supporting pages. Task 5 supplies production density. Task 6 verifies/deploys. Password recovery and payment processing remain excluded as approved.
- **Placeholder scan:** Every listed behavior has a concrete task, test command, and implementation boundary. Unavailable states are intentional, tested boundaries.
- **Type consistency:** getConsumerHome, EditorialImage, consumerNavigation, feed modes, and endpoint shapes use the same names in every task.
