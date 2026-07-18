---
name: tracer-code-continuous-refactoring
description: Safely evolve architecture between implementation slices using tracer code, stable boundary contracts, invariant-based tests, and incremental refactoring. Use when a later slice changes storage, transport, state, rendering, concurrency, or other internal implementation choices.
---

# Tracer Code And Continuous Refactoring

## Purpose

Handle the refactoring tax created by incremental slices. Prove a new boundary with a narrow tracer path, replace disposable internals behind that boundary, and preserve externally observable behavior with tests that do not depend on representation.

Use this skill independently for architecture evolution or together with `$slice-implementer` when implementing a slice that changes an earlier boundary.

## Core Principles

- Treat early implementations as learning scaffolding, not permanent monuments.
- Protect the smallest stable interface and observable invariant, not every internal data shape.
- Make it work, make it right, then make it fast; do not optimize a boundary before its behavior is proven.
- Use AI as a refactoring pair that maps an intentional change across known boundaries, not as a generator of a complete multi-slice system.

## Workflow

### 1. State The Evolution

Identify:

| Concern | Current slice | Target slice or constraint |
|---|---|---|
| Internal representation | e.g. in-memory array | e.g. database, CRDT, or worker queue |
| Stable boundary | e.g. `renderCanvas(shapes)` | Must remain callable with equivalent data |
| Observable invariant | e.g. dragged shape ends at `(10, 10)` | Must pass unchanged after replacement |
| Reason for change | Current limit or new requirement | Evidence, not speculation |

If no real constraint or boundary exists, stop and recommend keeping the current implementation.

### 2. Inventory The Contract

Read the current slice, callers, adapters, tests, and next-slice requirements. Classify each item as:

- **Stable:** public behavior, user workflow, protocol, domain invariant, or intentionally shared interface.
- **Disposable:** local data shape, adapter, storage mechanism, framework wiring, or performance scaffolding.
- **Unknown:** behavior that needs a focused test or measurement before changing.

Do not preserve accidental coupling merely because it already exists.

### 3. Build A Tracer

Introduce the smallest path that proves the target boundary without implementing the whole future system:

```text
old producer
    -> stable adapter/interface
    -> new implementation
    -> unchanged consumer
    -> existing observable assertion
```

Examples:

```text
in-memory []Shape
    -> SceneSource.List()
    -> database-backed SceneSource
    -> renderCanvas(shapes)
```

```text
React/local interaction state
    -> render model contract
    -> network or CRDT document adapter
    -> unchanged canvas renderer
```

Keep the tracer sequential and easy to inspect. Add concurrency or distributed coordination only after the boundary behavior is correct.

### 4. Refactor In Small Steps

Use this sequence:

1. Add or clarify the smallest boundary contract.
2. Add an adapter for the existing implementation.
3. Lock public behavior with invariant-based tests.
4. Add the target implementation behind the same contract.
5. Switch one caller at a time.
6. Remove obsolete scaffolding only after verification passes.
7. Measure performance or operational behavior if that motivated the change.

Keep each step buildable. If the boundary must change, make that change explicit and update all callers in one controlled step rather than maintaining ambiguous dual contracts.

## Reconciliation Rules

When a slice document conflicts with project quality rules, reconcile before editing:

- Replace primitive flag combinations with explicit state types when impossible states matter.
- Keep high-frequency execution state out of ordinary component/global state when it causes avoidable rendering work.
- Parse and validate untrusted transport data at the edge.
- Keep transport, persistence, and framework types out of core domain logic.
- Give subscriptions, sockets, timers, goroutines, workers, and queues deterministic teardown.
- Define idempotency and partial-failure behavior before retrying side effects.

The quality rule takes precedence over a shortcut in the old slice document. Record the deviation and why it is safer.

## Behavior-Preserving Tests

Test the public result, not the internal representation:

```typescript
// Stable: survives a local-array -> remote-document refactor.
test('created shape is visible at its final position', async ({ page }) => {
  await page.goto('/workspace');
  await page.getByRole('button', { name: 'Create box' }).click();
  await expect(page.locator('[data-element-type="box"]')).toBeVisible();
});
```

```go
// Stable: tests the contract, not whether storage uses a slice or a file.
func TestStoreRoundTrip(t *testing.T) {
	store := newTestStore()
	if err := store.Put(Item{ID: "1", Name: "one"}); err != nil {
		t.Fatal(err)
	}
	got, ok, err := store.Get("1")
	if err != nil || !ok || got.Name != "one" {
		t.Fatalf("round trip failed: got=%+v ok=%v err=%v", got, ok, err)
	}
}
```

Avoid assertions such as `internalStateArray.length`, concrete cache shape, or a specific database query when the behavior can be tested through the public boundary.

## Handoff And Reporting

Before refactoring, report the stable contract, disposable implementation, tracer step, and verification plan. After refactoring, report:

- Boundary and implementation changes.
- Tests intentionally kept unchanged.
- New tests or measurements.
- Cleanup performed and resources verified.
- Remaining migration or operational risks.
- The next slice that should consume the new boundary.

## Guardrails

- Do not launch a complete future architecture to avoid a small refactor.
- Do not preserve a leaky interface when evidence shows it prevents correctness or performance.
- Do not change public behavior silently; treat behavior changes as a new slice.
- Do not remove tests merely because internals changed; rewrite only tests that asserted disposable representation.

## Definition Of Done

The refactor is complete when the new boundary is proven, public behavior remains correct or an intentional behavior change is documented, invariant tests pass, resources terminate cleanly, and the old implementation is removed or explicitly isolated.

## AGENTS.md Reference Entry

```markdown
- **Skill Reference:** `skills/tracer-code-continuous-refactoring.md`
  - **When to invoke:** Use this when a later slice must replace an earlier internal representation or when architecture needs behavior-preserving evolution.
  - **Prompt Hook:** "Identify stable contracts and disposable internals, build a narrow tracer, refactor incrementally, and preserve invariant-based tests."
```
