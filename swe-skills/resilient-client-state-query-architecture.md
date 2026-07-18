```markdown
# Skill: Resilient Client State & Query Architecture

## Philosophy
Asynchronous client-side state is a reflection of the server, not a local dumping ground. Global client state must remain lean, localized, and explicitly modeled using robust declarative lifecycles instead of brittle conditional state combinations.

## Implementation Primitives
1. **Server State Lifecycles:** Delegate asynchronous tracking entirely to `TanStack Query`. Enforce explicit invalidation structures, clear mutations, precise stale times, and optimistic UI mutations.
2. **Explicit Workflow State:** For multi-stage, branching, or high-risk local UI states (e.g., canvas work, multi-tenant checkouts), use `XState` to define strict states, guards, and transition paths.
3. **Ephemeral State Isolation:** Store temporary UI layout metadata (e.g., sidebar toggles, open tabs) inside micro-stores via `Zustand`. 
4. **URL Synchronization:** Keep all visible user filters, search inputs, and pagination indicators dynamically mirrored inside the query parameter track via `nuqs`.

## Verification Checklist
- [ ] Is server data synchronization handled without unmanaged `useEffect` loops?
- [ ] Are pagination, tabs, and filters persistent across browser reloads via URL queries?
- [ ] Does the interface include appropriate guard blocks protecting against illegal workflow step jumps?
```

### `AGENTS.md` Reference
```markdown
- **Skill Reference:** `skills/client-state-query.md`
  - **When to invoke:** Use this when designing global client workspaces, state flows, client-side data fetching networks, or state sync pipelines.
  - **Prompt Hook:** "Act as a State Architecture Specialist. Enforce the Resilient Client State skill. Clean out dirty component effects, use TanStack Query for remote requests, and map out transitions safely."
```

---
