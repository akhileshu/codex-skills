---
name: go-systems-slice-topology-architect
description: Go topology planning guidance for vertical slices, package boundaries, and bounded concurrency. Use when organizing a Go repo, defining package layout, or decomposing systems work before implementation.
---

# Go Systems Slice Topology Architect

## Overview

Lay out the Go system first. Keep the composition root thin, isolate internal packages, and split work into small vertical slices.

## Topology Rules

1. Put wiring in `cmd/.../main.go` and keep business logic out of it.
2. Group code by capability inside `internal/`.
3. Keep each slice independently testable and compilable.
4. Introduce concurrency only after the sequential design is stable.

## Guardrails

- Keep queues and workers bounded.
- Use explicit package boundaries instead of broad shared utilities.
- Separate core logic from transport and persistence concerns.
- Do not over-architect small command-line tools.

## Flexible Guardrail

- For a small utility, a flat package tree is fine.
- Do not create folders just to satisfy a template.
- Expand the topology only when boundaries or scale justify it.

## AGENTS.md Reference Entry

```markdown
- **Skill Reference:** `skills/go-systems-slice-topology-architect.md`
  - **When to invoke:** Use this when planning Go repo structure, package boundaries, or an incremental systems roadmap.
  - **Prompt Hook:** "Act as a Go Systems Architect. Define the package topology, keep the composition root thin, and preserve bounded vertical slices."
```
