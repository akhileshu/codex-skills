---
name: production-capacity-lifecycle-operations
description: Production operations guidance for capacity limits, telemetry, feature flags, and safe rollouts. Use when adding rate limits, concurrency limits, observability, or lifecycle controls to a system.
---

# Production Capacity & Lifecycle Operations

## Overview

Keep systems bounded, observable, and safe to change. Add operational controls before the service grows painful to run.

## Operational Rules

1. Bound traffic with rate limiting and resource control.
2. Instrument logs, traces, and metrics with consistent context.
3. Roll out risky changes behind feature flags.
4. Use shadow traffic or other safe mirroring when replacing critical paths.

## Slice-Level Operations

- Tie each operational control to a concrete workload, failure mode, or rollback decision; do not add metrics or flags decoratively.
- Define resource ownership and teardown for workers, queues, connections, caches, and subscriptions.
- Verify the new path under representative limits before widening rollout, and keep rollback or disablement observable and reversible.

## Guardrails

- Use worker pools and semaphores for concurrency.
- Use token bucket or leaky bucket patterns for rate control.
- Keep observability structured and consistent.
- Avoid heavyweight capacity planning for trivial scripts.

## Flexible Guardrail

- For scripts or static tools, keep the operational layer light.
- Do not add feature flags, shadow traffic, or metrics if they do not change the decision.
- Add the stronger controls only when the workload or rollout risk warrants them.

## AGENTS.md Reference Entry

```markdown
- **Skill Reference:** `$production-capacity-lifecycle-operations`
  - **When to invoke:** Use this when adding rate limits, concurrency controls, telemetry, or rollout safety to a service.
  - **Prompt Hook:** "Act as an SRE and performance engineer. Bound capacity, add telemetry, and keep rollouts reversible."
```
