---
name: full-stack-web-slice-design-generator
description: Full-stack planning guidance for turning milestone rows into implementation-ready vertical slices from database to UI, with concrete TypeScript contracts, state flows, tests, and repository boundaries. Use when designing a web feature blueprint, studying a product row, or mapping client and server responsibilities before implementation.
---

# Full-Stack Web Slice Design Generator

## Overview

Turn product milestones into concrete full-stack slices. Start with the smallest visible capability and map the data flow end to end while keeping route composition, transport, validation, domain rules, persistence, client state, and rendering distinct.

Use this delivery lens while filling the document:

`Understand -> Simplify -> Reuse -> Build -> Integrate -> Verify -> Operate -> Evolve`

Keep the first slice a tracer implementation of the critical path. Later slices may replace internal state, transport, or persistence choices when evidence justifies it; protect only the smallest stable interfaces and observable behavior.

## Workflow

1. Identify the actor, visible capability, and smallest successful outcome.
2. Inspect the existing route, feature, schema, data access, query/mutation, UI primitives, and test setup.
3. Research a short set of verified external resources when the problem is non-trivial, current, or unfamiliar.
4. Map database truth through server authorization/validation to client state and UI feedback.
5. Define TypeScript contracts and write normal/error-state pseudocode before implementation.
6. Choose the smallest integration path and preserve existing conventions.
7. Specify behavior-focused tests and observable acceptance criteria.
8. Record deferred work and the behavior that future refactors must preserve.

## What To Study

For every non-trivial slice, include a small, prioritized study list. Scout existing engineering knowledge rather than generating generic advice:

- official framework, browser, database, API, and accessibility documentation;
- production engineering blogs and real-world case studies;
- whitepapers, PDFs, conference slides, architecture diagrams, and sequence diagrams;
- credible open-source implementations and their tests.

For each resource, provide a direct verified link, title/author or project, what to read, and the decision it informs. Browse for current, niche, or externally referenced material. Never invent citations or imply that a source was consulted when it was not. Distinguish authoritative sources from educational references.

Keep the list layered and short:

```markdown
## What To Study

1. Framework/server documentation — request and mutation lifecycle.
   Direct link; read the section that determines error and authorization behavior.
2. A production engineering case study — persistence, caching, or consistency trade-off.
   Direct link; use it to choose the simplest safe data-flow boundary.
3. An accessibility or browser reference — interaction and feedback requirements.
   Direct link; use it to define public UI behavior and selectors.
```

## Roadmap Table

When the input contains multiple milestones, begin with one row per visible capability:

| # | Slice / Visible Capability | Understand | Simplify | Reuse | Build | Integrate | Verify | Operate | Evolve |
|---:|---|---|---|---|---|---|---|---|---|
| 1 | Example capability | User and system concept to learn | Deliberate version-one boundary | Existing route, schema, hook, or primitive | Concrete server/client work | First end-to-end connection | User-visible and boundary checks | Risk-based telemetry or limits | Explicit next slice |

Keep cells concrete. `Simplify` is an exclusion list. `Integrate` must name the data boundary being connected. Use `-` when operation concerns do not affect a low-risk local slice.

## Required Slice Document

For each slice, use these headings in this order. Keep content proportional to the slice and do not fill sections with speculative detail.

### Goal

State the smallest user-visible capability, actor, trigger, and successful outcome.

### Non-goals

Name adjacent behavior deliberately excluded from this slice to protect its boundary.

### Design

Describe the simplest architecture that supports the capability. Include database truth, server, authorization, validation, domain/data operation, client state, and UI responsibilities.

Before accepting the design, check for high-volatility state leakage, raw external types entering domain logic, accidental coupling between transport and business rules, client-side policy enforcement, and missing cleanup for subscriptions or other long-lived resources.

### Interfaces

List the contracts between layers: data model, endpoint/action, request and response shapes, runtime validation, classified errors, capability decisions, query/cache keys, and component inputs/events. Reuse existing interfaces where possible.

Use TypeScript or TSX for all web code examples:

```ts
type CreateItemInput = { name: string };

type ItemResult = { id: string; name: string };

type MutationError =
  | { kind: "validation"; fields: Record<string, string> }
  | { kind: "forbidden" }
  | { kind: "conflict" }
  | { kind: "unavailable" };

// The server remains authoritative for authorization and validation.
declare function createItem(input: CreateItemInput):
  Promise<{ ok: true; value: ItemResult } | { ok: false; error: MutationError }>;
```

Name ownership and authority explicitly: the server decides authorization, the runtime schema validates untrusted input, and the client renders server results rather than becoming a policy engine.

### Execution flow

Trace the normal path end to end:

