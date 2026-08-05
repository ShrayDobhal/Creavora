# Task 3 — Follow-based conversation starters

## Scope

Changed only the Task 3 messages route, messages workspace, and their focused route/component tests. The pre-existing `package-lock.json` modification remains unmodified.

## RED

Added two regression tests before implementation and ran:

```text
npm test -- tests/api/consumer-workspace-routes.test.js tests/components/messages-responsive.test.jsx
```

The run failed with exactly the intended gaps:

1. `returns followed creators without messages as suggestions and omits unsafe or existing participants` failed because `GET /api/messages` returned only `{ items }`, without `suggestions`.
2. `opens a followed creator locally and promotes the starter after its first submitted message` failed because a list response containing a follow suggestion had no selectable creator button.

Result: 2 failed tests and 20 passing tests (exit 1). The failures demonstrated missing feature behavior, rather than fixture or test setup errors.

## GREEN

### Route

`GET /api/messages` now always returns `{ items, suggestions }`. It preserves the existing message ordering and participant presentation. If `database.follow.findMany` is available, it reads up to 12 follows for the viewer constrained to active creator accounts (`role: "CREATOR"`, `deletedAt: null`). It then defensively excludes the viewer, any soft-deleted relation payload, and everyone already present in message conversations before passing suggestions through the existing participant presenter. A minimal injected database without a `follow` delegate continues to work and receives an empty suggestions list.

### UI

The messages workspace renders follow suggestions in a “Start a conversation” section. Selecting a suggestion sets an in-memory thread `{ participant, items: [] }` and marks it as a local starter, preventing the normal thread GET. It does not write a `Conversation` or `Message`.

On a nonblank send, the existing message POST is used once. The returned message is appended to the thread, and the starter is promoted into the conversations list (or an existing entry’s last message is updated) and removed from suggestions. The local-starter marker remains until the user selects another conversation, avoiding an unnecessary GET immediately after first send.

## Verification

Re-ran the focused command after implementation:

```text
npm test -- tests/api/consumer-workspace-routes.test.js tests/components/messages-responsive.test.jsx
```

Result: 2 test files passed, 22 tests passed, 0 failures (exit 0). The existing mobile back/recovery tests remained green, and the new UI test verified one initial GET only before submit followed by exactly one POST with `{ receiverId: "creator-3", content: "Hi Mina" }`.

`git diff --check` also completed without whitespace errors.

## Fix round 1 — Legacy conversations without a last message

### RED

Added `renders a legacy conversation that has no last message` to the focused messages component suite. The fixture returns a normal `participant` conversation entry but intentionally omits `lastMessage`.

Ran:

```text
npm test -- tests/components/messages-responsive.test.jsx
```

Result: exit 1, with the new test failing and React reporting the expected `TypeError: Cannot read properties of undefined (reading 'createdAt')` at the conversation timestamp render. The test therefore reproduced the production crash rather than a fixture failure.

### GREEN

Changed only the conversation timestamp expression to safely read `conversation.lastMessage?.createdAt`; `formatTime` already returns an empty string for a missing value.

Ran:

```text
npm test -- tests/api/consumer-workspace-routes.test.js tests/components/messages-responsive.test.jsx
npx eslint 'src/app/(fan)/messages/page.jsx' 'tests/components/messages-responsive.test.jsx'
```

Results: the focused Task 3 suite passed 2 files / 23 tests with exit 0, and targeted ESLint completed with exit 0 and no output.
