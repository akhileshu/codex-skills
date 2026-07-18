---
name: full-stack-web-slice-workspace-architect
description: Workspace architecture guidance for full-stack projects, feature co-location, and incremental slice planning. Use when organizing a web app, defining folder topology, or splitting a product into front-to-back milestones.
---

# Full-Stack Web Slice Workspace Architect

## Overview

Use this skill to lay out a full-stack workspace before coding. Keep routes, features, UI primitives, and shared utilities separated cleanly.

## Workspace Rules

1. Keep route composition in the app layer.
2. Co-locate feature state, schemas, hooks, and view code under a feature folder.
3. Keep reusable UI primitives stateless and accessible.
4. Preserve a thin server/client boundary so data flow stays predictable.
5. Use vertical slices, not horizontal abstractions, for new work.

## Guardrails

- Place shared logic where reuse is actually needed.
- Keep feature folders small and coherent.
- Do not introduce extra state infrastructure for static or lightly interactive screens.
- Respect existing repo structure when it already solves the layout problem.

## Flexible Guardrail

- Simple pages can stay in one feature folder.
- Do not force a deep workspace tree if the app is small.
- Expand the layout only when multiple slices or boundaries make it useful.

## AGENTS.md Reference Entry

```markdown
- **Skill Reference:** `skills/full-stack-web-slice-workspace-architect.md`
  - **When to invoke:** Use this when starting a new web app, restructuring feature folders, or defining workspace boundaries for a slice.
  - **Prompt Hook:** "Act as a Lead Full-Stack Web Architect. Establish the workspace topology, keep feature boundaries clear, and use the smallest structure that still fits the slice."
```