`database truth -> server endpoint or action -> authorization/validation -> domain/data operation -> client cache -> component state -> UI layout`

Mention mutations, invalidation, loading states, optimistic behavior, subscriptions, and cleanup only when applicable.

Show state transitions when they affect user behavior:

```text
idle
  -> submitting (disable duplicate submission)
  -> success (invalidate query and render result)
  -> validation-error (preserve input and show fields)
  -> forbidden (show denied state; do not claim success)
  -> server/network-error (show retryable feedback)
```

### Failure cases

Cover validation, authorization, missing or stale data, network/server failure, concurrency/conflicts, and user recovery only when they can affect the slice. State the user-visible behavior and whether input, cache, or server state is preserved.

### Tests

Specify behavior-focused checks for server and UI boundaries. Include each test level only when it adds confidence:

| Scenario | Level | Expected observable behavior |
|---|---|---|
| Successful user flow | UI/integration | User sees the resulting state and refreshed data |
| Invalid input | Schema/server/UI | Mutation is rejected and actionable feedback appears |
| Forbidden action | Integration/UI | Backend denies it and UI does not claim success |
| Network or stale-data failure | Integration/E2E | Recovery or retry behavior is clear |

Keep E2E assertions on public outcomes and accessible selectors so internal cache or state implementations can change safely.

### Definition of done

Give observable acceptance criteria covering the user outcome, interfaces, loading/empty/success/error/forbidden states, failure behavior, authorization, and required tests.

### Future improvements

Capture explicitly deferred work, risks, or follow-up slices. Keep this separate from the current implementation contract. When a later slice changes an earlier internal design, record the refactoring boundary and behavior that must remain unchanged.

## Implementation-Ready Detail

Add these subsections inside the relevant required headings when the slice needs more detail; do not create a competing template.

### Core Mental Model

Show the user and data flow:

```text
user action
    -> route or component event
    -> server action/API
    -> authorization and runtime validation
    -> domain/data operation
    -> cache update or invalidation
    -> loading/success/error/forbidden UI feedback
```

### Repository And Feature Ownership

Show only relevant project structure and adapt it to the repository:

```text
web-app/
├── src/app/                   # Route composition
├── src/features/items/        # Item UI, hooks, schemas, and view model
├── src/server/items/          # Actions/API and domain mapping
├── src/server/db/             # Data access and policies
├── src/shared/contracts/      # Shared runtime schemas and types
├── src/components/            # Reusable accessible primitives
└── docs/slices/01-items.md
```

Do not invent a monorepo, server package, or abstraction layer for a small application.

### Pseudocode And Integration

Describe normal, rejected, and recovery paths before implementation:

```text
submit form
 -> disable duplicate submission
 -> parse input at server boundary
 -> check server-side capability
 -> perform mutation
 -> invalidate affected query
 -> show created item

on validation/forbidden/error
 -> preserve input when safe
 -> map classified error to actionable feedback
 -> re-enable submission or offer retry
```

Add helper flows for cache invalidation, stale-data handling, subscriptions, or optimistic rollback only when those behaviors are part of the slice.

### Tests And Acceptance

Use a risk-focused matrix and connect every acceptance criterion to a public observable. Prefer unit tests for pure mapping/validation, integration tests for server boundaries, and E2E tests for the critical user journey.

## Core Flow

- Database truth -> server endpoint/action -> authorization and validation -> client cache -> component state -> UI layout.
- Prefer one vertical slice per visible capability.
- Reuse existing UI tokens, schemas, hooks, actions, and test helpers before adding primitives.
- Keep the initial implementation simple when the slice is low risk.
- Keep route composition, transport, validation, domain rules, persistence, cache, and rendering responsibilities distinct.
- Make the server the source of truth for authorization.
- Make loading, empty, success, error, and forbidden states explicit when they are user-visible.

## Flexible Guardrail

- For static pages or low-risk CRUD, keep the study list, matrix, and pseudocode lean.
- Do not force elaborate state machines, optimistic updates, telemetry plans, or E2E maps when they do not change the decision.
- Use the full detail only when the boundary, state, or rollout risk justifies it.
- For a small slice, shorten each required section rather than omitting interface, failure, or acceptance decisions.

The nine required headings are not optional. If the input contains multiple capabilities, create one complete document per slice rather than combining unrelated flows.

## AGENTS.md Reference Entry

```markdown
- **Skill Reference:** `$full-stack-web-slice-design-generator`
  - **When to invoke:** Use this when a milestone row needs to become a concrete full-stack implementation plan before coding.
  - **Prompt Hook:** "Act as a Lead Full-Stack Architect. Research verified sources, map the slice end to end, use TypeScript/TSX contracts and examples, keep client/server boundaries clean, and choose the smallest safe implementation."
```
