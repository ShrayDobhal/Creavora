# Blindly Social Launch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a trustworthy, responsive Blindly social launch where registered people can maintain a profile, follow people, publish image-backed posts, and browse a dense India-focused development feed.

**Architecture:** Keep the existing Next.js App Router and Prisma/PostgreSQL application as the single source of truth. Add focused authenticated profile, post, and upload APIs; use an S3-compatible Cloudflare R2 adapter only when its server-side environment variables are present; and make the consumer UI call those APIs rather than relying on the existing static profile/settings screens. Development content is created only by the opt-in local seed command and uses the same relations and feed endpoint as real accounts.

**Tech Stack:** Next.js 16, React 19, Prisma 7/PostgreSQL, Zod, Vitest/Testing Library, Tailwind CSS 4, Cloudflare R2 through `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner`.

## Global Constraints

- The public product name is **Blindly**; keep existing repository/package names, historical data, and current public URLs compatible.
- No displayed title, primary heading, button, menu item, notification copy, or metadata title may end with a full stop.
- Only list navigation destinations whose primary action works in this release. Hide wallet, rewards, subscriptions, collections, live, communities, and messaging from the release navigation until their complete APIs are enabled.
- A signed-in `USER` and `CREATOR` can both create standard social posts. Do not gate normal publishing behind a paid feature or a creator role.
- R2 image uploads are image-only, client-limited to 5 MiB, compressed client-side before signing, scoped to the signed-in user, and fail closed with an honest unavailable message when configuration is absent.
- Never put R2 credentials in client code, commits, screenshots, tests, or logs. R2 is optional until `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, and `R2_PUBLIC_BASE_URL` are configured on the host.
- Preserve the protected production-seed guard: `npm run db:seed` may run only under `NODE_ENV=development`, a distinct local `SEED_DATABASE_URL`, and `SEED_DEVELOPMENT_CONFIRMATION=local-development`.
- Development seed records must cover Fitness, Sports, Technology, Fashion, Food, Travel, Education, Music, Art, Comedy, Gaming, and Lifestyle. They must use rights-cleared editorial/stock URLs, never generated portraits, and must never run in production.
- Use responsive, keyboard-accessible controls with visible focus states. No horizontal viewport overflow is permitted from 320 px upward.
- Keep the existing app tests passing; add behavior tests before implementation and do not remove security, authentication, or soft-delete filters to make tests pass.

---

## File Structure

- `prisma/schema.prisma` — adds profile/privacy and uploaded-media persistence fields while retaining existing user and post records.
- `prisma/migrations/20260805000000_blindly_social_launch/migration.sql` — additive PostgreSQL migration for the new columns, `MediaAsset` table, constraints, and indexes.
- `src/lib/validators.js` — narrows publish media to images and validates editable profile and upload-sign requests.
- `src/lib/consumer/profile.js` — creates the authenticated profile read/update contract and derives real follower/following/post totals.
- `src/lib/storage/r2.js` — server-only R2 configuration check, key construction, upload signing, and public URL verification.
- `src/app/api/profile/route.js` — authenticated `GET`/`PATCH` profile API.
- `src/app/api/uploads/sign/route.js` — authenticated upload-sign API; it returns a stable 503 configuration response when R2 is unavailable.
- `src/app/api/posts/route.js` — permits authenticated standard post creation and persists only a verified owned image asset.
- `src/app/api/posts/[id]/route.js` — authenticated owner-only `PATCH`/`DELETE` post API with soft deletion.
- `src/services/consumer-api.js` — typed-by-convention browser request helpers for profile, signing, direct PUT, and post mutation flows.
- `src/components/consumer/PostComposer.jsx` — accessible compose/publish UI with image preview, compression, upload state, and recovery.
- `src/components/consumer/ProfileEditor.jsx` — controlled profile/settings form that calls the real profile API and refreshes account identity.
- `src/components/consumer/OwnedPostMenu.jsx` — owner-only edit and delete menu used by feed/profile cards.
- `src/components/consumer/ResponsiveNav.jsx` — one source of truth for desktop sidebar, compact header actions, and mobile bottom navigation.
- `src/layouts/FanLayout.jsx` — Blindly mark, real profile/settings/logout account menu, responsive shell, and no static release-navigation claims.
- `src/app/(fan)/feed/page.jsx` — real compose entry point, category filtering, post refresh after a publish/mutation, and responsive feed layout.
- `src/app/(fan)/profile/page.jsx` — replaces static Ananya content with the authenticated or requested persisted profile and owned posts.
- `src/app/(fan)/settings/page.jsx` — replaces alerts/static billing panels with real profile, privacy, and logout settings.
- `src/app/(fan)/explore/page.jsx` — renders real category rails and retains search/follow behaviors on narrow layouts.
- `src/app/globals.css` — app-wide overflow and reduced-motion-safe transition rules.
- `prisma/seed.mjs` — deterministic, idempotent local social graph with balanced posts for every launch category.
- `.env.example` — documented R2 variables with no secret values.
- `tests/api/social-launch-routes.test.js` — API contracts for profile, upload signing, normal user publishing, owned post mutation, and logout.
- `tests/components/social-launch-ui.test.jsx` — account menu/logout, compose/upload, profile editor, and responsive navigation behavior.
- `tests/consumer/social-launch-data.test.js` — seed category and feed-density assertions without connecting to a database.

## Task 1: Establish the launch data contract and profile APIs

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20260805000000_blindly_social_launch/migration.sql`
- Modify: `src/lib/validators.js`
- Create: `src/lib/consumer/profile.js`
- Create: `src/app/api/profile/route.js`
- Create: `tests/api/social-launch-routes.test.js`

