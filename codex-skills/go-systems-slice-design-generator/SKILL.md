---
name: go-systems-slice-design-generator
description: Go systems planning guidance for turning milestone rows into implementation-ready slices with clear control flow, interfaces, pseudocode, tests, and repository boundaries. Use when designing Go features, parsers, pipelines, storage code, concurrency, or network-bound systems before implementation.
---

# Go Systems Slice Design Generator

## Overview

Turn a Go milestone into a small, testable, implementation-ready slice. Preserve the smallest stable boundary, make data flow and failure behavior explicit, and keep the first tracer path sequential unless concurrency is the capability being designed.

Use this delivery lens for each slice:

`Understand -> Simplify -> Reuse -> Build -> Integrate -> Verify -> Operate -> Evolve`

Before accepting a design, make invariants, ownership, cancellation, resource cleanup, and error semantics visible. Keep transport, storage, and domain representations separate when that boundary matters.

## Workflow

1. Identify the visible capability and its smallest useful outcome.
2. Inspect the repository before inventing packages, interfaces, or adapters.
3. Research a short set of relevant external resources when the topic is non-trivial, current, or unfamiliar.
4. Define the input, transformation, state, and output boundaries.
5. Draw the end-to-end flow and write pseudocode before proposing full implementation.
6. Add the narrowest integration path that proves the boundary.
7. Specify invariant-based tests and operational behavior proportional to risk.
8. Record the next refactoring boundary without designing future work in detail.

## What To Study

For every non-trivial slice, include a short, prioritized study list. Prefer existing engineering knowledge over invented explanations:

- official Go/package/protocol documentation for exact contracts;
- production engineering blogs and real-world case studies for trade-offs;
- whitepapers, PDFs, conference slides, or architecture diagrams for system models;
- credible open-source implementations for lifecycle and integration details.

For each resource, provide a direct link, title/author or project name, what to read, and the design decision it informs. Use browsing for current, niche, or externally referenced material. Do not fabricate links or citations; if a useful source cannot be verified, say so and provide a local reasoning path instead.

Keep the list small and layered:

```text
quick start: one conceptual explanation and one API reference
deep dive: one production case study, paper, or architecture diagram
implementation: one credible source for the lifecycle or protocol
```

Example:

```markdown
## What To Study

1. Go `context` package docs — cancellation and deadline ownership.
   https://pkg.go.dev/context
   Read `Done`, `Err`, and derived contexts; use it to define shutdown behavior.
2. The Go blog, “Pipelines” — cancellation in staged concurrent flows.
   https://go.dev/blog/pipelines
   Use it to decide how stages stop without leaking goroutines.
3. A relevant production case study or protocol paper — batching/retry trade-offs.
   Link directly to the verified source and state which queue or retry invariant it informs.
```

## Roadmap Table

When the input contains multiple milestones, begin with one row per visible capability:

| # | Slice / Visible Capability | Understand | Simplify | Reuse | Build | Integrate | Verify | Operate | Evolve |
|---:|---|---|---|---|---|---|---|---|---|
| 1 | Example capability | Runtime or domain concept to learn | Deliberate version-one boundary | Existing package or standard library | Concrete types and functions | First caller or composition-root path | Invariants and failure tests | Limits, cleanup, or telemetry | Explicit next slice |

Keep cells concrete and short. `Simplify` must state exclusions. `Integrate` must identify the package or process boundary. Use `-` only when a concern is genuinely irrelevant.

## Implementation-Ready Slice Document

For each slice, use these sections in order. Keep the depth proportional to risk, but do not leave architectural decisions implicit.

### What This Slice Builds

State the visible capability, smallest useful behavior, actor/caller, and output or state it produces.

### What To Study

Use the research protocol above. Tie every source to a concrete design decision; do not provide a generic technology bibliography.

### Scope And Non-goals

Define supported version-one behavior and explicitly defer adjacent features, alternate implementations, and premature concurrency.

