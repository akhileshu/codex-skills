---
name: go-implementation-slices-table-and-repo-structure
description: Design Go implementation slices and repository structure before coding. Use when turning a Go systems roadmap into a capability-by-capability implementation table, defining cmd and internal package boundaries, or sequencing sequential, storage, transport, and concurrent work.
---

# Go Systems Implementation Slices, Table And Repo Structure Architect

## Purpose

Turn a Go systems roadmap, parser, storage engine, service, or pipeline into two implementation artifacts:

1. A capability-by-capability implementation-slices table.
2. A Go repository-structure code fence showing package ownership and dependency direction.

Start with the smallest sequential tracer path. Add persistence, transport, concurrency, and operational complexity only when a later slice proves it is needed.

## Required Output

Unless the user requests another format, produce these sections in order:

### What To Study

List the smallest relevant Go packages, command entrypoints, interfaces, schemas, storage formats, protocols, tests, and configuration files to inspect. Explain what each reference informs.

### Implementation Slices

Use one row per capability and preserve this column order. Put `Done` immediately after `#`; use `[x]` for a capability the user or source roadmap confirms is complete, and `[ ]` for a pending or unconfirmed capability. Do not mark a slice complete merely because it is planned.

| # | Done | Slice / Visible Capability | Understand | Simplify | Reuse | Build | Integrate | Verify | Operate | Evolve |
|---:|:---:|---|---|---|---|---|---|---|---|---|---|
| 1 | [ ] | Example capability | Relevant system or runtime concept | Smallest sequential scope | Existing package or standard library primitive | Concrete types and control flow | First caller or composition-root path | Invariants and failure tests | Logs, limits, or cleanup if material | Explicit next step |

Make every cell concrete. `Simplify` states what is intentionally excluded. `Reuse` identifies existing packages, interfaces, codecs, or standard-library primitives. `Integrate` names the caller and dependency direction. `Operate` covers limits, cancellation, observability, and shutdown only when relevant. `Evolve` records deferred work, not requirements for the current slice.

### Repository Structure

Show a fenced Go tree and annotate ownership and dependency direction. Include `docs/slices/` for multi-slice work.

Example shape:

```text
go-system/
├── cmd/
│   └── service/
│       └── main.go              # Composition root: config, adapters, wiring
├── internal/
│   ├── ingest/                  # Input normalization and boundary contracts
│   ├── domain/                  # Pure rules and invariants
│   ├── storage/                 # Persistence adapter and codecs
│   ├── transport/               # HTTP, RPC, or message handlers
│   └── worker/                  # Bounded concurrency and lifecycle control
├── migrations/                  # Only when a database schema exists
├── pkg/                         # Only for intentionally public reusable APIs
├── docs/slices/                 # One design file per implementation slice
├── go.mod
└── go.sum
```

Adapt the tree to the repository. Omit `pkg/` for application-internal code and omit `migrations/`, `worker/`, or deeper packages when the system does not need them. Do not create packages solely to satisfy this example.

## Design Method

Use this lens for each row:

`Understand -> Simplify -> Reuse -> Build -> Integrate -> Verify -> Operate -> Evolve`

- Make the first slice a narrow end-to-end tracer path with explicit input, transform, output, and error exits.
- Keep `cmd/.../main.go` as wiring only. Put capability logic in `internal/` packages.
- Normalize and validate external input at the boundary; keep core logic free of transport, database, and framework types.
- Define invariants, ownership, cancellation, and shutdown before adding goroutines, queues, retries, or distributed coordination.
- Keep package contracts small so storage, transport, or concurrency implementations can change without rewriting callers.
- Treat early data structures as scaffolding. Preserve tested external behavior while refactoring internals for later slices.

## Slice Document Linkage

For a multi-slice plan, name documents predictably, for example `docs/slices/01-sequential-parser.md`. Each detailed slice document should contain:

`Goal`, `Non-goals`, `Design`, `Interfaces`, `Execution flow`, `Failure cases`, `Tests`, `Definition of done`, and `Future improvements`.

Keep the table concise and put detailed control flow, invariants, and failure analysis in the corresponding slice document.

## Verification And Operations

Select tests by risk:

- Unit tests for pure transformations, codecs, invariants, and error classification.
- Integration tests for storage, transport, process boundaries, and composition wiring.
- Race or concurrency tests only when concurrent behavior exists.
- End-to-end tests for a high-value external workflow, not for every package.

For operational slices, specify bounded input size, workers, queues, retries, timeouts, and memory where relevant. Require deterministic cleanup for goroutines, timers, channels, network clients, and consumers.

## Guardrails

- Build and verify the sequential baseline before concurrency.
- Prefer explicit packages and interfaces over broad shared utilities or speculative layers.
- Do not add `pkg/`, a worker pool, a queue, or distributed machinery without a concrete boundary or failure mode.
- Make ordinary runtime failures explicit and testable; do not hide them behind panics or unbounded retries.

## AGENTS.md Reference Entry

```markdown
- **Skill Reference:** `skills/go-implementation-slices-table-and-repo-structure.md`
  - **When to invoke:** Use this when a Go roadmap needs an implementation-slices table and repository/package structure before coding.
  - **Prompt Hook:** "Act as a Go Systems Architect. Generate the Understand/Simplify/Reuse/Build/Integrate/Verify/Operate/Evolve slices table, show cmd/internal package boundaries, and keep the first path sequential and testable."
```