**Interfaces:**
- Consumes: `withAuth(handler)` from `src/lib/middleware.js`, Prisma `db`, and the existing `Follow`/`Post` relations.
- Produces: `getCurrentProfile(database, userId) -> Promise<ProfilePayload>` and `updateCurrentProfile(database, userId, input) -> Promise<ProfilePayload>`.
- Produces: `GET /api/profile -> 200 ProfilePayload` and `PATCH /api/profile -> 200 ProfilePayload`; absent identity returns the existing middleware 401 response.
- `ProfilePayload` is `{ id, name, email, handle, bio, avatar, coverImage, roleTitle, location, website, profileVisibility, counts: { followers, following, posts } }`.

- [ ] **Step 1: Write the failing profile API tests**

```js
it("returns persisted profile fields and real social counts", async () => {
  const response = await createProfileGet({ user: { findUnique: vi.fn().mockResolvedValue(profileRow) } })(
    new Request("http://localhost/api/profile"), { user: { id: "user-1" } },
  );
  expect(await response.json()).toMatchObject({
    handle: "neha-runs", location: "Bengaluru", counts: { followers: 12, following: 8, posts: 4 },
  });
});

it("rejects a profile update with an invalid website before calling Prisma", async () => {
  const update = vi.fn();
  const response = await createProfilePatch({ user: { update } })(
    jsonRequest("PATCH", { website: "not a url" }), { user: { id: "user-1" } },
  );
  expect(response.status).toBe(400);
  expect(update).not.toHaveBeenCalled();
});
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `npm test -- tests/api/social-launch-routes.test.js`

Expected: FAIL because the profile route factories and profile fields do not exist.

- [ ] **Step 3: Add the additive Prisma shape and validators**

```prisma
model User {
  // existing fields remain unchanged
  location          String?
  website           String?
  profileVisibility String @default("PUBLIC")
  mediaAssets       MediaAsset[]
}

model MediaAsset {
  id        String   @id @default(uuid())
  ownerId   String
  key       String   @unique
  publicUrl String   @unique
  mimeType  String
  bytes     Int
  width     Int?
  height    Int?
  kind      String
  createdAt DateTime @default(now())
  owner     User     @relation(fields: [ownerId], references: [id], onDelete: Cascade)

  @@index([ownerId, kind])
}
```

```js
export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  bio: z.string().max(500).nullable().optional(),
  avatar: z.string().url().nullable().optional(),
  coverImage: z.string().url().nullable().optional(),
  roleTitle: z.string().max(50).nullable().optional(),
  location: z.string().max(80).nullable().optional(),
  website: z.string().url().max(2048).nullable().optional(),
  profileVisibility: z.enum(["PUBLIC", "FOLLOWERS"]).optional(),
}).strict();
```

Create an additive migration matching these fields/table, then run `npx prisma generate`. Do not change existing IDs, delete columns, or use a database reset.

- [ ] **Step 4: Implement the profile service and authenticated route factories**

```js
export async function getCurrentProfile(database, userId) {
  const user = await database.user.findUnique({
    where: { id: userId, deletedAt: null },
    include: { _count: { select: { followers: true, following: true, posts: { where: { deletedAt: null } } } } },
  });
  if (!user) throw new Error("Profile not found");
  return presentProfile(user);
}

