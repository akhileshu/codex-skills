---
name: full-stack-web-slice-design-generator
description: Full-stack planning guidance for turning milestone rows into implementation-ready vertical slices from database to UI, with concrete interfaces, state flows, tests, and repository boundaries. Use when designing a web feature blueprint, studying a product row, or mapping client and server responsibilities before implementation.
---

# Full-Stack Web Slice Design Generator

## Overview

Turn product milestones into concrete full-stack slices. Start with the smallest visible capability and map the data flow end to end.

## Slice Blueprint

1. Start with a "What to Study" shortlist of the smallest relevant references.
2. Map the pipeline from database truth to UI feedback.
3. Define the slice boundary, then keep server, client, and validation responsibilities separate.
4. Document each slice using the required structure below.
5. Include detailed operational notes only when the slice is risky enough to need them.

Use this delivery lens while filling the document:

`Understand -> Simplify -> Reuse -> Build -> Integrate -> Verify -> Operate -> Evolve`

Keep the first slice a tracer implementation of the critical path. Later slices may replace internal state, transport, or persistence choices when evidence justifies it; protect only the smallest stable interfaces and observable behavior.

## Roadmap Table

When the input contains multiple milestones, begin with one row per visible capability:

| # | Slice / Visible Capability | Understand | Simplify | Reuse | Build | Integrate | Verify | Operate | Evolve |
|---:|---|---|---|---|---|---|---|---|---|
| 1 | Example capability | User and system concept to learn | Deliberate version-one boundary | Existing route, schema, hook, or primitive | Concrete server/client work | First end-to-end connection | User-visible and boundary checks | Risk-based telemetry or limits | Explicit next slice |

Keep cells concrete. `Simplify` is an exclusion list. `Integrate` must name the data boundary being connected. Use `-` when operation concerns do not affect a low-risk local slice.

## Required Slice Document

For each slice, use these headings in this order. Keep the content proportional to the slice; do not fill sections with speculative detail.

### Goal

State the smallest user-visible capability and the outcome it must provide.

### Non-goals

Name adjacent behavior deliberately excluded from this slice to protect its boundary.

### Design

Describe the slice boundary and the simplest architecture that supports it. Include the relevant database truth, server, validation, client state, and UI responsibilities.

Before accepting the design, check for high-volatility state leakage, raw external types entering domain logic, accidental coupling between transport and business rules, and missing cleanup for subscriptions or other long-lived resources.

### Interfaces

List the contracts between layers: schema or data model, endpoint/action, request and response shapes, errors, cache/query keys, and component inputs or events. Reuse existing interfaces where possible.

### Execution flow

Trace the normal path end to end:

`database truth -> server endpoint or action -> validation boundary -> client cache -> component state -> UI layout`

Mention mutations, invalidation, loading states, and optimistic behavior only when applicable.

### Failure cases

Cover validation, authorization, missing or stale data, network/server failure, concurrency, and user-recovery behavior when relevant. Do not invent failure modes that cannot affect the slice.

### Tests

Specify behavior-focused checks for the server and UI boundaries. Include unit, integration, or E2E coverage only where each level adds confidence; identify the key happy path and meaningful failures.

### Definition of done

Give observable acceptance criteria covering the user outcome, interfaces, states, failure behavior, and required tests.

### Future improvements

Capture explicitly deferred work, risks, or follow-up slices. Keep this separate from the current implementation contract.

When a later slice changes an earlier internal design, record the refactoring boundary and the behavior that must remain unchanged.

## Implementation-Ready Detail

For slices that need more than the required headings, add these subsections inside the relevant headings rather than creating a second competing template:

### What This Slice Builds

State the smallest visible user capability, the actor, and the successful outcome.

### What To Study

List the smallest relevant routes, existing feature, database model, schema, query/action, UI primitive, and test setup. Tie each reference to a design decision.

### Core Mental Model

Show the user and data flow:

```text
user action
    -> route or component event
    -> server action/API
    -> authorization and validation
    -> domain/data operation
    -> cache update or invalidation
    -> loading/success/error/forbidden UI feedback
```

### Interfaces And State

Show representative contracts without assuming a framework:

```ts
type CreateItemInput = {
  name: string;
};

type ItemResult = {
  id: string;
  name: string;
};

// Server remains authoritative for authorization and validation.
declare function createItem(input: CreateItemInput): Promise<ItemResult>;
```

Name request/response or action contracts, errors, capability decisions, query/cache keys, component props/events, and explicit loading, empty, success, error, and forbidden states.

### Repository And Feature Ownership

Show only the relevant project structure:

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

Adapt this to the existing repository. Do not invent a monorepo or server package for a small application.

### Pseudocode And Integration

Describe the normal path and state transitions before implementation:

```text
submit form
 -> disable duplicate submission
 -> parse input at server boundary
 -> check capability
 -> perform mutation
 -> invalidate item query
 -> show created item
on validation/error/forbidden
 -> preserve input
 -> show actionable feedback
```

### Tests And Acceptance

Use a risk-focused matrix:

| Scenario | Level | Expected observable behavior |
|---|---|---|
| Successful user flow | UI/integration | User sees the resulting state |
| Invalid input | Schema/server/UI | Mutation is rejected and feedback is actionable |
| Forbidden action | Integration/UI | Backend denies it and UI does not claim success |
| Network or stale-data failure | Integration/E2E | Recovery or retry behavior is clear |

Keep E2E assertions on public outcomes and accessible selectors so internal cache or state implementations can change safely.

## Core Flow

- Database truth -> server endpoint or action -> validation boundary -> client cache -> component state -> UI layout.
- Prefer one vertical slice per visible capability.
- Reuse existing UI tokens, schemas, hooks, and actions before adding new primitives.
- Keep the initial implementation simple if the slice is low risk.
- Keep route composition, transport, validation, domain rules, persistence, cache, and rendering responsibilities distinct.
- Make the server the source of truth for authorization and do not turn the client into a policy engine.

## Flexible Guardrail

- For static pages or low-risk CRUD, skip the heavy matrix and keep the slice lean.
- Do not force elaborate state machines, telemetry plans, or E2E maps when they do not change the decision.
- Use the full matrix only when the boundary, state, or rollout risk justifies it.
- For a small slice, keep the added subsections brief rather than omitting interface, failure, or acceptance decisions.

The nine required headings are not optional, even for lean slices. A lean slice may use brief statements under each heading. If the input contains multiple capabilities, create one complete document per slice rather than combining unrelated flows.

## AGENTS.md Reference Entry

```markdown
- **Skill Reference:** `skills/full-stack-web-slice-design-generator.md`
  - **When to invoke:** Use this when a milestone row needs to become a concrete full-stack implementation plan before coding.
  - **Prompt Hook:** "Act as a Lead Full-Stack Architect. Map the slice end to end, keep client/server boundaries clean, and choose the smallest safe implementation."
```
