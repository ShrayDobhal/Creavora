# Blindly Consumer Workspace Design

## Goal

Replace the currently reduced signed-in consumer shell with a complete, image-led Blindly experience inspired by the supplied consumer dashboard, feed, profile, and messaging references. The result must work with the same PostgreSQL-backed data contracts as real users, remain responsive, and use the public Blindly brand throughout.

Password recovery is deliberately out of scope for this release. It requires an email-delivery provider and will be designed as a separate authenticated-security change after the consumer workspace is complete.

## Current-state diagnosis

The consumer navigation was intentionally narrowed to Feed, Explore, and Notifications in the previous launch because the remaining destinations were not guaranteed to be data-backed. Separately, the detailed local demo seed rejects production databases by design, leaving a new production database with no creators or posts. Together those decisions produce the sparse, blank signed-in screen reported by the user.

This release restores a rich user workspace only by making each displayed destination and card use a real API, a real route, or an explicit empty state. It does not reintroduce presentation-only shortcuts.

## Information architecture

Authenticated consumer navigation contains Home, Feed, Explore, Live, Subscriptions, Messages, Notifications, Collections, Wallet, Rewards, Saved Posts, and Settings. The desktop frame uses the reference hierarchy: top bar, persistent left rail, central workspace, and contextual right rail where it adds useful information. On tablet the rail collapses cleanly; on mobile a five-item bottom navigation covers Home, Feed, Explore, Notifications, and Profile, with the remaining destinations available from the account menu.

The Home dashboard at `/home` is the default signed-in destination. It contains a welcome and discovery area, category shortcuts, visual creator recommendations, current and scheduled live content, activity-aware subscription content, and compact right-rail modules. Feed at `/feed` uses the same frame with stories, Latest, Following, and Trending controls, an authenticated post composer, real post engagement, and contextual discovery. Explore remains the dedicated search and category-discovery destination.

Profile, Settings, and publishing retain the real functionality already added in the prior release. The workspace upgrades their presentation only where required for consistent frame, responsive, and visual behavior.

## Backed consumer features

The release treats the following as launch-critical and verifies each end-to-end:

- Account identity, logout, profile editing, and public profile viewing
- Creator discovery, search, follow and unfollow, and follower/following state
- Post creation, image display when a valid public image URL exists, edits and deletes by the owner, likes, comments, and bookmarks
- Feed filters and pagination, including an honest Following empty state
- Notifications, saved posts and collections through their existing APIs
- Messages, live, subscriptions, wallet, and rewards only when their route and API return authenticated, useful data; otherwise the destination shows a clear, non-destructive empty state rather than fabricated activity or monetary balances

Each route will share a small feature-specific client and presenter. No page reads Prisma directly. Every mutation preserves authentication, ownership, validation, and soft-delete filters enforced by the existing APIs.

## Production demo content

A separate production demo-content importer will populate clearly identified Blindly demonstration accounts and posts without using the local-only seed command. It must be idempotent: rerunning it updates only records whose fixed demo email/handle namespace belongs to the importer and never changes a non-demo account or post.

The import creates a coherent Indian-market discovery set across Fitness, Sports, Technology, Fashion, Food, Travel, Education, Music, Art, Comedy, Gaming, and Lifestyle. It creates creator profiles, follows, posts, and realistic engagement relationships needed by the existing data model. Post copy avoids emoji-led decorative text and does not use fabricated financial claims.

Images are curated editorial photography served through stable public image URLs with an image fallback component. They must be real photography rather than generated people, include useful alt text, fit their card without stretching, and fail visibly but gracefully if a remote host is unavailable. The importer has an explicit production confirmation environment variable and is not invoked during Vercel build or deployment.

## Presentation and accessibility

The visual treatment follows the user’s supplied UI hierarchy rather than copying its old product name or fake mechanics: generous white space, restrained violet accents, card depth, rich photography, compact typography, crisp iconography, and motion that respects reduced-motion preferences. The app must not use emoji as a replacement for interface icons. Page titles, headings, buttons, and menu labels do not end in full stops.

All content containers use min-width safeguards, responsive grids, image aspect ratios, and intentional overflow controls. Keyboard focus states, screen-reader names, loading, error, empty, and mutation-pending states are included for every interactive component.

## Error handling and operational safety

Unauthenticated calls continue to redirect or return authenticated HTTP errors without leaking account existence. API failures surface contextual retry states. A route is never hidden behind a successful-looking card when its underlying request fails.

The production importer validates its target connection, requires a literal confirmation value, checks its record namespace before updates, and writes no schema changes. Schema changes for this release are avoided unless an existing API audit proves one necessary. Credentials remain Vercel environment variables and are never committed.

## Testing and release verification

Tests will cover consumer navigation at desktop/mobile breakpoints, dashboard data loading, feed filters and visual image fallback, key engagement actions, demo importer idempotence and production guardrails, and empty/error states for non-social routes. Existing API, component, Prisma schema, lint, and production build checks must remain green.

Before deployment, the release runs the complete test suite, lint, Prisma validation, and a production build with non-secret test configuration. After a push to `main`, verify the Vercel deployment and directly check the authenticated/public routes and API failure behavior. Then run the demo importer exactly once against the configured production database and verify that the live consumer experience displays the imported content.

## Delivery order

1. Audit and harden the existing consumer routes and APIs, then define a consistent full navigation contract.
2. Build the responsive Home dashboard and shared visual modules from real API data.
3. Upgrade the Feed and Explore experience, including stable image rendering, discovery rails, and loading/error states.
4. Complete or honestly empty-state every route exposed by the restored navigation.
5. Add and test the guarded production demo importer.
6. Run full verification, deploy through the connected GitHub/Vercel workflow, import demo content, and verify the live result.

## Non-goals

This release does not process payments, create a payment-provider account, implement password recovery emails, perform real-time streaming, or promise real-time messaging delivery. Those capabilities will not be represented as completed transactions or live events unless their backend integration is actually configured and verified.
