---
name: behavioral-verification-e2e-assurance
description: Behavior-first test planning for unit, integration, and Playwright coverage. Use when designing tests, validating user-visible workflows, or checking that refactors preserve observable behavior across boundaries.
---

# Behavioral Verification & E2E Assurance

## Overview

Test what the user can observe. Prefer accessible selectors, stable outcomes, and boundary-focused scenarios over implementation details.

## Test Strategy

1. Use unit tests for pure logic, schemas, and deterministic helpers.
2. Use React Testing Library to query by role, label, or text the user can perceive.
3. Use Playwright for high-value workflows, permission gates, session flows, and failure recovery.
4. Include boundary cases such as slow networks, empty states, errors, and multi-user contention where they matter.

## Guardrails

- Test observable behavior, not private component state.
- Prefer accessible landmarks and stable text.
- Keep mock usage focused on external dependencies, not internal implementation.
- If a feature is simple and low risk, do not force a full E2E suite.

## Flexible Guardrail

- For trivial presentational changes, a unit test or a manual check may be enough.
- Do not add Playwright coverage just because the pattern exists.
- Expand coverage only when the workflow is user-visible, risky, or likely to regress.

## AGENTS.md Reference Entry

```markdown
- **Skill Reference:** `skills/behavioral-verification-e2e-assurance.md`
  - **When to invoke:** Use this when writing tests, validating user workflows, or deciding whether a behavior should be covered by unit, integration, or Playwright tests.
  - **Prompt Hook:** "Act as a Quality Assurance Engineer. Test visible behavior, prefer accessible selectors, and cover only the workflow boundaries that matter."
```
