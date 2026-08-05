# Blindly consumer actions and authentication design

## Outcome

Blindly must convert the remaining static or empty consumer surfaces into database-backed actions while preserving honest records. Creator profiles must render correctly, Explore search must return useful database matches, Subscriptions and Messages must help a new user take a real first action, and authentication must expose secure Google and password-recovery flows without pretending unconfigured external providers work.

## Profile and Home presentation

- The creator avatar is positioned relative to the white profile body with an explicit foreground `z-index`; the cover stays behind it at every supported width.
- The creator name starts after the avatar and never occupies the avatar's overlap area.
- The Home right-rail heading `Upcoming sessions` becomes `Hangout rooms`; links continue to use real live-session records.

## Explore search

- The existing `/api/search` remains the source of truth.
- Creator matching includes name, handle, bio, role title, location, and `CreatorProfile.category`.
- Search is submitted by the button and Enter key, updates the URL query parameter, shows a visible loading state, displays creator/post/community results, and offers a clear-search action.
- Empty results name the submitted query and never silently fall back to the discovery grid.

## Subscriptions

- `GET /api/subscriptions` returns recorded subscriptions plus recommended active creators not already subscribed to.
- Empty UI renders recommendation cards with real creator identity, imagery, category, and follower count.
- `POST /api/subscriptions` accepts `{ creatorId }` and idempotently creates or reactivates a zero-cost `Community access` subscription with `price: 0`, `method: FREE`, `status: ACTIVE`, and `renewsOn: No renewal`.
- `POST /api/subscriptions/cancel` accepts `{ subscriptionId }` and records `CANCELLED` plus `cancelledAt`; it never deletes history.
- The UI labels the action `Join free`, not a paid purchase, and immediately moves the resulting record into the subscription list.

## Messages

- `GET /api/messages` returns existing conversations and `suggestions` from real followed creators who do not yet have a conversation.
- Empty UI shows followed creators with `Start conversation`; selecting one opens an empty real thread without creating a database message.
- The first submitted text creates the first `Message` row through the existing POST route. After sending, it becomes a normal conversation.
- No synthetic messages or conversations are imported.

## Authentication

- Login pages include `Continue with Google` and `Forgot password`.
- `GET /api/auth/providers` reports whether Google and reset email are configured so UI can explain unavailable providers honestly.
- Google uses a server-side authorization-code flow with state, PKCE, HttpOnly cookies, exact callback validation, only `openid email profile`, verified Google email, and safe redirect handling.
- Google identities link to an existing active user only by verified email or create a new `USER`; `User.googleSubject` is unique.
- Password recovery stores only SHA-256 token hashes in a new `PasswordResetToken` table, expires after 30 minutes, is single-use, revokes active refresh tokens after reset, and always uses non-enumerating request responses.
- Production email delivery uses the free Resend API when `RESEND_API_KEY` and `PASSWORD_RESET_FROM_EMAIL` are configured. Without them, provider status is unavailable and the UI explains that email recovery is not yet configured.
- Google activation requires `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`; routes exist and are tested before credentials are added.

## Quality gates

- Add red-green regressions for every changed route and component.
- Run the complete test suite, ESLint, Prisma validation, production build, production migration, authenticated live API smoke tests, and browser checks at 320, 360, 390, and 768 pixels.
- Preserve all user-created rows and the existing modified planning document.

