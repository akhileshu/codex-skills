
### Pre-Existing Skills Registry (Ordered by Execution Priority)

| Priority | Targeted Capability Needed | Existing Skill Name / Slug | Primary Source Registry | Native Libraries Addressed |
| :---: | :--- | :--- | :--- | :--- |
| **1** | **API Design & Validation Guard** | `api-design` | `skills-hub.ai` | `tRPC`, `Zod`, Go HTTP router |
| **2** | **DB Model & Migration Review** | `db-migration-reviewer` | `proflead/codex-skills-library` | `Prisma`, `ZenStack` |
| **3** | **System Architecture Draftsman** | `system-design-draft` | `proflead/codex-skills-library` | Go channels, queues, distributed nodes |
| **4** | **Systematic Debugging & Isolation** | `bug-repro-plan` / `debugging` | `skills-hub.ai` / `GitHub` | Go context leaks, async conditions |
| **5** | **UI Layout & State Helper** | `css-layout-helper` / `ui.sh` | `proflead/codex-skills-library` | `React`, `Tailwind CSS`, `shadcn/ui` |
| **6** | **E2E & Behavioural Verification** | `integration-test-planner` | `proflead/codex-skills-library` | `Playwright`, `React Testing Library` |

---


#### 1. For Type-Safe Edge Invariants (`Zod`, `tRPC`, `Prisma`)
Instead of building validation rule sets, use the `api-design` schema from the registry. It forces the agent to cross-verify parameter endpoints against structural schemas:
*   **Trigger Command:** `/invoke api-design` or save as `.cursor/rules/api-design.mdc`
*   **What it does natively:** Checks your naming, schema versioning, payload validation (`Zod`), and query parameter structures (`nuqs`) against industry best practices.

#### 2. For Core Concurrency & Storage Logic (Go Channels, `context`, DB Locks)
Instead of drafting concurrency constraints, use the `db-migration-reviewer` and `system-design-draft` blueprints from the Codex library.
*   **Trigger Command:** `/invoke db-migration-reviewer`
*   **What it does natively:** Targets data mutation risks, heavy table locks (perfect for evaluating `Prisma` migrations before applying them), transaction integrity boundaries, and distributed state changes.

#### 3. For Complex UI Flows (`XState`, `TanStack Query`, `Zustand`)
Instead of teaching your agent how to combine query hooks and state machines, drop in the behavioral test configurations.
*   **Trigger Command:** `/invoke integration-test-planner`
*   **What it does natively:** Automatically identifies external integration dependencies, mocks network layer behaviors using mirrored requests (ideal for checking assertions with an `httpbin` digital mirror), and sets up user-centric user interface flows for `Playwright` to run.

### Your Action Plan
To immediately bootstrap your repository with these capabilities, run the following script if you use `skills-hub` or native workspace custom tools:

```bash
# If using the open CLI tool to pull specific validated rules straight into Cursor/Codex setup
npx @skills-hub-ai/cli install api-design --target cursor
npx @skills-hub-ai/cli install code-review --target cursor
```

Alternatively, clone the curated open-source repositories (`proflead/codex-skills-library` or `chrisboden/cursor-skills`) directly into your user config folder (`~/.cursor/skills/` or your system `.github/skills/` folder) to have them auto-load dynamically based on context.


---


### Paste this into your `AGENTS.md`:

```markdown
## 🛠️ Community Skills Registry Integrations

Instead of maintaining custom prompt files, this agent leverages open-source, industry-standard skill blueprints for Go systems development and full-stack TypeScript execution. 

### 1. API Design & Security Boundary
- **Skill Slug:** `api-design` (via `skills-hub.ai`)
- **Target Stack:** `tRPC`, `Zod`, Go HTTP router/middleware
- **When to Invoke:** Designing network payload contracts, configuring form validation structures, or writing server edge middleware.
- **Agent Instruction Injection:** 
  > "Act as a Type-Safe Full-Stack Developer. Reference the `api-design` skill parameters. Ensure all client-facing models strictly validate constraints at the system edge using single-source schemas, eliminating unparsed structural states before hitting business logic handlers."

### 2. Database Model & Migration Guard
- **Skill Reference:** `proflead/codex-skills-library/skills/data/db-migration-reviewer`
- **Target Stack:** `Prisma`, `ZenStack`, SQL transactional schemas
- **When to Invoke:** Writing schema updates, applying heavy data migrations, or designing row-level access control frameworks.
- **Agent Instruction Injection:**
  > "Act as a Database Administrator. Execute the `db-migration-reviewer` workflow rules. Scan all schema modifications for structural table locking risks, evaluate data backfill strategies, verify complete rollback scripts, and ensure ZenStack access policy coverage matches the new model state."

### 3. Distributed Concurrency & Systems Draftsman
- **Skill Reference:** `proflead/codex-skills-library/skills/architecture/domain-modeling`
- **Target Stack:** Go channels, concurrent sync/mutex blocks, worker pools, queues
- **When to Invoke:** Designing system boundaries, introducing thread concurrency, mapping microservice topologies, or isolating database operations.
- **Agent Instruction Injection:**
  > "Act as a Distributed Systems Architect. Leverage the `domain-modeling` and `architecture-review` skill definitions. Avoid introducing unbounded goroutines, explicitly enforce Go context deadline parameters, isolate domain rule sets from underlying infrastructure, and formally specify state sync invariants before coding."

### 4. Systematic Debugging & Fault Isolation
- **Skill Slug:** `code-review` / `debugging` (via `skills-hub.ai`)
- **Target Stack:** Go context leak hunting, runtime trace debugging, network boundary anomalies (`httpbin`)
- **When to Invoke:** Triaging test suites failures, hunting down distributed race conditions, or diagnosing application deadlocks under load simulations.
- **Agent Instruction Injection:**
  > "Act as a Systems Performance Engineer. Trigger the standard `code-review` and `debugging` blueprints. Map a strict step-by-step local context profiling sequence, isolate concurrent state conditions using race detectors, and utilize httpbin request mirrors to trace network payload variations precisely."

### 5. UI Layout, Component Integrity & Global State
- **Skill Reference:** `proflead/codex-skills-library/skills/frontend/css-layout-helper`
- **Target Stack:** `React`, `Tailwind CSS`, `shadcn/ui`, `Zustand`, `XState`, `nuqs`
- **When to Invoke:** Designing application pages, modeling client state machines, or wiring clean layout search filtering tied to the URL query string.
- **Agent Instruction Injection:**
  > "Act as a Principal Frontend Engineer. Apply the `css-layout-helper` and standard UI components skills. Guard against complex visual effect loops, encapsulate state changes within precise state machine boundaries, keep global shared memory slim, and synchronize layout updates smoothly using the URL parameters."

### 6. Functional E2E Workflow Verification
- **Skill Reference:** `proflead/codex-skills-library/skills/testing/integration-test-planner`
- **Target Stack:** `Playwright`, `React Testing Library`, `Vitest`
- **When to Invoke:** Structuring testing frameworks, validating edge behavior routines, or generating transaction path tests.
- **Agent Instruction Injection:**
  > "Act as a Software Quality Engineer. Utilize the `integration-test-planner` workflow specification. Build test cases completely around user-facing accessible landmarks rather than internal private selectors, verify session lifecycles over flaky networks, and simulate multiple concurrent client sessions to prove system safety under load."
```

---
