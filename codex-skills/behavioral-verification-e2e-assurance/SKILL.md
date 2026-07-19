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

## Project-Aware Test Tool Selection

- For web projects, inspect the existing package scripts and use the configured unit-test runner. Use Vitest when the project already has it configured; do not add or force it when another suitable runner is in use.
- Invoke `$playwright-skill` for browser-visible workflows, authentication, responsive behavior, navigation, and other high-value E2E checks. Follow that skill's server-detection and browser-execution workflow.
- For Go projects, use the native test runner with `go test ./...`. Add `go test -race ./...` when concurrency or shared state makes race detection relevant.
- Keep tool choice proportional to risk: a unit or integration test is sufficient when browser automation would not add meaningful confidence.

## Refactor-Proof Assertions

- Assert public outcomes and invariants, not state containers, framework wiring, or storage representation.
- Keep integration assertions stable when an internal implementation changes from local state to a remote store, queue, or synchronization engine.
- For long-lived resources, verify unsubscribe, disconnect, cancellation, or teardown behavior when leaks would affect users or capacity.

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
- **Skill Reference:** `$behavioral-verification-e2e-assurance`
  - **When to invoke:** Use this when writing tests, validating user workflows, or deciding whether a behavior should be covered by unit, integration, or Playwright tests.
  - **Prompt Hook:** "Act as a Quality Assurance Engineer. Test visible behavior, prefer accessible selectors, and cover only the workflow boundaries that matter."
```
