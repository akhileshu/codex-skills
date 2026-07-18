---
name: type-safe-boundary-validation-mutation
description: Type-safe boundary guidance for Zod, tRPC, Prisma, ZenStack, and React Hook Form validation flows. Use when designing schemas, API edges, or forms that need a single source of truth for validation and mutation.
---

# Type-Safe Boundary Validation & Mutation

## Overview

Keep data integrity at the edge. Validate once, preserve types through the flow, and let the backend remain the source of truth.

## Boundary Rules

1. Parse incoming data with a single schema at the boundary.
2. Express API actions as commands rather than loose state updates.
3. Put access policies in the schema or policy layer, not in scattered business logic.
4. Connect forms to the same validation source as the backend.

## State Integrity

- Transform parsed transport values into domain values before they enter core logic; do not let request, database, or framework types become the domain model by accident.
- Use discriminated unions and constrained value types when they prevent impossible combinations or ambiguous mutation states.
- Keep the boundary contract stable while allowing internal schemas and persistence representations to evolve behind it.

## Guardrails

- Keep validation explicit and close to the edge.
- Prefer compiler-inferred types over hand-maintained copies.
- Return clear structural errors and avoid hidden coercion.
- Avoid over-building schema layers for plain data transforms.

## Flexible Guardrail

- For simple internal transforms, a lightweight check may be enough.
- Do not force full end-to-end validation if the boundary risk is low.
- Add stricter modeling when the data crosses trust boundaries or mutations matter.

## AGENTS.md Reference Entry

```markdown
- **Skill Reference:** `skills/type-safe-boundary-validation-mutation.md`
  - **When to invoke:** Use this when designing database schemas, API handlers, or forms that need one authoritative validation boundary.
  - **Prompt Hook:** "Act as a Type-Safe Full-Stack Developer. Validate at the edge, keep policies central, and wire forms to the same schema source."
```