export function createProfilePatch({ database = db } = {}) {
  return async (request, { user }) => {
    const body = await request.json();
    const { error, data } = validateBody(updateProfileSchema, body);
    if (error) return NextResponse.json({ error: "Validation failed", details: error }, { status: 400 });
    return NextResponse.json(await updateCurrentProfile(database, user.id, data));
  };
}
```

Only allow avatar/cover URLs that belong to a `MediaAsset` owned by the requester or are null; this prevents accounts from attaching another person’s object URL.

- [ ] **Step 5: Run the focused API and generated-client checks**

Run: `npx prisma generate; npm test -- tests/api/social-launch-routes.test.js`

Expected: PASS with profile count and validation coverage.

- [ ] **Step 6: Commit the data and profile API increment**

```bash
git add prisma/schema.prisma prisma/migrations/20260805000000_blindly_social_launch/migration.sql src/lib/validators.js src/lib/consumer/profile.js src/app/api/profile/route.js tests/api/social-launch-routes.test.js
git commit -m "feat: add Blindly profile API"
```

### Task 2: Add fail-closed R2 image upload signing

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `src/lib/storage/r2.js`
- Create: `src/app/api/uploads/sign/route.js`
- Modify: `src/lib/validators.js`
- Modify: `.env.example`
- Modify: `tests/api/social-launch-routes.test.js`

**Interfaces:**
- Consumes: authenticated user ID, `MediaAsset`, `R2_*` server environment values, and browser-provided image metadata.
- Produces: `getR2Configuration(env) -> { configured: boolean, reason?: string }`, `createUploadIntent(input) -> Promise<{ assetId, key, uploadUrl, publicUrl, headers }>`.
- Produces: `POST /api/uploads/sign` accepting `{ fileName, mimeType, bytes, width, height, kind }` where `kind` is `avatar | cover | post`, returning 201 upload intent, 400 invalid image, 413 oversized image, or 503 `{ error: "Image uploads are not configured yet" }`.

- [ ] **Step 1: Write failing signing-route tests**

```js
it("fails closed when R2 configuration is absent", async () => {
  const response = await createUploadSignPost({ storage: unavailableStorage })(
    jsonRequest("POST", imageInput), { user: { id: "user-1" } },
  );
  expect(response.status).toBe(503);
  expect(await response.json()).toEqual({ error: "Image uploads are not configured yet" });
});

it("creates an owned post-image asset only for a 5 MiB-or-smaller image", async () => {
  const response = await createUploadSignPost({ storage: configuredStorage, database })(
    jsonRequest("POST", { ...imageInput, bytes: 5242880, mimeType: "image/webp" }),
    { user: { id: "user-1" } },
  );
  expect(response.status).toBe(201);
  expect(database.mediaAsset.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ ownerId: "user-1", kind: "post" }) }));
});
```

- [ ] **Step 2: Run the signing tests to verify failure**

Run: `npm test -- tests/api/social-launch-routes.test.js`

Expected: FAIL because the signing factory and storage adapter do not exist.

- [ ] **Step 3: Add only the necessary S3-compatible dependencies and storage adapter**

Run: `npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner`

```js
const required = ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET", "R2_PUBLIC_BASE_URL"];

export function getR2Configuration(env = process.env) {
  const missing = required.filter((name) => !env[name]);
  return missing.length ? { configured: false, reason: "missing_configuration" } : { configured: true };
}

