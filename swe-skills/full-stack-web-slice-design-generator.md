# Skill: Full-Stack Web Slice Design Generator

## Purpose
Deconstruct a high-level milestone row from a full-stack project matrix into a concrete, context-aware architectural blueprint. The blueprint must align directly with client and server directory boundaries before implementation begins.

## Column-by-Column Blueprint Requirements
When a milestone row is provided, the agent must systematically address every column using the following engineering constraints:

### 1. Understand & Simplify (Core Model)
*   **Targeted Study Sourcing:** Prior to mapping code structures, discover and output a **"What to Study"** shortlist. This must contain 2–3 hyper-specific technical references, API specifications, official documentation sections, or open-source reference implementations matching the exact feature domain.
*   **Data & State Flow First:** Explicitly map the data lifecycle as a complete pipeline from the database up to the user-facing UI component:
    ```text
    Database Truth → Server Endpoint/Action → Validation Boundary → Client Cache → Component State → UI Layout
    ```
*   **Complete State Matrix:** Define the data shapes, types, or validation schemas required. Every user interaction slice must explicitly model its complete state configurations. Never use loose binary states (`isLoading = true`). Map the explicit matrix:
    - `loading` → `empty` → `success` → `error` → `unauthorized / forbidden`

### 2. Reuse & Build (Implementation)
*   **Intelligent Reuse:** Explicitly audit existing shared UI components, design tokens, hooks, standard/framework utilities, or core database schemas before proposing new code.
*   **Implementation-Oriented Pseudocode:** Provide explicit logic maps for both sides of the network boundary. Do not offer high-level outlines. Include:
    - **Server-Side:** Input validation schemas, database mutation logic, access control policy guards, and specific error payloads.
    - **Client-Side:** Form hooks, network requests/mutations, explicit cache validation/invalidation triggers, and local state machine pathways.
*   **Step-by-Step User Flow Traces:** Trace exactly how an event moves through the system. Provide:
    - One full **Success Journey Flow** tracking user interaction, network transmit, database persistence, state synchronization, and successful UI feedback (e.g., toast alerts).
    - One full **Failure Journey Flow** pinpointing the exact boundary where validation, permissions, or network connectivity fails, detailing user feedback states.

### 3. Integrate & Verify (Testing Boundaries)
*   **The Integration Path:** Detail the exact contract between components and layers (e.g., `Form → Client Action → API/RPC Endpoint → Domain Service → DB Model`). Ensure strict responsibility separation.
*   **Behavioral-Driven Testing:** Outline test cases optimized for observable user outcomes rather than internal private selectors or component states:
    *   Use *Unit/Integration tests* for pure layout rules, validation schemas, and utility functions.
    *   Use *E2E tests* to validate multi-session workflows, authentications, real-time events, and critical user journeys.
*   **Boundary Failures:** Explicitly include test steps evaluating behavior under slow network latency, input rejection, unauthorized route access, and component unmounting.

### 4. Operate & Evolve (Lifecycle)
*   **Operational & Client Telemetry:** Define the specific logging contexts, breadcrumbs, metrics, or error tracking setups needed to debug issues in production (e.g., performance bottlenecks, client-side application crashes).
*   **Defensive Reliability:** Detail how the system responds to messy user and network environments: optimistic updates, input debouncing/throttling, explicit request timeouts, and client retry backoffs.
*   **Scope Guardrails:** Clearly segregate what is built in the **Active Slice** versus what must be deferred to the **Evolve Phase** (e.g., postpone custom advanced animations, complex filtering merges, bulk updates).

---

## Code Review Checklist (Pre-Generation Guardrail)
Before writing any actual full-stack code from this blueprint, evaluate the design against these standing preferences:
- [ ] Is the backend acting as the sole source of authorization and security truth?
- [ ] Are input parameters structurally validated exactly once at the system edge?
- [ ] Is the UI fully decoupled from raw database models via a dedicated client or transformation boundary?
- [ ] What is the smallest safe implementation slice?
- [ ] Is it the simplest correct sequential data flow before layering optimizations?

---

## ⚖️ Flexibility & Pragmatism Guardrail
*   **Value Over Form:** Apply these directives only when they actively improve correctness, decision-making, or production safety. 
*   **No Forced Complexity:** Do not force a complex matrix layout, a multi-layered state machine (`XState`), an isolation layer, or exhaustive testing blueprints for trivial, low-risk, or static UI slices. If an output can be fully explained cleanly in a simple list or 5 lines of plain code, default to the simplest path.
*   **Context Primacy:** Specific instruction updates or immediate milestone constraints provided in your prompt always take precedence over the defaults in this skill file.

---
