---
name: full-stack-web-implementation-slices-table-and-repo-structure
description: Design full-stack web implementation slices and repository structure before coding. Use when turning a roadmap into a capability-by-capability implementation table, mapping frontend/server/data boundaries, or organizing a web workspace for incremental delivery.
---

# Full-Stack Web Implementation Slices, Table And Repo Structure Architect

## Purpose

Turn a product roadmap or milestone list into two implementation artifacts:

1. A capability-by-capability implementation-slices table.
2. A repository-structure code fence that shows where each responsibility belongs.

Start with the smallest visible capability and evolve the system through independently understandable, buildable, integrable, and verifiable slices.

## Required Output

Unless the user requests another format, produce these sections in order:

### What To Study

List only the smallest relevant files, entrypoints, schemas, routes, existing features, and infrastructure to inspect before design. Explain the decision each reference informs.

### Implementation Slices

Use one row per visible capability and preserve this column order. Put `Done` immediately after `#`; use `[x]` for a capability the user or source roadmap confirms is complete, and `[ ]` for a pending or unconfirmed capability. Do not mark a slice complete merely because it is planned.

| # | Done | Slice / Visible Capability | Understand | Simplify | Reuse | Build | Integrate | Verify | Operate | Evolve |
|---:|:---:|---|---|---|---|---|---|---|---|---|---|
| 1 | [ ] | Example capability | Relevant runtime or domain concept | Smallest safe scope | Existing boundary or primitive | Concrete work | First end-to-end connection | Observable checks | Risk-based telemetry or limits | Explicit next step |

Make every cell concrete. `Simplify` is the deliberate exclusion list for the slice. `Reuse` names existing code, contracts, or dependencies. `Integrate` states how the slice crosses boundaries. `Operate` is proportional to risk; use `-` for genuinely local work. `Evolve` records deferred work, not hidden current requirements.

### Repository Structure

Show a fenced tree using the project’s actual framework and package conventions. Annotate only directories that clarify ownership. Include a `docs/slices/` location when the roadmap has multiple slices.

Example shape:

```text
web-app/
├── apps/
│   ├── web/
│   │   └── src/
│   │       ├── app/              # Route composition and page entrypoints
│   │       ├── features/         # Co-located capability slices
│   │       ├── components/       # Shared accessible UI primitives
│   │       └── lib/              # Thin client adapters and configuration
│   └── api/                      # Optional standalone API or realtime gateway
├── packages/
│   ├── contracts/                # Shared schemas and transport types
│   ├── domain/                   # Framework-independent rules when justified
│   └── database/                 # ORM client, migrations, and data access
├── docs/slices/                  # One design file per implementation slice
└── package.json
```

Adapt the tree to the repository. Do not invent `apps/`, `packages/`, or a standalone API when the existing project is smaller or uses another topology.

## Design Method

Use this lens for each row:

`Understand -> Simplify -> Reuse -> Build -> Integrate -> Verify -> Operate -> Evolve`

- Keep the first slice a tracer path through the critical boundary, not a speculative final architecture.
- Map data flow as `database truth -> server endpoint/action -> validation -> client cache -> component state -> UI feedback`.
- Keep route composition, transport, validation, domain rules, persistence, and rendering responsibilities distinct.
- Prefer the smallest stable interfaces. Later slices may replace internal state, transport, or persistence behind those interfaces.
- Treat high-frequency interaction state separately from low-frequency React/UI state when rendering performance can be affected.
- Make server authorization the source of truth; expose capabilities rather than reproducing policy in components.

## Slice Document Linkage

For a multi-slice plan, name documents predictably, for example `docs/slices/01-capability-name.md`. Each detailed slice document should contain:

`Goal`, `Non-goals`, `Design`, `Interfaces`, `Execution flow`, `Failure cases`, `Tests`, `Definition of done`, and `Future improvements`.

Keep table rows concise and put detailed contracts or failure analysis in the corresponding slice document.

## Examples

- [Real-time collaborative whiteboard](examples/milestones-table-and-folder-structure-collaborative-whiteboard.md): a full-stack progression from local canvas interaction through persistence, realtime collaboration, authorization, and operations. Use it when the roadmap crosses frontend, API, realtime, shared-contract, and database boundaries.

## Validation Before Coding

Challenge the design before implementation:

- Identify raw external types, authorization leakage, high-volatility state leakage, and accidental transport/domain coupling.
- Identify ownership and teardown for subscriptions, timers, WebSocket connections, queues, and cache lifecycles.
- Confirm each slice has a visible outcome, a boundary to integrate, an observable verification method, and explicit non-goals.
- Prefer invariant-based tests that remain valid when internal storage or synchronization changes.

## Guardrails

- Reuse existing routes, schemas, hooks, UI tokens, and data access policies before creating primitives.
- Keep low-risk CRUD and static pages lean; do not force elaborate state machines, telemetry, or E2E coverage without a decision benefit.
- Do not combine unrelated visible capabilities into one row.
- Add abstractions only when a real boundary, invariant, or repeated reuse justifies them.

## AGENTS.md Reference Entry

```markdown
- **Skill Reference:** `$full-stack-web-implementation-slices-table-and-repo-structure`
  - **When to invoke:** Use this when a web roadmap needs an implementation-slices table and repository structure before coding.
  - **Prompt Hook:** "Act as a Lead Full-Stack Web Architect. Generate the Understand/Simplify/Reuse/Build/Integrate/Verify/Operate/Evolve slices table, map stable boundaries, and show the repository structure."
```
