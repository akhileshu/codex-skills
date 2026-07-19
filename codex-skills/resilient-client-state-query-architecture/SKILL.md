---
name: resilient-client-state-query-architecture
description: Client-state architecture guidance for TanStack Query, Zustand, XState, and URL-synced state. Use when designing async client flows, global workspace state, or query-driven UI behavior.
---

# Resilient Client State & Query Architecture

## Overview

Keep remote state remote and local state lean. Model state transitions explicitly instead of relying on tangled effects.

## State Rules

1. Use TanStack Query for server state lifecycles.
2. Use Zustand for tiny local UI stores.
3. Use XState only when the workflow is branching or risky.
4. Mirror user-visible filters and pagination in the URL when persistence matters.

## Guardrails

- Prefer explicit loading, empty, success, and error states.
- Keep server-state mutation and cache invalidation clear.
- Avoid `useEffect` loops for simple data synchronization.
- Do not introduce a state machine when simple state is sufficient.

## Flexible Guardrail

- For simple forms or one-screen apps, plain local state may be enough.
- Do not force XState or URL sync if the user does not need persistence or branching.
- Increase the state machinery only when the workflow actually benefits from it.

## AGENTS.md Reference Entry

```markdown
- **Skill Reference:** `$resilient-client-state-query-architecture`
  - **When to invoke:** Use this when designing client-side state, query lifecycles, workspace filters, or persistent UI state.
  - **Prompt Hook:** "Act as a State Architecture Specialist. Keep server state in TanStack Query, keep local state lean, and mirror visible filters in the URL when needed."
```
