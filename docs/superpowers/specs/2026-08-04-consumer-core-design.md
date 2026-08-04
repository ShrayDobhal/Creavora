# Creavora Consumer Core Design

## Goal

Ship the first complete, database-backed Creavora experience for normal users, then use the same platform primitives for the creator release. The product must feel designed for Indian creator communities: clear INR pricing, local categories, direct language, and an editorial, image-led interface.

## Scope and release boundary

This specification covers only the consumer core. Creator publishing, memberships, payments, upload storage, creator analytics, live streaming, real-time chat, community moderation, and administration are follow-on releases. Existing API routes and Prisma models can remain where they are, but the consumer-facing routes in this release cannot render hard-coded product data.

## Product experience

### Public landing and onboarding

`/landing` is a long-form, responsive public page. It introduces Creavora with large editorial imagery, Indian creator categories, creator spotlights, product proof, and two clear entry points: normal user onboarding and Creator Login. No emoji-led or AI-styled copy is used. Motion is restrained and respects reduced-motion preferences.

The normal login remains the default. Creator Login is an explicit top-right entry point into a distinct creator authentication screen. JWT payloads use `USER` and `CREATOR` roles; the server protects routes rather than hiding UI with CSS.

### Signed-in consumer app

The signed-in home route is a personalised feed sourced from the database. It supports cursor pagination and a stable ordering by publication time. The first release exposes latest and following modes; recommended and trending remain contract-ready but do not claim personalised ranking until ranking signals exist.

Explore searches creators, posts, communities, and collections. Searches are debounced in the browser, validated on the server, and written to the authenticated user’s recent-search history only when a non-empty query is submitted. A browsable Indian-focused category taxonomy is displayed from a shared configuration module, not duplicated page constants.

Creator profiles use the handle as their public identifier and render live data: profile information, public posts, follower count, and an authenticated follow or unfollow action. Premium-content display is presentational in this release and does not claim paid access until the payments and membership release is implemented.

Posts provide authenticated, validated follow, like, comment, bookmark, and collection actions. Each mutation is idempotent where possible, updates a corresponding denormalised count transactionally, and creates a notification for the post creator when the action is eligible. A user cannot interact with their own post in a way that creates a duplicate notification.

### Data and API design

PostgreSQL and Prisma remain the system of record. Existing `User`, `CreatorProfile`, `Post`, `Follow`, `Like`, `Comment`, `Bookmark`, `Collection`, `Notification`, and `SearchHistory` models are extended only when needed for the consumer contract. All query paths filter soft-deleted records. UUIDs and existing unique constraints remain the external identity and integrity boundary.

API routes use the existing Next.js route-handler architecture for this release. Each route authenticates through the shared middleware, validates request bodies with Zod, returns explicit HTTP error shapes, and avoids browser-only assumptions so a later mobile client can call the same endpoints.

Feed response contract:

```json
{
  "items": ["post view models"],
  "nextCursor": "ISO timestamp or null"
}
```

Cursor queries use `(publishedAt, id)` as the deterministic sort tuple. A post view model includes author/profile summary, aggregate counts, and viewer-state flags (`hasLiked`, `hasBookmarked`, `isFollowing`) when authenticated.

### Frontend boundaries

Server data access is isolated in feature-oriented API client modules. UI components receive typed view models and callbacks; they do not import Prisma or duplicate authorization decisions. Loading, empty, and error states are deliberate product states rather than blank sections. Client-side optimistic updates are used only for reversible social actions, with rollback and user-visible error feedback.

Images use `next/image` whenever dimensions and source support it. Dynamic list sections use lazy loading, stable keys, and responsive image sizes. Accessibility includes semantic buttons, labelled form controls, keyboard navigation, visible focus treatment, and reduced-motion support.

### Development data

Seed data is allowed only in `prisma/seed.mjs` and is clearly development-only. It creates Indian-market sample creators, posts, categories, and communities with remote, licensed placeholder imagery. Production data is never fabricated at request time. Empty production databases show honest empty states and calls to action.

## Error handling and security

Unauthenticated mutations return `401`; role or ownership violations return `403`; missing or soft-deleted resources return `404`; invalid bodies return `400`; conflict-safe duplicate actions return their existing state rather than erroring. Server logs contain request-safe failure context without credentials or tokens.

Existing HTTP-only refresh-token rotation, password hashing, JWT verification, rate limiting, CORS, content-security policy, and role middleware remain in place. Consumer pages cannot reach creator dashboard routes, and creator-only APIs independently enforce the `CREATOR` role.

## Testing and verification

The implementation introduces focused tests for validation and social-action rules, API tests for authentication/ownership/cursor pagination, and route smoke tests for public and protected flows. Each task starts with a failing test, then implements the smallest change needed to pass. Final verification includes lint, production build, Prisma schema validation, production deployment checks, and direct smoke requests to the deployed public URL.

## Delivery sequence

1. Establish consumer view-model/API-client boundaries and development seed data.
2. Replace static feed and explore content with cursor-backed API data and working social actions.
3. Wire public creator profiles, follow actions, notifications, collections, and search history.
4. Refresh landing, onboarding, and responsive consumer UX around the supplied visual reference.
5. Verify and deploy this vertical before starting the creator publishing specification.

## Explicit non-goals for this release

Razorpay collection, paid-content enforcement, R2 uploads, WebSocket chat, live-video infrastructure, BullMQ/Redis workers, downloadable creator reports, and admin moderation are separate scoped releases. Their existing screens must either be protected and labelled as unavailable or remain outside the consumer navigation until their supporting APIs exist.
