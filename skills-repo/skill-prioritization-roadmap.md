
### Skill Prioritization Roadmap

| Priority | Skill Name | Why It Earns Its Keep (Value Metric) | Status |
| :--- | :--- | :--- | :--- |
| **1** | **Design-First Transformation Engineering** | Standardizes code layout, prevents boundary leaking, and forces input normalization. | Locked In |
| **2** | **Resilient Concurrent & Distributed Design** | Prevents system crashes, memory leaks, un-bounded queues, and un-idempotent retries. | Locked In |
| **3** | **Capability-Driven Auth & Frontend State** | Stops role-check leaks in UI, standardizes error/loading state handling, and unifies API integration patterns. | **Ready to Generate** |
| **4** | **Agentic Execution & Context Discovery** | Ensures the AI doesn't hallucinate codebases, enforces strict stepwise validation, and protects system invariants. | **Ready to Generate** |

---


| Priority | Reusable Skill Name | Source Sections Covered | Why It Earns Its Keep (Value Metric) | Action |
| :---: | :--- | :--- | :--- | :--- |
| **1** | **Design-First Transformation Engineering** | • 1. Core Mental Model<br>• 2. Understand the Real Problem<br>• 3. Simplify Before Building<br>• 6. Architectural Boundaries | Standardizes repository layout, enforces input normalization, and guarantees business logic stays decoupled from databases/frameworks. | **Ready / Extract** |
| **2** | **Resilient Concurrent & Distributed Design** | • 5. Incremental Vertical Slices<br>• 9. Error Handling & Failure Design<br>• 10. Concurrency & Asynchrony<br>• 11. Distributed-System Realities | Directly prevents system crashes, memory leaks, outbox failures, data corruption, race conditions, and uncontrolled cascade failures. | **Ready / Extract** |
| **3** | **Capability-Driven Auth & Frontend State** | • 7. State & Data Integrity<br>• 8. Interfaces, Contracts, & Auth | Stops security role leaks in UI layouts, standardizes complete state matrices, and ensures reliable decoupled integration patterns. | **Ready / Extract** |
| **4** | **Agentic Execution & Context Discovery** | • 17. Working Safely with AI Agents<br>• 18. Common Engineering Anti-patterns<br>• 19. Practical Engineering Workflow | Forces AI coding tools to systematically read codebases, state invariants, and map stepwise plans before writing flawed code. | **Ready / Extract** |
| **5** | **Production Capacity & Lifecycle Operations** | • 12. Testing for Invariants<br>• 13. Observability & Operability<br>• 14. Performance & Capacity<br>• 15. Refactoring & Evolution | Provides agents with strict checklists for building token-bucket limiters, metrics reporting, safe feature flagging, and load testing criteria. | **To Be Generated** |
| **—** | *Skip / Route to Reference Context* | • 4. Reuse Existing Solutions<br>• 16. Dependency & Tech Trade-offs<br>• 20. Definition of Done<br>• 21. Reusable Checklists | These are standalone check-points and tool preferences (e.g., choosing Go vs Next.js). They belong in a primary workflow template, not a dynamic skill. | **Route to Global Config** |
| **—** | *Skip / Route to Case Study Benchmarks* | • 22. Project-Derived Case Studies | These are excellent operational examples (Toy DB, Job Processor, etc.) to inject as *examples* inside the skills rather than separate files. | **Inline as Examples** |



### Priority Roadmap: Stack-Specific Available Skills

| Priority | Reusable Skill Name | Core Libraries & Tooling Covered | Concrete Target Output (Value Metric) | Action |
| :---: | :--- | :--- | :--- | :--- |
| **1** | **Type-Safe Boundary Validation & Mutation** | `Zod`, `tRPC`, `Prisma`, `ZenStack`, `React Hook Form` | Guarantees zero data corruption or unvalidated payload leaks by enforcing tight TypeScript inference from the DB schema directly to the client UI forms. | **Ready to Generate** |
| **2** | **Resilient Client State & Query Architecture** | `TanStack Query`, `Zustand`, `XState`, `nuqs` | Eradicates race conditions in asynchronous network fetches, avoids complex `useEffect` spaghetti, and anchors global workspace changes inside explicit state machines. | **Ready to Generate** |
| **3** | **Fault-Tolerant Distributed Integration** | Go `context`, `OpenTelemetry`, `UploadThing / S3`, `httpbin` | Standardizes outbound network calls, ensures structural context propagation, secures presigned URL proxy workflows, and handles flaky integrations safely. | **Ready to Generate** |
| **4** | **Behavioral Verification & E2E Assurance** | `Playwright`, `React Testing Library`, `Vitest` | Shifts testing from volatile implementation details to immutable user workflows, testing real-time events, permissions, and session lifecycles. | **Ready to Generate** |

---
