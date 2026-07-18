```markdown
# Skill: Behavioral Verification & E2E Assurance

## Philosophy
Test the user-facing outcome, not the private code implementation details. If a refactoring change breaks your tests but the application still behaves perfectly for the user, the test suite is invalid. 

## Strategy Rules
1. **Core Domain Correctness:** Use `Vitest` to quickly test pure utility logic, validation schemas, data parsers, and synchronous state transitions.
2. **Component Interactions:** Use `React Testing Library` to query components exclusively by user-accessible landmarks (e.g., `getByRole('button', { name: /submit/i })`). Avoid searching by inner component state or CSS selectors.
3. **Workflow Integrity Verification:** Protect high-value transaction pathways (e.g., multi-tenant authorization gates, booking loops) by testing real browser interactions via `Playwright`. Simulate slow connections, session dropouts, and multi-user race conditions.

## Verification Checklist
- [ ] Are tests free from implementation-dependent element selectors or mock states?
- [ ] Do your end-to-end tests validate behavior across distinct permission states?
- [ ] Are complex UI components tested for edge cases (e.g., empty queues, errors)?
```

### `AGENTS.md` Reference
```markdown
- **Skill Reference:** `skills/behavioral-verification.md`
  - **When to invoke:** Use this when designing testing plans, implementing unit tests, or configuring end-to-end testing scripts.
  - **Prompt Hook:** "Act as a Quality Assurance Engineer. Enforce the Behavioral Verification skill. Avoid internal detail mocks, verify functional outputs, and target user-facing scenarios."
```

---
