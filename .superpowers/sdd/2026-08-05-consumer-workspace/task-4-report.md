# Task 4 Report: Authentic consumer destinations and safe unavailable mutations

## Outcome

Replaced the remaining static consumer Messages, Collections, Saved Posts, and Subscriptions destinations with persisted API-backed views and explicit loading, error, pending, and empty states. Removed invented people, chats, recommendations, prices, success claims, browser alerts, and browser confirms from these routes.

Disabled subscription purchase, wallet deposit, and reward claim mutations with the required `501` response:

```json
{ "error": "This feature is not available yet" }
```

No mutation handler reads a request body or touches transaction, user, notification, balance, or XP data.

## Implementation

- `GET /api/messages` now returns deduplicated persisted conversation summaries for the authenticated user.
- `GET /api/messages?userId=<id>` returns the selected participant and persisted message view items.
- `POST /api/messages` validates `receiverId` and non-empty `content`, verifies the receiver, creates the message, and returns `201`.
- Added `GET /api/bookmarks`, using the existing safe post presenter and the same viewer-scoped relation pattern as Feed.
- Collections load, create, and delete through the existing API. Deletion uses an accessible inline confirmation and exposes pending/error state.
- Saved Posts load through `/api/bookmarks` and remove bookmarks through the existing toggle endpoint.
- Subscriptions expose bounded, selected read-only fields only. Purchase, cancellation, recommendation, price, and payment controls were removed from the consumer page.
- Added consumer service functions for conversations, threads, messages, collections, bookmarks, and subscriptions.
- Left Home, Feed, Explore, Live, Wallet page, and Rewards page implementations unchanged.

## TDD evidence

Initial focused run failed as expected:

- API suite could not import the not-yet-created bookmarks route.
- Component tests exposed the static Messages, Collections, Saved Posts, and Subscriptions destinations.

After implementation, the focused suite passed. During self-review, a query-contract test was strengthened to require the proven Feed relation shape; it failed against an invalid `Post.creatorFollowers` include, then passed after the bookmarks query was corrected to use `creator.followers` and adapt the presenter input.

## Verification

- `npm test -- tests/api/consumer-workspace-routes.test.js tests/components/consumer-workspace.test.jsx`
  - 2 files passed
  - 27 tests passed
- `npm test`
  - 17 files passed
  - 175 tests passed
- `npm run lint`
  - passed with 0 errors and 0 warnings
- `$env:DATABASE_URL='postgresql://blindly:blindly@127.0.0.1:5432/blindly'; npm run build`
  - compiled, type checked, collected page data, and generated all 61 static pages successfully
  - emitted only the existing multiple-lockfile workspace-root warning
- `git diff --check`
  - passed
- Static-pattern audit of Task 4 route sources found no legacy sample names, `alert`, `confirm`, static data imports, fake success copy, wallet/XP mutation fields, or transaction calls.

## Concerns

- A plain `npm run build` cannot start without `DATABASE_URL` because `src/lib/db.js` requires it at import time. Verification used a syntactically valid placeholder URL; the build does not connect to it during static generation.
- Next.js reports that multiple lockfiles make workspace-root inference ambiguous. This predates Task 4 and was not changed here.
- `package-lock.json` had an unrelated pre-existing `hasInstallScript` metadata change. It was preserved in the worktree and excluded from this task commit.

## Round 1 review corrections

Resolved every finding in `task-4-review.md`:

- Disabled direct subscription cancellation, payment-order creation, and payment verification routes with the exact `501` unavailable response before request-body access, provider access, or persistence.
- Made Collections, Saved Posts, and Subscriptions load-error and empty views mutually exclusive.
- Split collection load, page-action, and modal errors so a failed create remains visible as an alert inside the active dialog.
- Added request identity tracking to Messages so an aborted prior thread cannot clear the newer selected thread's pending state or publish stale data/errors.
- Confirmed the refreshed Task 4 staging command excludes Live and unchanged Wallet/Rewards pages.

### Round 1 TDD evidence

The focused suite initially failed with eight expected regressions:

- three direct mutation endpoints read the sentinel request body and returned `500` rather than `501`;
- three failed loads rendered both the API error and fabricated empty-data copy;
- a collection create failure was absent from the active dialog;
- aborting the first of two rapid thread requests cleared the second request's loading state.

After the minimal fixes:

- `npm test -- tests/api/consumer-workspace-routes.test.js tests/components/consumer-workspace.test.jsx`
  - 2 files passed
  - 35 tests passed
- `npm test`
  - 17 files passed
  - 183 tests passed
- `npm run lint`
  - passed with 0 errors and 0 warnings
- `$env:DATABASE_URL='postgresql://blindly:blindly@127.0.0.1:5432/blindly'; npm run build`
  - compiled, type checked, collected page data, and generated all 61 static pages successfully
  - emitted only the existing multiple-lockfile workspace-root warning
- Direct-route source audit found no request-body reads, payment-provider calls, persistence imports, balance/XP changes, transactions, or success claims in the six disabled mutation handlers.
