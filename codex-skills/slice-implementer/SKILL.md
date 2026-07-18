---
name: slice-implementer
description: Implement an existing slice design document safely through reconciliation, tracer code, incremental checkpoints, tests, and local verification. Use when implementing docs/slices/*.md or another bounded feature slice in a Go, full-stack web, or similar codebase.
---

# Slice Implementer

## Purpose

Turn one bounded slice design into working, verified code without blindly treating the document as a perfect specification. Preserve stable external behavior, correct unsafe shortcuts, and leave future slices out of the current implementation.

## Inputs And Boundaries

Read these before editing:

- The target slice document and its `Goal`, non-goals, interfaces, tests, and definition of done.
- The repository structure, entrypoints, relevant call paths, and existing tests.
- The immediately prior slice and the next slice when they define a boundary or expected evolution.
- Project instructions, quality rules, and the existing dependency/configuration setup.

Do not implement multiple slices because the target document mentions future work. Treat `Future improvements` as context, not current scope.

## Workflow

### 1. Discover

Map the current code before proposing edits. Identify the smallest set of files and tests that establish the slice boundary. State known constraints, unknowns, and the expected user or system-visible outcome.

### 2. Reconcile The Design

Before writing code, compare the slice document with the repository and project rules. Report corrections briefly before implementation:

| Check | Question | Required response |
|---|---|---|
| Boundary | Does transport, UI, persistence, or framework code leak into core logic? | Move or transform at the boundary. |
| State | Can impossible or high-volatility states occur? | Use explicit states or isolate the execution loop. |
| Input | Are external values parsed and validated at the edge? | Add runtime validation before domain logic. |
| Lifecycle | Who owns cleanup, cancellation, closing, and retry completion? | Make ownership and teardown explicit. |
| Behavior | What public behavior must survive internal replacement? | Name an invariant test before refactoring. |

If the design is underspecified, choose the smallest safe behavior supported by existing code and record the assumption. Do not expand scope to resolve unrelated ambiguity.

### 3. Build A Tracer Path

Prove the critical path with the narrowest implementation that crosses the intended boundary:

```text
caller or user action
    -> boundary adapter
    -> domain/application operation
    -> state or persistence
    -> observable result
```

For a Go slice, this is usually a sequential path through `cmd/...` and `internal/...`. For a web slice, it is usually one route/action through validation, authorization, data access, cache state, and UI feedback.

### 4. Implement Checkpoints

Work in small checkpoints, keeping each checkpoint buildable and verifiable:

1. Establish or adjust the smallest contract.
2. Implement the core behavior with explicit errors and invariants.
3. Connect one real caller, route, command, or UI path.
4. Add boundary and behavior tests.
5. Add operational controls only when the slice risk requires them.

Use existing schemas, interfaces, hooks, UI primitives, adapters, and test fixtures before adding new ones.

### 5. Verify And Report

Run focused tests after each checkpoint, then the relevant broader checks. Report:

- Files and behavior changed.
- Reconciliation decisions and any deviation from the slice document.
- Tests and commands run with results.
- Remaining risks or unverified boundaries.
- Follow-up work that belongs to a later slice.

## Refactoring Handoff

Invoke `$tracer-code-continuous-refactoring` when the target slice replaces an earlier internal representation, changes a stable boundary, or requires behavior-preserving migration. Keep ordinary feature implementation here; keep cross-slice architecture evolution in the refactoring skill.

## Implementation Examples

### Go Boundary

Keep the composition root as wiring and put the behavior behind a testable package:

```go
// cmd/toydb/main.go
func main() {
	if err := repl.Run(os.Stdin, os.Stdout, executor); err != nil {
		fmt.Fprintln(os.Stderr, "error:", err)
		os.Exit(1)
	}
}
```

```text
cmd/toydb/main.go
    -> internal/repl.Run
    -> internal/parser.Parse
    -> internal/catalog.Apply
    -> observable output or structured error
```

Do not put parser or database behavior in `main.go` just because the first slice is small.

### Full-Stack Boundary

Keep authorization and validation at the server boundary while exposing a user-visible result:

```text
form submit
    -> server action/API
    -> parse input
    -> check capability
    -> domain/data mutation
    -> invalidate query
    -> success, validation, forbidden, or retryable UI state
```

Use accessible, public behavior in tests rather than asserting private cache or store shapes.

## Guardrails

- Do not blindly follow a design document when it conflicts with repository evidence or safety rules.
- Do not introduce concurrency, distributed infrastructure, or abstractions before the sequential/local boundary is proven.
- Keep implementation scope inside the target slice’s goal and non-goals.
- Make ordinary failures explicit; do not swallow errors or add unbounded retries.
- Preserve user-visible behavior and stable contracts when replacing disposable internals.

## Definition Of Done

A slice is complete when the intended behavior works, important failure paths are handled, boundaries are validated, owned resources clean up, relevant tests pass, and any design deviations are documented.

## AGENTS.md Reference Entry

```markdown
- **Skill Reference:** `skills/slice-implementer.md`
  - **When to invoke:** Use this when implementing a bounded slice document such as `docs/slices/05-in-memory-table-storage.md`.
  - **Prompt Hook:** "Implement this slice after reconciling it with the repository and quality rules. Build a tracer path, work in verified checkpoints, and preserve stable behavior."
```