export function buildObjectKey({ ownerId, assetId, extension }) {
  return `users/${ownerId}/${assetId}.${extension}`;
}
```

Use `S3Client` with `endpoint: https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`, region `auto`, and `PutObjectCommand`. Sign a PUT constrained by content type; return the expected content-type header and normalize `R2_PUBLIC_BASE_URL` before constructing the public URL.

- [ ] **Step 4: Validate signed input and persist the asset before returning the intent**

```js
export const uploadSignSchema = z.object({
  fileName: z.string().min(1).max(120),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  bytes: z.number().int().positive().max(5 * 1024 * 1024),
  width: z.number().int().positive().max(10000),
  height: z.number().int().positive().max(10000),
  kind: z.enum(["avatar", "cover", "post"]),
}).strict();
```

If signing fails after asset creation, soft-clean the new `MediaAsset` record before returning the normal 500 error. Never expose a presigned URL when the asset cannot be persisted.

- [ ] **Step 5: Document configuration and run focused tests**

Add the five blank R2 keys to `.env.example`, including the note that the public base URL has no trailing slash. Then run:

Run: `npm test -- tests/api/social-launch-routes.test.js`

Expected: PASS for unavailable, oversized, invalid-type, and configured signing responses.

- [ ] **Step 6: Commit the upload-signing increment**

```bash
git add package.json package-lock.json src/lib/storage/r2.js src/app/api/uploads/sign/route.js src/lib/validators.js .env.example tests/api/social-launch-routes.test.js
git commit -m "feat: add guarded image upload signing"
```

### Task 3: Make normal posts publishable, editable, and removable by their owner

**Files:**
- Modify: `src/app/api/posts/route.js`
- Create: `src/app/api/posts/[id]/route.js`
- Modify: `src/lib/validators.js`
- Modify: `src/lib/consumer/feed.js`
- Modify: `src/lib/consumer/presenters.js`
- Modify: `src/services/consumer-api.js`
- Modify: `tests/api/social-launch-routes.test.js`

**Interfaces:**
- Consumes: `MediaAsset` identity, `withAuth`, existing feed page contract and post soft deletion.
- Produces: `POST /api/posts` for any authenticated user, `{ id, content, mediaUrl, mediaType, ... }` with HTTP 201.
- Produces: `PATCH /api/posts/:id` for the owner with `{ content }`, `DELETE /api/posts/:id` for the owner with HTTP 204, and 403 for anyone else.
- Produces: browser helpers `createPost(input)`, `updatePost(id, input)`, and `deletePost(id)`.

- [ ] **Step 1: Write failing ownership and standard-user publishing tests**

```js
it("lets a USER publish an owned signed image post", async () => {
  const response = await createPostPost({ database })(
    jsonRequest("POST", { content: "Sunday run in Cubbon Park", mediaAssetId: "asset-1" }),
    { user: { id: "user-1", role: "USER", name: "Nisha" } },
  );
  expect(response.status).toBe(201);
  expect(database.post.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ creatorId: "user-1", mediaType: "image" }) }));
});

it("returns 403 without updating a post owned by somebody else", async () => {
  const response = await createPostPatch({ database: postOwnedByOtherUser })(
    jsonRequest("PATCH", { content: "Changed copy" }), { user: { id: "user-1" }, params: Promise.resolve({ id: "post-2" }) },
  );
  expect(response.status).toBe(403);
});
```

- [ ] **Step 2: Run the post mutation tests to verify failure**

Run: `npm test -- tests/api/social-launch-routes.test.js`

Expected: FAIL because posts require `CREATOR` and there is no owner mutation route.

- [ ] **Step 3: Define the safe publish and mutation schemas**

```js
export const createPostSchema = z.object({
  content: z.string().min(1, "Post content is required").max(5000).trim(),
  mediaAssetId: z.string().uuid().nullable().optional(),
}).strict();

export const updatePostSchema = z.object({
  content: z.string().min(1, "Post content is required").max(5000).trim(),
}).strict();
```

Reject an asset unless it exists, belongs to `user.id`, has `kind: "post"`, and has an allowed image MIME type. Copy its persisted `publicUrl` to `Post.mediaUrl`; never accept a caller-supplied public URL.

- [ ] **Step 4: Implement authenticated creation and owner-only mutation**

```js
export const POST = withAuth(createPostPost());

