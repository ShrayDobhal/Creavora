# Blindly production polish and Explore design

## Objective

Remove every user-visible internal demo marker, make Explore visibly and verifiably database-driven, support both city/state and a fuller address on profiles, and make the consumer workspace reliable on common phone widths

## Scope

This release covers four connected areas:

- Production content cleanup and importer hardening
- Database-driven Explore categories, search, pagination and follow state
- Consumer profile address support
- Consumer mobile layout and interaction hardening

It does not add real-money payments, rebuild the creator studio, or redesign unrelated consumer screens

## Production content cleanup

The production content importer currently persists internal namespace markers in user-visible fields, including creator names, handles, post content, story captions, live titles and comments. Stable internal IDs may retain a private namespace, but no namespace may appear in presented content

The importer will use clean public values:

- Natural creator names without a demo suffix
- Clean public handles
- Editorial post copy without bracketed identifiers
- Clean story captions, live titles and comments
- Fictional-content provenance kept in internal metadata and operational documentation rather than public copy

The import remains deterministic, production-gated and idempotent. Running it against existing production data updates the previously imported records in place instead of creating duplicates. Presentation helpers also remove known legacy prefixes as defense in depth while the database cleanup deploys

## Database-driven Explore

Explore continues to use authenticated API routes and Postgres as the source of truth. The release makes this visible in the product contract rather than relying on a hardcoded category list

### Directory contract

`GET /api/creators` returns creators from active Postgres user and creator-profile records. It supports:

- Category filtering
- Text matching across name, handle and bio
- Stable cursor pagination
- Viewer-specific follow state
- Follower counts
- Deleted-user exclusion

### Discovery contract

`GET /api/discovery` returns:

- Categories derived from active creator profiles
- Real creator counts for each category
- Recommended creators from the database
- No empty or internal-only categories

The Explore page renders category controls from this response. Search continues through the database-backed search API and returns creators, posts and communities. Profile links, follow controls and pagination remain interactive and persisted

### Empty and error states

Loading, empty, retry and pagination-error states remain truthful. The UI never substitutes static creator cards when an API request fails. A category with no active creators is omitted from the derived category list

## Profile location and address

Profiles support two distinct optional fields:

- `City / State` uses the existing `location` field and is suitable for directory and profile summaries
- `Address` uses a new nullable database field and accepts a fuller locality or street address

The Website input is removed from the consumer profile editor. The existing website column remains in the schema for backward compatibility but is not edited in this release

Detailed address data is returned only by the authenticated current-profile endpoint for the account owner. It is excluded from creator directory cards, search results, feed presenters and public creator-profile responses. City/state may continue to appear publicly under the account's profile-visibility rules

Profile updates validate address text as trimmed plain text with a 240-character maximum. Empty values are stored as null

## Mobile behavior

The consumer workspace is verified at 320, 360, 390 and 768 CSS pixels

Required behavior:

- No horizontal document overflow
- Header identity, account menu and search entry remain reachable
- Bottom navigation remains above safe-area insets
- Settings navigation becomes a compact horizontal control on phones
- Profile fields stack to one column before the tablet breakpoint
- Buttons and primary controls provide at least a 44-pixel touch target where practical
- Category and filter rows may scroll horizontally without widening the document
- Cards, dialogs, message threads and action rows stay within the viewport
- Long names, handles, addresses and content wrap or truncate without clipping adjacent controls

Only intentional carousels and filter rows may scroll horizontally

## Data migration and release flow

1. Add the nullable profile address column through Prisma migration
2. Update validators, profile services and the editor contract
3. Update importer fixtures and idempotent update behavior
4. Add a production cleanup pass for the existing imported namespace
5. Deploy application code and schema changes through the existing Vercel production project
6. Run the gated importer once against production
7. Verify that public responses contain no user-visible demo markers

The cleanup targets only records owned by the importer namespace. It must not rewrite user-created accounts or posts

## Testing

Regression tests are written before implementation and cover:

- Imported public fields contain no internal namespace or demo suffix
- A second import updates in place without duplicates
- Discovery categories and counts come from database fixtures
- Creator category filtering, pagination and follow state remain correct
- Current-profile reads and writes include address
- Public creator presenters exclude detailed address
- Website is absent and Address is present in the consumer editor
- Phone layouts expose responsive classes and preserve reachable controls

Release verification includes the complete Vitest suite, ESLint, Prisma validation, production build, migration status, production import output, Vercel Ready status and live authentication/API smoke checks

## Success criteria

- No visible `[blindly-demo:*]`, `(Blindly Demo)` or internal demo handle remains on production surfaces
- Explore categories, creators, search results, pagination and follow state reflect Postgres records
- A user can save city/state and a fuller address, while detailed address stays private to the owner endpoint
- Consumer screens do not create document-level overflow at the required widths
- Existing authentication, feed, messages, notifications, collections, saved posts and profile flows continue to pass regression tests
