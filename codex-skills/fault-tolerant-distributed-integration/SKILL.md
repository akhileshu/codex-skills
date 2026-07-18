---
name: fault-tolerant-distributed-integration
description: Distributed integration guidance for Go clients, file transfer, telemetry, retries, and network-bound failure handling. Use when writing cross-service code, direct-to-storage upload flows, or any integration that needs deadlines and observability.
---

# Fault-Tolerant Distributed Integration

## Overview

Treat network boundaries as failure-prone by default. Add deadlines, telemetry, and bounded recovery paths before layering on resilience features.

## Core Rules

1. Put explicit `context.Context` deadlines on outgoing Go calls.
2. Instrument cross-service paths with structured tracing and request correlation.
3. Send large files directly to storage instead of proxying them through the app server.
4. Retry only with idempotency or deduplication in place.
5. Use local mirrors such as `httpbin` to test failure paths before shipping.

## Guardrails

- Keep queues, retries, and worker pools bounded.
- Prefer direct-to-storage or queue-based designs over app-server relay for heavy transfers.
- Preserve clear error context across process boundaries.
- Do not add distributed machinery when the task is local or one-shot.

## Flexible Guardrail

- For local-only helpers, skip the full telemetry stack.
- Do not wrap a tiny client in retry and circuit-breaker plumbing unless the boundary is real.
- Add the heavier patterns only when retries, file size, or latency make them necessary.

## AGENTS.md Reference Entry

```markdown
- **Skill Reference:** `skills/fault-tolerant-distributed-integration.md`
  - **When to invoke:** Use this when writing Go clients, direct-to-storage flows, or any network integration that must survive retries, timeouts, or partial failure.
  - **Prompt Hook:** "Act as a Distributed Infrastructure Developer. Add deadlines, telemetry, and bounded retry handling to the integration boundary."
```
