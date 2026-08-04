# Blindly Social Launch Design

## Branding

Blindly replaces Creavora across the visible product: logo wordmark, browser metadata, authentication copy, navigation, notifications, email-ready templates, image alt text, accessibility labels, documentation, and deployment-facing titles. Internal repository/package names and historical database records are not renamed unless an API contract requires it; public URLs remain unchanged for compatibility.

## Goal

Deliver the next launch-ready Blindly vertical: real account management, profile onboarding, image-backed posting, follows, responsive navigation, and a polished feed that matches the supplied desktop reference without exposing unimplemented product features.

## Product boundary

This release completes the real social loop: register, log in, edit a profile, upload an avatar or post image, publish a post, discover creators, follow and unfollow them, view follower counts, interact with posts, manage settings, and log out. It does not claim functional payments, wallet balances, subscriptions, rewards, live streaming, real-time messages, or collections until those have their own backend-backed release.

## Storage strategy

Use Cloudflare R2 through an isolated storage adapter. R2 supplies 10 GB storage, 1M Class A operations, and 10M Class B operations of included monthly usage, with no egress charge. The app enforces image-only uploads for this launch, a 5 MB pre-upload file limit, client-side image compression, and configurable per-user quotas. The storage adapter fails closed when R2 credentials are absent; it never falls back to database blobs or a paid provider.

The deployment requires `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, and `R2_PUBLIC_BASE_URL`. Until the values are configured, profile and post forms show an honest unavailable-upload state. This avoids hidden provider charges and avoids pretending uploads succeeded.

## Account and profile experience

Every authenticated layout has an accessible account menu with Profile, Settings, and Logout. Logout calls the authenticated logout API, clears the session, and returns to `/landing` without a confirmation dialog.

Profile setup is a resumable form available after registration and in Settings. Users can manage display name, unique handle, avatar, cover image, bio, location, website, and public profile visibility. Settings validates values on client and server, uses an optimistic but reversible save state, and reports upload/API errors clearly. Profile pages display real posts, follower and following counts, and only actions allowed for the current viewer.

## Publishing and social graph

The Feed includes a real post composer for eligible authenticated accounts. It supports text and one optional uploaded image, previews the image before publishing, validates limits, creates the post via the API, and prepends the returned view model only after success. Owners can edit or soft-delete their own posts; other users can like, comment, bookmark, and follow through existing authenticated APIs. Follow and unfollow returns real count/state data atomically.

## Navigation and responsive design

The supplied reference defines desktop hierarchy: a left rail, compact top bar, central feed/discovery area, and optional desktop-only contextual rail. The production implementation follows this hierarchy while keeping only working destinations visible. Desktop supports the full social navigation; tablet collapses the side rail; mobile uses a fixed bottom navigation and an account menu. All cards use responsive grids, min-width safeguards, line clamping, safe horizontal scroll only where intentional, and no content escapes the viewport.

Headings, page metadata, buttons, and menu labels use concise copy with no trailing full stops. Decorative copy, emoji-led labels, fabricated achievements, balances, subscriptions, and fake counts are removed. Remote editorial imagery is only used from stable, licensed sources; uploaded or seeded images are rendered with explicit dimensions, sensible crop behavior, and fallbacks.

## Data and API contracts

Prisma PostgreSQL remains the source of truth. Extend existing user/profile/post models only as necessary for profile fields and media metadata. Image records store object key, public URL, MIME type, byte size, dimensions, and owner; files never enter PostgreSQL as binary data. API endpoints validate session, ownership, file policy, and quotas; signed upload URLs have short expirations and scoped object keys.

All public and authenticated data uses soft-delete filters. User profile updates and post mutations write activity/notification records only when appropriate. The browser consumes HTTP APIs through feature-specific clients; no page reads Prisma directly.

## Verification

Tests cover logout, profile validation/ownership, upload policy and signed URL authorization, post publishing/edit/delete, follow count integrity, responsive navigation behavior, mobile overflow regression, and title-copy rules. Final verification runs unit/API/component tests, lint, Prisma validation, production build, direct deployed route checks, and a visual responsive pass at desktop, tablet, and mobile widths.

## Delivery sequence

1. Repair the account menu, logout, title copy, global responsive frame, and responsive navigation.
2. Implement profile onboarding and settings with server-backed updates and real profile counts.
3. Add R2 upload adapter, signed upload policy, and profile media uploads.
4. Add the feed composer, image post publishing, and owner edit/delete flows.
5. Rebuild Feed, Explore, and profile layouts around the supplied responsive reference; add visual and interaction verification.

## Follow-on releases

Saved collections, live sessions, messages, wallet, subscriptions, payments, rewards, communities, and admin features remain disabled in release navigation until each is built against a real API and database contract.
