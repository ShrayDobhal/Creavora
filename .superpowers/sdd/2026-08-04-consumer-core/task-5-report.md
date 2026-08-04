# Task 5 report: API-backed consumer screens

## Status

Implemented the feed, Explore, and creator-profile routes against the Task 3 consumer HTTP contracts. The routes no longer import `src/data.js`, and creator/post/community content is rendered only from API responses. Shared components provide API media rendering with initials/gradient fallbacks, accessible controls, loading/empty/error states, cursor-only pagination, debounced and explicit search, and optimistic like/bookmark/follow actions with rollback.

## Red evidence

- `npm run test -- tests/components/feed-card.test.jsx tests/components/explore-search.test.jsx` failed with unresolved `FeedCard` and `SearchPanel` imports before the components existed.
- After the shared layer was green, page-level tests failed because the old feed and Explore pages still rendered their local catalogues and never displayed the API-only fixtures.
- The missing-aggregate regression test failed because a search creator without `subscriberCount` was rendered as `0 subscribers`; the card now omits unknown aggregates instead of fabricating a value.

## Green evidence

- `npm run test`: 7 test files passed, 52 tests passed.
- `npm run lint`: exited 0 with no Task 5 errors. Two existing warnings remain in `src/app/(fan)/messages/page.jsx` and `src/hooks/useWebSocket.js`.
- `npm run build`: completed successfully, including `/feed`, `/explore`, and dynamic `/creator/[handle]`.
- `git diff --check`: clean before commit.

## Scope and implementation notes

- Added `src/services/consumer-api.js` for feed, discovery, search, creator-profile, like, bookmark, and follow requests.
- Added reusable `AsyncState`, `FeedCard`, `CreatorCard`, and `SearchPanel` components.
- Feed modes are Latest, Following, and Trending; page results append only through a server cursor.
- All route request effects own an `AbortController` and abort on dependency change/unmount. Pagination also aborts when the mode changes or the page unmounts.
- Search creator responses currently do not include viewer follow state or subscriber aggregates, so search cards intentionally omit those controls/values. Discovery cards retain the follow action because that response supplies the required state.
- Added Testing Library, user-event, jest-dom, and jsdom as development dependencies for real DOM interaction tests.

## Commit

`feat: connect consumer experience to live APIs`

## Concerns

- Lint retains two unrelated pre-existing hook dependency warnings outside Task 5 scope.
- Next build reports the existing multi-lockfile workspace-root inference warning.
- `npm install` reports three high-severity audit findings; dependency remediation was not attempted because it is outside this consumer-screen change and may require breaking upgrades.
