---
name: capability-driven-auth-frontend-state-ui-access-integrity
description: Web auth and client-state guidance for capability-based UI, explicit lifecycle states, and secure backend-driven authorization. Use when designing web interfaces, routing flows, client state models, or permission-gated interactions.
---

# Capability-Driven Auth & Frontend State

## Overview

Treat authorization as backend truth and client state as an explicit model. UI should reflect capabilities, not infer them.

## Core Rules

1. Put authorization decisions in the backend and expose capabilities to the UI.
2. Avoid raw role checks in components when a capability or policy can express the rule.
3. Model loading, empty, success, error, and forbidden as distinct states.
4. Preserve user intent across auth barriers so a login or payment gate can resume the action.
5. Keep BFF and API shaping layers thin and separate from the core domain model.

## Guardrails

- Prefer capabilities over roles.
- Make state matrices explicit for risky or branching flows.
- Keep client code from becoming an authorization engine.
- Do not overbuild state machines for small static screens.

## Flexible Guardrail

- If the screen is simple and non-sensitive, keep the state model lightweight.
- Do not force a BFF or state machine when plain props and a small query hook are enough.
- Expand to stricter modeling only where permissions, retries, or resumption matter.

## AGENTS.md Reference Entry

```markdown
- **Skill Reference:** `$capability-driven-auth-frontend-state-ui-access-integrity`
  - **When to invoke:** Use this when designing authenticated web interfaces, permission-gated flows, or client state that needs explicit loading, error, and forbidden handling.
  - **Prompt Hook:** "Act as a Lead Frontend & Security Engineer. Keep authorization in the backend, model explicit UI states, and preserve user intent across auth barriers."
```
