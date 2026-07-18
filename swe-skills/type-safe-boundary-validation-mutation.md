```markdown
# Skill: Type-Safe Boundary Validation & Mutation

## Philosophy
Data integrity must be absolute from the database disk up to the user input field. Never trust client payloads. Validate all data structurally at the entry boundary using single-source-of-truth inferable schemas, ensuring compiler-enforced end-to-end type safety.

## Architectural Standards
1. **Single Point Validation:** Leverage `Zod` to parse and validate incoming inputs (API payloads, environment variables, form boundaries) at the exact edge of execution.
2. **Secured Core Infrastructure:** Use `ZenStack` to anchor access policies directly inside the schema definition layer. Reserve direct `Prisma` queries strictly for advanced workflow engines, distributed events, or composite transactions.
3. **Intent-Driven Communications:** Use `tRPC` to implement explicit, command-style API procedures (e.g., `procedures.confirmBooking`) rather than raw status updates.
4. **Form Boundaries:** Coordinate validation states efficiently by coupling `React Hook Form` strictly to `Zod` resolvers. Never manage structural input error states manually.

## Verification Checklist
- [ ] Is input parsing isolated to an inferable schema layer?
- [ ] Are custom database permissions defined inside access policies rather than nested inside application logic?
- [ ] Does the UI form map validation errors directly from the backend schema definitions?
```

### `AGENTS.md` Reference
```markdown
- **Skill Reference:** `skills/type-safe-validation.md`
  - **When to invoke:** Invoke this when designing database schemas, writing backend API route handlers, configuring validation checks, or creating complex frontend forms.
  - **Prompt Hook:** "Act as a Type-Safe Full-Stack Developer. Enforce the Type-Safe Boundary Validation skill. Wire up clean schema inferences, hook up Zod validation schemas, and ensure absolute edge safety."
```

---
