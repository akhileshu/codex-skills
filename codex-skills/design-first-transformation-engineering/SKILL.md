---
name: design-first-transformation-engineering
description: Design-first engineering guidance for safe data-flow transformations, explicit invariants, and clean domain boundaries. Use when mapping inputs to outputs, structuring domain logic, or simplifying boundary-heavy code before implementation.
---

# Design-First Transformation Engineering

## Overview

Treat software as a transformation pipeline. Normalize at the edge, keep domain rules explicit, and avoid scattering special cases through the core.

## Core Rules

1. Define inputs, outputs, invariants, and failure cases before coding.
2. Normalize messy input once at the boundary.
3. Keep infrastructure concerns at the edges and business logic in the middle.
4. Prefer explicit commands and state transitions over generic mutation.
5. Make error paths and ordering constraints visible.

## Guardrails

- Choose the simplest correct sequential flow first.
- Move special cases outward when they can be normalized early.
- Keep core logic free of database, HTTP, or framework types.
- If the problem is small, do not force a heavy architectural decomposition.

## Flexible Guardrail

- For trivial helpers or one-off scripts, use direct sequential code.
- Do not demand a full command model when a plain function is enough.
- Only split layers when the boundary helps correctness or future change.

## AGENTS.md Reference Entry

```markdown
- **Skill Reference:** `$design-first-transformation-engineering`
  - **When to invoke:** Use this when mapping a new feature, shaping domain boundaries, or planning how data should flow through a change.
  - **Prompt Hook:** "Act as a Systems Architect. Normalize at the boundary, keep domain logic free of infrastructure details, and make state transitions explicit."
```
