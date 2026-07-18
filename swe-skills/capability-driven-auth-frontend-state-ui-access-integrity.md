## Skill 3: Capability-Driven Auth & Frontend State (UI & Access Integrity)

### `SKILL.md` Content
```markdown
# Skill: Capability-Driven Auth & Frontend State

## Core Philosophy
The backend completely decides what is allowed; the frontend merely reflects that decision. UI code must never manage raw security definitions; it must strictly consume granular capabilities. Application state transitions must treat edge cases (loading, empty, error, unauthorized) as first-class domain values.

## Architectural Guidelines
1. **Access Control Separation:** Prefer Attribute-Based Access Control (ABAC) or explicit backend capabilities over raw Role-Based Access Control (RBAC) checks scattered inside UI components. The UI should ask: `can(user, 'edit:document')`, not `if (user.role == 'admin')`.
2. **Defensive API Patterns:** Implement the **Intent Gateway + Auth Gate + Resume Flow** pattern. Capture user intents or target routes cleanly, detour through an authentication/payment barrier if required, and safely resume the stateful intent without forcing user re-entry.
3. **Resilient UI State Modeling:** Every interactive component must explicitly handle a complete state matrix. Never build binary state variables (`isLoading = true`). Use precise state configurations:
   - `loading` -> `empty` -> `success` -> `error` -> `forbidden`
4. **Data Aggregation Gateways:** Utilize Backend-for-Frontend (BFF) layers or structured API gateways to massage response shapes specifically for different clients. Keep the core domain service models clean and uncorrupted by UI layouts.

## Verification Checklist
- [ ] Are UI actions guarded by explicit fine-grained capabilities instead of string-based role flags?
- [ ] Does every data-fetching interface account for loading, empty, error, and forbidden states explicitly?
- [ ] If an unauthenticated user triggers a restricted mutation, is their original context preserved for a post-login resume flow?
```

### `AGENTS.md` Reference Entry
```markdown
- **Skill Reference:** `skills/capability-auth-frontend.md`
  - **When to invoke:** Use this when designing web interfaces, components, routing structures, client-side state machinery, authentication integration scripts, or layout permission gates.
  - **System Prompt Prompting:** "Act as a Lead Frontend & Security Engineer. Enforce the Capability-Driven Auth & Frontend State skill. Ensure zero role checks bleed into the layout components, model all UI states comprehensively, and ensure the backend acts as the sole source of authority."
```

---
