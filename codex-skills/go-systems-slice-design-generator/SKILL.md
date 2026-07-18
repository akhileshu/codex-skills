---
name: go-systems-slice-design-generator
description: Go systems planning guidance for turning milestone rows into implementation-ready slices with clear control flow, interfaces, pseudocode, tests, and repository boundaries. Use when designing Go features, parsers, pipelines, storage code, or concurrency before implementation.
---

# Go Systems Slice Design Generator

## Overview

Turn a Go milestone into a small, testable slice. Define the data flow, keep the first version sequential, and make the boundary rules explicit.

## Slice Blueprint

1. Start with a shortlist of the most relevant references or APIs.
2. Describe the input, transform, and output model in Go terms.
3. Normalize at the boundary before deeper logic.
4. Build a narrow sequential tracer path that proves the important boundary.
5. Add concurrency only after the sequential path is correct.
6. Preserve tested external behavior when later slices replace internal representations.

Use this lens for each slice: `Understand -> Simplify -> Reuse -> Build -> Integrate -> Verify -> Operate -> Evolve`.

Before implementation, check that invariants are explicit, cancellation and resource ownership are visible, and the design does not couple transport or storage types to core logic.

## Roadmap Table

When the input contains multiple milestones, begin with one row per visible capability:

| # | Slice / Visible Capability | Understand | Simplify | Reuse | Build | Integrate | Verify | Operate | Evolve |
|---:|---|---|---|---|---|---|---|---|---|
| 1 | Example capability | Runtime or domain concept to learn | Deliberate version-one boundary | Existing package or standard library | Concrete types and functions | First caller or composition-root path | Invariants and failure tests | Limits, cleanup, or telemetry | Explicit next slice |

Keep cells concrete and short. `Simplify` must state exclusions. `Integrate` must identify the package or process boundary. Use `-` for operations that are genuinely irrelevant rather than inventing ceremony.

## Implementation-Ready Slice Document

For each detailed slice, use these sections in order. Keep the depth proportional to risk, but include enough detail that implementation does not require architectural guesswork:

### What This Slice Builds

State the visible capability, the smallest useful behavior, and the output or state it produces.

### What To Study

List only the relevant packages, formats, protocols, existing code paths, and short references. Tie each item to a decision it informs.

### Scope And Non-goals

Define the supported version-one behavior and explicitly defer adjacent features.

### Core Mental Model

Show the main data flow and state transitions in a compact text diagram:

```text
external input
    -> boundary normalization
    -> domain operation
    -> state or output
    -> caller-visible result
```

### Data Model And Interfaces

Show the smallest useful Go contracts. Keep transport, storage, and domain representations separate when the boundary matters:

```go
type Reader interface {
	ReadNext() (Item, bool, error)
}

type Store interface {
	Put(Item) error
	Get(Key) (Item, bool, error)
}
```

Name invariants, ownership, error semantics, and lifecycle rules beside the interfaces.

### Integration Flow

Trace the first end-to-end path, including the composition root:

```text
cmd/service/main.go
    -> construct config and adapters
    -> call internal capability
    -> normalize boundary input
    -> apply domain rules
    -> return result or structured error
```

### Core Pseudocode

Describe the control flow before writing full code. Make normal completion, invalid input, cancellation, and cleanup explicit.

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

Do not create `pkg/`, worker packages, or extra layers unless public reuse or a real boundary justifies them.

### Failure Cases And Invariants

Cover malformed input, missing data, duplicate operations, cancellation, partial writes, retries, and concurrency only when they can affect this slice. State what must remain true after each failure.

### Tests

Use a compact test matrix:

| Scenario | Level | Expected observable behavior |
|---|---|---|
| Valid input | Unit/integration | Produces the expected result |
| Invalid input | Unit | Returns a classified error and no partial state |
| Boundary failure | Integration | Caller receives a recoverable failure |

Prefer tests for pure transformations and public behavior. Add race, process, or end-to-end tests only when the slice crosses those boundaries.

### Operational Notes And Future Evolution

Document limits, metrics, shutdown, cleanup, and rollback only when operationally relevant. Record how a later slice may replace internal data structures while preserving the tested external contract.

## Core Flow

- Treat the problem as `input -> transform -> output`.
- Keep invariants and error paths explicit.
- Use bounded loops and clear exit conditions.
- Include observability only where the slice is operationally important.
- Prefer invariant-based integration tests over tests tied to internal data structures.
- Keep `cmd/.../main.go` as wiring and keep core logic independent of transport and persistence types.
- Make ordinary runtime failures explicit; do not hide recoverable failures behind panics or unbounded retries.

## Flexible Guardrail

- For a tiny helper or CLI wrapper, keep the plan short.
- Do not force grammar diagrams or deep telemetry if the problem is simple.
- Keep the smallest correct sequential slice as the default.
- For a small slice, shorten each required section rather than omitting its boundary, failure, or test decisions.

## AGENTS.md Reference Entry

```markdown
- **Skill Reference:** `skills/go-systems-slice-design-generator.md`
  - **When to invoke:** Use this when a Go feature needs a concrete implementation slice, especially for parsers, storage, pipelines, or other boundary-heavy logic.
  - **Prompt Hook:** "Act as a Go Systems Architect. Define the sequential slice, normalize inputs at the boundary, and keep concurrency out until the baseline path works."
```
