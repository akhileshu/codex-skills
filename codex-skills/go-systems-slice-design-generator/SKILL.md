---
name: go-systems-slice-design-generator
description: Go systems planning guidance for turning milestone rows into bounded sequential slices with clear control flow. Use when designing Go features, parsers, pipelines, or storage code before implementation.
---

# Go Systems Slice Design Generator

## Overview

Turn a Go milestone into a small, testable slice. Define the data flow, keep the first version sequential, and make the boundary rules explicit.

## Slice Blueprint

1. Start with a shortlist of the most relevant references or APIs.
2. Describe the input, transform, and output model in Go terms.
3. Normalize at the boundary before deeper logic.
4. Add concurrency only after the sequential path is correct.

## Core Flow

- Treat the problem as `input -> transform -> output`.
- Keep invariants and error paths explicit.
- Use bounded loops and clear exit conditions.
- Include observability only where the slice is operationally important.

## Flexible Guardrail

- For a tiny helper or CLI wrapper, keep the plan short.
- Do not force grammar diagrams or deep telemetry if the problem is simple.
- Keep the smallest correct sequential slice as the default.

## AGENTS.md Reference Entry

```markdown
- **Skill Reference:** `skills/go-systems-slice-design-generator.md`
  - **When to invoke:** Use this when a Go feature needs a concrete implementation slice, especially for parsers, storage, pipelines, or other boundary-heavy logic.
  - **Prompt Hook:** "Act as a Go Systems Architect. Define the sequential slice, normalize inputs at the boundary, and keep concurrency out until the baseline path works."
```