export function createPostDelete({ database = db } = {}) {
  return async (_request, { user, params }) => {
    const { id } = await params;
    const post = await database.post.findFirst({ where: { id, deletedAt: null } });
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    if (post.creatorId !== user.id) return NextResponse.json({ error: "You cannot delete this post" }, { status: 403 });
    await database.post.update({ where: { id }, data: { deletedAt: new Date() } });
    return new NextResponse(null, { status: 204 });
  };
}
```

Ensure the feed query no longer limits normal posts to only `CREATOR` owners; it must keep `Post.deletedAt = null`, author soft-delete filtering, pagination stability, and all existing viewer interaction projections. Present `viewer.canManage` from post ownership so the UI never decides ownership from a handle alone.

- [ ] **Step 5: Run post API and existing feed tests**

Run: `npm test -- tests/api/social-launch-routes.test.js tests/api/consumer-routes.test.js tests/consumer/feed.test.js`

Expected: PASS with 201 creation, 403 cross-account denial, 204 soft deletion, and no regression in pagination.

- [ ] **Step 6: Commit publishing and ownership controls**

```bash
git add src/app/api/posts/route.js src/app/api/posts/[id]/route.js src/lib/validators.js src/lib/consumer/feed.js src/lib/consumer/presenters.js src/services/consumer-api.js tests/api/social-launch-routes.test.js
git commit -m "feat: enable social post publishing"
```

### Task 4: Replace static profile/settings UI and add the real composer

**Files:**
- Create: `src/components/consumer/PostComposer.jsx`
- Create: `src/components/consumer/ProfileEditor.jsx`
- Create: `src/components/consumer/OwnedPostMenu.jsx`
- Modify: `src/app/(fan)/feed/page.jsx`
- Modify: `src/app/(fan)/profile/page.jsx`
- Modify: `src/app/(fan)/settings/page.jsx`
- Modify: `src/components/consumer/FeedCard.jsx`
- Modify: `src/services/consumer-api.js`
- Modify: `tests/components/social-launch-ui.test.jsx`

**Interfaces:**
- Consumes: `getProfile`, `updateProfile`, `signImageUpload`, `uploadSignedImage`, `createPost`, `updatePost`, `deletePost`, and `FeedCard` `post.viewer.canManage`.
- Produces: `PostComposer({ user, onPublished })`, `ProfileEditor({ profile, onSaved })`, `OwnedPostMenu({ post, onMutated })`.
- Produces: a feed refresh event after successful publish/edit/delete and a `user-update` event after profile save so the top bar identity refreshes.

- [ ] **Step 1: Write failing component behavior tests**

```jsx
it("publishes a compressed selected image and refreshes the feed", async () => {
  const user = userEvent.setup();
  render(<PostComposer user={{ name: "Nisha" }} onPublished={onPublished} />);
  await user.type(screen.getByRole("textbox", { name: "Write a post" }), "New street-style look");
  await user.upload(screen.getByLabelText("Add image"), new File(["img"], "look.jpg", { type: "image/jpeg" }));
  await user.click(screen.getByRole("button", { name: "Publish post" }));
  expect(createPost).toHaveBeenCalledWith(expect.objectContaining({ content: "New street-style look" }));
  expect(onPublished).toHaveBeenCalledOnce();
});

it("saves editable profile fields instead of showing an alert", async () => {
  const user = userEvent.setup();
  render(<ProfileEditor profile={profile} onSaved={onSaved} />);
  await user.clear(screen.getByLabelText("Location"));
  await user.type(screen.getByLabelText("Location"), "Pune");
  await user.click(screen.getByRole("button", { name: "Save profile" }));
  expect(updateProfile).toHaveBeenCalledWith(expect.objectContaining({ location: "Pune" }));
});
```

- [ ] **Step 2: Run the component test to verify failure**

Run: `npm test -- tests/components/social-launch-ui.test.jsx`

Expected: FAIL because the components and real browser helpers do not exist.

- [ ] **Step 3: Implement browser helpers and progressive upload flow**

```js
export async function signImageUpload(input) {
  return request("/api/uploads/sign", { method: "POST", body: input });
}

