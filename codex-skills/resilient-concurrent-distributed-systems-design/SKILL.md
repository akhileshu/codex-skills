---
name: resilient-concurrent-distributed-systems-design
description: Concurrency and distributed-systems guidance for bounded workers, retries, isolation, and recovery paths. Use when designing Go routines, queue consumers, network retries, or any multi-process flow that must fail well.
---

# Resilient Concurrent & Distributed Systems Design

## Overview

Start sequential, then add concurrency carefully. Bound everything that can grow, and assume partial failure is normal once work crosses process boundaries.

## Core Rules

1. Build the simplest correct sequential version first.
2. Bound queues, workers, goroutines, and retries.
3. Use circuit breakers or bulkheads when dependency failure can spread.
4. Use outbox/inbox patterns or dedupe keys when retries can duplicate side effects.

## Evolution And Lifecycle

- Establish a tracer path with explicit ownership, cancellation, and completion semantics before parallelizing it.
- Keep invariants and externally visible outcomes stable when replacing the sequential implementation with workers or queues.
- Specify teardown for goroutines, timers, subscriptions, and queue consumers; a bounded design also needs a deterministic shutdown path.

## Guardrails

- Prefer fail-closed when safety matters more than uptime.
- Prefer fail-open only when availability is the more important outcome.
- Keep recovery logic explicit and testable.
- Avoid uncontrolled concurrency even when the code looks simple.

## Flexible Guardrail

- For a single-threaded local path, keep the sequential baseline and stop there.
- Do not add circuit breakers or queues unless the boundary is real.
- Expand to the heavier patterns only when concurrency or retries make them necessary.

## AGENTS.md Reference Entry

```markdown
- **Skill Reference:** `$resilient-concurrent-distributed-systems-design`
  - **When to invoke:** Use this when writing concurrent Go code, queue consumers, or multi-process workflows with retries and side effects.
  - **Prompt Hook:** "Act as a Distributed Systems Engineer. Keep concurrency bounded, design for retries and duplication, and choose the right failure mode explicitly."
```
