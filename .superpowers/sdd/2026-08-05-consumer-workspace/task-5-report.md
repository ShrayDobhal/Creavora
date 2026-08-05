# Task 5 Report: Guarded Blindly production demo-content importer

## Outcome

Added an explicit, guarded, idempotent production demo-content importer for the Blindly consumer experience. It populates twelve clearly fictional India-market creators, thirty-six image-led posts covering every launch category, twelve unexpired stories, four scheduled live sessions, and stable follows, likes, and comments.

The importer is available only through `npm run db:import-demo-content`. It is not attached to `build`, `postinstall`, `db:seed`, tests, or any other lifecycle. It validates the exact literal confirmation and PostgreSQL URL before constructing a database client.

## Safety and ownership

- Requires `BLINDLY_DEMO_CONTENT_CONFIRMATION=blindly-production-demo-content` exactly.
- Rejects absent, invalid, lookalike, HTTP, and non-PostgreSQL `DATABASE_URL` values.
- Performs validation before database-client construction.
- Uses only `upsert`; it never calls `delete`, `deleteMany`, `create`, or `createMany` against existing collections.
- Uses stable `blindly-demo-*` IDs, `@blindly.demo` email addresses, visible `[blindly-demo:*]` content markers, `(Blindly Demo)` display names, and “Fictional demo creator” biographies.
- Updates only records addressable through the importer namespace or the relationships between those importer-owned users and posts.
- Leaves the existing development seed URL/environment/confirmation checks and production rejection unchanged.
- Keeps partial-run recovery safe: a rerun converges through stable IDs and compound relation keys without duplicating importer-owned data.

## Content shape

- 12 users and 12 creator profiles.
- All categories: Fitness, Sports, Technology, Fashion, Food, Travel, Education, Music, Art, Comedy, Gaming, Lifestyle.
- 36 free, public, image-led posts (three per category) using fixed Unsplash editorial URLs.
- 12 stories whose expiry is derived from the supplied import time and remains in the future.
- 4 scheduled live sessions with future start times.
- 12 non-self follows, 36 non-self likes, and 12 non-self category-relevant comments.
- Category-coherent creator covers, story images, and live thumbnails, each selected from that creator’s own three post assets.
- Deterministic returned counts for users, creator profiles, posts, stories, live sessions, follows, likes, and comments.

## TDD evidence

The initial required focused run failed for the intended missing-feature reasons:

- `tests/consumer/demo-importer.test.js` could not import the not-yet-created importer module.
- `tests/seed/seed-shape.test.js` found no `db:import-demo-content` npm script.
- The pre-existing development seed safety tests remained green.

After the minimal implementation, the focused suite passed. Self-review then exposed three content-coherence defects through additional failing tests before each fix:

- creator covers, stories, and live thumbnails followed creator array order rather than category order;
- several generated likes were self-likes;
- several comments were self-comments or described the wrong category.

The implementation now maps all visual and social data by actual creator/category identity rather than incidental array position.

## Verification

- `npm test -- tests/consumer/demo-importer.test.js`
  - 1 file passed
  - 15 tests passed
- `npm test -- tests/consumer/demo-importer.test.js tests/seed/seed-shape.test.js tests/consumer/social-launch-data.test.js`
  - 3 files passed
  - 38 tests passed
- `npm test`
  - 18 files passed
  - 199 tests passed
- `npm run lint`
  - passed with 0 errors and 0 warnings
- `npx prisma validate`
  - Prisma schema valid
- `git diff --check`
  - passed
- Direct guard smoke check with a connection factory that throws if called
  - rejected on missing `BLINDLY_DEMO_CONTENT_CONFIRMATION`
  - did not construct the database client
- HTTP `HEAD` verification of all 36 generated editorial post URLs
  - 36 successful responses
  - 0 failures

## Concerns

- The importer was not executed against a live production database; its persistence contract was exercised with a deterministic in-memory Prisma-shaped database double, and Prisma schema compatibility was validated separately.
- The existing launch fixture set uses three stable URL variants per category, so each category’s three posts share the same underlying editorial photograph with distinct fixed query variants. This satisfies the stable image-led contract but can be diversified later without changing importer identity or safety behavior.
- `package-lock.json` contains an unrelated pre-existing `hasInstallScript` metadata change. It was preserved and excluded from this task commit.

## Independent review corrections

Resolved all findings from the independent implementation review:

- Strengthened PostgreSQL URL validation to require an exact supported protocol, non-empty hostname, and non-root database path. Hostless/pathless values such as `postgresql:foo`, `postgresql:/db`, `postgresql:///db`, `postgresql://host`, and `postgresql://host/` now fail before client construction.
- Changed user ownership lookup from the demo email to the stable `blindly-demo-user-*` ID. A non-importer record that happens to claim the generated email or handle is no longer updated; the database unique constraint stops the import without mutating that record.
- Strengthened editorial-media tests to require the fixed Unsplash photo-path shape and 36 distinct complete URLs, in addition to the approved host check and direct HTTP verification.

The rereview returned PASS with no remaining Critical, Important, or Minor findings.
