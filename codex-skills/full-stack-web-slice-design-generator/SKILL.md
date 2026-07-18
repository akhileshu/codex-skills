---
name: full-stack-web-slice-design-generator
description: Full-stack planning guidance for turning milestone rows into vertical slices from database to UI. Use when designing a web feature blueprint, studying a product row, or mapping client and server responsibilities before implementation.
---

# Full-Stack Web Slice Design Generator

## Overview

Turn product milestones into concrete full-stack slices. Start with the smallest visible capability and map the data flow end to end.

## Slice Blueprint

1. Start with a "What to Study" shortlist of the smallest relevant references.
2. Map the pipeline from database truth to UI feedback.
3. Define the slice boundary, then keep server, client, and validation responsibilities separate.
4. Include verify and operate notes only when the slice is risky enough to need them.

## Core Flow

- Database truth -> server endpoint or action -> validation boundary -> client cache -> component state -> UI layout.
- Prefer one vertical slice per visible capability.
- Reuse existing UI tokens, schemas, hooks, and actions before adding new primitives.
- Keep the initial implementation simple if the slice is low risk.

## Flexible Guardrail

- For static pages or low-risk CRUD, skip the heavy matrix and keep the slice lean.
- Do not force elaborate state machines, telemetry plans, or E2E maps when they do not change the decision.
- Use the full matrix only when the boundary, state, or rollout risk justifies it.

## AGENTS.md Reference Entry

```markdown
- **Skill Reference:** `skills/full-stack-web-slice-design-generator.md`
  - **When to invoke:** Use this when a milestone row needs to become a concrete full-stack implementation plan before coding.
  - **Prompt Hook:** "Act as a Lead Full-Stack Architect. Map the slice end to end, keep client/server boundaries clean, and choose the smallest safe implementation."
```