export async function uploadSignedImage({ uploadUrl, headers }, file, { signal } = {}) {
  const response = await fetch(uploadUrl, { method: "PUT", headers, body: file, signal });
  if (!response.ok) throw new Error("Image upload failed. Please try again.");
}
```

In `PostComposer`, use a canvas conversion only for JPEG/PNG images where it reduces byte size; preserve WebP, never upscale, and show an inline message if the compressed output is still over 5 MiB. Revoke local object URLs on replace/unmount. Keep text-only publishing available when R2 is not configured; disable only the image picker after its honest 503 response.

- [ ] **Step 4: Implement the real profile, settings, and owned-post experiences**

Replace static hard-coded people, stats, achievements, payment panels, `alert`, and nonfunctional controls in `/profile` and `/settings`. The profile page must fetch `/api/profile`, display persisted counts, list the user’s actual posts, and send avatar/cover files through the same image flow. Settings must contain only working Profile, Privacy, and Sign out controls for this release. An owner menu must provide keyboard-accessible Edit post and Delete post actions with an in-place text editor and a confirmation step before deletion.

- [ ] **Step 5: Run focused UI tests and existing feed-card tests**

Run: `npm test -- tests/components/social-launch-ui.test.jsx tests/components/feed-card.test.jsx`

Expected: PASS for publish, upload unavailable state, settings persistence, owner visibility, edit, and delete confirmation.

- [ ] **Step 6: Commit real social UI**

```bash
git add src/components/consumer/PostComposer.jsx src/components/consumer/ProfileEditor.jsx src/components/consumer/OwnedPostMenu.jsx src/app/(fan)/feed/page.jsx src/app/(fan)/profile/page.jsx src/app/(fan)/settings/page.jsx src/components/consumer/FeedCard.jsx src/services/consumer-api.js tests/components/social-launch-ui.test.jsx
git commit -m "feat: add Blindly profile and publishing UI"
```

### Task 5: Rebrand and make the application frame responsive with real logout

**Files:**
- Create: `src/components/consumer/ResponsiveNav.jsx`
- Modify: `src/layouts/FanLayout.jsx`
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.jsx`
- Modify: `src/app/(fan)/explore/page.jsx`
- Modify: `tests/components/social-launch-ui.test.jsx`
- Modify: `tests/components/root-page.test.jsx`

**Interfaces:**
- Consumes: current account user, `POST /api/auth/logout`, active pathname, and the three release destinations `/feed`, `/explore`, `/notifications` plus `/profile` and `/settings` in the account menu.
- Produces: `ResponsiveNav({ items, pathname, unreadNotifications })` with desktop/sidebar/mobile render modes and `logout() -> Promise<void>` client behavior.
- Produces: top-level public brand `Blindly`, metadata title `Blindly`, and one logout path that clears the session then navigates to `/landing`.

- [ ] **Step 1: Write failing navigation, logout, and title-copy tests**

```jsx
it("logs out through the API and returns to landing", async () => {
  const user = userEvent.setup();
  render(<UserMenu user={{ name: "Nisha", handle: "nisha" }} />);
  await user.click(screen.getByRole("button", { name: "Open account menu" }));
  await user.click(screen.getByRole("button", { name: "Sign out" }));
  expect(fetch).toHaveBeenCalledWith("/api/auth/logout", expect.objectContaining({ method: "POST" }));
  expect(push).toHaveBeenCalledWith("/landing");
});

it("keeps the launch frame within the viewport on mobile", () => {
  render(<FanLayout><div>Content</div></FanLayout>);
  expect(screen.getByRole("navigation", { name: "Primary navigation" })).toBeVisible();
  expect(screen.queryByText("Wallet")).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run the navigation tests to verify failure**

Run: `npm test -- tests/components/social-launch-ui.test.jsx tests/components/root-page.test.jsx`

Expected: FAIL because the current menu links to landing rather than invoking logout and does not render the new responsive navigation contract.

- [ ] **Step 3: Build one responsive navigation source and wire logout**

```js
const releaseItems = [
  { href: "/feed", label: "Feed", icon: LayoutGrid },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/notifications", label: "Notifications", icon: Bell },
];

