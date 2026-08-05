# Task 2 report: free community subscriptions and recommendations

## Delivered

- `GET /api/subscriptions` preserves the existing `items` presentation and adds database-backed `recommendations`. Recommendations are active, non-deleted creators only, excluding the viewer and creators with an active subscription for that viewer.
- `POST /api/subscriptions` accepts only `creatorId`; it validates the target inside a transaction and upserts a free community subscription with fixed server values: `Community access`, `0`, `FREE`, `ACTIVE`, `No renewal`, and `cancelledAt: null`.
- Repeated active joins return `created: false`; cancelled rows are reactivated instead of creating a second row.
- `POST /api/subscriptions/cancel` scopes lookup and update to the viewer/creator composite key, persists `CANCELLED` plus `cancelledAt`, and never deletes the row.
- The subscriptions page renders actual recommendations, posts only a creator id to join/cancel, removes joined recommendations locally, updates the persisted card, and exposes success/failure feedback.

## RED evidence

Before production changes, the focused command failed as expected:

```text
npm test -- tests/api/consumer-workspace-routes.test.js tests/components/consumer-workspace.test.jsx
9 failed, 37 passed (46 total)
```

The failures showed the missing `recommendations` response, `501` subscription creation/cancellation stubs, absent cancellation route factory, and absent recommendation/action UI.

## GREEN evidence

After the minimal implementation:

```text
npm run lint -- src/app/api/subscriptions/route.js src/app/api/subscriptions/cancel/route.js src/app/(fan)/subscriptions/page.jsx src/services/consumer-api.js tests/api/consumer-workspace-routes.test.js tests/components/consumer-workspace.test.jsx
# passed with no output

npm test -- tests/api/consumer-workspace-routes.test.js tests/components/consumer-workspace.test.jsx
Test Files  2 passed (2)
Tests  46 passed (46)
```

## Self-review

- Creator validation is server-side and rejects self, deleted, and non-creator targets.
- Fixed free-plan values are not derived from request input.
- Both cancellation read and write use the viewer/creator composite key, preventing cross-user cancellation.
- GET remains compatible with its legacy minimal route mock: absent optional `user.findMany` produces `recommendations: []` while real database calls receive the active-creator exclusion filter.
- No fake recommendation content or package-lock changes were included.

## Commit

Implementation commit: `157c816aba911d83aa4335470e708f5ec758be6f` (`feat: add free creator subscriptions`).
