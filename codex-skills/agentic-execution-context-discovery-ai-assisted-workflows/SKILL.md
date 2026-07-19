---
name: agentic-execution-context-discovery-ai-assisted-workflows
description: Disciplined AI-assisted coding workflow for context discovery, phased execution, and local verification. Use when starting work in an unfamiliar codebase, planning a change, reviewing structure, or needing a stepwise approach before coding.
---

# Agentic Execution & Context Discovery

## Overview

Use this skill to avoid guessing. Discover the project shape first, state the constraints explicitly, then work in small verifiable steps.

## Workflow

1. Inspect the relevant files, entrypoints, and call paths before proposing code.
2. State the problem, constraints, and known unknowns in plain terms.
3. Break the work into the smallest safe phases.
4. Establish a narrow tracer path that proves the key boundary before widening scope.
5. Implement the first phase with the narrowest possible change.
6. Verify the result locally before widening scope.
7. Refactor or replace internal scaffolding when later evidence requires it; preserve tested external behavior.

## Design Validation

Before coding, challenge the proposed design against the actual failure modes:

- Identify leaky boundaries, high-frequency state coupled to slow UI updates, unvalidated external input, and unmanaged resources.
- Confirm each phase has a visible outcome, a verification method, and a clear reason not to include adjacent work.
- If a recurring failure reveals a missing project rule, propose the rule with its trade-off instead of silently adding ceremony.

## Guardrails

- Prefer evidence over assumption.
- Do not write code until the relevant context is mapped.
- Keep the first pass sequential and simple.
- Add abstraction only when the current slice proves it is needed.
- Treat early implementations as disposable scaffolding behind stable, minimal interfaces.

## Flexible Guardrail

- For a tiny, local fix, use a lightweight version of the loop.
- Do not force a long discovery checklist when the task is already well scoped.
- Let the immediate prompt override any default sequencing if it is more specific.

## AGENTS.md Reference Entry

```markdown
- **Skill Reference:** `$agentic-execution-context-discovery-ai-assisted-workflows`
  - **When to invoke:** Use this when starting work in an unfamiliar repo, planning a change, or needing an explicit discover-first workflow before coding.
  - **Prompt Hook:** "Act as a Principal Engineer Coordinator. Discover the repo structure first, state constraints clearly, split the work into phases, and validate each step before coding."
```