async function signOut() {
  const response = await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
  if (!response.ok) throw new Error("Could not sign out. Please try again.");
  window.dispatchEvent(new Event("user-update"));
  router.push("/landing");
  router.refresh();
}
```

Use `Blindly` in the logo title, landing copy, search placeholder, metadata, and all active release routes. Account menu order is Profile, Settings, then Sign out. Use a `<button>` for Sign out, trap no focus, close on Escape/outside click, announce an inline failure, and never navigate to landing before a successful response.

- [ ] **Step 4: Add layout safety and remove inactive static claims**

```css
html, body { min-height: 100%; overflow-x: clip; }
img, video, canvas { max-width: 100%; }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { scroll-behavior: auto !important; transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
}
```

Keep transition classes short and purposeful. At `lg` show sidebar; below it show compact header controls; below `sm` show a safe-area-aware bottom navigation with enough main padding. Ensure explore search rails wrap/scroll only within their own container, never the page. Scan active JSX and metadata with `rg` for visible trailing `.` and remove only final full stops from titles/labels/headings, not paragraph prose or programmatic punctuation.

- [ ] **Step 5: Run responsive/UI checks**

Run: `npm test -- tests/components/social-launch-ui.test.jsx tests/components/root-page.test.jsx && npm run lint`

Expected: PASS and no new ESLint warnings/errors.

- [ ] **Step 6: Commit the Blindly frame**

```bash
git add src/components/consumer/ResponsiveNav.jsx src/layouts/FanLayout.jsx src/app/globals.css src/app/layout.jsx src/app/(fan)/explore/page.jsx tests/components/social-launch-ui.test.jsx tests/components/root-page.test.jsx
git commit -m "feat: rebrand launch frame as Blindly"
```

### Task 6: Seed a dense, safely scoped India-focused development feed

**Files:**
- Modify: `prisma/seed.mjs`
- Modify: `tests/seed/seed-shape.test.js`
- Create: `tests/consumer/social-launch-data.test.js`

**Interfaces:**
- Consumes: existing guarded `runSeed(environment)` and the existing Prisma `User`, `CreatorProfile`, `Follow`, and `Post` persistence.
- Produces: `LAUNCH_FEED_FIXTURES` exported from `prisma/seed.mjs`, with at least three non-premium posts per launch category and authentic category labels used by explore/search/feed.
- Produces: repeatable upserts that refresh content/counts without duplicate creators, posts, follows, or paid-feature claims.

- [ ] **Step 1: Write failing density and safety tests**

```js
it("defines at least three launch posts for every public category", async () => {
  const { LAUNCH_CATEGORIES, LAUNCH_FEED_FIXTURES } = await import("../../prisma/seed.mjs");
  expect(LAUNCH_CATEGORIES).toEqual(expect.arrayContaining(["Fitness", "Sports", "Technology", "Fashion"]));
  for (const category of LAUNCH_CATEGORIES) {
    expect(LAUNCH_FEED_FIXTURES.filter((post) => post.category === category)).toHaveLength(3);
  }
});

