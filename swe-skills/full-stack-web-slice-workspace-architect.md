# Skill 2: Full-Stack Web Slice & Workspace Architect

## Purpose
Guide full-stack agents in analyzing user experience feature flows and dividing them into clean, front-to-back **Tracer Code Milestones**. This structure enforces a type-safe boundary design from the database directly out to responsive UI layouts, ensuring client states are predictable and backend verification checks are absolute.

## Structural Generation Rules

### 1. The Full-Stack Tracer Matrix Requirement
When a client application or product vertical is introduced, the agent must map out an interactive feature progression. 
*   **The Single-Vertical Rule:** A slice cannot be "just a UI component" or "just a database table." Every row must compose an operational data flow: from client interaction through validation down to persistent storage, then back out to UI feedback loops.
*   **Web Domain Columns Matrix:** The roadmap table must satisfy full-stack validation patterns:

| # | Slice / Visible Capability | Understand (User Goal) | Simplify (Boundary Limits) | Reuse (UI Tokens / Schemas) | Build (Server/Client Actions) | Integrate (Network Flow) | Verify (E2E User Journeys) | Operate (Client/Server Metrics) | Evolve (Postponed Aesthetics) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |

#### Target Example Format:
```markdown
| 05 | **Optimistic Room Booking** | User books timeline slot with zero perceived latency | Single-room reservation; ignore conflict races initially | `shadcn/ui` Dialog, `Zod` schema model | `bookRoomAction()`, `useMutation()` payload hook | Client Cache state optimistic update → Server validation endpoint | Playwright multi-session timeline overlap test | Sentry error tracking, API query execution timeline metrics | Real-time WebSockets synchronization, multi-room maps |
```

### 2. Modern Full-Stack Folder Segregation
Enforce a clean, decoupled workspace folder layout that cleanly establishes network and state boundaries, separating persistent server state from immediate client interactions:
*   `src/app/` (or server routes) - Clear semantic route structures that isolate pages and server action boundaries.
*   `src/components/ui/` - Headless, reusable, accessible presentation primitives, free from unmanaged state mutations.
*   `src/features/` - Domain-specific co-location blocks bundling the UI view layer, state managers, validation schemas, and mutations together (e.g., `src/features/bookings/`).

#### Layout Schema Sample:
```text
web-workspace/
├── src/
│   ├── app/               ← Routing, layout composition, server actions
│   ├── components/ui/     ← Pure presentational components (shadcn/ui)
│   ├── features/
│   │   └── workspace/     ← Co-located features: types, components, hooks
│   │       ├── components/
│   │       ├── hooks/     ← TanStack Query / state machines
│   │       └── schemas/   ← Zod validation contracts
│   └── lib/               ← Shared clients (Prisma, telemetry configs)
└── tests/e2e/             ← Playwright functional workflows
```

## ⚖️ Flexibility & Pragmatism Guardrail
*   **Pragmatic Scaling:** Apply extensive full-stack matrices and feature co-location folders to high-risk data mutations, complex authorization gates, or interactive state features (like scheduling calendars or collaborative canvases).
*   **Lightweight Slices:** For static informational layouts, text-only dashboards, or standard CRUD pages, do not hand-roll customized state infrastructure, complex client-side caching setups, or granular slice files. Utilize framework configurations and standard components directly to keep the application lean.

***

### 📑 Global `AGENTS.md` Integration Entry
```markdown
## 🗺️ Roadmap & Workspace Architecture Generation Skills

These architecture planning skills prevent agents from generating massive, context-blind blocks of boilerplate code, forcing them instead to create disciplined, incremental vertical slices.

- **Skill Reference:** `skills/go-systems-architect.md`
  - **When to Invoke:** Commencing a new system utility, background infrastructure microservice, or CLI tool.
  - **Prompt Hook:** "Act as a Go Systems Architect. Enforce the `skills/go-systems-architect.md` guidelines against this objective. Generate a complete, multi-phase Tracer Code Matrix and mapping repository structure from first principles."

- **Skill Reference:** `skills/fullstack-web-architect.md`
  - **When to Invoke:** Kicking off a new web platform, user workspace feature, interactive canvas application, or multi-tenant checkout workflow.
  - **Prompt Hook:** "Act as a Lead Full-Stack Web Architect. Enforce the `skills/fullstack-web-architect.md` guidelines. Break down the requirements into an incremental Web Domain Matrix and client/server folder topology before coding."
```

---
