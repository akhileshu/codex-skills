
## Skill 1: Design-First Transformation Engineering (Data Flow & Domain Constraints)

### `SKILL.md` Content
```markdown
# Skill: Design-First Transformation Engineering

## Core Philosophy
Software engineering is the design of simple, reliable transformations under constraints. Programs must be treated as `input -> transform -> output` pipelines with explicit state ownership, invariants, and failure modes. The engineering goal is to move edge cases to normal cases early in the execution chain.

## Execution Pattern
1. **Remove Ambiguity First:** Before writing any code, explicitly document:
   - Inputs (shape, messy variations, structural traits)
   - Outputs (expected values, formats)
   - Invariants (what *must* remain true at all times)
   - Failure cases & ordering requirements
2. **Normalize Early:** Convert messy inputs into a uniform model exactly once at the system boundary (`normalize -> validate -> transform -> store`). Eliminate special-case `if` statements scattered throughout business logic.
3. **Establish Clear Boundaries:** Keep core business rules stable and push outer infrastructure tools (HTTP, DB, external APIs) to the periphery. Use clean execution pipelines:
   - Web App: `HTTP Handler -> Service/Use Case -> Repository -> Database`
   - Compiler/Engine: `Parser -> Binder -> Executor -> Storage`
4. **Enforce State Invariants:** Design mutations around explicit domain commands (e.g., `confirmBooking`, `cancelOrder`) rather than generic updates. Protect consistency boundaries at the aggregate level.

## Verification Checklist
- [ ] Are inputs normalized and validated exactly once at the entry boundary?
- [ ] Is business logic free from structural infrastructure leaks (e.g., direct DB types in core logic)?
- [ ] Are business rules represented as explicit state transitions instead of implicit flag mutations?
```

### `AGENTS.md` Reference Entry
```markdown
- **Skill Reference:** `skills/design-first-transformations.md`
  - **When to invoke:** Use this during the initial architectural design phase, when mapping out a new feature, structuring data tables, defining domain entities, or planning how data flows through a new service.
  - **System Prompt Prompting:** "Act as a Systems Architect. Enforce the Design-First Transformation Engineering skill. Ensure data is normalized at the boundary, domain logic is clean of infrastructure details, and all state mutations utilize explicit commands."
```

---