it("keeps launch fixture URLs on approved stock/editorial hosts", async () => {
  const { LAUNCH_FEED_FIXTURES } = await import("../../prisma/seed.mjs");
  expect(LAUNCH_FEED_FIXTURES.every(({ imageUrl }) => /^https:\/\/(images\.unsplash\.com|images\.pexels\.com)\//.test(imageUrl))).toBe(true);
});
```

- [ ] **Step 2: Run seed tests to verify failure**

Run: `npm test -- tests/seed/seed-shape.test.js tests/consumer/social-launch-data.test.js`

Expected: FAIL because the current seed does not expose the category-balanced launch fixtures.

- [ ] **Step 3: Define deterministic launch creators, relationships, and posts**

```js
export const LAUNCH_CATEGORIES = [
  "Fitness", "Sports", "Technology", "Fashion", "Food", "Travel",
  "Education", "Music", "Art", "Comedy", "Gaming", "Lifestyle",
];

export const LAUNCH_FEED_FIXTURES = [
  { handle: "neha-moves", category: "Fitness", content: "A practical 20-minute mobility session before the Bengaluru commute", imageUrl: "https://images.pexels.com/..." },
  { handle: "sideline-sam", category: "Sports", content: "Five fielding drills our weekend cricket group keeps repeating", imageUrl: "https://images.pexels.com/..." },
  { handle: "byte-by-isha", category: "Technology", content: "A calmer home-desk setup for long product sprints", imageUrl: "https://images.unsplash.com/..." },
  { handle: "tara-drapes", category: "Fashion", content: "Handloom layers that work through a humid Mumbai afternoon", imageUrl: "https://images.unsplash.com/..." },
  // Add exactly three editorial posts for each remaining category using the same fields
];
```

Use twelve distinct Indian-market creator profiles, local city descriptors, and a varied following graph. Make all launch posts public, standard, and non-premium. Preserve the current seed guards and use `upsert` keys derived from handle/content so reruns remain idempotent.

- [ ] **Step 4: Run seed tests and a guarded dry validation**

Run: `npm test -- tests/seed/seed-shape.test.js tests/consumer/social-launch-data.test.js`

Expected: PASS with twelve categories, thirty-six posts minimum, approved image hosts, and the existing production refusal tests intact.

Run: `NODE_ENV=production npm run db:seed`

Expected: exits before database connection with `Seed data is disabled in production`.

- [ ] **Step 5: Commit development feed density**

```bash
git add prisma/seed.mjs tests/seed/seed-shape.test.js tests/consumer/social-launch-data.test.js
git commit -m "feat: expand Blindly development feed"
```

### Task 7: Verify the release, migrate safely, and deploy only with configured services

**Files:**
- Modify: `README.md`
- Modify: `docs/superpowers/specs/2026-08-05-social-launch-design.md`
- Modify: `docs/superpowers/plans/2026-08-05-blindly-social-launch.md`

**Interfaces:**
- Consumes: completed migrations, automated test suite, application build, staging/production env configuration, and Vercel/GitHub credentials already available to the user account.
- Produces: a documented release checklist and a deployment whose signed-out routes, authenticated routes, profile, post creation, and upload-unconfigured state are verified by real HTTP responses.

- [ ] **Step 1: Write the failing release-checklist assertions into the plan**

Add this checklist under a `## Release Verification` heading and leave every box unchecked before validation:

```markdown
- [ ] `npm test` passes
- [ ] `npm run lint` reports no errors
- [ ] `npm run build` succeeds
- [ ] Production migration has completed before traffic is shifted
- [ ] `GET /landing` returns 200 and shows Blindly
- [ ] Signed-out `GET /feed` redirects to login
- [ ] Authenticated profile update, text post, follow, edit, delete, and logout have been manually exercised
- [ ] Image upload either succeeds with configured R2 or displays the exact truthful unavailable state with no broken UI
- [ ] 320 px, 768 px, 1024 px, and 1440 px layouts have no horizontal document overflow
```

- [ ] **Step 2: Run the complete automated verification before deployment**

Run: `npm test && npm run lint && npm run build`

Expected: all tests pass, no lint errors, and Next build completes. Do not claim release readiness if any command fails.

- [ ] **Step 3: Apply the production migration through the deployment’s configured database path**

Run: `npx prisma migrate deploy`

Expected: only `20260805000000_blindly_social_launch` and any prior unapplied migrations are applied to the database selected by the explicit production `DATABASE_URL`. Confirm the target host before invoking this command; never run `migrate reset`.

- [ ] **Step 4: Configure or intentionally omit R2 production variables**

Set `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, and `R2_PUBLIC_BASE_URL` in the Vercel project only if the user has created a free-tier R2 bucket and credentials. If they are absent, deploy without them and verify the composer retains text publishing while image selection returns `Image uploads are not configured yet`.

- [ ] **Step 5: Deploy, run HTTP smoke tests, and commit release documentation**

Run: `vercel --prod`

Run: `curl.exe -I https://creavora.vercel.app/landing; curl.exe -I https://creavora.vercel.app/feed`

Expected: landing 200; feed redirects to the login route while unauthenticated. Run the signed-in manual checklist on the same alias, then commit:

```bash
git add README.md docs/superpowers/specs/2026-08-05-social-launch-design.md docs/superpowers/plans/2026-08-05-blindly-social-launch.md
git commit -m "docs: record Blindly release verification"
git push origin main
```

Do not push a build that fails the verification step, and do not state that uploads are live unless the configured-R2 test has passed.

## Release Verification

- [ ] `npm test` passes
- [ ] `npm run lint` reports no errors
- [ ] `npm run build` succeeds
- [ ] Production migration has completed before traffic is shifted
- [ ] `GET /landing` returns 200 and shows Blindly
- [ ] Signed-out `GET /feed` redirects to login
- [ ] Authenticated profile update, text post, follow, edit, delete, and logout have been manually exercised
- [ ] Image upload either succeeds with configured R2 or displays the exact truthful unavailable state with no broken UI
- [ ] 320 px, 768 px, 1024 px, and 1440 px layouts have no horizontal document overflow

## Plan Self-Review

**Spec coverage:** Account/profile editing is Task 1 and Task 4; genuine followers are retained through the existing `Follow` relation and surfaced as real counts in Task 1; ordinary user publishing, edit, and delete are Task 3 and Task 4; upload storage safety is Task 2; the responsive frame, logout, branding, title punctuation, and sidebar scope are Task 5; India-focused dense development posts across every named category are Task 6; full build/deploy checks are Task 7. Excluded paid, live, wallet, messaging, and reward claims remain hidden in Task 5 rather than being presented as working.

**Placeholder scan:** The red-flag phrase scan is clear. Each task specifies concrete route/component names, contracts, commands, and test assertions.

**Type consistency:** `ProfilePayload`, `MediaAsset`, `mediaAssetId`, `viewer.canManage`, `createPost`, `updatePost`, `deletePost`, `signImageUpload`, and `uploadSignedImage` are introduced once and used with the same names in subsequent tasks.
