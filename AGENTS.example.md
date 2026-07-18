- **Skill Reference:** `agentic-execution-context-discovery-ai-assisted-workflows`
  - **When to invoke:** Use this when starting work in an unfamiliar repo, planning a change, or needing an explicit discover-first workflow before coding.
  - **Prompt Hook:** "Act as a Principal Engineer Coordinator. Discover the repo structure first, state constraints clearly, split the work into phases, and validate each step before coding."

- **Skill Reference:** `behavioral-verification-e2e-assurance`
  - **When to invoke:** Use this when writing tests, validating user workflows, or deciding whether a behavior should be covered by unit, integration, or Playwright tests.
  - **Prompt Hook:** "Act as a Quality Assurance Engineer. Test visible behavior, prefer accessible selectors, and cover only the workflow boundaries that matter."

- **Skill Reference:** `capability-driven-auth-frontend-state-ui-access-integrity`
  - **When to invoke:** Use this when designing authenticated web interfaces, permission-gated flows, or client state that needs explicit loading, error, and forbidden handling.
  - **Prompt Hook:** "Act as a Lead Frontend & Security Engineer. Keep authorization in the backend, model explicit UI states, and preserve user intent across auth barriers."

- **Skill Reference:** `design-first-transformation-engineering`
  - **When to invoke:** Use this when mapping a new feature, shaping domain boundaries, or planning how data should flow through a change.
  - **Prompt Hook:** "Act as a Systems Architect. Normalize at the boundary, keep domain logic free of infrastructure details, and make state transitions explicit."

- **Skill Reference:** `fault-tolerant-distributed-integration`
  - **When to invoke:** Use this when writing Go clients, direct-to-storage flows, or any network integration that must survive retries, timeouts, or partial failure.
  - **Prompt Hook:** "Act as a Distributed Infrastructure Developer. Add deadlines, telemetry, and bounded retry handling to the integration boundary."

- **Skill Reference:** `full-stack-web-slice-design-generator`
  - **When to invoke:** Use this when a milestone row needs to become a concrete full-stack implementation plan before coding.
  - **Prompt Hook:** "Act as a Lead Full-Stack Architect. Map the slice end to end, keep client/server boundaries clean, and choose the smallest safe implementation."

- **Skill Reference:** `full-stack-web-implementation-slices-table-and-repo-structure`
  - **When to invoke:** Use this when a web roadmap needs an implementation-slices table and repository structure before coding.
  - **Prompt Hook:** "Act as a Lead Full-Stack Web Architect. Generate the Understand/Simplify/Reuse/Build/Integrate/Verify/Operate/Evolve slices table, map stable boundaries, and show the repository structure."

- **Skill Reference:** `production-capacity-lifecycle-operations`
  - **When to invoke:** Use this when adding rate limits, concurrency controls, telemetry, or rollout safety to a service.
  - **Prompt Hook:** "Act as an SRE and performance engineer. Bound capacity, add telemetry, and keep rollouts reversible."

- **Skill Reference:** `resilient-client-state-query-architecture`
  - **When to invoke:** Use this when designing client-side state, query lifecycles, workspace filters, or persistent UI state.
  - **Prompt Hook:** "Act as a State Architecture Specialist. Keep server state in TanStack Query, keep local state lean, and mirror visible filters in the URL when needed."

- **Skill Reference:** `resilient-concurrent-distributed-systems-design`
  - **When to invoke:** Use this when writing concurrent Go code, queue consumers, or multi-process workflows with retries and side effects.
  - **Prompt Hook:** "Act as a Distributed Systems Engineer. Keep concurrency bounded, design for retries and duplication, and choose the right failure mode explicitly."

- **Skill Reference:** `slice-implementer`
  - **When to invoke:** Use this when implementing a bounded slice document such as `docs/slices/05-in-memory-table-storage.md`.
  - **Prompt Hook:** "Implement this slice after reconciling it with the repository and quality rules. Build a tracer path, work in verified checkpoints, and preserve stable behavior."

- **Skill Reference:** `tracer-code-continuous-refactoring`
  - **When to invoke:** Use this when a later slice must replace an earlier internal representation or when architecture needs behavior-preserving evolution.
  - **Prompt Hook:** "Identify stable contracts and disposable internals, build a narrow tracer, refactor incrementally, and preserve invariant-based tests."

- **Skill Reference:** `type-safe-boundary-validation-mutation`
  - **When to invoke:** Use this when designing database schemas, API handlers, or forms that need one authoritative validation boundary.
  - **Prompt Hook:** "Act as a Type-Safe Full-Stack Developer. Validate at the edge, keep policies central, and wire forms to the same schema source."