### Core Mental Model

Show the main data flow and important state transitions:

```text
external input
    -> boundary normalization
    -> domain operation
    -> state or output
    -> caller-visible result
```

### Data Model And Interfaces

Show the smallest useful Go contracts. Name invariants, ownership, error semantics, and lifecycle rules beside them:

```go
type Reader interface {
	ReadNext() (Item, bool, error)
}

type Store interface {
	Put(Item) error
	Get(Key) (Item, bool, error)
}
```

Keep adapters out of domain contracts when they would leak transport or persistence details.

### Integration Flow

Trace the first end-to-end path, including the composition root:

```text
cmd/service/main.go
    -> construct config and adapters
    -> call internal capability
    -> normalize boundary input
    -> apply domain rules
    -> return result or classified error
```

### Core Pseudocode

Describe normal completion, invalid input, cancellation, retry limits, and cleanup before writing full code:

```text
run(ctx, input):
    normalized = normalize(input)
    if normalized is invalid: return classified validation error

    result = domain operation(normalized)
    if ctx is cancelled: release owned resources; return ctx error
    if operation fails: preserve invariant; return wrapped cause

    commit or publish result
    return result
```

Add helper flows for non-trivial boundaries:

```text
readNext():
    if exhausted: return no item
    decode one item
    if malformed: record position; return parse error
    advance cursor exactly once
    return item
```

Every helper must have a clear exit condition and must not hide recoverable failures behind panics or unbounded retries.

### Suggested Go Structure

Show only files relevant to the slice:

```text
toy-system/
├── cmd/service/main.go       # Wiring only
├── internal/
│   ├── ingest/               # Boundary parsing and normalization
│   ├── domain/               # Pure rules and invariants
│   └── storage/              # Persistence adapter
├── docs/slices/01-ingest.md
└── go.mod
```

Adapt this to the repository. Do not create `pkg/`, worker packages, or extra layers unless public reuse or a real boundary justifies them.

### Failure Cases And Invariants

Cover only failures that can affect the slice: malformed input, missing data, duplicate operations, cancellation, partial writes, retries, deadlines, and concurrency races where applicable. State what remains true after each failure.

### Tests

Use a compact behavior-focused matrix:

| Scenario | Level | Expected observable behavior |
|---|---|---|
| Valid input | Unit/integration | Produces the expected result |
| Invalid input | Unit | Returns a classified error and no partial state |
| Cancellation or deadline | Integration | Stops work and releases owned resources |
| Boundary failure | Integration | Caller receives a recoverable failure |

Prefer pure transformation tests and public behavior. Add race, process, or end-to-end tests only when the slice crosses those boundaries.

### Operational Notes And Future Evolution

Document limits, metrics, shutdown, cleanup, rollback, and retry policy only when operationally relevant. State how a later slice may replace internal data structures while preserving the tested external contract.

## Core Guardrails

- Treat the problem as `input -> transform -> output`.
- Normalize at boundaries before deeper logic.
- Keep bounded loops and explicit exit conditions.
- Keep the smallest correct sequential path as the default.
- Add concurrency only when required by the capability, and define ownership, backpressure, cancellation, and shutdown.
- Keep `cmd/.../main.go` as wiring.
- Prefer invariant-based integration tests over tests tied to internal data structures.
- Use `-` instead of speculative ceremony for irrelevant concerns.

For a tiny helper or CLI wrapper, shorten each section rather than inventing deep telemetry or architecture.

## AGENTS.md Reference Entry

```markdown
- **Skill Reference:** `$go-systems-slice-design-generator`
  - **When to invoke:** Use this when a Go feature needs a concrete implementation slice, especially for parsers, storage, pipelines, concurrency, or boundary-heavy logic.
  - **Prompt Hook:** "Act as a Go Systems Architect. Research the relevant sources, define the sequential slice, normalize inputs at the boundary, show core and helper pseudocode, and keep concurrency out until the baseline path works."
```
